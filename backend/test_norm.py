import argparse
import sys
from normalize import load_file, standardize_dataframe

def main():
    parser = argparse.ArgumentParser(description="Test the normalization layer.")
    parser.add_argument("file_path", type=str, help="Path to the file you want to test (e.g. data.json, data.xlsx)")
    
    args = parser.parse_args()

    print(f"\n--- Loading {args.file_path} ---")
    try:
        raw_df = load_file(args.file_path)
        print(f"\n[RAW DATA FOUND]")
        print(f"Total Rows: {len(raw_df)}")
        print(f"Columns Found: {list(raw_df.columns)}")
        print("First 2 rows of Raw Data:")
        print(raw_df.head(2))
        
        print(f"\n--- Running Normalization ---")
        std_df = standardize_dataframe(raw_df)
        
        print(f"\n[STANDARDIZED DATA]")
        print(f"Columns: {list(std_df.columns)}")
        print("First 3 rows of Standardized Data:")
        # We print name, description, and language to see the mapped result
        print(std_df[['id', 'name', 'description', 'language']].head(3))
        
        print("\nNormalization successful!")
        
    except Exception as e:
        print(f"\nError during normalization: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
