import argparse
import pandas as pd
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
from embed import encode_dataset
from cluster import cluster_embeddings
from utils import clean_text

def main():
    parser = argparse.ArgumentParser(description="Evaluate embedding and clustering performance")
    parser.add_argument("--input", type=str, default="tatoeba_merged.csv", help="Input dataset with known group_id")
    parser.add_argument("--model", type=str, default="paraphrase-multilingual-MiniLM-L12-v2", help="Model name")
    parser.add_argument("--eps", type=float, default=0.3, help="DBSCAN eps")
    args = parser.parse_args()

    print(f"Loading {args.input}...")
    try:
        df = pd.read_csv(args.input)
    except FileNotFoundError:
        print(f"Error: Could not find {args.input}. Please ensure the data exists.")
        return

    if "group_id" not in df.columns:
        print("Error: Dataset must contain a 'group_id' column for ground truth evaluation.")
        return
    
    text_col = "text" if "text" in df.columns else "name"

    group_sizes = df["group_id"].value_counts()
    valid_groups = group_sizes[group_sizes >= 2].index
    df = df[df["group_id"].isin(valid_groups)]
    
    if len(valid_groups) > 200:
        sampled_groups = np.random.choice(valid_groups, 200, replace=False)
        df = df[df["group_id"].isin(sampled_groups)]
    
    df = df.reset_index(drop=True)
    print(f"Evaluating on {len(df)} records ({df['group_id'].nunique()} groups).")

    texts = df[text_col].astype(str).apply(clean_text).tolist()
    
    print("Generating embeddings...")
    vectors = encode_dataset(texts, model_name=args.model)
    
    print("Clustering...")
    predicted_labels = cluster_embeddings(vectors, eps=args.eps)

    print("\nCalculating metrics by generating all pairs...")
    
    n = len(df)
    
    if n > 2000:
        print("Dataset too large for exhaustive pair calculation. Please sample.")
        return

    true_labels = df["group_id"].values
    
    y_true = (true_labels[:, None] == true_labels[None, :]).astype(int).flatten()
    y_pred = (predicted_labels[:, None] == predicted_labels[None, :]).astype(int).flatten()
    
    mask = ~np.eye(n, dtype=bool).flatten()
    y_true = y_true[mask]
    y_pred = y_pred[mask]
    
    noise_mask = (predicted_labels[:, None] == -1) & (predicted_labels[None, :] == -1)
    noise_mask = noise_mask.flatten()[mask]
    y_pred[noise_mask] = 0 # -1 and -1 are not in the same cluster conceptually

    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print("\n--- EVALUATION RESULTS ---")
    print(f"Precision: {precision:.3f} (When model says duplicate, how often is it right?)")
    print(f"Recall:    {recall:.3f} (Out of all true duplicates, how many did it find?)")
    print(f"F1-Score:  {f1:.3f} (Harmonic mean of Precision and Recall)")
    print("--------------------------")

if __name__ == "__main__":
    main()
