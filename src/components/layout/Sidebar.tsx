import { useAppStore } from '@/store/useAppStore'
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Database,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react'

export default function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useAppStore()

  const navSections = [
    {
      title: 'PLATFORM',
      items: [
        { id: 'dashboard',     label: 'Overview',      icon: LayoutDashboard },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: '15' },
        { id: 'workbench',     label: 'AI Workbench',  icon: Bot },
      ],
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'knowledge',     label: 'Vector Base',   icon: Database },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'settings',      label: 'System Rules',  icon: Sliders },
      ],
    },
  ]

  return (
    <aside
      className={`bg-white border-r border-black/[0.08] flex flex-col flex-shrink-0 sticky top-0 h-screen z-20 select-none transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-[230px]'
      }`}
    >
      {/* Workspace Header */}
      <div className="h-[52px] border-b border-black/[0.06] px-4 flex items-center justify-between">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-bold">
              
            </div>
            <div>
              <span className="text-xs font-bold text-[#1d1d1f] tracking-tight">
                SupportMind
              </span>
              <span className="text-[10px] text-[#86868b] block -mt-0.5 font-normal">
                Apple Operations
              </span>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-md bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-bold mx-auto">
            
          </div>
        )}

        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!sidebarCollapsed && (
              <div className="text-[10px] font-semibold text-[#86868b] tracking-wider px-3 mb-1 uppercase">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-black/[0.06] text-[#1d1d1f] font-semibold shadow-2xs'
                        : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.03] font-medium'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-[#0071e3]' : 'text-[#86868b]'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white text-[#1d1d1f] shadow-2xs'
                                : 'bg-black/[0.05] text-[#86868b]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-black/[0.06] space-y-1.5">
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('workbench')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black/[0.03] hover:bg-black/[0.06] rounded-lg text-[11px] font-medium text-[#424245] transition-colors"
              >
                <Sparkles size={13} className="text-[#0071e3]" />
                <span>Simulate</span>
              </button>
              <button
                onClick={() => setActivePage('settings')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black/[0.03] hover:bg-black/[0.06] rounded-lg text-[11px] font-medium text-[#424245] transition-colors"
              >
                <Activity size={13} className="text-[#34c759]" />
                <span>Status</span>
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center py-1.5 text-[#86868b] hover:text-[#1d1d1f]"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
