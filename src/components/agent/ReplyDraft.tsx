import { useState } from 'react'
import { Copy, CheckCheck, Edit2, Send } from 'lucide-react'

interface ReplyDraftProps {
  reply: string
  ragSourcesUsed?: number
  processingTimeMs?: number
}

export default function ReplyDraft({ reply, ragSourcesUsed = 0, processingTimeMs }: ReplyDraftProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedReply, setEditedReply] = useState(reply)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedReply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      border: '1px solid rgba(0,102,204,0.25)',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(0,102,204,0.05)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(0,102,204,0.15)',
        background: 'rgba(0,102,204,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={13} style={{ color: '#5ba8f5' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5ba8f5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Drafted Reply
          </span>
          {ragSourcesUsed > 0 && (
            <span style={{
              fontSize: '0.65rem', padding: '1px 7px', borderRadius: '99px',
              background: 'rgba(52,211,153,0.1)', color: 'var(--emerald)',
              border: '1px solid rgba(52,211,153,0.2)', fontWeight: 600,
            }}>
              {ragSourcesUsed} RAG sources
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
              background: editing ? 'rgba(0,102,204,0.2)' : 'var(--bg-card)',
              color: editing ? '#5ba8f5' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <Edit2 size={11} />{editing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
              background: copied ? 'rgba(52,211,153,0.1)' : 'var(--bg-card)',
              color: copied ? 'var(--emerald)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 200ms ease',
            }}
          >
            {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Reply body */}
      <div style={{ padding: '14px' }}>
        {editing ? (
          <textarea
            value={editedReply}
            onChange={e => setEditedReply(e.target.value)}
            style={{
              width: '100%', minHeight: '100px', resize: 'vertical',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: '0.875rem', fontFamily: 'inherit', lineHeight: 1.6,
              padding: '10px 12px', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(0,102,204,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>
            {editedReply}
          </p>
        )}
      </div>

      {/* Footer meta */}
      {processingTimeMs && (
        <div style={{
          padding: '6px 14px', borderTop: '1px solid var(--border)',
          fontSize: '0.68rem', color: 'var(--text-muted)',
        }}>
          Generated in {processingTimeMs}ms
        </div>
      )}
    </div>
  )
}
