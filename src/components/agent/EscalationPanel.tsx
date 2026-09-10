import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react'

interface EscalationPanelProps {
  decision: string // 'auto_handled' | 'escalated'
  reason: string
  priority: string // 'low' | 'medium' | 'high' | 'urgent'
}

const PRIORITY_CONFIG = {
  low:    { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  medium: { color: 'var(--amber)',   bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  high:   { color: '#fb923c',        bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)'  },
  urgent: { color: 'var(--rose)',    bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
}

export default function EscalationPanel({ decision, reason, priority }: EscalationPanelProps) {
  const isEscalated = decision === 'escalated'
  const pCfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium

  const Icon = isEscalated
    ? priority === 'urgent' ? AlertOctagon : AlertTriangle
    : ShieldCheck

  return (
    <div style={{
      border: `1px solid ${isEscalated ? pCfg.border : 'rgba(52,211,153,0.25)'}`,
      borderRadius: 'var(--radius-lg)',
      background: isEscalated ? pCfg.bg : 'rgba(52,211,153,0.05)',
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} style={{ color: isEscalated ? pCfg.color : 'var(--emerald)', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.85rem', fontWeight: 700,
            color: isEscalated ? pCfg.color : 'var(--emerald)',
          }}>
            {isEscalated ? 'Escalate to Human' : 'Auto-Handle'}
          </span>
        </div>

        {/* Priority badge */}
        <span style={{
          padding: '2px 10px', borderRadius: '99px',
          background: pCfg.bg, color: pCfg.color,
          border: `1px solid ${pCfg.border}`,
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {priority}
        </span>
      </div>

      {/* Reason */}
      <p style={{
        fontSize: '0.8rem', color: 'var(--text-secondary)',
        lineHeight: 1.5, margin: 0,
        padding: '8px 10px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
      }}>
        {reason}
      </p>
    </div>
  )
}
