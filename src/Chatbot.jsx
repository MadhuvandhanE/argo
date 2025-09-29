import React, { useEffect, useRef } from 'react';

function Chatbot({ messages, inputValue, onInputChange, onSendMessage, suggestions, onSuggestionClick }) {
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {suggestions && suggestions.length > 0 && (
            <div className="suggestion-buttons">
                {suggestions.map((s, i) => <button key={i} className="suggestion-btn" onClick={() => onSuggestionClick(s)}>{s}</button>)}
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

export default Chatbot;