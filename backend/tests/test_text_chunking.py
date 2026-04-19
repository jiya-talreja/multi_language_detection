import pandas as pd
from text_chunking import chunk_text_multilingual, chunk_dataframe

def test_chunk_text_multilingual():
    text = "Hello world. " * 50  # 650 chars
    
    # Short text, no chunking
    chunks = chunk_text_multilingual(text, max_chars=800)
    assert len(chunks) == 1
    assert chunks[0] == text.strip()
    
    # Long text, needs chunking
    long_text = "A" * 800 + " " + "B" * 400
    chunks = chunk_text_multilingual(long_text, max_chars=800, overlap=100)
    assert len(chunks) == 2
    assert "A" * 800 in chunks[0]
    assert "B" * 400 in chunks[1]

def test_chunk_dataframe():
    data = {
        "id": [1, 2],
        "name": ["Doc 1", "Doc 2"],
        "text": ["Short text.", "Long text. " * 100]  # Doc 2 is ~1100 chars
    }
    df = pd.DataFrame(data)
    
    chunked_df = chunk_dataframe(df, max_chars=800, overlap=100)
    
    # Doc 1 should be 1 row, Doc 2 should be at least 2 rows
    assert len(chunked_df) > 2
    
    # Check parent ids
    assert chunked_df.iloc[0]["parent_id"] == 1
    assert chunked_df.iloc[0]["is_chunked"] == False
    
    assert chunked_df.iloc[1]["parent_id"] == 2
    assert chunked_df.iloc[1]["is_chunked"] == True
    assert chunked_df.iloc[1]["chunk_id"] == 0
    assert chunked_df.iloc[2]["chunk_id"] == 1
