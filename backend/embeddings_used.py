import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import normalize

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

chunk_size = 1000
all_embeddings = []
all_ids = []
all_texts = []

for i, chunk in enumerate(pd.read_csv("final.csv", chunksize=chunk_size)):
    print(f"Processing chunk {i+1}...")

    texts = chunk["text"].astype(str).tolist()
    emb = model.encode(texts, batch_size=32)

    all_embeddings.append(emb)
    all_ids.extend(chunk["id"].tolist())
    all_texts.extend(texts)

embeddings = np.vstack(all_embeddings)

print("Total rows:", len(all_ids))

# Normalize
embeddings = normalize(embeddings)

print("Running DBSCAN...")

clustering = DBSCAN(eps=0.3, min_samples=2, metric="euclidean")
labels = clustering.fit_predict(embeddings)

print("Clustering done.")

result_df = pd.DataFrame({
    "id": all_ids,
    "text": all_texts,
    "predicted_group_id": labels
})

result_df.to_csv("final_output.csv", index=False)

print("Saved final_output.csv")