import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Database, Search, Loader2, BarChart2 } from 'lucide-react'
import IntentBadge from '@/components/agent/IntentBadge'

const API = 'http://localhost:8000'

const MOCK_RESULTS = [
  { text: "My iPhone 15 Pro won't turn on after updating to iOS 17.4. Completely dead screen!", score: 0.94, intent: 'device_issue', source_handle: '@mike_tech' },
  { text: "My iPhone 14 battery is draining super fast. Goes from 100% to 20% in 3 hours.", score: 0.87, intent: 'device_issue', source_handle: '@battery_drain' },
  { text: "My MacBook Air M3 gets extremely hot even when doing basic tasks like browsing.", score: 0.81, intent: 'device_issue', source_handle: '@overheating_mac' },
]

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: 4, borderRadius: '99px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', background: 'var(--accent-light)' }} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-light)', width: '30px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)

  const mutation = useMutation({
    mutationFn: async (body: { query: string; top_k: number }) => {
      const res = await fetch(`${API}/api/knowledge/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
  })

  const results = mutation.data?.results ?? (mutation.isError ? MOCK_RESULTS : null)

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Database size={18} style={{ color: 'var(--accent-light)' }} />
          <h1>Knowledge Base</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Semantic search over the Apple Support RAG vector index in Qdrant.
        </p>
      </div>

      {/* Search form */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && mutation.mutate({ query, top_k: topK })}
            placeholder="Search for similar Apple Support conversations..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 200ms ease',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(0,102,204,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <select
            value={topK}
            onChange={e => setTopK(Number(e.target.value))}
            style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {[3, 5, 10].map(n => <option key={n} value={n}>Top {n}</option>)}
          </select>
          <button
            onClick={() => query.trim() && mutation.mutate({ query, top_k: topK })}
            disabled={mutation.isPending || !query.trim()}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0066CC, #338FE8)',
              border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.875rem',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: mutation.isPending || !query.trim() ? 0.5 : 1,
            }}
          >
            {mutation.isPending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{mutation.data?.query ?? query}"
          </div>
          {results.map((r: { text: string; score: number; intent?: string; source_handle?: string }, i: number) => (
            <div key={i} className="card fade-in-up" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', animationDelay: `${i * 50}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {r.intent && <IntentBadge intent={r.intent} size="sm" />}
                  {r.source_handle && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.source_handle}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart2 size={12} style={{ color: 'var(--accent-light)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                    {Math.round(r.score * 100)}% match
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {r.text}
              </p>
              <ScoreBar score={r.score} />
            </div>
          ))}
        </div>
      )}

      {!results && !mutation.isPending && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Database size={36} style={{ opacity: 0.25, marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem' }}>Enter a query to search similar conversations in the vector index</p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
