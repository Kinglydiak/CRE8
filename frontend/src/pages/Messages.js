import React, { useState, useEffect, useContext } from 'react';
import { getAllConversations, getConversation, sendMessage, markAsRead } from '../services/messageService';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

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

    try {
      setSending(true);
      await sendMessage({
        receiverId: selectedUser._id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedUser._id);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (conversation) => {
    const otherUser = conversation.participants.find(p => p._id !== user._id);
    setSelectedUser(otherUser);
  };

  const getUnreadCount = (conversation) => {
    return conversation.messages?.filter(m => 
      m.receiver === user._id && !m.read
    ).length || 0;
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>💬 Messages</h1>
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
                  const otherUser = conversation.participants?.find(p => p._id !== user._id) || {};
                  const unreadCount = getUnreadCount(conversation);
                  
                  return (
                    <div
                      key={conversation._id || index}
                      className={`conversation-item ${selectedUser?._id === otherUser._id ? 'active' : ''}`}
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
                      {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                      )}
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
                        className={`message-bubble ${message.sender === user._id ? 'sent' : 'received'}`}
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
                <div className="empty-icon">💬</div>
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
