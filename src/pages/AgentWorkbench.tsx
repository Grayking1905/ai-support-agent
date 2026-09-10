import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import IntentBadge from '@/components/agent/IntentBadge'
import ConfidenceIndicator from '@/components/agent/ConfidenceIndicator'
import ReplyDraft from '@/components/agent/ReplyDraft'
import EscalationPanel from '@/components/agent/EscalationPanel'

const API = 'http://localhost:8000'

const EXAMPLE_MESSAGES = [
  "My iPhone 15 won't turn on after the latest iOS update. Completely black screen!",
  "I can't sign into my Apple ID. It says my account is locked.",
  "I was charged $49.99 for a subscription I never signed up for on the App Store!",
  "My AirPods Pro keep disconnecting from my iPhone every few minutes.",
  "The App Store keeps crashing whenever I try to download an app.",
  "My MacBook screen has dead pixels. I have AppleCare+.",
]

export default function AgentWorkbench() {
  const [handle, setHandle] = useState('@customer')
  const [message, setMessage] = useState('')
  const { setAgentResult, currentAgentResult, setProcessing, isProcessing } = useAppStore()

  const mutation = useMutation({
    mutationFn: async (body: { customer_handle: string; message: string }) => {
      const res = await fetch(`${API}/api/agent/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onMutate: () => setProcessing(true),
    onSettled: () => setProcessing(false),
    onSuccess: (data) => setAgentResult(data),
  })

  // Fallback mock for demo when backend is down
  const handleSubmit = () => {
    if (!message.trim()) return
    if (API === 'http://localhost:8000') {
      mutation.mutate({ customer_handle: handle, message })
    }
  }

  const handleReset = () => {
    setMessage('')
    setAgentResult(null)
    mutation.reset()
  }

  const result = mutation.data ?? currentAgentResult

  return (
    <div style={{ padding: '28px', display: 'flex', gap: '24px', maxWidth: '1200px', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Left: Input panel */}
      <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #0066CC, #338FE8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={14} color="#fff" />
            </div>
            <h2>AI Agent Workbench</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Submit a customer message and the AI agent will classify the intent, retrieve similar resolved cases, draft a reply, and decide whether to auto-handle or escalate.
          </p>
        </div>

        {/* Input form */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Handle */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Customer Handle
            </label>
            <input
              value={handle}
              onChange={e => setHandle(e.target.value)}
              placeholder="@customer"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 200ms ease',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,102,204,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Customer Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type or paste the customer's tweet..."
              rows={5}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
                outline: 'none', resize: 'vertical', lineHeight: 1.6,
                transition: 'border-color 200ms ease',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,102,204,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
              {message.length}/280
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !message.trim()}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0066CC, #338FE8)',
                border: 'none', color: '#fff', fontFamily: 'inherit',
                fontSize: '0.875rem', fontWeight: 600, cursor: isProcessing || !message.trim() ? 'not-allowed' : 'pointer',
                opacity: isProcessing || !message.trim() ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 200ms ease',
              }}
            >
              {isProcessing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              {isProcessing ? 'Processing...' : 'Run Agent'}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {mutation.isError && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.78rem', color: 'var(--rose)' }}>
              ⚠ Backend offline — start the FastAPI server to get live results.
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={13} style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Example Messages
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {EXAMPLE_MESSAGES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setMessage(ex)}
                style={{
                  textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.78rem', lineHeight: 1.4, transition: 'all 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Results panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {result ? (
          <>
            {/* Classification */}
            <div className="card fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="label">Intent Classification</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <IntentBadge intent={result.classification.intent} size="md" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {result.classification.reasoning}
                </span>
              </div>
              <ConfidenceIndicator value={result.classification.confidence} />
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sentiment: <span style={{ color: result.sentiment_score < -0.3 ? 'var(--rose)' : result.sentiment_score > 0.2 ? 'var(--emerald)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {result.sentiment_score > 0 ? '+' : ''}{result.sentiment_score.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  RAG sources: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{result.rag_sources_used}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Processing: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{result.processing_time_ms}ms</span>
                </div>
              </div>
            </div>

            {/* Escalation */}
            <div className="fade-in-up" style={{ animationDelay: '80ms' }}>
              <EscalationPanel
                decision={result.escalation.decision}
                reason={result.escalation.reason}
                priority={result.escalation.priority}
              />
            </div>

            {/* Reply */}
            <div className="fade-in-up" style={{ animationDelay: '160ms' }}>
              <ReplyDraft
                reply={result.drafted_reply}
                ragSourcesUsed={result.rag_sources_used}
                processingTimeMs={result.processing_time_ms}
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            color: 'var(--text-muted)', textAlign: 'center',
          }}>
            <Bot size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>Submit a customer message to see AI agent results</p>
            <p style={{ fontSize: '0.78rem' }}>Classification · Reply · Escalation Decision</p>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
