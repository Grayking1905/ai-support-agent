from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, settings
from models import Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SupportMind API",
    description="AI Support Agent for Apple Support — Intent Classification, RAG-Powered Reply, Escalation Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from routers.conversations import router as conversations_router
from routers.agent import router as agent_router
from routers.knowledge import router as knowledge_router
from routers.analytics import router as analytics_router

app.include_router(conversations_router)
app.include_router(agent_router)
app.include_router(knowledge_router)
app.include_router(analytics_router)


@app.get("/api/health")
def health_check():
    # Quick connectivity checks
    qdrant_ok = False
    postgres_ok = False
    try:
        from services.rag_service import get_qdrant_client
        get_qdrant_client().get_collections()
        qdrant_ok = True
    except Exception:
        pass
    try:
        from database import engine
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("SELECT 1"))
        postgres_ok = True
    except Exception:
        pass

    return {
        "status": "operational" if (qdrant_ok and postgres_ok) else "degraded",
        "service": "SupportMind API",
        "version": "1.0.0",
        "qdrant_connected": qdrant_ok,
        "postgres_connected": postgres_ok,
    }
