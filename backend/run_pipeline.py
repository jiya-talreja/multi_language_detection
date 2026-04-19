import argparse
import pathlib
import pandas as pd
from utils import clean_text
from embed import encode_dataset
from cluster import cluster_embeddings
from normalize import load_file, standardize_dataframe

def main():
    parser = argparse.ArgumentParser(description="Multilingual semantic deduplication pipeline")
    parser.add_argument("--input", type=str, required=True, help="Input CSV file path")
    parser.add_argument("--output", type=str, default="results", help="Output directory path")
    parser.add_argument("--model", type=str, default="paraphrase-multilingual-MiniLM-L12-v2", help="SentenceTransformer model name")
    parser.add_argument("--eps", type=float, default=0.3, help="DBSCAN eps parameter")
    parser.add_argument("--min-samples", type=int, default=2, help="DBSCAN min_samples parameter")
    parser.add_argument("--name-col", type=str, default="name", help="Column name for record name (or text)")
    parser.add_argument("--desc-col", type=str, default="description", help="Column name for record description")

    args = parser.parse_args()

    print(f"Reading and normalizing data from {args.input}...")
    try:
        raw_df = load_file(args.input)
        df = standardize_dataframe(raw_df, name_col=args.name_col, desc_col=args.desc_col)
    except Exception as e:
        print(f"Failed to load dataset: {str(e)}")
        return

    # Combine name and description, handling NaNs
    print("Cleaning and combining text fields...")
    def combine_and_clean(row):
        name = row['name']
        desc = row['description']
        combined = f"{name} {desc}"
        return clean_text(combined)

    df["clean_text"] = df.apply(combine_and_clean, axis=1)

    # Filter out empty records
    valid_mask = df["clean_text"].str.strip() != ""
    if not valid_mask.all():
        print(f"Dropping {len(df) - valid_mask.sum()} records with empty text after cleaning.")
        df = df[valid_mask].copy()

    texts = df["clean_text"].tolist()

    if not texts:
        print("No valid text data to process. Exiting.")
        return

    # Embed
    vectors = encode_dataset(texts, model_name=args.model)

    # Cluster
    groups = cluster_embeddings(vectors, eps=args.eps, min_samples=args.min_samples)
    
    # Assign cluster IDs
    df["predicted_group_id"] = groups

    # Setup output
    out_dir = pathlib.Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "deduped.csv"
    
    df.to_csv(out_file, index=False)
    print(f"Success! Output saved to {out_file}")

if __name__ == "__main__":
    main()
