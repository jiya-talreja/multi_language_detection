import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
import hdbscan
import umap

# -------------------------------
# STEP 1: LOAD MODEL
# -------------------------------
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# -------------------------------
# STEP 2: LOAD DATA
# -------------------------------
chunk_size = 100
all_embeddings = []
all_ids = []
all_texts = []

for i, chunk in enumerate(pd.read_csv("multilingual_test_1000.csv", chunksize=chunk_size)):
    print(f"Processing chunk {i+1}...")

    texts = chunk["text"].astype(str).tolist()

    emb = model.encode(texts, batch_size=32, show_progress_bar=False)

    all_embeddings.append(emb)
    all_ids.extend(chunk["id"].tolist())
    all_texts.extend(texts)

# -------------------------------
# STEP 3: COMBINE + NORMALIZE
# -------------------------------
embeddings = np.vstack(all_embeddings)
embeddings = normalize(embeddings)

print("Total rows:", len(all_ids))

# -------------------------------
# STEP 4: UMAP DIMENSIONALITY REDUCTION (IMPORTANT UPGRADE)
# -------------------------------
reducer = umap.UMAP(
    n_neighbors=25,
    n_components=10,
    metric="cosine",
    random_state=42
)

embeddings_reduced = reducer.fit_transform(embeddings)
np.save("embeddings.npy", embeddings) 
print("Embeddings saved.")

print("UMAP reduction done.")

# -------------------------------
# STEP 5: HDBSCAN CLUSTERING
# -------------------------------
clusterer = hdbscan.HDBSCAN(
    min_cluster_size=3,
    metric="euclidean"
)

labels = clusterer.fit_predict(embeddings_reduced)

print("Clustering done.")
from sklearn.metrics.pairwise import cosine_similarity

def refine_duplicates(df, embeddings, threshold=0.88):
    final_rows = []

    for gid, group in df.groupby("predicted_group_id"):
        idx = group.index
        emb = embeddings[idx]

        sim = cosine_similarity(emb)

        keep = set()

        for i in range(len(group)):
            if i in keep:
                continue

            keep.add(i)

            for j in range(i+1, len(group)):
                if sim[i][j] > threshold:
                    keep.add(j)

        filtered = group.iloc[list(keep)]
        final_rows.append(filtered)

    return pd.concat(final_rows)



# -------------------------------
# STEP 6: OUTPUT DATAFRAME
# -------------------------------
result_df = pd.DataFrame({
    "id": all_ids,
    "text": all_texts,
    "predicted_group_id": labels
})
result_df = refine_duplicates(result_df, embeddings)
# -------------------------------
# STEP 7: SAVE
# -------------------------------
result_df.to_csv("final_output.csv", index=False)

print("Saved final_output.csv")
