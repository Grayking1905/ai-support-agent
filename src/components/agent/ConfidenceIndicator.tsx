interface ConfidenceIndicatorProps {
  value: number // 0-1
  label?: string
}

export default function ConfidenceIndicator({ value, label }: ConfidenceIndicatorProps) {
  const pct = Math.round(value * 100)
  const isHigh = pct >= 85
  const isMedium = pct >= 65
  const color = isHigh ? '#248a3d' : isMedium ? '#c97500' : '#d70015'
  const bgColor = isHigh ? 'rgba(52, 199, 89, 0.1)' : isMedium ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 59, 48, 0.1)'
  const barColor = isHigh ? '#34c759' : isMedium ? '#ff9500' : '#ff3b30'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#86868b] font-medium text-[11px] tracking-wide uppercase">
          {label ?? 'AI Confidence'}
        </span>
        <span
          className="font-semibold px-2 py-0.5 rounded-full text-[11px]"
          style={{ color, backgroundColor: bgColor }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-black/[0.05] overflow-hidden w-full">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  )
}
