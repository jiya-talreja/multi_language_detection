import pandas as pd
import pathlib
import json
import langid

def detect_language(text: str) -> str:
    """
    Detects the language of the given text using langid.
    Returns the ISO 639-1 language code.
    """
    if not text or not str(text).strip():
        return "unknown"
    try:
        lang, confidence = langid.classify(text)
        return lang
    except Exception:
        return "unknown"

def load_file(file_path: str) -> pd.DataFrame:
    """
    Robustly loads a file (CSV, Excel, JSON, XML) into a Pandas DataFrame.
    Handles encoding issues and basic file corruption.
    """
    path = pathlib.Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = path.suffix.lower()
    
    try:
        if ext == ".csv":
            # Try utf-8 first, fallback to latin-1 if there are weird characters
            try:
                return pd.read_csv(file_path, encoding='utf-8')
            except UnicodeDecodeError:
                return pd.read_csv(file_path, encoding='latin-1')

        elif ext == ".tsv":
            # Tab-separated values — same as CSV but with tab delimiter
            try:
                return pd.read_csv(file_path, sep='\t', encoding='utf-8')
            except UnicodeDecodeError:
                return pd.read_csv(file_path, sep='\t', encoding='latin-1')
                
        elif ext in [".xls", ".xlsx"]:
            return pd.read_excel(file_path)
            
        elif ext == ".json":
            # Pandas read_json is sometimes picky about formats (records vs split).
            # If read_json fails, try manual json loading.
            try:
                return pd.read_json(file_path)
            except ValueError:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # If the json is a dictionary containing a list, try to find the list
                if isinstance(data, dict):
                    for key, val in data.items():
                        if isinstance(val, list):
                            return pd.DataFrame(val)
                    # If no list found, just wrap the dict
                    return pd.DataFrame([data])
                elif isinstance(data, list):
                    return pd.DataFrame(data)
                else:
                    raise ValueError("JSON file structure not supported. Expecting a list of records.")
                    
        elif ext == ".xml":
            return pd.read_xml(file_path)
            
        else:
            raise ValueError(f"Unsupported file format: {ext}")
            
    except Exception as e:
        raise RuntimeError(f"Error parsing {ext} file: {str(e)}")

def standardize_dataframe(df: pd.DataFrame, name_col: str = None, desc_col: str = None) -> pd.DataFrame:
    """
    Standardizes the dataframe to guarantee 'id', 'name', and 'description' columns.
    If name_col or desc_col are not provided, it attempts to auto-detect them.
    """
    df = df.copy()
    
    # Standardize column names to lowercase for easier matching
    original_cols = list(df.columns)
    col_map = {col: str(col).lower().strip() for col in original_cols}
    df.rename(columns=col_map, inplace=True)
    
    # Auto-detect target column if not explicitly mapped
    def find_column(hints, exact_match=False):
        # First pass: look for exact matches
        for hint in hints:
            if hint in df.columns:
                return hint
        # Second pass: look for partial matches (e.g. 'product_name')
        if not exact_match:
            for col in df.columns:
                for hint in hints:
                    if hint in col:
                        return col
        return None

    # Resolve Name column
    # Broad hints: covers named-entity fields AND single-text datasets (query/complaint/message etc.)
    NAME_HINTS = [
        'name', 'title', 'header', 'subject', 'product', 'item',
        'query', 'complaint', 'request', 'message', 'sentence', 'input',
        'text', 'label', 'category', 'question', 'issue', 'ticket',
    ]
    actual_name_col = None
    if name_col and name_col.lower().strip() in df.columns:
        actual_name_col = name_col.lower().strip()
    else:
        actual_name_col = find_column(NAME_HINTS)
        
    # Resolve Description column
    # Don't steal the name column — skip it in desc search
    DESC_HINTS = [
        'description', 'desc', 'details', 'info', 'body', 'content',
        'notes', 'summary', 'comment', 'answer', 'response', 'resolution',
        'context', 'explanation', 'full_text', 'narrative',
    ]
    actual_desc_col = None
    if desc_col and desc_col.lower().strip() in df.columns:
        actual_desc_col = desc_col.lower().strip()
    else:
        # Search, but exclude the column already chosen as name
        for hint in DESC_HINTS:
            if hint in df.columns and df.columns.get_loc(hint) != (df.columns.get_loc(actual_name_col) if actual_name_col else -1):
                actual_desc_col = hint
                break
        if not actual_desc_col:
            for col in df.columns:
                if col == actual_name_col:
                    continue
                for hint in DESC_HINTS:
                    if hint in col:
                        actual_desc_col = col
                        break
                if actual_desc_col:
                    break
        
    # Enforce standard schema
    result = pd.DataFrame()
    
    # 1. ID
    if 'id' in df.columns:
        result['id'] = df['id']
    else:
        # Generate auto-incrementing ID
        result['id'] = range(1, len(df) + 1)
        
    # 2. Name
    if actual_name_col:
        result['name'] = df[actual_name_col].fillna("").astype(str)
    else:
        result['name'] = ""
        
    # 3. Description
    if actual_desc_col:
        result['description'] = df[actual_desc_col].fillna("").astype(str)
    else:
        result['description'] = ""
        
    # 4. Language (if present, keep it, otherwise assume unknown)
    LANG_HINTS = ['language', 'lang', 'locale', 'detected_language', 'script']
    lang_col_found = None
    for hint in LANG_HINTS:
        if hint in df.columns:
            lang_col_found = hint
            break
    if lang_col_found:
        result['language'] = df[lang_col_found].fillna("").astype(str)
    else:
        # If no language column is found, attempt to detect it from content
        print("Detecting language from content...")
        # Combine name and description for better detection accuracy
        combined_text = result['name'] + " " + result['description']
        
        # Optimize by only detecting for the first 50 rows if the dataset is large, 
        # or do it for all if it's manageable. For the UI preview, we might just need a few.
        # But for full detection, we need all.
        result['language'] = combined_text.apply(detect_language)
        
    # --- Fallback: concatenate all string columns if we found literally nothing ---
    if result['name'].str.strip().eq("").all() and result['description'].str.strip().eq("").all():
        string_cols = df.select_dtypes(include=['object', 'string']).columns
        if not string_cols.empty:
            result['name'] = df[string_cols].fillna("").astype(str).agg(' '.join, axis=1)

    # --- Smart mirror: if description is empty but name has content, copy name into description ---
    # This ensures the embedding layer always has text to work with for single-text datasets.
    desc_empty = result['description'].str.strip().eq("")
    name_has_content = result['name'].str.strip().ne("")
    if desc_empty.all() and name_has_content.any():
        result['description'] = result['name']

    return result
