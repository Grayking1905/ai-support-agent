import type { Intent } from '@/store/useAppStore'

const INTENT_CONFIG: Record<Intent, { label: string; color: string; bg: string; border: string }> = {
  device_issue:         { label: 'Device Issue',         color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)' },
  account_access:       { label: 'Account Access',       color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  app_crash:            { label: 'App / Software',       color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)'  },
  billing_payment:      { label: 'Billing & Payment',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  warranty_repair:      { label: 'Warranty & Repair',    color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
  setup_activation:     { label: 'Setup & Activation',   color: '#5ba8f5', bg: 'rgba(91,168,245,0.1)',  border: 'rgba(91,168,245,0.25)'  },
  network_connectivity: { label: 'Network',              color: '#67e8f9', bg: 'rgba(103,232,249,0.1)', border: 'rgba(103,232,249,0.25)' },
  other_general:        { label: 'General',              color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',border: 'rgba(148,163,184,0.2)'  },
}

interface IntentBadgeProps {
  intent: Intent | string
  size?: 'sm' | 'md'
}

export default function IntentBadge({ intent, size = 'sm' }: IntentBadgeProps) {
  const cfg = INTENT_CONFIG[intent as Intent] ?? {
    label: intent, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',
  }
  const px = size === 'sm' ? '6px 10px' : '4px 10px'
  const fs = size === 'sm' ? '0.68rem' : '0.75rem'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: px, borderRadius: '99px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: fs, fontWeight: 600, letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

export { INTENT_CONFIG }
