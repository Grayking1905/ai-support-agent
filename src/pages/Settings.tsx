import { Settings as SettingsIcon, Server, Brain, Sliders, Info } from 'lucide-react'

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Icon size={15} style={{ color: 'var(--accent-light)' }} />
        <h2>{title}</h2>
      </div>
      <div style={{ marginTop: '4px' }}>{children}</div>
    </div>
  )
}

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  return (
    <div style={{
      width: 38, height: 22, borderRadius: '99px',
      background: defaultOn ? 'var(--accent)' : 'var(--bg-elevated)',
      border: `1px solid ${defaultOn ? 'var(--accent)' : 'var(--border)'}`,
      position: 'relative', cursor: 'pointer', transition: 'all 300ms ease',
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        left: defaultOn ? 'calc(100% - 18px)' : 2,
        transition: 'left 300ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

export default function Settings() {
  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <SettingsIcon size={18} style={{ color: 'var(--accent-light)' }} />
          <h1>Settings</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure the AI agent, infrastructure connections, and escalation thresholds.
        </p>
      </div>

      <Section title="Infrastructure" icon={Server}>
        <SettingRow label="PostgreSQL" desc="postgresql://postgres:***@localhost:5432/supportmind">
          <span className="badge badge-emerald">Connected</span>
        </SettingRow>
        <SettingRow label="Qdrant Vector DB" desc="http://localhost:6333 — Collection: apple_support_conversations">
          <span className="badge badge-emerald">Connected</span>
        </SettingRow>
        <SettingRow label="FastAPI Backend" desc="http://localhost:8000">
          <span className="badge badge-blue">localhost</span>
        </SettingRow>
      </Section>

      <Section title="AI Models" icon={Brain}>
        <SettingRow label="LLM Provider" desc="Groq — openai/gpt-oss-20b">
          <span className="badge badge-blue">Groq</span>
        </SettingRow>
        <SettingRow label="Embedding Model" desc="BAAI/bge-small-en-v1.5 (384 dims)">
          <span className="badge badge-violet">SentenceTransformer</span>
        </SettingRow>
        <SettingRow label="LLM Temperature" desc="Controls reply creativity (0.1 = focused, 1.0 = creative)">
          <input
            type="range" min="0" max="100" defaultValue="40"
            style={{ width: '100px', accentColor: 'var(--accent)' }}
          />
        </SettingRow>
      </Section>

      <Section title="Escalation Thresholds" icon={Sliders}>
        <SettingRow label="Confidence Threshold" desc="Escalate when classification confidence falls below this value">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="range" min="0" max="100" defaultValue="65" style={{ width: '80px', accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '32px' }}>65%</span>
          </div>
        </SettingRow>
        <SettingRow label="Sentiment Threshold" desc="Escalate when sentiment score falls below this value">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="range" min="-100" max="0" defaultValue="-60" style={{ width: '80px', accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '32px' }}>-0.6</span>
          </div>
        </SettingRow>
        <SettingRow label="Legal Keyword Detection" desc="Auto-escalate messages with legal/sensitive keywords">
          <Toggle defaultOn />
        </SettingRow>
        <SettingRow label="Repeat Customer Escalation" desc="Escalate customers with 3+ unresolved interactions">
          <Toggle defaultOn />
        </SettingRow>
      </Section>

      <Section title="About" icon={Info}>
        <SettingRow label="SupportMind Version" desc="AI Support Agent for Apple Support Twitter">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>v1.0.0</span>
        </SettingRow>
        <SettingRow label="Knowledge Base" desc="Apple Support conversations (seeded mock data)">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>15 conversations</span>
        </SettingRow>
        <SettingRow label="Intents" desc="8 Apple Support intent categories">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>8 classes</span>
        </SettingRow>
      </Section>
    </div>
  )
}
