import pandas as pd
import logging

logger = logging.getLogger(__name__)

def chunk_text_multilingual(text: str, max_chars: int = 800, overlap: int = 100) -> list[str]:
    """
    Splits text into chunks of at most `max_chars` characters, with an overlap of `overlap` characters.
    Tries to find natural break points (spaces, punctuation) to avoid splitting words.
    """
    if not isinstance(text, str) or not text.strip():
        return []
        
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
        
    chunks = []
    start = 0
    text_len = len(text)
    
    # Natural break points
    breaks = {' ', '\n', '\t', '.', ',', '。', '、', '！', '？', ';', '!', '?'}
    
    while start < text_len:
        end = start + max_chars
        
        if end >= text_len:
            chunks.append(text[start:].strip())
            break
            
        # Try to find a natural break point near the end
        break_point = end
        for i in range(end, max(start, end - overlap), -1):
            if text[i-1] in breaks:
                break_point = i
                break
                
        chunk = text[start:break_point].strip()
        if chunk:
            chunks.append(chunk)
            
        # Ensure we move forward and overlap correctly
        next_start = break_point - overlap
        if next_start <= start:
            # Fallback if overlap is too large or no break point was found
            next_start = break_point
            
        start = next_start
        
    return chunks

def chunk_dataframe(df: pd.DataFrame, text_col: str = "text", max_chars: int = 800, overlap: int = 100) -> pd.DataFrame:
    """
    Takes a normalized DataFrame and chunks the text column into multiple rows if necessary.
    Preserves all original columns and adds 'parent_id', 'chunk_id', and 'is_chunked' columns.
    """
    if df.empty or text_col not in df.columns:
        return df.copy()
        
    chunked_records = []
    
    # Ensure there's a unique id for parent tracking if not present
    df = df.copy()
    if "id" not in df.columns:
        df["id"] = range(len(df))
        
    for idx, row in df.iterrows():
        text = str(row.get(text_col, ""))
        chunks = chunk_text_multilingual(text, max_chars, overlap)
        
        if not chunks:
            # Handle empty texts gracefully
            record = row.to_dict()
            record["parent_id"] = row["id"]
            record["chunk_id"] = 0
            record["is_chunked"] = False
            chunked_records.append(record)
            continue
            
        is_chunked = len(chunks) > 1
        for i, chunk_text in enumerate(chunks):
            record = row.to_dict()
            record[text_col] = chunk_text
            record["parent_id"] = row["id"]
            record["chunk_id"] = i
            record["is_chunked"] = is_chunked
            
            # Provide a unique ID for the chunk so downstream systems don't confuse rows
            if is_chunked:
                record["id"] = f"{row['id']}_chunk{i}"
                
            chunked_records.append(record)
            
    result_df = pd.DataFrame(chunked_records)
    logger.info(f"Chunking complete. Expanded {len(df)} records into {len(result_df)} chunks.")
    return result_df
