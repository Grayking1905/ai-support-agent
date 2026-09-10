import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import Dashboard from '@/pages/Dashboard'
import Conversations from '@/pages/Conversations'
import AgentWorkbench from '@/pages/AgentWorkbench'
import KnowledgeBase from '@/pages/KnowledgeBase'
import Settings from '@/pages/Settings'
import { useAppStore } from '@/store/useAppStore'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

function PageRenderer() {
  const { activePage } = useAppStore()
  switch (activePage) {
    case 'dashboard':
      return <Dashboard />
    case 'conversations':
      return <Conversations />
    case 'workbench':
      return <AgentWorkbench />
    case 'knowledge':
      return <KnowledgeBase />
    case 'settings':
      return <Settings />
    default:
      return <Dashboard />
  }
}

export default function App() {
  const { setActivePage } = useAppStore()

  // Global Keyboard Shortcuts (⌘K, ⌘N, ⌘1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setActivePage('workbench')
      } else if (isMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setActivePage('conversations')
      } else if (isMeta && e.key === '1') {
        e.preventDefault()
        setActivePage('dashboard')
      } else if (isMeta && e.key === '2') {
        e.preventDefault()
        setActivePage('conversations')
      } else if (isMeta && e.key === '3') {
        e.preventDefault()
        setActivePage('workbench')
      } else if (isMeta && e.key === '4') {
        e.preventDefault()
        setActivePage('knowledge')
      } else if (isMeta && e.key === '5') {
        e.preventDefault()
        setActivePage('settings')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActivePage])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#00A3BF]/20 selection:text-[#007a8f]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopBar />
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <PageRenderer />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
