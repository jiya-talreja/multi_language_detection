import os
import re

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\backend\\server.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add FAISS imports and global state
if "import faiss" not in content:
    imports_to_add = """import faiss
from pydantic import BaseModel

FAISS_INDEX = None
FAISS_GROUP_IDS = None

class SearchQuery(BaseModel):
    query: str
"""
    content = content.replace("from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks", 
                              "from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks\n" + imports_to_add)

# 2. Build FAISS index at the end of detect_duplicates
old_end_detect = """        return {"status": "success", "clusters": clusters, "total_records_processed": len(working_df)}

    except Exception as e:"""

new_end_detect = """        # Build FAISS index for real-time search
        global FAISS_INDEX, FAISS_GROUP_IDS
        try:
            print("Building FAISS index for real-time search...")
            group_vectors = []
            faiss_group_ids = []
            
            # Map clusters to vectors using their anchors or centroids
            # For simplicity and speed, we use the anchor text vector
            anchor_texts = [c["anchor"]["text"] for c in clusters]
            if anchor_texts:
                anchor_embs = encode_dataset(anchor_texts, model_name=GLOBAL_MODEL_NAME)
                anchor_embs = anchor_embs.astype("float32")
                faiss.normalize_L2(anchor_embs)
                
                dim = anchor_embs.shape[1]
                FAISS_INDEX = faiss.IndexFlatIP(dim)
                FAISS_INDEX.add(anchor_embs)
                FAISS_GROUP_IDS = [c["id"] for c in clusters]
                print(f"FAISS index built with {len(FAISS_GROUP_IDS)} clusters.")
        except Exception as faiss_err:
            print(f"Failed to build FAISS index: {str(faiss_err)}")

        return {"status": "success", "clusters": clusters, "total_records_processed": len(working_df)}

    except Exception as e:"""

content = content.replace(old_end_detect, new_end_detect)

# 3. Add /search endpoint
search_endpoint = """
@app.post("/search")
async def search_duplicates(request: SearchQuery):
    global FAISS_INDEX, FAISS_GROUP_IDS
    if FAISS_INDEX is None or not FAISS_GROUP_IDS:
        raise HTTPException(status_code=400, detail="FAISS index not built yet. Please process a file first.")
        
    text = request.query.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Query text is empty.")
        
    try:
        emb = encode_dataset([text], model_name=GLOBAL_MODEL_NAME)
        emb = emb.astype("float32")
        faiss.normalize_L2(emb)
        
        scores, indices = FAISS_INDEX.search(emb, 1)
        best_score = float(scores[0][0])
        best_idx = int(indices[0][0])
        
        if best_idx == -1:
            return {"status": "success", "match": None}
            
        cluster_id = FAISS_GROUP_IDS[best_idx]
        return {
            "status": "success", 
            "match": {
                "cluster_id": cluster_id,
                "similarity": round(best_score, 3)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""

if "@app.post(\"/search\")" not in content:
    content += search_endpoint

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\backend\\server.py", "w", encoding="utf-8") as f:
    f.write(content)

print("FAISS backend logic added.")
