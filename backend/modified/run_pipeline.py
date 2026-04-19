import argparse
import pandas as pd

from embed import encode_dataset
from cluster import cluster_embeddings
from normalize import load_file, standardize_dataframe


def print_groups(df):
    print("\n--- GROUPS ---")

    grouped = df.groupby("predicted_group_id")

    for gid, group in grouped:
        if gid == -1:
            continue

        # 🔥 remove duplicate sentences
        group = group.drop_duplicates(subset=["text"])

        # 🔥 optional: keep only one per language (if column exists)
        if "language" in group.columns:
            group = group.drop_duplicates(subset=["language"])

        print(f"\n--- GROUP {gid} (size={len(group)}) ---")

        # 🔥 print nicely using pandas
        print(group[["text"]].to_string(index=False))


def main():
    parser = argparse.ArgumentParser(description="Multilingual semantic deduplication pipeline")

    parser.add_argument("--input", type=str, required=True, help="Input CSV/XLSX file path")
    parser.add_argument("--model", type=str, default="paraphrase-multilingual-MiniLM-L12-v2")

    args = parser.parse_args()

    # -------------------------------
    # STEP 1: LOAD + NORMALIZE
    # -------------------------------
    print(f"Reading and normalizing data from {args.input}...")

    try:
        raw_df = load_file(args.input)
        df = standardize_dataframe(raw_df)
    except Exception as e:
        print(f"Failed to load dataset: {str(e)}")
        return

    # -------------------------------
    # STEP 2: FILTER EMPTY TEXT
    # -------------------------------
    print("Preparing AI-ready text...")

    df = df[df["text"].astype(str).str.strip() != ""].copy()

    if df.empty:
        print("No valid text found. Exiting.")
        return

    texts = df["text"].tolist()

    # -------------------------------
    # STEP 3: EMBEDDINGS
    # -------------------------------
    embeddings = encode_dataset(texts, model_name=args.model)

    # -------------------------------
    # STEP 4: CLUSTERING (HDBSCAN + UMAP)
    # -------------------------------
    groups = cluster_embeddings(embeddings, df)

    # -------------------------------
    # STEP 5: PRINT OUTPUT
    # -------------------------------
    print_groups(groups)

    print("\nDone.")


if __name__ == "__main__":
    main()
