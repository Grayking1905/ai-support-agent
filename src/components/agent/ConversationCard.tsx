import type { Conversation } from '@/store/useAppStore'
import IntentBadge from './IntentBadge'
import { Clock, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'

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
  const isResolved = c.is_resolved
  const initials = (c.customer_name ?? c.customer_handle).replace('@', '').slice(0, 2).toUpperCase()

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between select-none ${
        active
          ? 'border-[#0071e3] shadow-sm ring-1 ring-[#0071e3]'
          : 'border-black/[0.06] hover:border-black/[0.12] hover:shadow-md'
      }`}
    >
      {/* Top Header: Avatar with Status Dot + Name & Handle */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with subtle presence indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-black/[0.05] flex items-center justify-center text-[#1d1d1f] font-semibold text-xs border border-black/[0.04]">
              {initials}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isEscalated ? 'bg-[#ff9500]' : isResolved ? 'bg-[#34c759]' : 'bg-[#0071e3]'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1d1d1f] truncate group-hover:text-[#0071e3] transition-colors">
              {c.customer_name ?? c.customer_handle}
            </div>
            <div className="text-[11px] text-[#86868b] truncate">
              {c.customer_handle}
            </div>
          </div>
        </div>

        {/* Intent Badge */}
        {c.intent && <IntentBadge intent={c.intent} size="sm" />}
      </div>

      {/* Message Snippet */}
      <p className="text-xs text-[#515154] leading-relaxed line-clamp-2 mb-4 font-normal">
        "{c.original_message}"
      </p>

      {/* Footer: ID, Time & Status */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#86868b]">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[#a1a1a6]">#{c.id.replace('conv_', '')}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-sans text-[11px]">
            <Clock size={11} />
            {timeAgo(c.created_at)}
          </span>
        </div>

        <div>
          {isResolved ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#248a3d]">
              <CheckCircle2 size={12} className="text-[#34c759]" />
              Resolved
            </span>
          ) : isEscalated ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c97500]">
              <AlertTriangle size={12} className="text-[#ff9500]" />
              Escalated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0071e3]">
              <ShieldCheck size={12} className="text-[#0071e3]" />
              Auto-Handled
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
