import pandas as pd
import pathlib
import json
import langid
from utils import clean_text

def detect_language(text: str) -> str:
    if not text or not str(text).strip():
        return "unknown"
    try:
        lang, confidence = langid.classify(text)
        return lang
    except Exception:
        return "unknown"

def load_file(file_path: str) -> pd.DataFrame:
    path = pathlib.Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = path.suffix.lower()
    
    try:
        if ext == ".csv":
            try:
                return pd.read_csv(file_path, encoding='utf-8')
            except UnicodeDecodeError:
                return pd.read_csv(file_path, encoding='latin-1')

        elif ext == ".tsv":
            try:
                return pd.read_csv(file_path, sep='\t', encoding='utf-8')
            except UnicodeDecodeError:
                return pd.read_csv(file_path, sep='\t', encoding='latin-1')
                
        elif ext == ".xlsx":
            try:
                return pd.read_excel(file_path, engine='openpyxl')
            except Exception as e:
                if "not a zip file" in str(e).lower():
                    try:
                        return pd.read_csv(file_path)
                    except:
                        raise ValueError("The file has a .xlsx extension but is not a valid Excel file or CSV.")
                raise e
        elif ext == ".xls":
            try:
                return pd.read_excel(file_path)
            except Exception:
                raise ValueError("Older Excel (.xls) files are not supported. Please save as .xlsx or .csv.")
            
        elif ext == ".json":
            try:
                return pd.read_json(file_path)
            except ValueError:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if isinstance(data, dict):
                    for key, val in data.items():
                        if isinstance(val, list):
                            return pd.DataFrame(val)
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
    df = df.copy()
    
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
        
    DESC_HINTS = [
        'description', 'desc', 'details', 'info', 'body', 'content',
        'notes', 'summary', 'comment', 'answer', 'response', 'resolution',
        'context', 'explanation', 'full_text', 'narrative',
    ]
    actual_desc_col = None
    if desc_col and desc_col.lower().strip() in df.columns:
        actual_desc_col = desc_col.lower().strip()
    else:
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
        
    result = pd.DataFrame()
    
    if 'id' in df.columns:
        result['id'] = df['id']
    else:
        result['id'] = range(1, len(df) + 1)
        
    if actual_name_col:
        result['name'] = df[actual_name_col].fillna("").astype(str)
    else:
        result['name'] = ""
        
    if actual_desc_col:
        result['description'] = df[actual_desc_col].fillna("").astype(str)
    else:
        result['description'] = ""
        
    LANG_HINTS = ['language', 'lang', 'locale', 'detected_language', 'script']
    lang_col_found = None
    for hint in LANG_HINTS:
        if hint in df.columns:
            lang_col_found = hint
            break
    if lang_col_found:
        result['language'] = df[lang_col_found].fillna("").astype(str)
    else:
        print("Detecting language from content...")
        combined_text = result['name'] + " " + result['description']
        result['language'] = combined_text.apply(detect_language)
        
    if result['name'].str.strip().eq("").all() and result['description'].str.strip().eq("").all():
        string_cols = df.select_dtypes(include=['object', 'string']).columns
        if not string_cols.empty:
            result['name'] = df[string_cols].fillna("").astype(str).agg(' '.join, axis=1)

    desc_empty = result['description'].str.strip().eq("")
    name_has_content = result['name'].str.strip().ne("")
    if desc_empty.all() and name_has_content.any():
        result['description'] = result['name']

    def create_ai_text(row):
        name = str(row['name']).strip()
        desc = str(row['description']).strip()
        
        if not name and not desc:
            return ""
        if not name:
            return clean_text(desc)
        if not desc:
            return clean_text(name)
            
        n_low = name.lower()
        d_low = desc.lower()
        
        if n_low == d_low:
            return clean_text(name)
            
        combined = f"{name}: {desc}"
        return clean_text(combined)

    result['text'] = result.apply(create_ai_text, axis=1)

    return result
