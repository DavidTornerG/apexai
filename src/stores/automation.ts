import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ActionRecord {
  id: string;
  prompt: string;
  actions: string[];
  success: boolean;
  duration_ms: number;
  timestamp: string;
  screenshots?: string[];
}

export interface AutomationStats {
  total_actions: number;
  success_rate: number;
  avg_latency_ms: number;
  actions_today: number;
  fastest_action_ms: number;
  slowest_action_ms: number;
}

interface AutomationState {
  // State
  isRunning: boolean;
  currentAction: ActionRecord | null;
  history: ActionRecord[];
  stats: AutomationStats;
  isCommandPaletteOpen: boolean;

  // Actions
  setRunning: (running: boolean) => void;
  setCurrentAction: (action: ActionRecord | null) => void;
  addToHistory: (action: ActionRecord) => void;
  clearHistory: () => void;
  updateStats: (stats: AutomationStats) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAutomationStore = create<AutomationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isRunning: false,
    currentAction: null,
    history: [],
    stats: {
      total_actions: 0,
      success_rate: 100.0,
      avg_latency_ms: 0.0,
      actions_today: 0,
      fastest_action_ms: 0.0,
      slowest_action_ms: 0.0,
    },
    isCommandPaletteOpen: false,

    // Actions
    setRunning: (running: boolean) => {
      set({ isRunning: running });
    },

    setCurrentAction: (action: ActionRecord | null) => {
      set({ currentAction: action });
    },

    addToHistory: (action: ActionRecord) => {
      set((state) => ({
        history: [action, ...state.history].slice(0, 100), // Keep last 100 actions
      }));
    },

    clearHistory: () => {
      set({ history: [] });
    },

    updateStats: (stats: AutomationStats) => {
      set({ stats });
    },

    setCommandPaletteOpen: (open: boolean) => {
      set({ isCommandPaletteOpen: open });
    },
  }))
);

// Subscribe to state changes for persistence or side effects
useAutomationStore.subscribe(
  (state) => state.history,
  (history) => {
    // Could persist to localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('automation-history', JSON.stringify(history.slice(0, 20)));
    }
  }
);

// Load initial history from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('automation-history');
  if (saved) {
    try {
      const history = JSON.parse(saved);
      useAutomationStore.setState({ history });
    } catch (error) {
      console.warn('Failed to load automation history:', error);
    }
  }
}
