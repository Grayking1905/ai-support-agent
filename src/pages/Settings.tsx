import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Server,
  Brain,
  Sliders,
  Info,
  CheckCircle2,
} from 'lucide-react'

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4">
      <div>
        <div className="text-xs sm:text-sm font-medium text-[#1d1d1f]">{label}</div>
        {desc && <div className="text-xs text-[#86868b] mt-0.5">{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon size={14} className="text-[#86868b]" />
        <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">{title}</h2>
      </div>
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs divide-y divide-black/[0.04] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SwitchToggle({ defaultChecked = true }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer outline-none ${
        checked ? 'bg-[#34c759]' : 'bg-black/[0.12]'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function Settings() {
  const [confThreshold, setConfThreshold] = useState(85)
  const [temp, setTemp] = useState(0.3)

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#5856d6] flex items-center justify-center text-white shadow-xs">
              <SettingsIcon size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                System Rules & Telemetry
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                Manage backend services, LLM parameters, and automated escalation thresholds
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#34c759]/10 text-[#248a3d]">
            <CheckCircle2 size={13} />
            Services Online
          </span>
        </div>

        {/* 1. Infrastructure Services */}
        <Section title="Infrastructure Connections" icon={Server}>
          <SettingRow
            label="PostgreSQL 16 Engine"
            desc="Transactional database for tickets and sentiment analytics"
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#248a3d] bg-[#34c759]/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
              Port 5432
            </span>
          </SettingRow>

          <SettingRow
            label="Qdrant Vector Database"
            desc="Collection: apple_support_conversations (384-dim BGE embeddings)"
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#248a3d] bg-[#34c759]/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
              Port 6333
            </span>
          </SettingRow>

          <SettingRow
            label="FastAPI ASGI Gateway"
            desc="REST endpoints and pipeline orchestration"
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
              Port 8000
            </span>
          </SettingRow>
        </Section>

        {/* 2. AI & LLM Models */}
        <Section title="Inference & Embeddings" icon={Brain}>
          <SettingRow
            label="Inference Provider"
            desc="Groq Low-Latency Cloud Inference (Llama-3 70B)"
          >
            <span className="text-[11px] font-semibold text-[#c97500] bg-[#ff9500]/10 px-2.5 py-0.5 rounded-full">
              Groq SDK
            </span>
          </SettingRow>

          <SettingRow
            label="Dense Embedding Model"
            desc="SentenceTransformers: BAAI/bge-small-en-v1.5"
          >
            <span className="text-[11px] font-semibold text-[#4341b5] bg-[#5856d6]/10 px-2.5 py-0.5 rounded-full">
              384 Dimensions
            </span>
          </SettingRow>

          <SettingRow
            label="LLM Temperature"
            desc="Controls reply determinism (0.1 = strictly consistent, 1.0 = creative)"
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-24 accent-[#0071e3] cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-[#1d1d1f] w-8">
                {temp.toFixed(2)}
              </span>
            </div>
          </SettingRow>
        </Section>

        {/* 3. Automated Escalation Controls */}
        <Section title="Escalation Thresholds & Safety Rules" icon={Sliders}>
          <SettingRow
            label="Confidence Threshold"
            desc="Inquiries with classification confidence below this value are escalated"
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseInt(e.target.value))}
                className="w-24 accent-[#0071e3] cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-[#1d1d1f] w-8">
                {confThreshold}%
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label="Negative Sentiment Intercept"
            desc="Auto-route inquiries with severe frustration directly to human agents"
          >
            <SwitchToggle defaultChecked={true} />
          </SettingRow>

          <SettingRow
            label="Financial Dispute Intercept"
            desc="Route unauthorized charge claims exceeding $100 to tier-2 billing"
          >
            <SwitchToggle defaultChecked={true} />
          </SettingRow>

          <SettingRow
            label="Repeat Unresolved Flag"
            desc="Escalate customers with multiple unresolved interactions"
          >
            <SwitchToggle defaultChecked={true} />
          </SettingRow>
        </Section>

        {/* 4. About */}
        <Section title="About SupportMind" icon={Info}>
          <SettingRow
            label="Application Version"
            desc="AI Customer Support Suite for Apple Support Twitter"
          >
            <span className="text-xs font-mono text-[#86868b]">v2.4.0 (2026.09)</span>
          </SettingRow>

          <SettingRow
            label="Design Standard"
            desc="Apple Human Interface Guidelines (macOS / iPadOS)"
          >
            <span className="text-xs font-medium text-[#0071e3]">Apple HIG Light</span>
          </SettingRow>
        </Section>
      </div>
    </div>
  )
}
