import { useQuery } from '@tanstack/react-query'
import {
  MessageSquare,
  AlertTriangle,
  Bot,
  Zap,
  Sparkles,
  ChevronRight,
  Database,
  Sliders,
} from 'lucide-react'
import ResolutionTrendChart from '@/components/charts/ResolutionTrend'
import IntentDistributionChart from '@/components/charts/IntentDistribution'
import { useAppStore } from '@/store/useAppStore'
import IntentBadge from '@/components/agent/IntentBadge'

const API = 'http://localhost:8000'

const MOCK_TREND = [
  { date: 'Mon', auto_handled: 14, escalated: 2, total: 16 },
  { date: 'Tue', auto_handled: 11, escalated: 3, total: 14 },
  { date: 'Wed', auto_handled: 18, escalated: 1, total: 19 },
  { date: 'Thu', auto_handled: 15, escalated: 2, total: 17 },
  { date: 'Fri', auto_handled: 22, escalated: 2, total: 24 },
  { date: 'Sat', auto_handled: 9,  escalated: 1, total: 10 },
  { date: 'Sun', auto_handled: 12, escalated: 0, total: 12 },
]

export default function Dashboard() {
  const { setActivePage, setActiveConversation } = useAppStore()

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => fetch(`${API}/api/analytics/summary`).then((r) => r.json()),
    retry: false,
    placeholderData: {
      total_conversations: 15,
      auto_handled: 14,
      escalated: 1,
      resolved: 10,
      avg_confidence: 0.94,
      intent_distribution: [
        { intent: 'device_issue', count: 5, label: 'Device Issue', percentage: 33.3 },
        { intent: 'account_access', count: 3, label: 'Account Access', percentage: 20 },
        { intent: 'billing_payment', count: 2, label: 'Billing & Payment', percentage: 13.3 },
        { intent: 'app_crash', count: 2, label: 'App / Software', percentage: 13.3 },
        { intent: 'network_connectivity', count: 2, label: 'Network', percentage: 13.3 },
        { intent: 'warranty_repair', count: 1, label: 'Warranty & Repair', percentage: 6.7 },
      ],
    },
  })

  const { data: trend } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: () => fetch(`${API}/api/analytics/trend`).then((r) => r.json()),
    retry: false,
    placeholderData: MOCK_TREND,
  })

  const autoRate = summary?.total_conversations
    ? Math.round((summary.auto_handled / summary.total_conversations) * 100)
    : 93

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 space-y-6">
      {/* 1. Apple Intelligence Callout (Quiet, elegant, official Apple style) */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5856d6] via-[#af52de] to-[#ff2d55] flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                Apple Intelligence Insights
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
              <span className="text-[11px] text-[#86868b]">Live Telemetry</span>
            </div>
            <p className="text-xs text-[#515154] mt-0.5 max-w-2xl leading-relaxed">
              14 of 15 inquiries resolved autonomously with 94% average confidence. 1 high-dissatisfaction
              refund inquiry was routed to a supervisor.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('conversations')}
          className="self-start sm:self-auto flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Review Inquiries</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 2. Apple KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#86868b]">Total Inquiries</span>
            <div className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#1d1d1f]">
              <MessageSquare size={14} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {summary?.total_conversations ?? 15}
            </div>
            <div className="text-[11px] text-[#34c759] font-medium mt-1">
              +18% from last week
            </div>
          </div>
        </div>

        {/* Auto-Handled */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#86868b]">Autonomous Resolution</span>
            <div className="w-7 h-7 rounded-lg bg-[#34c759]/10 flex items-center justify-center text-[#34c759]">
              <Zap size={14} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {autoRate}%
            </div>
            <div className="text-[11px] text-[#86868b] font-normal mt-1">
              {summary?.auto_handled ?? 14} tickets auto-handled
            </div>
          </div>
        </div>

        {/* Escalated */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#86868b]">Escalated to Human</span>
            <div className="w-7 h-7 rounded-lg bg-[#ff9500]/10 flex items-center justify-center text-[#ff9500]">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {summary?.escalated ?? 1}
            </div>
            <div className="text-[11px] text-[#86868b] font-normal mt-1">
              Requires supervisor signoff
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#86868b]">Model Confidence</span>
            <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
              <Bot size={14} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {Math.round((summary?.avg_confidence ?? 0.94) * 100)}%
            </div>
            <div className="text-[11px] text-[#86868b] font-normal mt-1">
              Intent classification score
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytics Section: Resolution Trend & Intent Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Resolution Trend</h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                7-day volume of autonomous handling vs human escalation
              </p>
            </div>
            <div className="flex items-center gap-1 px-1 py-0.5 bg-black/[0.04] rounded-lg text-xs">
              <button className="px-2 py-1 bg-white rounded-md text-[#1d1d1f] font-medium shadow-2xs">
                7 Days
              </button>
              <button className="px-2 py-1 text-[#86868b] hover:text-[#1d1d1f]">
                30 Days
              </button>
            </div>
          </div>
          <ResolutionTrendChart data={trend ?? MOCK_TREND} />
        </div>

        {/* Intent Distribution Donut (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Intent Distribution</h3>
            <p className="text-xs text-[#86868b] mt-0.5">Classification by problem type</p>
          </div>
          <IntentDistributionChart data={summary?.intent_distribution ?? []} />
          <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868b]">
            <span>Primary Category</span>
            <span className="font-semibold text-[#1d1d1f]">Device Issues (33%)</span>
          </div>
        </div>
      </div>

      {/* 4. Recent High-Priority Inquiries & Quick Jump */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Recent Inquiries</h3>
            <button
              onClick={() => setActivePage('conversations')}
              className="text-xs font-medium text-[#0071e3] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-black/[0.04]">
            {[
              {
                id: 'conv_a1',
                handle: '@mike_tech',
                name: 'Mike Tech',
                issue: "iPhone 15 Pro won't turn on after iOS 17.4 update. Dead screen.",
                intent: 'device_issue',
                status: 'auto_handled',
                time: '2h ago',
              },
              {
                id: 'conv_a3',
                handle: '@frustrated_mom',
                name: 'Frustrated Mom',
                issue: 'Child made $340 unauthorized in-app purchases. Needs refund ASAP.',
                intent: 'billing_payment',
                status: 'escalated',
                time: '8h ago',
              },
              {
                id: 'conv_a2',
                handle: '@sarah_jones92',
                name: 'Sarah Jones',
                issue: "Can't log into Apple ID. Locked after resetting password.",
                intent: 'account_access',
                status: 'resolved',
                time: '5h ago',
              },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setActiveConversation(t.id)
                  setActivePage('conversations')
                }}
                className="py-3 flex items-center justify-between gap-4 cursor-pointer group hover:bg-black/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-black/[0.05] text-[#1d1d1f] font-semibold text-xs flex items-center justify-center flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors truncate">
                        {t.name}
                      </span>
                      <span className="text-[11px] text-[#86868b]">{t.handle}</span>
                    </div>
                    <p className="text-xs text-[#515154] truncate">{t.issue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <IntentBadge intent={t.intent} size="sm" />
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      t.status === 'escalated'
                        ? 'bg-[#ff9500]/10 text-[#c97500]'
                        : t.status === 'resolved'
                        ? 'bg-[#34c759]/10 text-[#248a3d]'
                        : 'bg-[#0071e3]/10 text-[#0071e3]'
                    }`}
                  >
                    {t.status === 'auto_handled' ? 'Auto-Handled' : t.status === 'escalated' ? 'Escalated' : 'Resolved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Capabilities / Services (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">Quick Tools</h3>
            <p className="text-xs text-[#86868b] mb-4">Launch specialized modules</p>

            <div className="space-y-2">
              <button
                onClick={() => setActivePage('workbench')}
                className="w-full p-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3]">
                    AI Workbench
                  </div>
                  <div className="text-[11px] text-[#86868b]">Interactive prompt sandbox</div>
                </div>
              </button>

              <button
                onClick={() => setActivePage('knowledge')}
                className="w-full p-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
                  <Database size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#34c759]">
                    Vector Knowledge Base
                  </div>
                  <div className="text-[11px] text-[#86868b]">Search 384d embeddings</div>
                </div>
              </button>

              <button
                onClick={() => setActivePage('settings')}
                className="w-full p-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5856d6]/10 text-[#5856d6] flex items-center justify-center">
                  <Sliders size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#5856d6]">
                    System Rules
                  </div>
                  <div className="text-[11px] text-[#86868b]">Escalation gates & safety</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.06] mt-4 flex items-center justify-between text-xs text-[#86868b]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />
              Qdrant Connected
            </span>
            <span>Groq Llama-3 Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
