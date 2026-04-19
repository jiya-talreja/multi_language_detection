import numpy as np
from sentence_transformers import SentenceTransformer

# Global model instance
_model = None

def get_model(model_name: str):
    global _model
    if _model is None:
        print(f"Loading model into memory: {model_name}")
        _model = SentenceTransformer(model_name)
    return _model

def encode_dataset(texts: list[str], model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", batch_size: int = 32):
    """
    Encodes a list of strings into embeddings.
    """
    model = get_model(model_name)
    
    print(f"Encoding {len(texts)} texts...")
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=True)
    
    return embeddings
