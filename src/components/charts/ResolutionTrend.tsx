import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TrendItem { date: string; auto_handled: number; escalated: number; total: number }

export default function ResolutionTrendChart({ data }: { data: TrendItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gAuto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#34d399" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gEsc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f87171" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#52527a" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#52527a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.78rem',
          }}
        />
        <Legend
          iconType="circle" iconSize={7}
          formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{v}</span>}
        />
        <Area type="monotone" dataKey="auto_handled" name="Auto-Handled" stroke="#34d399" fill="url(#gAuto)" strokeWidth={2} />
        <Area type="monotone" dataKey="escalated"    name="Escalated"    stroke="#f87171" fill="url(#gEsc)"  strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
