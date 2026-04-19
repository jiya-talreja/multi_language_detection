import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import pandas as pd
from normalize import standardize_dataframe

def test_standardize_dataframe_exact_match():
    df = pd.DataFrame({
        'Name': ['Apple', 'Banana'],
        'Description': ['A fruit', 'Another fruit'],
        'ID': [101, 102]
    })
    
    result = standardize_dataframe(df)
    
    assert list(result.columns) == ['id', 'name', 'description', 'language']
    assert result['name'].tolist() == ['Apple', 'Banana']
    assert result['description'].tolist() == ['A fruit', 'Another fruit']
    assert result['id'].tolist() == [101, 102]

def test_standardize_dataframe_partial_match():
    df = pd.DataFrame({
        'product_title': ['Apple', 'Banana'],
        'item_desc': ['A fruit', 'Another fruit']
    })
    
    result = standardize_dataframe(df)
    
    assert list(result.columns) == ['id', 'name', 'description', 'language']
    assert result['name'].tolist() == ['Apple', 'Banana']
    assert result['description'].tolist() == ['A fruit', 'Another fruit']
    assert result['id'].tolist() == [1, 2] # Auto-generated IDs

def test_standardize_dataframe_missing_desc():
    df = pd.DataFrame({
        'name': ['Apple', 'Banana']
    })
    
    result = standardize_dataframe(df)
    assert result['name'].tolist() == ['Apple', 'Banana']
    assert result['description'].tolist() == ['', '']

def test_standardize_dataframe_fallback():
    # If no recognized columns exist, it should fallback to combining strings
    df = pd.DataFrame({
        'weird_col1': ['Apple', 'Banana'],
        'weird_col2': ['A fruit', 'Another fruit']
    })
    
    result = standardize_dataframe(df)
    assert result['name'].tolist() == ['Apple A fruit', 'Banana Another fruit']
    assert result['description'].tolist() == ['', '']
