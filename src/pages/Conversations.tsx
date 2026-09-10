import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import ConversationCard from '@/components/agent/ConversationCard'
import ConversationDrawer from '@/components/agent/ConversationDrawer'
import type { Conversation, Intent } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

const API = 'http://localhost:8000'

const MOCK_CONVS: Conversation[] = [
  {
    id: 'conv_a1',
    customer_handle: '@mike_tech',
    customer_name: 'Mike Tech',
    original_message: "My iPhone 15 Pro won't turn on after updating to iOS 17.4. Completely dead screen!",
    created_at: new Date(Date.now() - 3_600_000 * 2).toISOString(),
    intent: 'device_issue',
    intent_confidence: 0.94,
    escalation_status: 'auto_handled',
    sentiment_score: -0.5,
    drafted_reply: "We're sorry to hear your iPhone isn't responding. Please try a force restart: press and quickly release Volume Up, then Volume Down, then hold the Side button until you see the Apple logo. DM us your serial number if that doesn't work. ^AS",
    rag_sources_count: 3,
    is_resolved: false,
  },
  {
    id: 'conv_a2',
    customer_handle: '@sarah_jones92',
    customer_name: 'Sarah Jones',
    original_message: "I can't log into my Apple ID. Locked after resetting my password 3 times!",
    created_at: new Date(Date.now() - 3_600_000 * 5).toISOString(),
    intent: 'account_access',
    intent_confidence: 0.96,
    escalation_status: 'auto_handled',
    sentiment_score: -0.4,
    drafted_reply: "Please go to iforgot.apple.com to begin account recovery. If 2FA codes aren't arriving, ensure your trusted number is up to date. DM us for further assistance. ^AS",
    rag_sources_count: 4,
    is_resolved: true,
  },
  {
    id: 'conv_a3',
    customer_handle: '@frustrated_mom',
    customer_name: 'Frustrated Mom',
    original_message: "My 8-year-old made $340 in in-app purchases! I need a refund NOW. This is unacceptable!",
    created_at: new Date(Date.now() - 3_600_000 * 8).toISOString(),
    intent: 'billing_payment',
    intent_confidence: 0.92,
    escalation_status: 'escalated',
    escalation_reason: 'Critical customer dissatisfaction & high monetary amount ($340)',
    sentiment_score: -0.85,
    drafted_reply: "We completely understand your concern. Please visit reportaproblem.apple.com to request a refund. Enable Ask to Buy in Family Sharing to prevent future unauthorized purchases. ^AS",
    rag_sources_count: 2,
    is_resolved: false,
  },
  {
    id: 'conv_a4',
    customer_handle: '@devraj_patel',
    customer_name: 'Devraj Patel',
    original_message: "App Store keeps crashing every time I try to download anything. Started after iOS 17.3 update.",
    created_at: new Date(Date.now() - 3_600_000 * 12).toISOString(),
    intent: 'app_crash',
    intent_confidence: 0.89,
    escalation_status: 'auto_handled',
    sentiment_score: -0.2,
    drafted_reply: "Try signing out of the App Store (Settings > [your name] > Media & Purchases > Sign Out), then sign back in. Also try restarting your device. ^AS",
    rag_sources_count: 3,
    is_resolved: false,
  },
  {
    id: 'conv_a5',
    customer_handle: '@wifi_troubles',
    customer_name: 'WiFi Troubles',
    original_message: "My iPad Pro won't connect to 5GHz WiFi after iPadOS update. Other devices work fine.",
    created_at: new Date(Date.now() - 3_600_000 * 18).toISOString(),
    intent: 'network_connectivity',
    intent_confidence: 0.91,
    escalation_status: 'auto_handled',
    sentiment_score: -0.2,
    drafted_reply: "Please try forgetting the 5GHz network in Settings > Wi-Fi, then reconnect. If that doesn't help, reset network settings at Settings > General > Transfer or Reset > Reset > Reset Network Settings. ^AS",
    rag_sources_count: 2,
    is_resolved: true,
  },
  {
    id: 'conv_a6',
    customer_handle: '@james_r_wilson',
    customer_name: 'James Wilson',
    original_message: "My MacBook Pro screen has dead pixels and it's only 6 months old. I have AppleCare+",
    created_at: new Date(Date.now() - 3_600_000 * 24).toISOString(),
    intent: 'warranty_repair',
    intent_confidence: 0.95,
    escalation_status: 'auto_handled',
    sentiment_score: -0.1,
    drafted_reply: "Dead pixels on a 6-month-old MacBook with AppleCare+ are covered under warranty. Please schedule at your nearest Apple Store via apple.com/retail. ^AS",
    rag_sources_count: 3,
    is_resolved: true,
  },
  {
    id: 'conv_a7',
    customer_handle: '@alexa_designer',
    customer_name: 'Alexa Chen',
    original_message: "How do I transfer eSIM from my old iPhone 12 to my new iPhone 15 without a physical carrier store?",
    created_at: new Date(Date.now() - 3_600_000 * 28).toISOString(),
    intent: 'setup_activation',
    intent_confidence: 0.93,
    escalation_status: 'auto_handled',
    sentiment_score: 0.1,
    drafted_reply: "During setup, select 'Transfer From Nearby iPhone' when prompted for cellular setup. Both phones must have Bluetooth on and running iOS 16 or later. ^AS",
    rag_sources_count: 3,
    is_resolved: true,
  },
  {
    id: 'conv_a8',
    customer_handle: '@marcus_beats',
    customer_name: 'Marcus Miller',
    original_message: "My AirPods Pro 2 right earbud produces a buzzing sound during Active Noise Cancellation.",
    created_at: new Date(Date.now() - 3_600_000 * 32).toISOString(),
    intent: 'device_issue',
    intent_confidence: 0.91,
    escalation_status: 'auto_handled',
    sentiment_score: -0.35,
    drafted_reply: "Please clean the mesh on both earbuds with a dry cotton swab and ensure the latest firmware is installed. If crackling persists, visit an Apple Authorized Service Provider. ^AS",
    rag_sources_count: 2,
    is_resolved: false,
  },
]

type SubNavFilter = 'all' | 'auto_handled' | 'escalated' | 'resolved'

export default function Conversations() {
  const { activeConversationId, setActiveConversation } = useAppStore()
  const [subNavFilter, setSubNavFilter] = useState<SubNavFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntent, setSelectedIntent] = useState<Intent | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)
  const [newTicketText, setNewTicketText] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')

  const { data: conversations, refetch, isFetching } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () =>
      fetch(`${API}/api/conversations?limit=50`)
        .then((r) => r.json())
        .catch(() => MOCK_CONVS),
    retry: false,
    placeholderData: MOCK_CONVS,
  })

  const list = conversations && conversations.length > 0 ? conversations : MOCK_CONVS

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: list.length,
      auto_handled: list.filter((c) => c.escalation_status === 'auto_handled').length,
      escalated: list.filter((c) => c.escalation_status === 'escalated').length,
      resolved: list.filter((c) => c.is_resolved).length,
    }
  }, [list])

  // Filtered list
  const filteredList = useMemo(() => {
    return list.filter((c) => {
      if (subNavFilter === 'auto_handled' && c.escalation_status !== 'auto_handled') return false
      if (subNavFilter === 'escalated' && c.escalation_status !== 'escalated') return false
      if (subNavFilter === 'resolved' && !c.is_resolved) return false

      if (selectedIntent !== 'all' && c.intent !== selectedIntent) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const name = (c.customer_name ?? '').toLowerCase()
        const handle = c.customer_handle.toLowerCase()
        const msg = c.original_message.toLowerCase()
        const id = c.id.toLowerCase()
        if (!name.includes(q) && !handle.includes(q) && !msg.includes(q) && !id.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [list, subNavFilter, selectedIntent, searchQuery])

  const activeConversation = useMemo(() => {
    return list.find((c) => c.id === activeConversationId) ?? list[0] ?? null
  }, [list, activeConversationId])

  const handleCardClick = (c: Conversation) => {
    setActiveConversation(c.id)
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] overflow-hidden bg-[#f5f5f7]">
      {/* 1. Sub-nav Header with Apple Segmented Control */}
      <div className="bg-white border-b border-black/[0.08] px-8 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Customer Conversations
            </h1>
            <p className="text-xs text-[#86868b] mt-0.5">
              Live customer tweet triage powered by Qdrant vector retrieval & Groq Llama-3
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className={`p-2 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all ${
                isFetching ? 'animate-spin text-[#0071e3]' : ''
              }`}
              title="Refresh tickets"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Apple Segmented Control Tabs */}
        <div className="inline-flex bg-black/[0.05] p-1 rounded-xl gap-1">
          <button
            onClick={() => setSubNavFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              subNavFilter === 'all'
                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <span>All Inquiries</span>
            <span className="text-[10px] text-[#86868b]">{counts.all}</span>
          </button>

          <button
            onClick={() => setSubNavFilter('auto_handled')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              subNavFilter === 'auto_handled'
                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <span>Auto-Handled</span>
            <span className="text-[10px] text-[#34c759] font-semibold">{counts.auto_handled}</span>
          </button>

          <button
            onClick={() => setSubNavFilter('escalated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              subNavFilter === 'escalated'
                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <span>Escalated</span>
            <span className="text-[10px] text-[#ff9500] font-semibold">{counts.escalated}</span>
          </button>

          <button
            onClick={() => setSubNavFilter('resolved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              subNavFilter === 'resolved'
                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <span>Resolved</span>
            <span className="text-[10px] text-[#248a3d] font-semibold">{counts.resolved}</span>
          </button>
        </div>
      </div>

      {/* 2. Apple Toolbar */}
      <div className="bg-white border-b border-black/[0.08] px-8 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        {/* Search & Intent Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-2.5 text-[#86868b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, @handle, or inquiry..."
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-black/[0.04] hover:bg-black/[0.07] focus:bg-white focus:ring-1 focus:ring-[#0071e3] border border-transparent focus:border-[#0071e3] rounded-lg outline-none transition-all placeholder-[#86868b] text-[#1d1d1f]"
            />
          </div>

          <div className="relative">
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value as any)}
              className="appearance-none bg-black/[0.04] hover:bg-black/[0.07] text-[#424245] text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 cursor-pointer outline-none transition-all"
            >
              <option value="all">All Intents</option>
              <option value="device_issue">Device Issue</option>
              <option value="account_access">Account Access</option>
              <option value="billing_payment">Billing & Payment</option>
              <option value="app_crash">App / Software</option>
              <option value="network_connectivity">Network</option>
              <option value="warranty_repair">Warranty</option>
              <option value="setup_activation">Setup & Activation</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-[#86868b] pointer-events-none" />
          </div>
        </div>

        {/* View Switcher & Primary Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 rounded-lg bg-black/[0.04]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#1d1d1f] shadow-2xs' : 'text-[#86868b]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white text-[#1d1d1f] shadow-2xs' : 'text-[#86868b]'
              }`}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>

          {/* Apple Primary Action Button */}
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Process Inquiry</span>
            <kbd className="text-[10px] bg-white/20 px-1 rounded font-mono hidden md:inline">
              ⌘N
            </kbd>
          </button>
        </div>
      </div>

      {/* 3. Inquiries Grid / List */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredList.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredList.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeConversationId && isDrawerOpen}
                  onClick={() => handleCardClick(conv)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden divide-y divide-black/[0.04]">
              {filteredList.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleCardClick(conv)}
                  className="p-3.5 hover:bg-black/[0.02] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black/[0.05] flex items-center justify-center text-[#1d1d1f] text-xs font-semibold">
                      {(conv.customer_name ?? conv.customer_handle).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#1d1d1f]">
                        {conv.customer_name ?? conv.customer_handle}
                      </div>
                      <div className="text-[11px] text-[#86868b] line-clamp-1 max-w-md">
                        {conv.original_message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#86868b]">#{conv.id}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        conv.escalation_status === 'escalated'
                          ? 'bg-[#ff9500]/10 text-[#c97500]'
                          : conv.is_resolved
                          ? 'bg-[#34c759]/10 text-[#248a3d]'
                          : 'bg-[#0071e3]/10 text-[#0071e3]'
                      }`}
                    >
                      {conv.escalation_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto text-[#86868b] mb-3">
              <Search size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f]">No matching inquiries</h3>
            <p className="text-xs text-[#86868b] mt-1 mb-4">
              Try adjusting your search terms or active intent filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedIntent('all')
                setSubNavFilter('all')
              }}
              className="text-xs font-medium text-[#0071e3] hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Slide-over Inspector Drawer (Apple HIG Sheet pattern) */}
      <ConversationDrawer
        conversation={activeConversation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 5. Process Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-black/[0.08] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0071e3] text-white flex items-center justify-center">
                  <Sparkles size={13} />
                </div>
                <h3 className="text-sm font-bold text-[#1d1d1f]">Simulate Customer Inquiry</h3>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#424245] block mb-1">
                  Customer Handle or Name
                </label>
                <input
                  type="text"
                  placeholder="@customer_handle"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/[0.04] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-lg outline-none text-[#1d1d1f]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#424245] block mb-1">
                  Customer Support Inquiry / Tweet
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. My iPhone 15 battery drains 50% in 2 hours after updating to iOS 17.5."
                  value={newTicketText}
                  onChange={(e) => setNewTicketText(e.target.value)}
                  className="w-full p-3 text-xs bg-black/[0.04] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-lg outline-none text-[#1d1d1f] resize-none"
                />
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setNewCustomerName('@jordan_apple')
                      setNewTicketText('My AirPods Pro keep losing connection during phone calls!')
                    }}
                    className="text-[11px] px-2 py-1 rounded-md bg-black/[0.04] hover:bg-black/[0.08] text-[#424245] transition-colors"
                  >
                    AirPods Connection
                  </button>
                  <button
                    onClick={() => {
                      setNewCustomerName('@app_dev_rob')
                      setNewTicketText('Need urgent refund for recurring iCloud storage subscription charge.')
                    }}
                    className="text-[11px] px-2 py-1 rounded-md bg-black/[0.04] hover:bg-black/[0.08] text-[#424245] transition-colors"
                  >
                    iCloud Refund
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-black/[0.06] bg-[#fbfbfd] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTicketText.trim()) return
                  setIsNewTicketModalOpen(false)
                  try {
                    const res = await fetch(`${API}/api/agent/process`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customer_message: newTicketText,
                        customer_handle: newCustomerName || '@user_inquiry',
                      }),
                    })
                    if (res.ok) {
                      refetch()
                    }
                  } catch (e) {
                    refetch()
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs"
              >
                Run AI Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
