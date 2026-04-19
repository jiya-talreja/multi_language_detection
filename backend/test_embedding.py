import pandas as pd # pyright: ignore[reportMissingModuleSource]
import numpy as np # pyright: ignore[reportMissingImports]
import random
from sentence_transformers import SentenceTransformer # pyright: ignore[reportMissingImports]
from sklearn.metrics.pairwise import cosine_similarity # pyright: ignore[reportMissingModuleSource]
print("Loading dataset...")
df = pd.read_csv("tatoeba_merged.csv")
df = df.dropna(subset=["text", "group_id"])
df["text"] = df["text"].astype(str)
print("Original size:", len(df))
group_sizes = df["group_id"].value_counts()
valid_groups = group_sizes[group_sizes >= 2].index
df = df[df["group_id"].isin(valid_groups)]
print("After filtering valid groups:", len(df))
unique_groups = df["group_id"].unique()
GROUP_SAMPLE_SIZE = 100 
if len(unique_groups) > GROUP_SAMPLE_SIZE:
    sampled_groups = np.random.choice(unique_groups, GROUP_SAMPLE_SIZE, replace=False)
    df = df[df["group_id"].isin(sampled_groups)]
df = df.reset_index(drop=True)
print("Final working size:", len(df))
print("Number of groups:", df["group_id"].nunique())
print("\nTop group sizes:")
print(df["group_id"].value_counts().head())
print("\nLoading model...")
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
print("\nGenerating embeddings...")
texts = df["text"].tolist()
embeddings = model.encode(
    texts,
    batch_size=32,
    show_progress_bar=True
)
print("Embeddings generated.")
print("\n--- RANDOM PAIR CHECK ---")
NUM_CHECKS = 20  
same_group_scores = []
diff_group_scores = []
for _ in range(NUM_CHECKS):
    i, j = random.sample(range(len(df)), 2)
    emb1 = embeddings[i].reshape(1, -1)
    emb2 = embeddings[j].reshape(1, -1)
    similarity = cosine_similarity(emb1, emb2)[0][0]
    text1 = df.iloc[i]["text"]
    text2 = df.iloc[j]["text"]
    group1 = df.iloc[i]["group_id"]
    group2 = df.iloc[j]["group_id"]
    is_same = group1 == group2
    if is_same:
        same_group_scores.append(similarity)
    else:
        diff_group_scores.append(similarity)
    print("\n----------------------")
    print("Text 1:", text1)
    print("Text 2:", text2)
    print("Similarity:", round(similarity, 3))
    print("Same group:", is_same)
print("\n--- SUMMARY ---")
if same_group_scores:
    print("Avg SAME group similarity:", round(np.mean(same_group_scores), 3))
else:
    print("No SAME group pairs found in sample")
if diff_group_scores:
    print("Avg DIFF group similarity:", round(np.mean(diff_group_scores), 3))
else:
    print("No DIFF group pairs found in sample")
print("\nDONE")
print("\n--- SAME GROUP CHECK (FORCED) ---")
grouped = df.groupby("group_id")
count = 0
for group_id, group in grouped:
    if len(group) >= 2:
        rows = group.sample(n=2, random_state=42)
        idx1, idx2 = rows.index
        emb1 = embeddings[idx1].reshape(1, -1)
        emb2 = embeddings[idx2].reshape(1, -1)
        similarity = cosine_similarity(emb1, emb2)[0][0]
        print("\n----------------------")
        print("Text 1:", rows.iloc[0]["text"])
        print("Text 2:", rows.iloc[1]["text"])
        print("Similarity:", round(similarity, 3))
        print("Same group: True")
        count += 1
        if count >= 10:
            break