import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Globe, 
  Shield,
  AlertTriangle,
  Clock,
  Hash
} from 'lucide-react';
import io from 'socket.io-client';

const ChatSystem = ({ user, isOpen, onToggle }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState('global');
  const [messages, setMessages] = useState({ global: [], team: [] });
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [blockedMessage, setBlockedMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io('https://y0h0i3cmp1ev.manus.space', {
        transports: ['polling'], // Start with polling only for better compatibility
        forceNew: true,
        timeout: 15000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      setSocket(newSocket);
      
      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setError('');
        
        // Join chat with user info
        newSocket.emit('join_chat', {
          user_id: user.id || 'user_1',
          username: user.username || 'EcoNinja',
          team_id: user.team_id || 'team_1',
          team_name: user.team_name || 'EcoNinjas',
          is_admin: user.is_admin || false
        });
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
        setError('Connection failed. Retrying...');
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      });
      
      newSocket.on('join_success', (data) => {
        console.log('Joined chat:', data.message);
      });
      
      newSocket.on('new_message', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.channel_type]: [...prev[message.channel_type], message]
        }));
      });
      
      newSocket.on('admin_broadcast', (message) => {
        setMessages(prev => ({
          ...prev,
          global: [...prev.global, message]
        }));
      });
      
      newSocket.on('user_typing', (data) => {
        if (data.is_typing) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.username !== data.username);
            return [...filtered, data];
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u.username !== data.username));
        }
      });
      
      newSocket.on('message_blocked', (data) => {
        setBlockedMessage(data.reason);
        setTimeout(() => setBlockedMessage(''), 5000);
      });
      
      newSocket.on('error', (data) => {
        setError(data.message);
        setTimeout(() => setError(''), 5000);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, socket, user]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', { channel_type: currentChannel, is_typing: true });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('typing', { channel_type: currentChannel, is_typing: false });
      }
    }, 1000);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (!socket || !connected) {
      setError('Not connected to chat server. Message not sent.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    socket.emit('send_message', {
      channel_type: currentChannel,
      message: newMessage.trim()
    });
    
    setNewMessage('');
    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing', { channel_type: currentChannel, is_typing: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentMessages = messages[currentChannel] || [];
  const currentTypingUsers = typingUsers.filter(u => 
    currentChannel === 'global' || u.team_name === user.team_name
  );

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 hover:bg-primary/30 transition-colors"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MessageCircle size={24} className="text-primary" />
        {!connected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {connected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-card/95 backdrop-blur-md border-l border-primary/20 shadow-2xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} className="text-primary" />
                <h3 className="font-bold text-lg eco-text-glow">Eco Chat</h3>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <button
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Channel Selector */}
            <div className="flex border-b border-primary/20">
              <button
                className={`flex-1 p-3 flex items-center justify-center space-x-2 transition-colors ${
                  currentChannel === 'global' 
                    ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => setCurrentChannel('global')}
              >
                <Globe size={16} />
                <span>Global</span>
              </button>
              <button
                className={`flex-1 p-3 flex items-center justify-center space-x-2 transition-colors ${
                  currentChannel === 'team' 
                    ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => setCurrentChannel('team')}
              >
                <Users size={16} />
                <span>Team</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-96">
              {currentMessages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.is_admin 
                      ? 'bg-yellow-500/20 border border-yellow-500/50' 
                      : message.user_id === user.id 
                        ? 'bg-primary/20 ml-8' 
                        : 'bg-card/50 mr-8'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {message.is_admin && <Shield size={14} className="text-yellow-500" />}
                      <span className={`font-medium text-sm ${
                        message.is_admin ? 'text-yellow-500' : 'text-primary'
                      }`}>
                        {message.username}
                      </span>
                      {message.team_name && currentChannel === 'global' && (
                        <span className="text-xs text-muted-foreground">
                          [{message.team_name}]
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{formatTime(message.timestamp)}</span>
                    </span>
                  </div>
                  <p className="text-sm break-words">{message.message}</p>
                  {message.is_broadcast && (
                    <div className="mt-2 text-xs text-yellow-500 flex items-center space-x-1">
                      <Hash size={10} />
                      <span>Admin Broadcast</span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {currentTypingUsers.length > 0 && (
                <motion.div
                  className="text-xs text-muted-foreground italic flex items-center space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>
                    {currentTypingUsers.map(u => u.username).join(', ')} 
                    {currentTypingUsers.length === 1 ? ' is' : ' are'} typing...
                  </span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Error/Blocked Message */}
            <AnimatePresence>
              {(error || blockedMessage) && (
                <motion.div
                  className="mx-4 p-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-red-500">{error || blockedMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-primary/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${currentChannel === 'global' ? 'all teams' : 'your team'}...`}
                  className="flex-1 p-2 rounded-lg bg-card/50 border border-primary/20 focus:border-primary focus:outline-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {/* Channel Info */}
              <div className="mt-2 text-xs text-muted-foreground flex items-center space-x-2">
                {currentChannel === 'global' ? (
                  <>
                    <Globe size={12} />
                    <span>Global chat - Flag sharing blocked</span>
                  </>
                ) : (
                  <>
                    <Users size={12} />
                    <span>Team chat - Private to {user.team_name}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSystem;

