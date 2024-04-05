import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Chatwindow from './Chatwindow';
const socket = io('http://localhost:5021');

function App() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('message');
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (user1 && user2 && message) {
      socket.emit('sendMessage', { user1, user2, message });
      setUser1('');
      setUser2('');
      setMessage('');
    }
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <div className="App">
      <header>
        <img src="https://s7d2.scene7.com/is/image/Caterpillar/CM20220222-5c3c2-280a8?fmt=png-alpha" alt="Logo" className="logo" />
        <h1>Welcome to CAT 3D Marketplace</h1>
      </header>
      <Chatwindow />
    </div>
    


  );
}

export default App;
