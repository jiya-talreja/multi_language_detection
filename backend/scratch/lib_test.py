import hdbscan
import umap
import numpy as np
print("Libraries imported successfully")
data = np.random.rand(10, 5)
reducer = umap.UMAP(n_neighbors=2)
reduced = reducer.fit_transform(data)
print("UMAP done")
clusterer = hdbscan.HDBSCAN(min_cluster_size=2)
labels = clusterer.fit_predict(reduced)
print("HDBSCAN done, labels:", labels)
