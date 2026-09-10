# CLAUDE.md - AI Support Agent (SupportMind)

This document provides Claude Code and AI agents with project context, commands, architectural patterns, and execution standards.

> **MANDATORY UPDATE PROTOCOL:**
> Whenever you complete a task or make codebase modifications, you **MUST** update this file (`CLAUDE.md`), `AGENTS.md`, and append an entry to `.claude/memory/changes_log.md` and `.agents/memory/changes_log.md`.

---

## 1. Quick Reference & Commands

### Infrastructure (Docker Desktop)
```bash
# Start Qdrant Vector DB & PostgreSQL 16
docker compose up -d

# Verify container status
docker ps

# Stop containers
docker compose down
```

### Frontend (React 19 + Vite 8 + TypeScript)
```bash
# Start development server (http://localhost:5173)
npm run dev

# Run production build validation
npm run build

# Run Oxlint
npm run lint
```

### Backend (FastAPI + Uvicorn + Python 3.12)
```powershell
# Run backend dev server with hot reload (http://localhost:8000)
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# Install newly added requirements
.\venv\Scripts\pip.exe install -r requirements.txt
```
- API Swagger Documentation: `http://localhost:8000/docs`
- Qdrant Web Dashboard: `http://localhost:6333/dashboard`

---

## 2. Project Architecture & Memory

Full persistent memory and history logs are maintained in:
- Memory: `.claude/memory/project_memory.md` and `.agents/memory/project_memory.md`
- Change Log: `.claude/memory/changes_log.md` and `.agents/memory/changes_log.md`

### Core Components
```
ai-support-agent/
├── .claude/
│   ├── memory/                   # Architectural memory & continuous change log
│   └── skills/                   # 30 workflow skills (UI/UX, Apple, Anthropic, Vercel)
├── .agents/                      # Agentic memory & rules mirror
├── backend/
│   ├── .env                      # Environment secrets (Groq API, Qdrant, DB)
│   ├── database.py               # SQLAlchemy database connection & session
│   ├── main.py                   # FastAPI routing, middleware, health check
│   ├── models.py                 # SQLAlchemy relational schema
│   ├── requirements.txt          # Backend dependencies
│   ├── schemas.py                # Pydantic schemas
│   ├── venv/                     # Python 3.12 virtual environment
│   ├── data/
│   │   ├── extract_apple_support.py # Kaggle TWCS streaming ETL script
│   │   ├── apple_support_dataset.json # 300 clean paired conversations
│   │   └── ingest_kaggle_apple.py  # Ingestion into PostgreSQL & Qdrant
│   ├── routers/
│   │   ├── conversations.py      # Conversation list & detail API (with historical replies)
│   │   ├── agent.py              # AI process triage endpoint (classify, RAG, reply, escalate)
│   │   ├── knowledge.py          # Qdrant vector search endpoints
│   │   └── analytics.py          # Metrics summary & 7-day trend API
│   ├── services/
│   │   ├── classifier.py         # Hybrid intent classification & sentiment analysis
│   │   ├── embeddings.py         # BAAI/bge-small-en-v1.5 embeddings
│   │   ├── rag_service.py        # Qdrant query_points vector retrieval & batch upsert
│   │   ├── reply_generator.py    # Grounded response generation via Groq SDK
│   │   └── escalation.py         # Human escalation rules engine
│   ├── models.py                 # SQLAlchemy relational schema
│   ├── schemas.py                # Pydantic v2 schemas
│   ├── database.py               # Engine, SessionLocal, Settings
│   └── main.py                   # FastAPI app with CORS middleware
├── src/
│   ├── components/
│   │   ├── agent/
│   │   │   ├── ConversationCard.tsx
│   │   │   ├── ConversationDrawer.tsx # Apple Inspector Sheet with historical reply grounding
│   │   │   ├── ConfidenceIndicator.tsx
│   │   │   ├── EscalationPanel.tsx
│   │   │   ├── ReplyDraft.tsx
│   │   │   └── IntentBadge.tsx
│   │   ├── charts/
│   │   │   ├── IntentDistribution.tsx
│   │   │   └── ResolutionTrend.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── ui/                   # 53 shadcn/ui primitives
│   ├── pages/
│   │   ├── Dashboard.tsx         # Live metrics (300 convs) & analytics
│   │   ├── Conversations.tsx     # Apple segmented control tabs & mail preview cards
│   │   ├── AgentWorkbench.tsx    # Live AI sandbox testing
│   │   ├── KnowledgeBase.tsx     # Vector search UI
│   │   └── Settings.tsx          # Infrastructure status & settings
│   ├── store/useAppStore.ts      # Zustand global state
│   ├── App.tsx                   # Main router shell
│   ├── index.css                 # Apple HIG light theme tokens & SF typography
│   └── main.tsx                  # QueryClientProvider & root mount
├── docker-compose.yml            # Docker services: supportmind-qdrant & supportmind-postgres
└── components.json               # shadcn/ui configuration
```

---

## 3. Installed Skills in `.claude/skills/`

The `.claude/skills/` directory contains 30 ready-to-use skills:
1. **`apple-design-skill`**: Apple Human Interface Guidelines, craftsmanship, aesthetic polish, and micro-interactions.
2. **`ui-ux-pro-max`**: Design intelligence, color harmony palettes, font pairings, and responsive styling.
3. **Anthropic Suite (19 Skills)**:
   - `frontend-design`, `web-artifacts-builder`, `webapp-testing`
   - `canvas-design`, `algorithmic-art`, `theme-factory`
   - `mcp-builder`, `skill-creator`, `claude-api`
   - `docx`, `pdf`, `pptx`, `xlsx`, `brand-guidelines`, `internal-comms`, etc.
4. **Vercel Suite (9 Skills)**:
   - `react-best-practices`, `web-design-guidelines`, `composition-patterns`
   - `react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `writing-guidelines`, etc.

---

## 4. Code Style & Engineering Standards

- **React & TypeScript**:
  - Always enforce strict typing; avoid `any`.
  - Use `@/*` imports (e.g. `@/components/ui/button`, `@/lib/utils`, `@/store/useAppStore`).
  - Use functional components with React hooks.
  - Wrap async server queries in TanStack Query (`useQuery`, `useMutation`).
- **Styling**:
  - Follow Tailwind CSS v4 conventions.
  - Utilize shadcn/ui patterns with `cn()` utility.
  - Maintain high visual polish (subtle borders, glassmorphism, responsive grid layouts).
- **Python & FastAPI**:
  - Use Pydantic models for all request bodies and response models.
  - Use SQLAlchemy models for relational data and depend on `get_db` session generator.
  - Follow async endpoints for non-blocking I/O operations.
- **Continuous Update**:
  - Log every completed task into `.claude/memory/changes_log.md` and keep `CLAUDE.md` up to date.
