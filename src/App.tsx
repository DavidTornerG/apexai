import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import { appWindow } from '@tauri-apps/api/window';
import { Minimize2, Maximize2, X, Command } from 'lucide-react';
import CommandPalette from './components/CommandPalette';
import ActionHistory from './components/ActionHistory';
import ScreenPreview from './components/ScreenPreview';
import StatusBar from './components/StatusBar';
import { useAutomationStore } from './stores/automation';

interface AutomationEvent {
  type: 'action_started' | 'action_completed' | 'error';
  data: any;
}

function App() {
  const {
    isRunning,
    currentAction,
    history,
    stats,
    isCommandPaletteOpen,
    addToHistory,
    setCurrentAction,
    setRunning,
    updateStats,
    setCommandPaletteOpen,
  } = useAutomationStore();

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Register global shortcut for command palette
    const registerShortcut = async () => {
      try {
        await register('CommandOrControl+Shift+Space', () => {
          setCommandPaletteOpen(true);
        });
      } catch (error) {
        console.warn('Failed to register global shortcut:', error);
      }
    };

    registerShortcut();

    // Listen for automation events
    const setupEventListeners = async () => {
      const unlisten = await listen<AutomationEvent>('automation-event', (event) => {
        console.log('Automation event:', event.payload);

        switch (event.payload.type) {
          case 'action_started':
            setCurrentAction(event.payload.data);
            setRunning(true);
            break;
          case 'action_completed':
            addToHistory(event.payload.data);
            setCurrentAction(null);
            setRunning(false);
            // Update stats
            fetchStats();
            break;
          case 'error':
            console.error('Automation error:', event.payload.data);
            setRunning(false);
            setCurrentAction(null);
            break;
        }
      });

      // Listen for global shortcut events
      const unlistenShortcut = await listen('global-shortcut', (event) => {
        if (event.payload === 'command-palette') {
          setCommandPaletteOpen(true);
        }
      });

      return () => {
        unlisten();
        unlistenShortcut();
      };
    };

    setupEventListeners();

    // Load initial stats
    fetchStats();

    return () => {
      unregisterAll();
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await invoke('get_automation_stats');
      updateStats(statsData as any);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [updateStats]);

  const handleCommand = useCallback(async (command: string) => {
    try {
      await invoke('execute_automation', { prompt: command });
      setCommandPaletteOpen(false);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  }, []);

  const handleMinimize = async () => {
    try {
      await invoke('minimize_window');
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      await invoke('maximize_window');
      setIsMaximized(!isMaximized);
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  };

  const handleClose = async () => {
    try {
      await invoke('close_window');
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close command palette
      if (event.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }

      // Cmd/Ctrl + K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  return (
    <div className="app-container">
      {/* Custom window controls */}
      <div className="window-controls">
        <div className="window-title">same.dev</div>
        <div className="window-buttons">
          <button onClick={handleMinimize} title="Minimize">
            <Minimize2 size={14} />
          </button>
          <button onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            <Maximize2 size={14} />
          </button>
          <button onClick={handleClose} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Left sidebar - Action History */}
        <div className="sidebar glass-panel">
          <div className="sidebar-header">
            <h2>History</h2>
            <span className="history-count">{history.length}</span>
          </div>
          <ActionHistory actions={history} />
        </div>

        {/* Center panel - Screen Preview */}
        <div className="center-panel">
          <ScreenPreview
            isActive={isRunning}
            currentAction={currentAction}
          />

          {!isRunning && (
            <div className="center-welcome">
              <div className="welcome-content">
                <div className="nexus-logo">
                  <div className="logo-icon">
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="22" fill="url(#gradient)" stroke="url(#border)" strokeWidth="2"/>
                      <path d="M28 14L18 26H22L20 34L30 22H26L28 14Z" fill="white" stroke="none"/>
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{stopColor:"#0066FF", stopOpacity:1}} />
                          <stop offset="50%" style={{stopColor:"#0080FF", stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:"#0052CC", stopOpacity:1}} />
                        </linearGradient>
                        <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{stopColor:"#FFFFFF", stopOpacity:0.3}} />
                          <stop offset="100%" style={{stopColor:"#FFFFFF", stopOpacity:0.1}} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <h1 className="welcome-title">Ready to Automate</h1>
                <p className="welcome-subtitle">
                  Describe what you'd like me to do and I'll take care of it
                </p>
                <button
                  className="quick-action-btn animate-glow"
                  onClick={() => setCommandPaletteOpen(true)}
                >
                  <Command size={16} />
                  <span>Open Command Palette</span>
                  <span className="shortcut">⌘⇧Space</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - Stats */}
        <div className="right-panel glass-panel">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-label">Avg Latency</div>
              <div className="stat-value">{Math.round(stats.avg_latency_ms)}ms</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Actions Today</div>
              <div className="stat-value">{stats.actions_today}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Success Rate</div>
              <div className="stat-value">{stats.success_rate.toFixed(1)}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Actions</div>
              <div className="stat-value">{stats.total_actions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        isRunning={isRunning}
        currentAction={currentAction}
        stats={stats}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />
    </div>
  );
}

export default App;
