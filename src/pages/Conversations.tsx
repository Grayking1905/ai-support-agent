import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Filter, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import ConversationCard from '@/components/agent/ConversationCard'
import IntentBadge from '@/components/agent/IntentBadge'
import ConfidenceIndicator from '@/components/agent/ConfidenceIndicator'
import ReplyDraft from '@/components/agent/ReplyDraft'
import EscalationPanel from '@/components/agent/EscalationPanel'
import type { Conversation, Intent } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

const API = 'http://localhost:8000'

const MOCK_CONVS: Conversation[] = [
  { id: 'conv_a1', customer_handle: '@mike_tech',      customer_name: 'Mike Tech',      original_message: "My iPhone 15 Pro won't turn on after updating to iOS 17.4. Completely dead screen!", created_at: new Date(Date.now() - 3_600_000 * 2).toISOString(), intent: 'device_issue', intent_confidence: 0.92, escalation_status: 'auto_handled', sentiment_score: -0.5, drafted_reply: "We're sorry to hear your iPhone isn't responding. Please try a force restart: press and quickly release Volume Up, then Volume Down, then hold the Side button until you see the Apple logo. DM us your serial number if that doesn't work. ^AS", rag_sources_count: 3, is_resolved: false },
  { id: 'conv_a2', customer_handle: '@sarah_jones92',  customer_name: 'Sarah Jones',    original_message: "I can't log into my Apple ID. Locked after resetting my password 3 times!", created_at: new Date(Date.now() - 3_600_000 * 5).toISOString(), intent: 'account_access', intent_confidence: 0.95, escalation_status: 'auto_handled', sentiment_score: -0.4, drafted_reply: "Please go to iforgot.apple.com to begin account recovery. If 2FA codes aren't arriving, ensure your trusted number is up to date. DM us for further assistance. ^AS", rag_sources_count: 4, is_resolved: true },
  { id: 'conv_a3', customer_handle: '@frustrated_mom', customer_name: 'Frustrated Mom', original_message: "My 8-year-old made $340 in in-app purchases! I need a refund NOW. This is unacceptable!", created_at: new Date(Date.now() - 3_600_000 * 8).toISOString(), intent: 'billing_payment', intent_confidence: 0.91, escalation_status: 'escalated', escalation_reason: 'High negative sentiment — customer appears very frustrated', sentiment_score: -0.8, drafted_reply: "We completely understand your concern. Please visit reportaproblem.apple.com to request a refund. Enable Ask to Buy in Family Sharing to prevent future purchases. ^AS", rag_sources_count: 2, is_resolved: false },
  { id: 'conv_a4', customer_handle: '@devraj_patel',   customer_name: 'Devraj Patel',   original_message: "App Store keeps crashing every time I try to download anything. Started after iOS 17.3 update.", created_at: new Date(Date.now() - 3_600_000 * 12).toISOString(), intent: 'app_crash', intent_confidence: 0.88, escalation_status: 'auto_handled', sentiment_score: -0.2, drafted_reply: "Try signing out of the App Store (Settings > [your name] > Media & Purchases > Sign Out), then sign back in. Also try offloading the App Store from Settings > iPhone Storage. ^AS", rag_sources_count: 3, is_resolved: false },
  { id: 'conv_a5', customer_handle: '@wifi_troubles',  customer_name: 'WiFi Troubles',  original_message: "My iPad Pro won't connect to 5GHz WiFi after iPadOS update. Other devices work fine.", created_at: new Date(Date.now() - 3_600_000 * 18).toISOString(), intent: 'network_connectivity', intent_confidence: 0.87, escalation_status: 'auto_handled', sentiment_score: -0.2, drafted_reply: "Please try forgetting the 5GHz network in Settings > Wi-Fi, then reconnect. If that doesn't help, reset network settings at Settings > General > Transfer or Reset > Reset > Reset Network Settings. ^AS", rag_sources_count: 2, is_resolved: true },
  { id: 'conv_a6', customer_handle: '@james_r_wilson', customer_name: 'James Wilson',   original_message: "My MacBook Pro screen has dead pixels and it's only 6 months old. I have AppleCare+", created_at: new Date(Date.now() - 3_600_000 * 24).toISOString(), intent: 'warranty_repair', intent_confidence: 0.94, escalation_status: 'auto_handled', sentiment_score: -0.1, drafted_reply: "Dead pixels on a 6-month-old MacBook with AppleCare+ are covered. Please schedule at your nearest Apple Store via apple.com/retail or start a repair at getsupport.apple.com. ^AS", rag_sources_count: 3, is_resolved: true },
]

export default function Conversations() {
  const { activeConversationId, setActiveConversation } = useAppStore()
  const [intentFilter, setIntentFilter] = useState<Intent | 'all'>('all')

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations', intentFilter],
    queryFn: () => fetch(`${API}/api/conversations?limit=50${intentFilter !== 'all' ? `&intent=${intentFilter}` : ''}`).then(r => r.json()),
    retry: false,
    placeholderData: MOCK_CONVS,
  })

  const active = conversations?.find(c => c.id === activeConversationId) ?? conversations?.[0] ?? null
  const filtered = conversations ?? []

  const INTENT_FILTERS: Array<{ value: Intent | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'device_issue', label: 'Device' },
    { value: 'account_access', label: 'Account' },
    { value: 'billing_payment', label: 'Billing' },
    { value: 'app_crash', label: 'App' },
    { value: 'network_connectivity', label: 'Network' },
    { value: 'warranty_repair', label: 'Warranty' },
    { value: 'setup_activation', label: 'Setup' },
  ]

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Left panel — list */}
      <div style={{
        width: 340, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Filters */}
        <div style={{
          padding: '14px 14px 10px', borderBottom: '1px solid var(--border)',
          display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'var(--bg-surface)',
          position: 'sticky', top: 0, zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', width: '100%' }}>
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Filter by intent
            </span>
          </div>
          {INTENT_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setIntentFilter(f.value)}
              style={{
                padding: '3px 9px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                border: `1px solid ${intentFilter === f.value ? 'rgba(0,102,204,0.5)' : 'var(--border)'}`,
                background: intentFilter === f.value ? 'rgba(0,102,204,0.15)' : 'transparent',
                color: intentFilter === f.value ? '#5ba8f5' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 200ms ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(c => (
            <ConversationCard
              key={c.id}
              conversation={c}
              active={c.id === (active?.id)}
              onClick={() => setActiveConversation(c.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Right panel — detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {active ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: `hsl(${(active.customer_handle.charCodeAt(1) * 47) % 360}, 60%, 35%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {(active.customer_name ?? active.customer_handle).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ marginBottom: '2px' }}>{active.customer_name ?? active.customer_handle}</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{active.customer_handle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {active.is_resolved
                  ? <span className="badge badge-emerald"><CheckCircle2 size={10} /> Resolved</span>
                  : active.escalation_status === 'escalated'
                  ? <span className="badge badge-amber"><AlertTriangle size={10} /> Escalated</span>
                  : <span className="badge badge-muted"><Clock size={10} /> Open</span>
                }
              </div>
            </div>

            {/* Original message */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="label" style={{ marginBottom: '8px' }}>Customer Message</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
                {active.original_message}
              </p>
            </div>

            {/* Classification */}
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="label">Classification</div>
              {active.intent && <IntentBadge intent={active.intent} size="md" />}
              {typeof active.intent_confidence === 'number' && (
                <ConfidenceIndicator value={active.intent_confidence} />
              )}
            </div>

            {/* Escalation */}
            {active.escalation_status && active.escalation_status !== 'pending' && (
              <EscalationPanel
                decision={active.escalation_status}
                reason={active.escalation_reason ?? 'No escalation triggers detected'}
                priority={active.escalation_status === 'escalated' ? 'high' : 'low'}
              />
            )}

            {/* Reply */}
            {active.drafted_reply && (
              <ReplyDraft
                reply={active.drafted_reply}
                ragSourcesUsed={active.rag_sources_count}
              />
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  )
}
