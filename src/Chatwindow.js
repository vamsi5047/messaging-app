import React, { useState, useEffect } from 'react';
import './Chatwindow.css'; // Import CSS file for styling
import socketIOClient from 'socket.io-client'; // Import socket.io-client
import AWS from 'aws-sdk';

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [user1, setUser1] = useState(''); // Assuming you have user state variables
  const [user2, setUser2] = useState(''); // Assuming you have user state variables
  const [socket, setSocket] = useState(null); // Declare socket state
  const [messages, setMessages] = useState([]); // State to store messages
  const [attachment, setAttachment] = useState(null); // State to store attachment file

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleImageChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (user1 && user2 && message) {
      const messageData = { user1, user2, message };
      
      // If there's an attachment, upload it to S3
      if (attachment) {
        const attachmentUrl = await uploadAttachment(attachment);
        messageData.attachmentUrl = attachmentUrl;
      }

      // Emit sendMessage event to the server
      socket.emit('sendMessage', messageData);
      
      // Clear message input after sending
      setMessage('');
      setAttachment(null);
    }
  };

  const uploadAttachment = async (file) => {
    const s3 = new AWS.S3({
      accessKeyId: 'Yasmeen2866',
      secretAccessKey: 'Thisistheseason01',
    });

    const params = {
      Bucket: 'catmessaging',
      Key: file.name,
      Body: file,
      ACL: 'public-read',
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      return null;
    }
  };

  useEffect(() => {
    // Initialize socket connection
    const socket = socketIOClient('http://localhost:5021'); // Change the URL to your socket server URL
    setSocket(socket); // Set the socket state

    // Listen for incoming messages
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className={`chat-window ${isOpen ? 'open' : ''}`}>
      <div className="chat-toggle" onClick={toggleChat}>
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </div>
      <div className="chat-content">
        <div className="chat-container">
          <form onSubmit={handleSubmit} className="message-form">
            <input type="text" value={user1} placeholder="User 1" onChange={(event) => setUser1(event.target.value)} className="name-input" />
            <input type="text" value={user2} placeholder="User 2" onChange={(event) => setUser2(event.target.value)} className="name-input" />
            <input type="text" value={message} placeholder="Your message" onChange={(event) => setMessage(event.target.value)} className="message-input" />
            <input type="file" accept="image/" onChange={handleImageChange} className="file-input" />
            <button type="submit" className="send-button">Send</button>
          </form>
          <ul className="messages-list">
            {messages.map((message, index) => (
              <li key={index}>
                <span className="message-name">{message.user1}:</span> {message.message}
                {message.attachmentUrl && <img src={message.attachmentUrl} alt="Attachment" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
