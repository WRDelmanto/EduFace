function MessageBubble({ text, sender = 'system', align = 'left', type = 'info' }) {
  return (
    <div className={`message-bubble ${sender} ${align} ${type}`}>
      <p>{text}</p>
    </div>
  );
}

export default MessageBubble;