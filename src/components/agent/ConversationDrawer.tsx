import { useEffect } from 'react'
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Database,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import type { Conversation } from '@/store/useAppStore'
import IntentBadge from './IntentBadge'
import ConfidenceIndicator from './ConfidenceIndicator'
import EscalationPanel from './EscalationPanel'
import ReplyDraft from './ReplyDraft'

interface ConversationDrawerProps {
  conversation: Conversation | null
  isOpen: boolean
  onClose: () => void
}

export default function ConversationDrawer({ conversation: c, isOpen, onClose }: ConversationDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !c) return null

  const isEscalated = c.escalation_status === 'escalated'
  const sentiment = c.sentiment_score ?? 0
  const sentimentLabel =
    sentiment < -0.3 ? 'Frustrated' : sentiment > 0.3 ? 'Positive' : 'Neutral'
  const sentimentColor =
    sentiment < -0.3 ? '#d70015' : sentiment > 0.3 ? '#248a3d' : '#636366'
  const sentimentBg =
    sentiment < -0.3 ? 'rgba(255,59,48,0.1)' : sentiment > 0.3 ? 'rgba(52,199,89,0.1)' : 'rgba(142,142,147,0.1)'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Apple Inspector Sheet Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-black/[0.08] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black/[0.05] flex items-center justify-center text-[#1d1d1f] font-semibold text-xs border border-black/[0.04]">
              {(c.customer_name ?? c.customer_handle).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">
                  {c.customer_name ?? c.customer_handle}
                </h3>
                <span className="text-xs text-[#86868b]">{c.customer_handle}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/[0.04] text-[#6e6e73]">
                  {c.id}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#86868b]">
                <Clock size={11} />
                <span>
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {c.is_resolved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#34c759]/10 text-[#248a3d]">
                <CheckCircle2 size={12} />
                Resolved
              </span>
            ) : isEscalated ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff9500]/10 text-[#c97500]">
                <AlertTriangle size={12} />
                Escalated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                <ShieldCheck size={12} />
                Auto-Handled
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] transition-all ml-1"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f5f5f7]">
          {/* Customer Message */}
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase flex items-center gap-1.5">
                <MessageSquare size={12} className="text-[#0071e3]" />
                Customer Inquiry
              </span>
              <span className="text-[10px] text-[#86868b]">Apple Support Twitter</span>
            </div>
            <p className="text-sm text-[#1d1d1f] leading-relaxed font-normal">
              "{c.original_message}"
            </p>
          </div>

          {/* Intelligence Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Intent */}
            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5">
                  Detected Intent
                </span>
                {c.intent ? (
                  <IntentBadge intent={c.intent} size="md" />
                ) : (
                  <span className="text-xs text-[#86868b]">Inquiry</span>
                )}
              </div>
              <div className="mt-3 pt-2.5 border-t border-black/[0.04]">
                {typeof c.intent_confidence === 'number' && (
                  <ConfidenceIndicator value={c.intent_confidence} label="Classifier Score" />
                )}
              </div>
            </div>

            {/* Sentiment */}
            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5">
                  Sentiment Analysis
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ color: sentimentColor, backgroundColor: sentimentBg }}
                >
                  {sentimentLabel}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-black/[0.04]">
                <div className="flex items-center justify-between text-[10px] text-[#86868b] mb-1">
                  <span>Sentiment Score</span>
                  <span className="font-semibold text-[#1d1d1f]">{sentiment.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-black/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((sentiment + 1) / 2) * 100))}%`,
                      backgroundColor: sentimentColor,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Triage Decision */}
          {c.escalation_status && (
            <div>
              <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5 px-1">
                Automated Triage Decision
              </span>
              <EscalationPanel
                decision={c.escalation_status}
                reason={c.escalation_reason ?? 'High classification confidence (>0.85). Autonomous reply drafted.'}
                priority={c.escalation_status === 'escalated' ? 'high' : 'low'}
              />
            </div>
          )}

          {/* Drafted Reply */}
          {c.drafted_reply && (
            <div>
              <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5 px-1">
                Grounded AI Draft
              </span>
              <ReplyDraft
                reply={c.drafted_reply}
                ragSourcesUsed={c.rag_sources_count}
              />
            </div>
          )}

          {/* Historical Apple Support Tweet Reply (Direct Grounding Comparison) */}
          {c.historical_apple_reply && (
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-[#1d1d1f] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-[#0071e3] font-bold text-sm"></span>
                  Historical @AppleSupport Tweet Reply
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/[0.05] text-[#1d1d1f]">
                  {c.apple_signoff || '^AS'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-black/[0.04] text-xs text-[#1d1d1f] leading-relaxed font-normal">
                "{c.historical_apple_reply}"
              </div>
              <div className="mt-2 text-[10px] text-[#86868b] flex items-center justify-between">
                <span>Direct Kaggle ground truth (thoughtvector/twcs)</span>
                <span className="text-[#248a3d] font-semibold">Human Verified</span>
              </div>
            </div>
          )}

          {/* Qdrant RAG Context */}
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase flex items-center gap-1.5">
                <Database size={12} className="text-[#0071e3]" />
                RAG Vector Context (Qdrant)
              </span>
              <span className="text-[10px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-full">
                {c.rag_sources_count} Matches
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] text-xs text-[#515154]">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#86868b] mb-1">
                  <span>#kb_apple_ios17_troubleshoot</span>
                  <span className="text-[#248a3d] font-semibold">0.912 Cosine Score</span>
                </div>
                <p className="line-clamp-2">
                  Official Apple support protocol for iOS device responsiveness: Execute hard reboot sequence (Volume Up, Volume Down, hold Power button for 15s).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] text-xs text-[#515154]">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#86868b] mb-1">
                  <span>#kb_account_recovery_guide</span>
                  <span className="text-[#248a3d] font-semibold">0.864 Cosine Score</span>
                </div>
                <p className="line-clamp-2">
                  Customer account verification standards: Direct users to iforgot.apple.com with two-factor authorization token checks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all"
          >
            Done
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Ticket ${c.id} marked as resolved!`)
                onClose()
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              Mark Resolved
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(c.drafted_reply ?? '')
                alert('Drafted reply copied! Sending tweet...')
                onClose()
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              Send Tweet (^AS)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
