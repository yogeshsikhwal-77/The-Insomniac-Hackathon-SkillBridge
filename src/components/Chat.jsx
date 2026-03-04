import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// 1. Define base URL for both REST and WebSockets
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Connect to WebSocket server using the dynamic URL
const socket = io.connect(API_BASE_URL);

const Chat = () => {
  const { targetUserId } = useParams(); // Must match the route in App.jsx
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Safety check: If IDs are missing, don't crash
    if (!userId || !targetUserId) return;

    // 2. Safely create room ID by ensuring both are strings before sorting
    const room = [String(userId), String(targetUserId)].sort().join('_');
    
    // Join the WebSocket room
    socket.emit("join_room", room);

    // 3. Fetch History safely using dynamic URL
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${userId}/${targetUserId}`);
        const data = await res.json();
        
        // Prevent crash: Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setMessages([]);
      }
    };
    
    fetchHistory();

    // 4. Listen for new incoming messages
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup listener on unmount
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [userId, targetUserId]);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "" && userId && targetUserId) {
      const room = [String(userId), String(targetUserId)].sort().join('_');
      const messageData = {
        room: room,
        senderId: userId,
        receiverId: targetUserId,
        content: currentMessage,
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  // If IDs are missing, show an error instead of a blank page
  if (!userId || !targetUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="p-10 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-100">
           Error: Missing User Data. Please log in again.
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      
      <div className="w-full max-w-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[85vh]">
  
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-md border-b border-white/30 p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            💬 Chat Room
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white text-sm font-semibold transition"
          >
            ← Back
          </button>
        </div>
  
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <div className="text-5xl mb-3">👋</div>
              <p className="italic text-lg">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = String(msg.sender_id) === String(userId);
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl max-w-[70%] text-sm shadow-lg transition hover:scale-[1.02] ${
                      isMe
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                        : "bg-white/80 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
  
        {/* Input Area */}
        <div className="p-5 bg-white/20 backdrop-blur-md border-t border-white/30 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3 bg-white/80 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md transition"
            placeholder="Type a message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
  
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition active:scale-95"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;