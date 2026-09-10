"""
Embedding service using sentence-transformers (BAAI/bge-small-en-v1.5)
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from functools import lru_cache

@lru_cache(maxsize=1)
def get_model():
    """Load model once and cache it."""
    return SentenceTransformer("BAAI/bge-small-en-v1.5")

def embed_text(text: str) -> list[float]:
    """Embed a single text string."""
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts."""
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()
