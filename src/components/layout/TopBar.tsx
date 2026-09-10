import { useAppStore } from '@/store/useAppStore'
import { Bell, Search } from 'lucide-react'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Overview',           subtitle: 'Analytics & Live Metrics' },
  conversations: { title: 'Conversations',      subtitle: 'Apple Support Inquiries' },
  workbench:     { title: 'AI Workbench',       subtitle: 'Pipeline Sandbox' },
  knowledge:     { title: 'Knowledge Base',     subtitle: 'Qdrant Vector Index' },
  settings:      { title: 'Settings',           subtitle: 'System & Safety Rules' },
}

export default function TopBar() {
  const { activePage } = useAppStore()
  const meta = PAGE_META[activePage] ?? { title: activePage, subtitle: 'SupportMind' }

  return (
    <header className="h-[52px] bg-white/90 backdrop-blur-xl border-b border-black/[0.08] sticky top-0 z-30 flex items-center justify-between px-6 flex-shrink-0 select-none">
      {/* Left: Window Title & Subtitle in Apple HIG Style */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
          {meta.title}
        </span>
        <span className="text-black/20 text-xs">•</span>
        <span className="text-xs text-[#86868b] font-normal hidden sm:inline">
          {meta.subtitle}
        </span>
      </div>

      {/* Right: Clean Search, System Status, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Apple System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.04] text-[11px] font-medium text-[#424245]">
          <span className="w-2 h-2 rounded-full bg-[#34c759] inline-block" />
          <span>Operational</span>
          <span className="text-black/20">|</span>
          <span className="text-[#86868b]">218ms</span>
        </div>

        {/* Apple Search Input */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-[#86868b] pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets, IDs..."
            className="w-48 xl:w-56 pl-8 pr-10 py-1 text-xs bg-black/[0.04] hover:bg-black/[0.07] focus:bg-white focus:ring-1 focus:ring-[#0071e3] border border-transparent focus:border-[#0071e3] rounded-lg outline-none transition-all placeholder-[#86868b] text-[#1d1d1f]"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[9px] font-mono bg-white border border-black/10 rounded text-[#86868b] shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Icon Button */}
        <button
          className="relative p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
        </button>

        {/* Hairline Divider */}
        <div className="w-[1px] h-4 bg-black/[0.08]" />

        {/* User Profile */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-[11px] font-semibold">
            
          </div>
          <span className="text-xs font-medium text-[#1d1d1f] hidden xl:inline group-hover:text-[#0071e3] transition-colors">
            Apple Support
          </span>
        </div>
      </div>
    </header>
  )
}
