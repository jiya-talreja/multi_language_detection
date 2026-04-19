import numpy as np
from sentence_transformers import SentenceTransformer

def encode_dataset(texts: list[str], model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", batch_size: int = 32):
    """
    Encodes a list of strings into embeddings.
    """
    print(f"Loading model: {model_name}")
    model = SentenceTransformer(model_name)
    
    print(f"Encoding {len(texts)} texts...")
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=True)
    
    return embeddings
