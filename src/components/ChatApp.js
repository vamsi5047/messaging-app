import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish a WebSocket connection when the component mounts
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Cleanup function to close the connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  // Function to send a message
  const sendMessage = () => {
    if (socket) {
      socket.emit('message', messageInput);
      setMessageInput('');
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatApp;
