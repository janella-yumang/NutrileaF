import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'bot'; timestamp: Date }>>([
    {
      id: '1',
      text: 'Hi! 👋 How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi')) {
      return 'Hello! Welcome to NutriLeaf! What would you like to know about moringa?';
    } else if (input.includes('product') || input.includes('buy')) {
      return 'You can browse our products in the Market section. We have moringa powder, capsules, tea, and more!';
    } else if (input.includes('health') || input.includes('benefit')) {
      return 'Moringa is packed with nutrients! It\'s high in protein, vitamins, and minerals. Check our guides for more info!';
    } else if (input.includes('scan') || input.includes('disease')) {
      return 'Use our AI-powered Scan feature to analyze plant health and detect diseases. It\'s in the main navigation!';
    } else if (input.includes('forum')) {
      return 'Join our community forum to discuss moringa growing tips and share experiences with other users!';
    } else {
      return 'That\'s a great question! You can also check our guides and resources for more detailed information.';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={styles.container}>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.floatingButton,
          background: isOpen ? '#1a5f3a' : '#2d7a50'
        }}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <MessageCircle size={24} color="white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.chatHeader}>
            <h3 style={styles.chatTitle}>NutriLeaf Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <X size={20} />
            </button>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map(message => (
              <div
                key={message.id}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    backgroundColor: message.sender === 'user' ? '#1a5f3a' : '#e8f4f0',
                    color: message.sender === 'user' ? 'white' : '#0f2419'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={styles.input}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              style={styles.sendButton}
              disabled={!inputValue.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 999,
    fontFamily: 'inherit'
  },
  floatingButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(15, 36, 25, 0.25)',
    transition: 'all 0.3s ease',
    hover: {
      transform: 'scale(1.1)'
    }
  },
  chatWindow: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    width: '360px',
    height: '500px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(15, 36, 25, 0.20)',
    border: '1px solid rgba(15, 36, 25, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease'
  },
  chatHeader: {
    backgroundColor: '#1a5f3a',
    color: 'white',
    padding: '16px',
    borderRadius: '16px 16px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f9fbfa'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '4px'
  },
  message: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordWrap: 'break-word'
  },
  inputContainer: {
    padding: '12px',
    borderTop: '1px solid rgba(15, 36, 25, 0.08)',
    display: 'flex',
    gap: '8px',
    backgroundColor: 'white',
    borderRadius: '0 0 16px 16px'
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid rgba(15, 36, 25, 0.12)',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    backgroundColor: '#f9fbfa'
  },
  sendButton: {
    padding: '8px 16px',
    backgroundColor: '#1a5f3a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};

export default FloatingChat;
