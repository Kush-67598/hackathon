import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chatApi";

const WELCOME_MSG = {
  role: "bot",
  text: "Hi there! I'm Niramaya AI 🌸 I'm here to help you understand your screening results, answer general wellness questions, and provide supportive guidance. How can I help you today?",
};

const SAFETY_REMINDER = "Remember: I'm an AI companion, not a medical professional. Always consult your healthcare provider for medical advice.";

export function HealthChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(userText);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chatbot-container" style={{ fontFamily: "'Inter', sans-serif" }}>
      {isOpen && (
        <div className="chatbot-window" style={{ 
          borderRadius: '24px', 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 12px 48px rgba(42, 31, 78, 0.15)',
          overflow: 'hidden',
          background: '#FFFFFF'
        }}>
          {/* Header */}
          <div className="chatbot-header" style={{ 
            background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)', 
            padding: '16px 20px',
            border: 'none'
          }}>
            <div style={{ 
              fontSize: "20px", 
              background: 'rgba(255,255,255,0.2)', 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              display: 'grid', 
              placeItems: 'center' 
            }}>🌸</div>
            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: "14px", color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Niramaya AI
              </div>
              <div style={{ fontSize: "11px", color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                Health Companion
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: 'background 0.2s'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" ref={messagesEndRef} style={{ 
            padding: '20px', 
            background: '#F8FAFC', 
            gap: '12px',
            height: '380px' 
          }}>
            {messages.map((msg, idx) => {
              const isBot = msg.role === 'bot';
              return (
                <div key={idx} className={`chat-msg ${msg.role}`} style={{
                  padding: '12px 16px',
                  borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  maxWidth: '85%',
                  fontWeight: 500,
                  boxShadow: isBot ? '0 2px 4px rgba(0,0,0,0.02)' : '0 4px 12px rgba(124, 111, 205, 0.15)',
                  background: isBot ? '#FFFFFF' : '#7C6FCD',
                  color: isBot ? '#1E293B' : '#FFFFFF',
                  border: isBot ? '1px solid #E2E8F0' : 'none',
                  alignSelf: isBot ? 'flex-start' : 'flex-end'
                }}>
                  {msg.text}
                </div>
              );
            })}
            {loading && (
              <div className="chat-msg bot" style={{ 
                background: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '16px 16px 16px 4px', 
                padding: '12px 16px',
                width: 'fit-content'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Safety Footer */}
          <div
            style={{
              padding: "10px 16px",
              background: "#FFFBEB",
              fontSize: "10px",
              color: "#92400E",
              textAlign: "center",
              borderTop: "1px solid #FEF3C7",
              lineHeight: 1.4,
              fontWeight: 600
            }}
          >
            {SAFETY_REMINDER}
          </div>

          {/* Input Area */}
          <div className="chat-input-row" style={{ 
            padding: '16px', 
            background: '#FFFFFF', 
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            gap: '10px' 
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: input.trim() ? '#7C6FCD' : '#E2E8F0',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        className="chatbot-toggle" 
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)',
          boxShadow: '0 8px 24px rgba(124, 111, 205, 0.3)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'grid',
          placeItems: 'center',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
