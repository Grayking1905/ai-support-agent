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
    case 'dashboard':     return <Dashboard />
    case 'conversations': return <Conversations />
    case 'workbench':     return <AgentWorkbench />
    case 'knowledge':     return <KnowledgeBase />
    case 'settings':      return <Settings />
    default:              return <Dashboard />
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <TopBar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <PageRenderer />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
