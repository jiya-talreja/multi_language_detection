from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import tempfile
import pathlib
import pandas as pd
from typing import Optional
from itertools import combinations
from sklearn.metrics.pairwise import cosine_similarity

from normalize import load_file, standardize_dataframe
from utils import clean_text
from embed import encode_dataset
from cluster import cluster_embeddings
from text_chunking import chunk_dataframe

app = FastAPI(title="JN.ai Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep the model loaded in memory for faster subsequent requests
GLOBAL_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

@app.get("/")
def health_check():
    return {"status": "ok", "message": "JN.ai API is running."}

@app.post("/normalize")
async def normalize_file(
    file: UploadFile = File(...),
    name_col: Optional[str] = Form(None),
    desc_col: Optional[str] = Form(None)
):
    """
    Accepts an uploaded file and returns the normalized/standardized data.
    Used for debugging and verification of the normalization layer.
    """
    ext = pathlib.Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        raw_df = load_file(tmp_path)
        std_df = standardize_dataframe(raw_df, name_col=name_col, desc_col=desc_col)
        
        # Convert to records for JSON response
        data = std_df.to_dict(orient="records")
        return {
            "status": "success",
            "filename": file.filename,
            "columns": list(std_df.columns),
            "data": data,
            "total_rows": len(std_df)
        }
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)

@app.post("/chunk")
async def chunk_data(data: list[dict]):
    """
    Accepts normalized records and returns them exploded into chunks.
    """
    try:
        df = pd.DataFrame(data)
        chunked_df = chunk_dataframe(df)
        return {
            "status": "success",
            "data": chunked_df.to_dict(orient="records"),
            "total_rows": len(chunked_df),
            "original_rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect")
async def detect_duplicates(
    file: UploadFile = File(...),
    name_col: Optional[str] = Form(None),
    desc_col: Optional[str] = Form(None),
    eps: float = Form(0.3)
):
    """
    Accepts an uploaded file, normalizes it, embeds the text, and clusters duplicates.
    Returns pairs of duplicates with their similarity scores.
    """
    ext = pathlib.Path(file.filename).suffix
    
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # 1. Normalize
        raw_df = load_file(tmp_path)
        df = standardize_dataframe(raw_df, name_col=name_col, desc_col=desc_col)
        
        # 2. Extract auxiliary fields for UI if present in raw data
        # We check raw_df columns because standardized_df currently only guarantees id, name, description, text, language
        for col in ['email', 'phone', 'category', 'date']:
            # Find the best match in raw_df for these auxiliary fields
            matches = [c for c in raw_df.columns if col in str(c).lower()]
            if matches:
                df[col] = raw_df[matches[0]].fillna("").astype(str)
            else:
                df[col] = ""

        # 3. Filter and prepare for embedding
        valid_mask = df["text"].str.strip() != ""
        if not valid_mask.any():
            raise HTTPException(status_code=400, detail="No usable text found in the dataset.")
            
        working_df = df[valid_mask].copy().reset_index(drop=True)
        
        # 3. Apply chunking
        working_df = chunk_dataframe(working_df, max_chars=800, overlap=100)
        
        texts = working_df["text"].tolist()
        # 4. Embed
        print(f"Embedding {len(texts)} texts...")
        vectors = encode_dataset(texts, model_name=GLOBAL_MODEL_NAME)

        # 5. Cluster
        print("Clustering (UMAP + HDBSCAN)...")
        working_df = cluster_embeddings(vectors, working_df)
        
        # In the new version, cluster_embeddings returns a dataframe with 'predicted_group_id'
        # It also filters out noise (-1) automatically during the refine_duplicates step.
        working_df["cluster_id"] = working_df["predicted_group_id"]

        # 6. Build Clusters for the UI
        print("Building clusters for the UI...")
        clusters = []
        cluster_id_counter = 1
        
        # Optimize by normalizing all vectors once
        import numpy as np
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1
        vectors_norm = vectors / norms
        
        # Iterate over each cluster that is not noise (-1)
        # Note: In the new version, cluster_id is 'predicted_group_id' and noise is handled by refine_duplicates
        for group_id in sorted(working_df["predicted_group_id"].unique()):
            if group_id == -1:
                continue
                
            group_df = working_df[working_df["predicted_group_id"] == group_id]
            if len(group_df) < 2:
                continue
                
            if len(group_df) > 50:
                print(f"Warning: Cluster {group_id} has {len(group_df)} items. Taking a sample.")
                group_df = group_df.iloc[:50]
                
            cluster_indices = group_df.index.tolist()
            
            # Vectorized similarity matrix for this cluster
            cluster_vecs = vectors_norm[cluster_indices]
            sim_matrix = np.dot(cluster_vecs, cluster_vecs.T)
            
            # Pick the first record as the 'anchor' (representative) of the cluster
            anchor_rec = group_df.iloc[0]
            anchor_parent_id = str(anchor_rec.get("parent_id", anchor_rec["id"]))
            anchor_text = str(anchor_rec["text"]).strip().lower()
            
            members = []
            seen_record_ids = {anchor_parent_id}
            seen_texts = {anchor_text}
            
            for i in range(1, len(cluster_indices)):
                rec = group_df.iloc[i]
                record_id = str(rec.get("parent_id", rec["id"]))
                record_text = str(rec["text"]).strip().lower()
                
                # Filter 1: If we've already included this record ID, skip its other chunks
                if record_id in seen_record_ids:
                    continue
                
                # Filter 2: If the text is an EXACT match to something already in the cluster, skip it
                # This prevents "self-detection" of identical rows and focuses on semantic/cross-lingual matches
                if record_text in seen_texts:
                    continue
                
                seen_record_ids.add(record_id)
                seen_texts.add(record_text)
                sim = sim_matrix[0, i]
                
                members.append({
                    "id": str(rec.get("parent_id", rec["id"])),
                    "name": str(rec["name"]),
                    "email": str(rec.get("email", "")),
                    "phone": str(rec.get("phone", "")),
                    "text": str(rec["text"]),
                    "language": str(rec["language"]) if rec["language"] else "Unknown",
                    "similarity": round(float(sim), 3)
                })
            
            if members:
                anchor_lang = str(anchor_rec["language"]) if anchor_rec["language"] else "Unknown"
                is_cross_lingual = any(m["language"] != anchor_lang for m in members)
                
                clusters.append({
                    "id": f"cluster-{cluster_id_counter}",
                    "isCrossLingual": is_cross_lingual,
                    "anchor": {
                        "id": str(anchor_rec.get("parent_id", anchor_rec["id"])),
                        "name": str(anchor_rec["name"]),
                        "email": str(anchor_rec.get("email", "")),
                        "phone": str(anchor_rec.get("phone", "")),
                        "text": str(anchor_rec["text"]),
                        "language": str(anchor_rec["language"]) if anchor_rec["language"] else "Unknown"
                    },
                    "members": members,
                    "avgSimilarity": round(float(np.mean([m["similarity"] for m in members])), 3)
                })
                cluster_id_counter += 1

        # Sort clusters by average similarity descending
        clusters.sort(key=lambda x: x["avgSimilarity"], reverse=True)
        
        print(f"Returning {len(clusters)} clusters to the UI.")
        return {"status": "success", "clusters": clusters, "total_records_processed": len(working_df)}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
