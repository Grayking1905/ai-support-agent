interface ConfidenceIndicatorProps {
  value: number // 0-1
  label?: string
}

export default function ConfidenceIndicator({ value, label }: ConfidenceIndicatorProps) {
  const pct = Math.round(value * 100)
  const color =
    pct >= 85 ? 'var(--emerald)' :
    pct >= 65 ? 'var(--amber)' :
    'var(--rose)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label ?? 'Confidence'}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: '99px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '99px',
          background: color,
          transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  )
}
