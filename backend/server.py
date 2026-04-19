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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)

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
        
        # Ensure 'text' column logic is applied to preserve legacy 'text' or 'notes' fields
        if 'text' in raw_df.columns:
            df['text'] = raw_df['text'].fillna("").astype(str)
        else:
            df['text'] = df['description']
            
        # Extract fields for UI
        if 'email' in raw_df.columns:
            df['email'] = raw_df['email'].fillna("").astype(str)
        else:
            df['email'] = ""
            
        if 'phone' in raw_df.columns:
            df['phone'] = raw_df['phone'].fillna("").astype(str)
        else:
            df['phone'] = ""

        # 2. Prepare text for embedding
        def combine_and_clean(row):
            combined = f"{row['name']} {row['description']}"
            return clean_text(combined)

        df["clean_text"] = df.apply(combine_and_clean, axis=1)
        valid_mask = df["clean_text"].str.strip() != ""
        
        if not valid_mask.any():
            raise HTTPException(status_code=400, detail="No usable text found in the dataset.")
            
        working_df = df[valid_mask].copy().reset_index(drop=True)
        texts = working_df["clean_text"].tolist()

        # 3. Embed
        print(f"Embedding {len(texts)} texts...")
        vectors = encode_dataset(texts, model_name=GLOBAL_MODEL_NAME)

        # 4. Cluster
        print("Clustering...")
        labels = cluster_embeddings(vectors, eps=eps)
        working_df["cluster_id"] = labels

        # 5. Build Pairs for the UI
        pairs = []
        pair_id_counter = 1
        
        # Iterate over each cluster that is not noise (-1)
        for cluster_id in sorted(working_df["cluster_id"].unique()):
            if cluster_id == -1:
                continue
                
            cluster_indices = working_df[working_df["cluster_id"] == cluster_id].index.tolist()
            
            # Generate all pairs within this cluster
            for idxA, idxB in combinations(cluster_indices, 2):
                vecA = vectors[idxA].reshape(1, -1)
                vecB = vectors[idxB].reshape(1, -1)
                sim = cosine_similarity(vecA, vecB)[0][0]
                
                recA = working_df.iloc[idxA]
                recB = working_df.iloc[idxB]
                
                pairs.append({
                    "id": f"pair-{pair_id_counter}",
                    "similarity": round(float(sim), 3),
                    "recordA": {
                        "id": str(recA["id"]),
                        "name": str(recA["name"]),
                        "email": str(recA["email"]),
                        "phone": str(recA["phone"]),
                        "text": str(recA["text"]),
                        "language": str(recA["language"]) if recA["language"] else "Unknown",
                        "languageCode": str(recA["language"])[:2].lower() if recA["language"] else "en"
                    },
                    "recordB": {
                        "id": str(recB["id"]),
                        "name": str(recB["name"]),
                        "email": str(recB["email"]),
                        "phone": str(recB["phone"]),
                        "text": str(recB["text"]),
                        "language": str(recB["language"]) if recB["language"] else "Unknown",
                        "languageCode": str(recB["language"])[:2].lower() if recB["language"] else "en"
                    }
                })
                pair_id_counter += 1

        # Sort pairs by similarity descending
        pairs.sort(key=lambda x: x["similarity"], reverse=True)

        return {"status": "success", "pairs": pairs, "total_records_processed": len(working_df)}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
