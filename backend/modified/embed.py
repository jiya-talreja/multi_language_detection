import numpy as np
from sentence_transformers import SentenceTransformer

_model = None

def get_model(model_name: str):
    global _model
    if _model is None:
        print(f"Loading model: {model_name}")
        _model = SentenceTransformer(model_name)
    return _model


def encode_dataset(texts: list[str], model_name: str, batch_size: int = 32):
    model = get_model(model_name)
    print("MODEL : ",model)
    print(f"Encoding {len(texts)} texts...")
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=True
    )

    return np.array(embeddings)
