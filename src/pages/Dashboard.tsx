import { useQuery } from '@tanstack/react-query'
import { MessageSquare, CheckCircle2, AlertTriangle, Bot, TrendingUp, Zap, Database } from 'lucide-react'
import ResolutionTrendChart from '@/components/charts/ResolutionTrend'
import IntentDistributionChart from '@/components/charts/IntentDistribution'
import { useAppStore } from '@/store/useAppStore'

const API = 'http://localhost:8000'

const MOCK_TREND = [
  { date: 'Mon', auto_handled: 12, escalated: 2, total: 14 },
  { date: 'Tue', auto_handled: 9,  escalated: 3, total: 12 },
  { date: 'Wed', auto_handled: 15, escalated: 1, total: 16 },
  { date: 'Thu', auto_handled: 11, escalated: 4, total: 15 },
  { date: 'Fri', auto_handled: 14, escalated: 2, total: 16 },
  { date: 'Sat', auto_handled: 6,  escalated: 1, total: 7  },
  { date: 'Sun', auto_handled: 8,  escalated: 0, total: 8  },
]

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string
}) {
  return (
    <div className="card fade-in-up" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color ?? 'var(--accent)'}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: color ?? 'var(--accent-light)' }} />
        </div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { setActivePage } = useAppStore()

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => fetch(`${API}/api/analytics/summary`).then(r => r.json()),
    retry: false,
    placeholderData: {
      total_conversations: 15, auto_handled: 14, escalated: 1,
      resolved: 10, avg_confidence: 0.91,
      intent_distribution: [
        { intent: 'device_issue', count: 4, label: 'Device Issue', percentage: 26.7 },
        { intent: 'account_access', count: 3, label: 'Account Access', percentage: 20 },
        { intent: 'billing_payment', count: 2, label: 'Billing & Payment', percentage: 13.3 },
        { intent: 'app_crash', count: 2, label: 'App / Software', percentage: 13.3 },
        { intent: 'network_connectivity', count: 2, label: 'Network', percentage: 13.3 },
        { intent: 'warranty_repair', count: 1, label: 'Warranty & Repair', percentage: 6.7 },
        { intent: 'setup_activation', count: 1, label: 'Setup & Activation', percentage: 6.7 },
      ],
    },
  })

  const { data: trend } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: () => fetch(`${API}/api/analytics/trend`).then(r => r.json()),
    retry: false,
    placeholderData: MOCK_TREND,
  })

  const autoRate = summary?.total_conversations
    ? Math.round((summary.auto_handled / summary.total_conversations) * 100)
    : 0

  return (
    <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon={MessageSquare} label="Total Conversations" value={summary?.total_conversations ?? '—'} sub="All-time ingested" />
        <StatCard icon={Zap}          label="Auto-Handled"         value={`${autoRate}%`} sub={`${summary?.auto_handled ?? 0} conversations`} color="var(--emerald)" />
        <StatCard icon={AlertTriangle} label="Escalated"           value={summary?.escalated ?? '—'} sub="Routed to humans" color="var(--amber)" />
        <StatCard icon={CheckCircle2} label="Resolved"             value={summary?.resolved ?? '—'} sub="Marked complete" color="#5ba8f5" />
        <StatCard icon={Bot}          label="Avg Confidence"       value={summary ? `${Math.round((summary.avg_confidence ?? 0) * 100)}%` : '—'} sub="Classification accuracy" color="var(--violet)" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={15} style={{ color: 'var(--accent-light)' }} />
              <h2>Resolution Trend</h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>7-day auto-handle vs escalation</p>
          </div>
          <ResolutionTrendChart data={trend ?? MOCK_TREND} />
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={15} style={{ color: 'var(--accent-light)' }} />
              <h2>Intent Mix</h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Distribution by category</p>
          </div>
          <IntentDistributionChart data={summary?.intent_distribution ?? []} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Test AI Agent', icon: Bot, page: 'workbench', color: 'var(--accent)' },
            { label: 'Browse Conversations', icon: MessageSquare, page: 'conversations', color: 'var(--violet)' },
            { label: 'Search Knowledge Base', icon: Database, page: 'knowledge', color: 'var(--emerald)' },
          ].map(a => (
            <button
              key={a.page}
              onClick={() => setActivePage(a.page)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                border: `1px solid ${a.color}33`, background: `${a.color}11`,
                color: a.color, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.85rem', fontWeight: 600, transition: 'all 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${a.color}22`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${a.color}11`)}
            >
              <a.icon size={15} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
