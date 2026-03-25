import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllConversations, getConversation, sendMessage, markAsRead } from '../services/messageService';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  // Keep ref in sync so socket handler always sees current selectedUser
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time: listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      const currentSelected = selectedUserRef.current;
      const msgSenderId = msg.sender?._id?.toString() || msg.sender?.toString();
      const msgReceiverId = msg.receiver?._id?.toString() || msg.receiver?.toString();

      // If this message belongs to the open conversation, append it
      if (
        currentSelected &&
        (msgSenderId === currentSelected._id?.toString() ||
          msgReceiverId === currentSelected._id?.toString())
      ) {
        setMessages((prev) => {
          // Avoid duplicate (sender already sees it from optimistic update)
          if (prev.find((m) => m._id?.toString() === msg._id?.toString())) return prev;
          return [...prev, msg];
        });
      }

      // Refresh conversation list preview
      fetchConversations();
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket]);

  useEffect(() => {
    fetchConversations();
    if (location.state?.userId) {
      setSelectedUser({
        _id: location.state.userId,
        name: location.state.userName,
        profilePicture: location.state.userPicture,
        role: 'mentor'
      });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
    // eslint-disable-next-line
  }, [selectedUser?._id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
    // eslint-disable-next-line
  }, [selectedUser?._id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getAllConversations();
      setConversations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await getConversation(userId);
      setMessages(data.data || []);
      // Mark messages as read
      await markAsRead(userId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage;
    setNewMessage('');

    try {
      setSending(true);
      await sendMessage({
        receiverId: selectedUser._id,
        content
      });
      // Socket will deliver the echo back via new_message event
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(content); // restore on failure
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (conversation) => {
    if (conversation.otherUser) {
      setSelectedUser(conversation.otherUser);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Messages</h1>
            <p className="dashboard-subtitle">Chat with your mentees and stay connected</p>
          </div>
        </div>

        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-panel">
            <h3>Conversations</h3>
            {conversations.length > 0 ? (
              <div className="conversations-list">
                {conversations.map((conversation, index) => {
                  const otherUser = conversation.otherUser || {};
                  const otherUserId = conversation.otherUserId;

                  return (
                    <div
                      key={otherUserId || index}
                      className={`conversation-item ${selectedUser?._id?.toString() === otherUserId ? 'active' : ''}`}
                      onClick={() => handleUserSelect(conversation)}
                    >
                      <img
                        src={otherUser.profilePicture || '/default-avatar.png'}
                        alt={otherUser.name || 'User'}
                        className="conversation-avatar"
                      />
                      <div className="conversation-info">
                        <h4>{otherUser.name || 'Unknown User'}</h4>
                        <p className="last-message">
                          {conversation.lastMessage?.content?.substring(0, 40) || 'No messages yet'}
                          {conversation.lastMessage?.content?.length > 40 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-conversations">
                <p>No conversations yet</p>
              </div>
            )}
          </div>

          {/* Messages Panel */}
          <div className="messages-panel">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <img
                    src={selectedUser.profilePicture || '/default-avatar.png'}
                    alt={selectedUser.name}
                    className="chat-avatar"
                  />
                  <div>
                    <h3>{selectedUser.name}</h3>
                    <p className="user-role">{selectedUser.role}</p>
                  </div>
                </div>

                {/* Messages List */}
                <div className="messages-list">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`message-bubble ${message.sender?._id?.toString() === user._id?.toString() ? 'sent' : 'received'}`}
                      >
                        <p>{message.content}</p>
                        <span className="message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="message-input-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="empty-icon"></div>
                <h3>Select a conversation</h3>
                <p>Choose a mentee from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
