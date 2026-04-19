import unicodedata
import re

def clean_text(text: str) -> str:
    """
    Cleans and normalizes text for better embedding quality.
    - Normalizes unicode characters
    - Lowercases
    - Removes extra whitespace
    """
    if not isinstance(text, str):
        return ""
    
    # Normalize unicode (e.g., NFKC normalizes compatibility characters to their canonical forms)
    text = unicodedata.normalize('NFKC', text)
    
    # Lowercase
    text = text.lower()
    
    # Remove basic HTML tags if any
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Remove extra whitespace
    text = " ".join(text.split())
    
    return text
