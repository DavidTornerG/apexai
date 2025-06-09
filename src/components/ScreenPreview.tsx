import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Activity, Zap, Eye } from 'lucide-react';
import { ActionRecord } from '../stores/automation';

interface ScreenPreviewProps {
  isActive: boolean;
  currentAction: ActionRecord | null;
}

const ScreenPreview: React.FC<ScreenPreviewProps> = ({ isActive, currentAction }) => {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulseKey(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="screen-preview">
      <AnimatePresence mode="wait">
        {isActive && currentAction ? (
          // Active state - show current action
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px'
            }}
          >
            {/* Animated activity indicator */}
            <motion.div
              key={pulseKey}
              style={{
                position: 'relative',
                marginBottom: '24px'
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px var(--accent-glow)'
                }}
              >
                <Activity size={32} color="white" />
              </motion.div>

              {/* Ripple effect */}
              <motion.div
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '2px solid var(--accent-primary)',
                  pointerEvents: 'none'
                }}
              />
            </motion.div>

            {/* Current action details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Executing Action
              </h3>

              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                maxWidth: '400px'
              }}>
                {currentAction.prompt}
              </p>

              {/* Action steps */}
              {currentAction.actions && currentAction.actions.length > 0 && (
                <div style={{
                  background: 'rgba(0, 102, 255, 0.1)',
                  border: '1px solid rgba(0, 102, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px'
                }}>
                  {currentAction.actions.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      style={{
                        fontSize: '12px',
                        color: 'var(--accent-primary)',
                        marginBottom: index < currentAction.actions!.length - 1 ? '4px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Zap size={10} />
                      {step}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          // Idle state - show placeholder
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="preview-placeholder"
          >
            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ marginBottom: '16px' }}
            >
              <Monitor size={48} style={{ color: 'var(--text-tertiary)' }} />
            </motion.div>

            <h3 style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: 'var(--text-secondary)'
            }}>
              Ready for Action
            </h3>

            <p style={{
              fontSize: '14px',
              opacity: 0.7,
              maxWidth: '300px',
              lineHeight: '1.4'
            }}>
              Use the command palette to start automating tasks.
              I'll show the live preview here.
            </p>

            {/* Feature highlights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px',
              marginTop: '32px',
              maxWidth: '400px'
            }}>
              {[
                { icon: <Eye size={16} />, label: 'Screen Analysis' },
                { icon: <Zap size={16} />, label: 'Smart Actions' },
                { icon: <Activity size={16} />, label: 'Live Preview' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <div style={{ color: 'var(--accent-primary)' }}>
                    {feature.icon}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center'
                  }}>
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `
          linear-gradient(var(--border-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default ScreenPreview;
