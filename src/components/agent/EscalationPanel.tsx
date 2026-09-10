import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react'

interface EscalationPanelProps {
  decision: string // 'auto_handled' | 'escalated'
  reason: string
  priority: string // 'low' | 'medium' | 'high' | 'urgent'
}

const PRIORITY_CONFIG = {
  low:    { color: '#248a3d', bg: 'rgba(52, 199, 89, 0.08)',  border: 'rgba(52, 199, 89, 0.2)'  },
  medium: { color: '#c97500', bg: 'rgba(255, 149, 0, 0.08)', border: 'rgba(255, 149, 0, 0.2)' },
  high:   { color: '#d70015', bg: 'rgba(255, 59, 48, 0.08)',  border: 'rgba(255, 59, 48, 0.2)'  },
  urgent: { color: '#d70015', bg: 'rgba(255, 59, 48, 0.12)', border: 'rgba(255, 59, 48, 0.3)'  },
}

export default function EscalationPanel({ decision, reason, priority }: EscalationPanelProps) {
  const isEscalated = decision === 'escalated'
  const pCfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium

  const Icon = isEscalated
    ? priority === 'urgent' ? AlertOctagon : AlertTriangle
    : ShieldCheck

  return (
    <div
      className="p-4 rounded-2xl border transition-all"
      style={{
        borderColor: isEscalated ? pCfg.border : 'rgba(52, 199, 89, 0.2)',
        backgroundColor: isEscalated ? pCfg.bg : 'rgba(52, 199, 89, 0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            size={16}
            style={{ color: isEscalated ? pCfg.color : '#34c759' }}
            className="flex-shrink-0"
          />
          <span
            className="text-xs font-semibold tracking-tight"
            style={{ color: isEscalated ? pCfg.color : '#248a3d' }}
          >
            {isEscalated ? 'Escalated to Human Specialist' : 'Auto-Handled by SupportMind'}
          </span>
        </div>

        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
          style={{
            backgroundColor: '#ffffff',
            color: pCfg.color,
            borderColor: pCfg.border,
          }}
        >
          {priority} Priority
        </span>
      </div>

      {/* Reason text */}
      <div className="p-2.5 rounded-xl bg-white/90 border border-black/[0.04] text-xs text-[#515154] leading-relaxed">
        {reason}
      </div>
    </div>
  )
}
