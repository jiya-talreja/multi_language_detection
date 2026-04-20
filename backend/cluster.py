import numpy as np
import pandas as pd
import hdbscan
import umap
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity


# -------------------------------
# STEP 1: MERGE CLUSTERS (NEW 🔥)
# -------------------------------
def merge_similar_clusters(df, embeddings, threshold=0.85):
    cluster_ids = df["predicted_group_id"].unique()
    cluster_ids = [cid for cid in cluster_ids if cid != -1]

    centroids = {}
    for cid in cluster_ids:
        idx = df[df["predicted_group_id"] == cid].index.to_numpy()
        centroids[cid] = embeddings[idx].mean(axis=0)

    merged_map = {}
    visited = set()
    new_id = 0

    for cid1 in cluster_ids:
        if cid1 in visited:
            continue

        merged_map[cid1] = new_id
        visited.add(cid1)

        for cid2 in cluster_ids:
            if cid2 in visited:
                continue

            sim = cosine_similarity(
                centroids[cid1].reshape(1, -1),
                centroids[cid2].reshape(1, -1)
            )[0][0]

            if sim > threshold:
                merged_map[cid2] = new_id
                visited.add(cid2)

        new_id += 1

    df["predicted_group_id"] = df["predicted_group_id"].map(
        lambda x: merged_map.get(x, -1)
    )

    return df


# -------------------------------
# STEP 2: REFINE DUPLICATES
# -------------------------------
def refine_duplicates(df, embeddings, threshold=0.72):
    final_rows = []

    for gid, group in df.groupby("predicted_group_id"):
        if gid == -1:
            continue

        idx = group.index.to_numpy()
        emb = embeddings[idx]

        sim = cosine_similarity(emb)
        keep = set()

        for i in range(len(group)):
            if i in keep:
                continue

            keep.add(i)

            for j in range(i + 1, len(group)):
                if sim[i][j] > threshold:
                    keep.add(j)

        filtered = group.iloc[list(keep)]
        
        if len(filtered) < 2:
            filtered = group
            
        print(f"Refine: group {gid} kept {len(filtered)}/{len(group)} members")
        
        final_rows.append(filtered)

    if final_rows:
        return pd.concat(final_rows)
    else:
        return pd.DataFrame(columns=df.columns)


# -------------------------------
# STEP 3: MAIN CLUSTER FUNCTION
# -------------------------------
def cluster_embeddings(embeddings: np.ndarray, df, min_cluster_size=3):
    print("Normalizing embeddings...")
    embeddings = normalize(embeddings)

    # -------------------------------
    # UMAP (dimension reduction)
    # -------------------------------
    print("Running UMAP...")
    reducer = umap.UMAP(
        n_neighbors=25,
        n_components=10,
        metric="cosine",
        random_state=42
    )

    reduced = reducer.fit_transform(embeddings)
    print("UMAP done.")

    # -------------------------------
    # HDBSCAN clustering
    # -------------------------------
    print("Running HDBSCAN...")
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        metric="euclidean",
        cluster_selection_method="eom"
    )

    labels = clusterer.fit_predict(reduced)
    print("Clustering done.")

    df["predicted_group_id"] = labels

    # -------------------------------
    # 🔥 NEW STEP: MERGE CLUSTERS
    # -------------------------------
    print("Merging similar clusters...")
    df = merge_similar_clusters(df, embeddings)

    # -------------------------------
    # REFINE INSIDE CLUSTERS
    # -------------------------------
    print("Refining clusters...")
    df = refine_duplicates(df, embeddings)

    return df
