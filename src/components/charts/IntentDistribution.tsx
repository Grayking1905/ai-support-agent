import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { INTENT_CONFIG } from '../agent/IntentBadge'
import type { Intent } from '@/store/useAppStore'

interface IntentItem { intent: string; count: number; label: string }

export default function IntentDistributionChart({ data }: { data: IntentItem[] }) {
  const COLORS = data.map(d => INTENT_CONFIG[d.intent as Intent]?.color ?? '#8e8e93')

  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="48%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          strokeWidth={2}
          stroke="#ffffff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
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
          wrapperStyle={{ paddingTop: '6px' }}
          formatter={(value) => (
            <span style={{ color: '#515154', fontSize: '11px', fontWeight: 500 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
