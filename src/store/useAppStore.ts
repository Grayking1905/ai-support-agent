import { create } from 'zustand'

export type Intent =
  | 'device_issue'
  | 'account_access'
  | 'app_crash'
  | 'billing_payment'
  | 'warranty_repair'
  | 'setup_activation'
  | 'network_connectivity'
  | 'other_general'

export type EscalationStatus = 'auto_handled' | 'escalated' | 'pending'

export interface Conversation {
  id: string
  customer_handle: string
  customer_name?: string
  original_message: string
  created_at: string
  intent?: Intent
  intent_confidence?: number
  escalation_status: EscalationStatus
  escalation_reason?: string
  sentiment_score?: number
  drafted_reply?: string
  historical_apple_reply?: string
  apple_signoff?: string
  rag_sources_count: number
  is_resolved: boolean
}

export interface AgentResult {
  conversation_id: string
  classification: { intent: string; confidence: number; reasoning: string }
  drafted_reply: string
  escalation: { decision: string; reason: string; priority: string }
  rag_sources_used: number
  sentiment_score: number
  processing_time_ms: number
}

interface AppState {
  // Active UI state
  activeConversationId: string | null
  activePage: string
  sidebarCollapsed: boolean

  // Filters
  intentFilter: Intent | null
  escalationFilter: EscalationStatus | null

  // Agent workbench
  currentAgentResult: AgentResult | null
  isProcessing: boolean

  // Actions
  setActiveConversation: (id: string | null) => void
  setActivePage: (page: string) => void
  toggleSidebar: () => void
  setIntentFilter: (intent: Intent | null) => void
  setEscalationFilter: (status: EscalationStatus | null) => void
  setAgentResult: (result: AgentResult | null) => void
  setProcessing: (v: boolean) => void

  // Legacy counter (kept for store continuity)
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeConversationId: null,
  activePage: 'dashboard',
  sidebarCollapsed: false,
  intentFilter: null,
  escalationFilter: null,
  currentAgentResult: null,
  isProcessing: false,
  count: 0,

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setIntentFilter: (intent) => set({ intentFilter: intent }),
  setEscalationFilter: (status) => set({ escalationFilter: status }),
  setAgentResult: (result) => set({ currentAgentResult: result }),
  setProcessing: (v) => set({ isProcessing: v }),
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}))
