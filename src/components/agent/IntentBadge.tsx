import type { Intent } from '@/store/useAppStore'

const INTENT_CONFIG: Record<Intent, { label: string; color: string; bg: string; border: string }> = {
  device_issue:         { label: 'Device Issue',         color: '#d70015', bg: 'rgba(255, 59, 48, 0.08)',  border: 'rgba(255, 59, 48, 0.16)' },
  account_access:       { label: 'Account Access',       color: '#4341b5', bg: 'rgba(88, 86, 214, 0.08)', border: 'rgba(88, 86, 214, 0.16)' },
  app_crash:            { label: 'App / Software',       color: '#c97500', bg: 'rgba(255, 149, 0, 0.08)', border: 'rgba(255, 149, 0, 0.16)' },
  billing_payment:      { label: 'Billing & Payment',    color: '#997500', bg: 'rgba(255, 204, 0, 0.12)', border: 'rgba(255, 204, 0, 0.22)' },
  warranty_repair:      { label: 'Warranty & Repair',    color: '#248a3d', bg: 'rgba(52, 199, 89, 0.08)', border: 'rgba(52, 199, 89, 0.16)' },
  setup_activation:     { label: 'Setup & Activation',   color: '#0071e3', bg: 'rgba(0, 113, 227, 0.08)', border: 'rgba(0, 113, 227, 0.16)' },
  network_connectivity: { label: 'Network & Signal',     color: '#1d8496', bg: 'rgba(48, 176, 199, 0.08)', border: 'rgba(48, 176, 199, 0.16)' },
  other_general:        { label: 'General Inquiries',    color: '#636366', bg: 'rgba(142, 142, 147, 0.08)', border: 'rgba(142, 142, 147, 0.16)' },
}

interface IntentBadgeProps {
  intent: Intent | string
  size?: 'sm' | 'md'
  showDot?: boolean
}

export default function IntentBadge({ intent, size = 'sm', showDot = true }: IntentBadgeProps) {
  const cfg = INTENT_CONFIG[intent as Intent] ?? {
    label: intent || 'Inquiry',
    color: '#636366',
    bg: 'rgba(142, 142, 147, 0.08)',
    border: 'rgba(142, 142, 147, 0.16)',
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${paddingClass}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
        />
      )}
      <span>{cfg.label}</span>
    </span>
  )
}

export { INTENT_CONFIG }
