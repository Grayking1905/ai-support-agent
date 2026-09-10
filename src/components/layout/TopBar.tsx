import { useAppStore } from '@/store/useAppStore'
import { Bell, Search } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; desc: string }> = {
  dashboard:     { title: 'Dashboard',      desc: 'Overview & system metrics' },
  conversations: { title: 'Conversations',  desc: 'All Apple Support interactions' },
  workbench:     { title: 'AI Workbench',   desc: 'Test the agent in real-time' },
  knowledge:     { title: 'Knowledge Base', desc: 'RAG vector index & search' },
  settings:      { title: 'Settings',       desc: 'Configuration & preferences' },
}

export default function TopBar() {
  const { activePage } = useAppStore()
  const info = PAGE_TITLES[activePage] ?? { title: activePage, desc: '' }

  return (
    <header style={{
      height: 60,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(9,9,15,0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Page title */}
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {info.title}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.desc}</div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px',
          color: 'var(--text-muted)', fontSize: '0.8rem',
        }}>
          <Search size={13} />
          <span>Search...</span>
          <span style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '1px 5px', fontSize: '0.65rem', color: 'var(--text-muted)',
          }}>⌘K</span>
        </div>

        {/* Notifications */}
        <button style={{
          width: 34, height: 34, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Bell size={15} />
          <span style={{
            position: 'absolute', top: 5, right: 5,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--rose)', border: '2px solid var(--bg-base)',
          }} />
        </button>

        {/* Status indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 'var(--radius-md)', padding: '5px 10px',
          fontSize: '0.72rem', fontWeight: 600, color: 'var(--emerald)',
        }}>
          <span className="pulse-dot" style={{ background: 'var(--emerald)' }} />
          Operational
        </div>
      </div>
    </header>
  )
}
