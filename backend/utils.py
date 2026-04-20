import unicodedata
import re

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    
    text = unicodedata.normalize('NFKC', text)
    
    text = text.lower()
    
    text = re.sub(r'<[^>]+>', ' ', text)
    
    text = " ".join(text.split())
    
    return text
