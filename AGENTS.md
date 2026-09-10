# AI Support Agent (SupportMind) - Agent Architecture & Context

> **CRITICAL RULE FOR ALL AI AGENTS:**
> Whenever you complete a task, feature implementation, refactoring, or configuration change, you **MUST** update this file (`AGENTS.md`), `CLAUDE.md`, and append an entry to `.agents/memory/changes_log.md` and `.claude/memory/changes_log.md`. Always keep project status, file trees, and architecture documentation synchronized.

---

## 1. Project Overview & Identity
**SupportMind** is an enterprise AI Support Agent system featuring:
- **Intelligent Customer Support**: Automated ticket resolution, triage, and RAG-powered responses.
- **Modern Interactive Dashboard**: Real-time agent monitoring, system metrics, and analytics.
- **Scalable Hybrid Data Storage**: PostgreSQL for relational ticket & user management + Qdrant for semantic vector search over knowledge bases.

---

## 2. Technology Stack

### Frontend (`/src`)
- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, CSS Variables
- **UI System**: shadcn/ui primitives (`class-variance-authority`, `clsx`, `tailwind-merge`)
- **Global State**: Zustand (`src/store/useAppStore.ts`)
- **Async Data & Caching**: TanStack Query v5 (`@tanstack/react-query`)
- **Charts & Visuals**: Recharts (`recharts`)
- **Icons**: Lucide React (`lucide-react`)
- **Path Aliases**: `@/*` maps to `./src/*`

### Backend (`/backend`)
- **Framework**: FastAPI (Python 3.12, ASGI)
- **ASGI Server**: Uvicorn with reload support
- **Validation**: Pydantic v2 & `pydantic-settings`
- **Database ORM**: SQLAlchemy 2.0 (`psycopg2-binary` for PostgreSQL, SQLite fallback)
- **Vector Database**: Qdrant (`qdrant-client`)
- **AI & Embedding Models**:
  - LLM Inference: Groq SDK (`groq`)
  - Embeddings: Sentence Transformers (`BAAI/bge-small-en-v1.5`)
- **Data & Analytics**: Pandas, NumPy, Scikit-learn, HTTPX

### Infrastructure & Containers (`docker-compose.yml`)
- **Qdrant Vector DB**: `supportmind-qdrant` on `http://localhost:6333` (REST API & Web Dashboard), `6334` (gRPC)
- **PostgreSQL 16**: `supportmind-postgres` on `localhost:5432` (`postgres:postgres@localhost:5432/supportmind`)

---

## 3. Essential Commands & Run Workflows

### Docker Services
```powershell
# Start Qdrant & PostgreSQL
docker compose up -d

# Check running status
docker ps

# Stop services
docker compose down
```

### Frontend Development
```powershell
# Install Node dependencies
npm install

# Run Vite dev server (http://localhost:5173)
npm run dev

# Production build test
npm run build
```

### Backend Development
```powershell
# Activate virtual environment
cd backend
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI dev server (http://localhost:8000)
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

---

## 4. Implemented Application Architecture

### Frontend Pages (`src/pages/`)
1. **Dashboard** (`Dashboard.tsx`): Real-time metrics overview (Total Conversations, Auto-handled Rate, Escalated Count, Resolution Rate, Avg AI Confidence), 7-day resolution trend chart, and intent distribution donut chart.
2. **Conversations** (`Conversations.tsx`): Two-panel conversation explorer with intent and escalation filters, confidence bars, customer sentiment indicators, and detailed Apple Support tweet threads.
3. **AI Workbench** (`AgentWorkbench.tsx`): Interactive testing sandbox for the agent. Test any customer message or pick preset customer issues; executes real-time intent classification, semantic RAG search over historical resolutions, Groq-powered drafted reply, and human escalation triage.
4. **Knowledge Base** (`KnowledgeBase.tsx`): Vector database explorer querying Qdrant collection `apple_support_conversations` (384-dim BGE embeddings) with cosine similarity scores and payload previews.
5. **Settings** (`Settings.tsx`): System status dashboard displaying live connectivity for FastAPI, PostgreSQL 16, Qdrant Vector DB, Groq LLM inference, and embedding models.

### Backend Endpoints (`backend/routers/`)
- `GET /api/health`: System connectivity status (Qdrant + PostgreSQL).
- `GET /api/conversations`: Paginated conversation list with filters by intent and escalation status.
- `GET /api/conversations/{id}`: Detailed conversation with full tweet thread.
- `POST /api/agent/process`: End-to-end agent triage pipeline: intent classification, sentiment analysis, Qdrant RAG search, Groq drafted reply, and escalation decision.
- `POST /api/knowledge/search`: Semantic vector search against Qdrant collection with similarity scores.
- `GET /api/knowledge/stats`: Total vectors and collection metadata.
- `GET /api/analytics/summary`: Aggregate KPIs and intent distribution.
- `GET /api/analytics/trend`: 7-day resolution and volume timeline.

### AI & Agent Services (`backend/services/`)
- `classifier.py`: Hybrid intent classification with confidence scoring across 7 core support categories and sentiment scoring.
- `embeddings.py`: SentenceTransformer (`BAAI/bge-small-en-v1.5`) with 384-dimensional normalized embeddings and LRU caching.
- `rag_service.py`: Qdrant vector database integration utilizing `query_points` for sub-millisecond semantic retrieval.
- `reply_generator.py`: Grounded response generation leveraging historical Apple Support patterns (`^AS` signoff) via Groq SDK.
- `escalation.py`: Rule-based and sentiment-informed escalation engine routing to human agents when confidence is low or sentiment is critical.

---

## 5. Installed Agent Skills & Best Practices

Both `.agents/skills/` and `.claude/skills/` are loaded with 30 high-impact skills for design, engineering, and testing:

1. **Apple Design Guidelines** (`apple-design-skill`): Apple Human Interface Guidelines, craftsmanship, aesthetic polish, micro-interactions, layout precision.
2. **UI/UX Pro Max** (`ui-ux-pro-max`): Advanced design systems, curated color palettes, typography pairings, component styling rules, responsive layout intelligence.
3. **Anthropic Official Skills**:
   - `frontend-design`: Modern web application layouts, typography, and responsive patterns.
   - `web-artifacts-builder`: Rich single-page apps and reactive components.
   - `webapp-testing`: End-to-end and component validation patterns.
   - `canvas-design` & `algorithmic-art`: Visual compositions and graphic components.
   - `mcp-builder` & `skill-creator`: Creating new agent workflows and tools.
   - `doc-coauthoring`, `docx`, `pdf`, `pptx`, `xlsx`: Multi-format report and data generation.
4. **Vercel Agent Skills**:
   - `react-best-practices`: Code-splitting, React 19 features, performance optimization.
   - `web-design-guidelines`: Accessibility, layout hierarchy, and contrast standards.
   - `composition-patterns`: Scalable component design.
   - `react-view-transitions`: Fluid page and state transitions.
   - `vercel-optimize` & `deploy-to-vercel`: Production optimization and deployment configurations.

---

## 6. Agent Update Protocol (MANDATORY)

Every agent working on this codebase must adhere to the following protocol:
1. **Pre-flight**: Inspect `.agents/memory/project_memory.md` and `.agents/memory/changes_log.md` before executing new tasks.
2. **Execution**: Follow strict type safety (TypeScript & Pydantic), modern aesthetic standards (Tailwind v4 / shadcn / Apple Design HIG), and clean modular architecture.
3. **Post-flight Update**:
   - Update `AGENTS.md` and `CLAUDE.md` to reflect any new routes, components, or dependencies.
   - Append completed task details into `.agents/memory/changes_log.md` and `.claude/memory/changes_log.md`.
