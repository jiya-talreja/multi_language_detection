import pandas as pd
from normalize import standardize_dataframe

def test_text_combination():
    data = [
        {"name": "Apple iPhone 13", "description": "Latest smartphone from Apple", "other": "junk"},
        {"name": "Samsung Galaxy", "description": "Samsung Galaxy", "other": "junk"}, # Same
        {"name": "Nike Shoes", "description": "", "other": "junk"}, # Empty desc
        {"name": "", "description": "Just a description", "other": "junk"}, # Empty name
        {"name": "Sony TV", "description": "Sony TV 4K Ultra HD", "other": "junk"}, # Subset
        {"name": "Bose Headphones", "description": "High quality Bose Headphones", "other": "junk"}, # Subset reverse
        {"name": "Toyota", "description": "Corolla", "other": "junk"}, # Different
    ]
    df = pd.DataFrame(data)
    std_df = standardize_dataframe(df)
    
    # Expected results (cleaned)
    expected = [
        "apple iphone 13: latest smartphone from apple",
        "samsung galaxy",
        "nike shoes",
        "just a description",
        "sony tv 4k ultra hd",
        "high quality bose headphones",
        "toyota: corolla"
    ]
    
    results = std_df['text'].tolist()
    
    for i, res in enumerate(results):
        print(f"Row {i}: '{res}' (Expected: '{expected[i]}')")
        assert res == expected[i]

if __name__ == "__main__":
    test_text_combination()
    print("\nAll text combination tests passed!")
