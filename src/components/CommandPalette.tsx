import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, ArrowRight, Clock, Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onCommand }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commonCommands = [
    'Open Chrome and search for React documentation',
    'Send email to team about project updates',
    'Create new document in Google Docs',
    'Schedule meeting for tomorrow at 2 PM',
    'Take screenshot of current window',
    'Open VS Code',
    'Fill out the contact form',
    'Download the latest report',
    'Click the submit button',
    'Type my name in the input field',
    'Scroll down to see more content',
    'Open settings menu',
    'Save the current document',
    'Copy text to clipboard',
    'Navigate to dashboard',
    'Search for files',
    'Open file manager',
    'Switch to dark mode',
    'Refresh the page',
    'Close all tabs'
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setInput('');
      setSuggestions(commonCommands.slice(0, 8));
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (input.length > 0) {
      const filtered = commonCommands.filter(cmd =>
        cmd.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setSelectedIndex(0);
    } else {
      setSuggestions(commonCommands.slice(0, 8));
      setSelectedIndex(0);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commandToExecute = input.trim() || suggestions[selectedIndex];
    if (commandToExecute) {
      onCommand(commandToExecute);
      setInput('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          setInput(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="command-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
            }}
          >
            {/* Input Section */}
            <form onSubmit={handleSubmit}>
              <div className="command-input-container">
                <div className="command-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5V3C5 2.44772 4.55228 2 4 2H3C2.44772 2 2 2.44772 2 3V4C2 4.55228 2.44772 5 3 5H5ZM5 5H15M5 5V15M15 5H17C17.5523 5 18 4.55228 18 4V3C18 2.44772 17.5523 2 17 2H16C15.4477 2 15 2.44772 15 3V5ZM5 15H3C2.44772 15 2 15.4477 2 16V17C2 17.5523 2.44772 18 3 18H4C4.55228 18 5 17.5523 5 17V15ZM5 15H15M15 15V17C15 17.5523 15.4477 18 16 18H17C17.5523 18 18 17.5523 18 17V16C18 15.4477 17.5523 15 17 15H15Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What would you like me to do?"
                  className="command-input"
                />
                {!input && (
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    color: 'var(--text-tertiary)',
                    fontSize: '14px',
                    pointerEvents: 'none'
                  }}>
                    <Search size={16} />
                  </div>
                )}
              </div>
            </form>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <motion.div
                className="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    onDoubleClick={() => {
                      onCommand(suggestion);
                      onClose();
                    }}
                    style={{
                      backgroundColor: index === selectedIndex ? 'var(--bg-hover)' : 'transparent'
                    }}
                    whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="suggestion-icon">
                      <ArrowRight size={14} />
                    </span>
                    <span style={{ flex: 1 }}>{suggestion}</span>
                    {index === selectedIndex && (
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        opacity: 0.7
                      }}>
                        ↵
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              className="command-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                <span className="hint">↵ Execute</span>
                <span className="hint">⇥ Autocomplete</span>
                <span className="hint">↑↓ Navigate</span>
              </div>
              <span className="hint">ESC to close</span>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
