import pandas as pd
import numpy as np
from cluster import cluster_embeddings

# Create dummy embeddings
embeddings = np.random.rand(10, 384)
# Make some of them very similar
embeddings[1] = embeddings[0] + 0.01
embeddings[2] = embeddings[0] - 0.01
embeddings[4] = embeddings[3] + 0.02

df = pd.DataFrame({
    "text": [f"Text {i}" for i in range(10)],
    "name": [f"Name {i}" for i in range(10)]
})

print("Running cluster_embeddings...")
result_df = cluster_embeddings(embeddings, df, min_cluster_size=2)

print("\nResulting DataFrame:")
print(result_df)
