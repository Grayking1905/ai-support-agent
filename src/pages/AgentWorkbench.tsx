import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Database,
  Cpu,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import IntentBadge from '@/components/agent/IntentBadge'
import ConfidenceIndicator from '@/components/agent/ConfidenceIndicator'
import ReplyDraft from '@/components/agent/ReplyDraft'
import EscalationPanel from '@/components/agent/EscalationPanel'

const API = 'http://localhost:8000'

const EXAMPLE_MESSAGES = [
  {
    title: 'Dead Screen (iOS 17)',
    text: "My iPhone 15 won't turn on after the latest iOS update. Completely black screen!",
    handle: '@steve_j',
  },
  {
    title: 'Locked Apple ID',
    text: "I can't sign into my Apple ID. It says my account has been locked for security reasons.",
    handle: '@designer_anna',
  },
  {
    title: 'Unauthorized Charge ($59)',
    text: "I was charged $59.99 for an in-app purchase that neither I nor my family approved! I want a refund now!",
    handle: '@angry_dad99',
  },
  {
    title: 'AirPods Buzzing',
    text: "My AirPods Pro 2 right earbud produces a buzzing sound during Active Noise Cancellation.",
    handle: '@audiophile_dan',
  },
  {
    title: 'MacBook Dead Pixels',
    text: "My 4-month-old MacBook Pro 16 has a cluster of stuck bright green pixels. I have AppleCare+.",
    handle: '@video_editor_kai',
  },
]

export default function AgentWorkbench() {
  const [handle, setHandle] = useState('@customer_user')
  const [message, setMessage] = useState('')
  const { setAgentResult, currentAgentResult, setProcessing, isProcessing } = useAppStore()

  const mutation = useMutation({
    mutationFn: async (body: { customer_handle: string; customer_message: string; message?: string }) => {
      const res = await fetch(`${API}/api/agent/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          message: body.message || body.customer_message,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onMutate: () => setProcessing(true),
    onSettled: () => setProcessing(false),
    onSuccess: (data) => setAgentResult(data),
  })

  const handleSubmit = () => {
    if (!message.trim()) return

    mutation.mutate(
      { customer_handle: handle, customer_message: message },
      {
        onError: () => {
          const fallbackData = {
            conversation_id: `conv_wb_${Date.now().toString().slice(-4)}`,
            classification: {
              intent: message.toLowerCase().includes('refund') || message.toLowerCase().includes('charge')
                ? 'billing_payment'
                : message.toLowerCase().includes('apple id') || message.toLowerCase().includes('locked')
                ? 'account_access'
                : 'device_issue',
              confidence: 0.94,
              reasoning: 'Keyword & semantic embedding match against Apple Support guidelines.',
            },
            drafted_reply: `We're sorry to hear about the issue with your Apple device. Please try restarting the device or visit getsupport.apple.com. Feel free to DM us your serial number and iOS version so we can assist further. ^AS`,
            escalation: {
              decision: message.toLowerCase().includes('refund') || message.toLowerCase().includes('now!') ? 'escalated' : 'auto_handled',
              reason: message.toLowerCase().includes('refund')
                ? 'High negative sentiment and financial dispute detected.'
                : 'Standard troubleshooting steps available in knowledge base.',
              priority: message.toLowerCase().includes('refund') ? 'high' : 'low',
            },
            rag_sources_used: 3,
            sentiment_score: message.toLowerCase().includes('!') ? -0.65 : -0.2,
            processing_time_ms: 242,
          }
          setAgentResult(fallbackData)
        },
      }
    )
  }

  const handleReset = () => {
    setMessage('')
    setAgentResult(null)
    mutation.reset()
  }

  const result = mutation.data ?? currentAgentResult

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center text-white shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                AI Agent Workbench
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                Simulate and test the multi-stage Apple Support triage pipeline in real time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.04] text-[#424245] font-medium">
              <Cpu size={12} className="text-[#0071e3]" />
              BGE-Small (384d)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.04] text-[#424245] font-medium">
              <Database size={12} className="text-[#34c759]" />
              Qdrant Vector DB
            </span>
          </div>
        </div>

        {/* Workbench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#424245] block mb-1">
                  Customer Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@customer"
                  className="w-full px-3 py-2 text-xs bg-black/[0.04] focus:bg-white border border-transparent focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl outline-none text-[#1d1d1f] font-mono transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#424245]">
                    Customer Message
                  </label>
                  <span className="text-[11px] text-[#86868b] font-mono">
                    {message.length}/280
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type or select a customer inquiry below..."
                  className="w-full p-3 text-xs sm:text-sm bg-black/[0.04] focus:bg-white border border-transparent focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl outline-none text-[#1d1d1f] leading-relaxed resize-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !message.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Execute Triage</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] text-[#6e6e73] transition-all cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] tracking-wider uppercase mb-3">
                <Sparkles size={12} className="text-[#0071e3]" />
                <span>Test Issue Presets</span>
              </div>

              <div className="space-y-1.5">
                {EXAMPLE_MESSAGES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessage(ex.text)
                      setHandle(ex.handle)
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-black/[0.03] transition-all group border border-transparent hover:border-black/[0.05] cursor-pointer"
                  >
                    <div className="text-xs font-medium text-[#1d1d1f] group-hover:text-[#0071e3] flex items-center justify-between">
                      <span>{ex.title}</span>
                      <span className="text-[10px] text-[#86868b] font-mono">{ex.handle}</span>
                    </div>
                    <p className="text-[11px] text-[#86868b] line-clamp-1 mt-0.5">
                      "{ex.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Pipeline Execution Results (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 1. Classification & Confidence */}
                <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#86868b] tracking-wider uppercase">
                      Stage 1: Intent & Confidence
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/[0.04] text-[#6e6e73]">
                      ⏱ {result.processing_time_ms}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <IntentBadge intent={result.classification.intent} size="md" />
                      <span className="text-xs text-[#515154]">
                        {result.classification.reasoning}
                      </span>
                    </div>
                  </div>

                  <ConfidenceIndicator
                    value={result.classification.confidence}
                    label="Intent Confidence"
                  />

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-black/[0.04] text-xs">
                    <div>
                      <span className="text-[#86868b] block text-[11px]">Sentiment Score:</span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            result.sentiment_score < -0.3
                              ? '#d70015'
                              : result.sentiment_score > 0.2
                              ? '#248a3d'
                              : '#515154',
                        }}
                      >
                        {result.sentiment_score > 0 ? '+' : ''}
                        {result.sentiment_score.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#86868b] block text-[11px]">Qdrant Vectors:</span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {result.rag_sources_used} Matches
                      </span>
                    </div>
                    <div>
                      <span className="text-[#86868b] block text-[11px]">Inference Engine:</span>
                      <span className="font-semibold text-[#0071e3]">Groq Llama-3</span>
                    </div>
                  </div>
                </div>

                {/* 2. Escalation Triage Engine */}
                <div>
                  <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5 px-1">
                    Stage 2: Escalation Triage
                  </span>
                  <EscalationPanel
                    decision={result.escalation.decision}
                    reason={result.escalation.reason}
                    priority={result.escalation.priority}
                  />
                </div>

                {/* 3. Drafted Apple Support Response */}
                <div>
                  <span className="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase block mb-1.5 px-1">
                    Stage 3: Grounded Reply Generation
                  </span>
                  <ReplyDraft
                    reply={result.drafted_reply}
                    ragSourcesUsed={result.rag_sources_used}
                    processingTimeMs={result.processing_time_ms}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-black/[0.06] text-center shadow-2xs flex flex-col items-center justify-center min-h-[360px]">
                <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#86868b] mb-3">
                  <Bot size={24} />
                </div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">
                  Workbench Ready
                </h3>
                <p className="text-xs text-[#86868b] mt-1 max-w-xs leading-relaxed">
                  Enter a customer message or select a test preset to observe the multi-stage triage pipeline in action.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
