import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { ActionRecord } from '../stores/automation';

interface ActionHistoryProps {
  actions: ActionRecord[];
}

const ActionHistory: React.FC<ActionHistoryProps> = ({ actions }) => {
  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle size={12} style={{ color: 'var(--success)' }} />
    ) : (
      <XCircle size={12} style={{ color: 'var(--error)' }} />
    );
  };

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  if (actions.length === 0) {
    return (
      <div className="action-history">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--text-tertiary)',
          textAlign: 'center'
        }}>
          <Clock size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>No actions yet</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            Use the command palette to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="action-history">
      <AnimatePresence initial={false}>
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            className="action-item"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {/* Action prompt */}
            <div className="action-prompt">
              {action.prompt}
            </div>

            {/* Action steps */}
            {action.actions && action.actions.length > 0 && (
              <div style={{
                margin: '8px 0',
                fontSize: '11px',
                color: 'var(--text-tertiary)'
              }}>
                {action.actions.map((step, stepIndex) => (
                  <div key={stepIndex} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px'
                  }}>
                    <ChevronRight size={10} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action metadata */}
            <div className="action-meta">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getStatusIcon(action.success)}
                <span className={`action-status ${action.success ? 'success' : 'error'}`}>
                  {action.success ? 'Success' : 'Failed'}
                </span>
                <span>•</span>
                <span>{formatDuration(action.duration_ms)}</span>
              </div>
              <span>{getRelativeTime(action.timestamp)}</span>
            </div>

            {/* Hover effect indicator */}
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                background: action.success ? 'var(--success)' : 'var(--error)',
                borderRadius: '0 2px 2px 0',
                opacity: 0
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show total count if there are many actions */}
      {actions.length >= 20 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '16px',
            fontSize: '12px',
            color: 'var(--text-tertiary)'
          }}
        >
          Showing recent {actions.length} actions
        </motion.div>
      )}
    </div>
  );
};

export default ActionHistory;
