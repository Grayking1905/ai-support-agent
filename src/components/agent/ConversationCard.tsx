import type { Conversation } from '@/store/useAppStore'
import IntentBadge from './IntentBadge'
import { Clock, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react'

interface ConversationCardProps {
  conversation: Conversation
  active?: boolean
  onClick?: () => void
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}

export default function ConversationCard({ conversation: c, active, onClick }: ConversationCardProps) {
  const isEscalated = c.escalation_status === 'escalated'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        padding: '14px 16px', textAlign: 'left', width: '100%',
        background: active ? 'rgba(0,102,204,0.1)' : 'var(--bg-card)',
        border: `1px solid ${active ? 'rgba(0,102,204,0.35)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', cursor: 'pointer',
        transition: 'all 200ms ease', fontFamily: 'inherit',
        boxShadow: active ? '0 0 0 1px rgba(0,102,204,0.15)' : 'none',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card-hover)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: `hsl(${(c.customer_handle.charCodeAt(1) * 47) % 360}, 60%, 35%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {(c.customer_name ?? c.customer_handle).charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.customer_name ?? c.customer_handle}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.customer_handle}</div>
          </div>
        </div>

        {/* Status */}
        {c.is_resolved ? (
          <CheckCircle2 size={14} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
        ) : isEscalated ? (
          <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
        ) : (
          <ArrowUpRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
      </div>

      {/* Message preview */}
      <p style={{
        fontSize: '0.78rem', color: 'var(--text-secondary)',
        lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {c.original_message}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {c.intent && <IntentBadge intent={c.intent} size="sm" />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.68rem', flexShrink: 0 }}>
          <Clock size={10} />
          {timeAgo(c.created_at)}
        </div>
      </div>
    </button>
  )
}
