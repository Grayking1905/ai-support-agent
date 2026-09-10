"""
RAG service: semantic search over Apple Support conversations in Qdrant.
"""
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from qdrant_client.http.exceptions import UnexpectedResponse
from services.embeddings import embed_text
from database import settings

COLLECTION_NAME = "apple_support_conversations"
VECTOR_SIZE = 384  # BAAI/bge-small-en-v1.5 dim


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)


def ensure_collection():
    """Create the Qdrant collection if it doesn't exist."""
    client = get_qdrant_client()
    try:
        client.get_collection(COLLECTION_NAME)
    except Exception:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
    return client


def search_similar(query: str, top_k: int = 5, intent_filter: str | None = None) -> list[dict]:
    """
    Search Qdrant for similar Apple Support conversations.
    Returns list of {text, score, intent, source_handle}.
    """
    client = ensure_collection()
    query_vector = embed_text(query)

    search_filter = None
    if intent_filter:
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue
        search_filter = Filter(
            must=[FieldCondition(key="intent", match=MatchValue(value=intent_filter))]
        )

    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        query_filter=search_filter,
        with_payload=True,
    )
    points = response.points if hasattr(response, "points") else response

    return [
        {
            "text": r.payload.get("text", "") if r.payload else "",
            "score": round(r.score, 4),
            "intent": r.payload.get("intent") if r.payload else None,
            "source_handle": r.payload.get("source_handle") if r.payload else None,
            "reply": r.payload.get("reply") if r.payload else None,
        }
        for r in points
    ]


def upsert_conversation(
    doc_id: str,
    text: str,
    intent: str,
    source_handle: str | None = None,
    reply: str | None = None,
):
    """Upsert a conversation into Qdrant."""
    client = ensure_collection()
    vector = embed_text(text)
    point = PointStruct(
        id=abs(hash(doc_id)) % (2**63),
        vector=vector,
        payload={
            "doc_id": doc_id,
            "text": text,
            "intent": intent,
            "source_handle": source_handle,
            "reply": reply,
        },
    )
    client.upsert(collection_name=COLLECTION_NAME, points=[point])


def get_collection_count() -> int:
    """Get total number of vectors in the collection."""
    try:
        client = ensure_collection()
        info = client.get_collection(COLLECTION_NAME)
        return info.points_count or info.vectors_count or 0
    except Exception:
        return 0
