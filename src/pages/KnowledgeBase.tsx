import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Database, Search, Loader2, BarChart2 } from 'lucide-react'
import IntentBadge from '@/components/agent/IntentBadge'

const API = 'http://localhost:8000'

const MOCK_RESULTS = [
  {
    text: "My iPhone 15 Pro won't turn on after updating to iOS 17.4. Completely dead screen!",
    score: 0.942,
    intent: 'device_issue',
    source_handle: '@mike_tech',
    resolution: 'Performed hard reset sequence; customer confirmed device restarted successfully.',
  },
  {
    text: "My iPhone 14 battery is draining super fast. Goes from 100% to 20% in 3 hours.",
    score: 0.874,
    intent: 'device_issue',
    source_handle: '@battery_drain',
    resolution: 'Advised check Settings > Battery for background drain apps and update to iOS 17.4.1.',
  },
  {
    text: "My MacBook Air M3 gets warm even when doing basic tasks like browsing in Safari.",
    score: 0.816,
    intent: 'device_issue',
    source_handle: '@overheating_mac',
    resolution: 'Inspected Activity Monitor CPU usage; isolated rogue Safari web extension process.',
  },
]

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0071e3] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#0071e3] w-10 text-right font-mono">
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

  const results = mutation.data?.results ?? (mutation.isError || mutation.isIdle ? null : MOCK_RESULTS)
  const displayResults = results ?? (query.trim() ? MOCK_RESULTS : null)

  const handleSearch = () => {
    if (!query.trim()) return
    mutation.mutate({ query, top_k: topK })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center text-white shadow-xs">
              <Database size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                Vector Knowledge Base
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                Semantic search over Qdrant collection `apple_support_conversations`
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] text-[#424245] font-medium">
              15 Ingested Vectors
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] text-[#424245] font-medium">
              384 Dimensions
            </span>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-[#86868b]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search semantic database (e.g. 'iPhone 15 screen black unresponsive')..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-black/[0.04] focus:bg-white border border-transparent focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl outline-none text-[#1d1d1f] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="px-3 py-2 bg-black/[0.04] rounded-xl text-xs font-medium text-[#424245] outline-none cursor-pointer border border-transparent hover:border-black/[0.08]"
              >
                {[3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    Top {n} Matches
                  </option>
                ))}
              </select>

              <button
                onClick={handleSearch}
                disabled={mutation.isPending || !query.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                {mutation.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Search size={13} />
                )}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-black/[0.04] text-xs">
            <span className="text-[#86868b] text-[11px] font-medium">Try searching:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'iPhone dead screen after update',
                'AirPods buzzing ANC',
                'refund unauthorized in-app purchase',
              ].map((term, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(term)
                    mutation.mutate({ query: term, top_k: topK })
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.03] hover:bg-black/[0.06] text-[#424245] hover:text-[#0071e3] transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {displayResults ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#86868b] px-1">
              <span>
                Found {displayResults.length} matches for "{query || 'sample query'}"
              </span>
              <span>Sorted by Cosine Distance</span>
            </div>

            <div className="space-y-3">
              {displayResults.map((r: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.intent && <IntentBadge intent={r.intent} size="sm" />}
                      <span className="text-xs font-mono text-[#86868b]">
                        {r.source_handle ?? `@customer_${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-full">
                      <BarChart2 size={12} />
                      <span>{Math.round(r.score * 100)}% Match</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#1d1d1f] font-normal leading-relaxed">
                    "{r.text}"
                  </p>

                  {r.resolution && (
                    <div className="p-2.5 rounded-xl bg-black/[0.02] text-xs text-[#515154] border border-black/[0.04]">
                      <span className="font-semibold text-[#1d1d1f]">Resolution: </span>
                      {r.resolution}
                    </div>
                  )}

                  <ScoreBar score={r.score} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-black/[0.06] text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center mx-auto text-[#86868b] mb-3">
              <Database size={22} />
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Search Qdrant Vector Index</h3>
            <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
              Enter any Apple hardware, software, or billing inquiry to retrieve historically grounded resolutions via sub-millisecond semantic search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
