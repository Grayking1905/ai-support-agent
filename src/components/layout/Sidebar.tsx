import { useAppStore } from '@/store/useAppStore'
import {
  LayoutDashboard, MessageSquare, Bot, Database, Settings,
  ChevronLeft, ChevronRight, Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'conversations',  label: 'Conversations', icon: MessageSquare },
  { id: 'workbench',      label: 'AI Workbench',  icon: Bot },
  { id: 'knowledge',      label: 'Knowledge Base',icon: Database },
  { id: 'settings',       label: 'Settings',      icon: Settings },
]

export default function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      style={{
        width: sidebarCollapsed ? '64px' : '220px',
        minHeight: '100vh',
        background: 'rgba(15,15,26,0.95)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand */}
      <div style={{
        padding: sidebarCollapsed ? '20px 0' : '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border)',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #0066CC 0%, #338FE8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(0,102,204,0.4)',
        }}>
          <Zap size={17} color="#fff" />
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              SupportMind
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Apple Support AI
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              title={sidebarCollapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: sidebarCollapsed ? '10px 0' : '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: active
                  ? 'linear-gradient(135deg, rgba(0,102,204,0.2) 0%, rgba(51,143,232,0.12) 100%)'
                  : 'transparent',
                color: active ? '#5ba8f5' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                transition: 'all 200ms ease',
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                boxShadow: active ? 'inset 0 0 0 1px rgba(0,102,204,0.25)' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && label}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          margin: '12px 8px',
          padding: '9px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: '8px',
          fontSize: '0.8rem',
          fontFamily: 'inherit',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {sidebarCollapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
      </button>
    </aside>
  )
}
