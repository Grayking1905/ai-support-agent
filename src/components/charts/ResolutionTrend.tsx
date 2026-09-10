import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TrendItem { date: string; auto_handled: number; escalated: number; total: number }

export default function ResolutionTrendChart({ data }: { data: TrendItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="gAuto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0071e3" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0071e3" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="gEsc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ff9500" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ff9500" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            color: '#1d1d1f',
            fontSize: '12px',
            padding: '8px 12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ paddingTop: '8px' }}
          formatter={(v) => <span style={{ color: '#515154', fontSize: '11px', fontWeight: 500 }}>{v}</span>}
        />
        <Area
          type="monotone"
          dataKey="auto_handled"
          name="Auto-Handled"
          stroke="#0071e3"
          fill="url(#gAuto)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="escalated"
          name="Escalated"
          stroke="#ff9500"
          fill="url(#gEsc)"
          strokeWidth={1.75}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
