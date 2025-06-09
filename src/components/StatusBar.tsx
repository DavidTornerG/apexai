import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Cpu, Zap, Clock } from 'lucide-react';
import { ActionRecord, AutomationStats } from '../stores/automation';

interface StatusBarProps {
  isRunning: boolean;
  currentAction: ActionRecord | null;
  stats: AutomationStats;
}

const StatusBar: React.FC<StatusBarProps> = ({ isRunning, currentAction, stats }) => {
  const getStatusColor = () => {
    if (isRunning) return 'var(--accent-primary)';
    return 'var(--success)';
  };

  const getStatusText = () => {
    if (isRunning && currentAction) {
      return `Executing: ${currentAction.prompt.slice(0, 50)}${currentAction.prompt.length > 50 ? '...' : ''}`;
    }
    return 'Ready • Nexus AI Computer Control';
  };

  const formatLatency = (ms: number) => {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="status-bar">
      {/* Left side - Status */}
      <div className="status-indicator">
        <motion.div
          className={`status-dot ${isRunning ? 'running' : ''}`}
          animate={isRunning ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={isRunning ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          style={{
            backgroundColor: getStatusColor()
          }}
        />
        <span style={{
          fontSize: '12px',
          color: isRunning ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}>
          {getStatusText()}
        </span>
      </div>

      {/* Right side - Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Connection status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Wifi size={12} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '11px' }}>Connected</span>
        </div>

        {/* Performance metrics */}
        {stats.avg_latency_ms > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '11px' }}>
              Avg: {formatLatency(stats.avg_latency_ms)}
            </span>
          </div>
        )}

        {/* Success rate */}
        {stats.total_actions > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Zap size={12} style={{
              color: stats.success_rate >= 90 ? 'var(--success)' :
                     stats.success_rate >= 70 ? 'var(--warning)' : 'var(--error)'
            }} />
            <span style={{ fontSize: '11px' }}>
              {stats.success_rate.toFixed(1)}%
            </span>
          </div>
        )}

        {/* CPU usage indicator (simulated) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Cpu size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '11px' }}>
            {isRunning ? 'High' : 'Low'}
          </span>
        </div>

        {/* Version */}
        <span style={{
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          opacity: 0.7
        }}>
          v0.1.0
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
