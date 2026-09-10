"""Knowledge base router — search and inspect Qdrant."""
from fastapi import APIRouter
from schemas import KnowledgeSearchRequest, KnowledgeSearchResponse, KnowledgeSearchResult
from services.rag_service import search_similar, get_collection_count

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge"])


@router.post("/search", response_model=KnowledgeSearchResponse)
def search_knowledge(req: KnowledgeSearchRequest):
    results = search_similar(req.query, top_k=req.top_k)
    return KnowledgeSearchResponse(
        results=[KnowledgeSearchResult(**r) for r in results],
        query=req.query,
        total=len(results),
    )


@router.get("/stats")
def knowledge_stats():
    count = get_collection_count()
    return {"total_vectors": count, "collection": "apple_support_conversations"}
