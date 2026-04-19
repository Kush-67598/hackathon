import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chatApi";

const WELCOME_MSG = {
  role: "bot",
  text: "Hi there! I'm Synthera AI 🌸 I'm here to help you understand your screening results, answer general wellness questions, and provide supportive guidance. How can I help you today?",
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
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ fontSize: "20px" }}>🌸</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)" }}>
                Synthera AI
              </div>
              <div style={{ fontSize: "var(--text-xs)", opacity: 0.85 }}>
                Health companion
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" ref={messagesEndRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <span style={{ animation: "pulse 1s infinite" }}>Typing...</span>
              </div>
            )}
          </div>

          {/* Safety Footer */}
          <div
            style={{
              padding: "6px 12px",
              background: "var(--color-accent-light)",
              fontSize: "10px",
              color: "#92400e",
              textAlign: "center",
              borderTop: "1px solid var(--color-border-subtle)",
              lineHeight: 1.3,
            }}
          >
            {SAFETY_REMINDER}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your results, symptoms..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} aria-label="Send">
              ➤
            </button>
          </div>
        </div>
      )}

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle chatbot">
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}
