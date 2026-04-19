import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import normalize

def cluster_embeddings(embeddings: np.ndarray, eps: float = 0.3, min_samples: int = 2):
    """
    Normalizes embeddings and clusters them using DBSCAN.
    """
    print("Normalizing embeddings...")
    normalized_embeddings = normalize(embeddings)
    
    print(f"Running DBSCAN clustering (eps={eps}, min_samples={min_samples})...")
    clustering = DBSCAN(eps=eps, min_samples=min_samples, metric="euclidean")
    labels = clustering.fit_predict(normalized_embeddings)
    
    print(f"Clustering complete. Found {len(set(labels)) - (1 if -1 in labels else 0)} clusters.")
    return labels
