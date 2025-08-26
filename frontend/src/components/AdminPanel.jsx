import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  Trash2, 
  Ban, 
  Volume2, 
  VolumeX,
  Eye,
  AlertTriangle,
  Clock,
  Activity,
  X,
  Search,
  Filter
} from 'lucide-react';

const AdminPanel = ({ isOpen, onToggle, socket, user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({ global: [], teams: {} });
  const [adminLogs, setAdminLogs] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!user.is_admin) return;
    
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/users', {
        headers: { 'X-Admin-Token': 'admin-secret-token' }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch all messages
      const messagesResponse = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/messages/all', {
        headers: { 'X-Admin-Token': 'admin-secret-token' }
      });
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setAllMessages(messagesData.messages);
      }

      // Fetch admin logs
      const logsResponse = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/logs', {
        headers: { 'X-Admin-Token': 'admin-secret-token' }
      });
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setAdminLogs(logsData.logs);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && user.is_admin) {
      fetchAdminData();
    }
  }, [isOpen, user.is_admin]);

  // Admin actions
  const deleteMessage = async (messageId, channelType, teamId = null) => {
    try {
      const response = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/message/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin-secret-token'
        },
        body: JSON.stringify({
          message_id: messageId,
          channel_type: channelType,
          team_id: teamId,
          admin_user: user.username
        })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const blockUser = async (userId, blockType = 'chat', reason = '') => {
    try {
      const response = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/user/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin-secret-token'
        },
        body: JSON.stringify({
          user_id: userId,
          block_type: blockType,
          reason: reason,
          admin_user: user.username
        })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const muteUser = async (userId, reason = '', duration = 'permanent') => {
    try {
      const response = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/user/mute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin-secret-token'
        },
        body: JSON.stringify({
          user_id: userId,
          reason: reason,
          duration: duration,
          admin_user: user.username
        })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to mute user:', error);
    }
  };

  const unblockUser = async (userId) => {
    try {
      const response = await fetch('https://5000-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer/api/admin/user/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin-secret-token'
        },
        body: JSON.stringify({
          user_id: userId,
          admin_user: user.username
        })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTeamMessages = (teamId) => {
    return allMessages.teams[teamId] || [];
  };

  const uniqueTeams = [...new Set(users.map(u => u.team_id).filter(Boolean))];

  if (!user.is_admin) {
    return null;
  }

  return (
    <>
      {/* Admin Panel Toggle Button */}
      <motion.button
        className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 hover:bg-yellow-500/30 transition-colors"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Shield size={24} className="text-yellow-500" />
      </motion.button>

      {/* Admin Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 top-0 h-full w-96 bg-card/95 backdrop-blur-md border-r border-yellow-500/20 shadow-2xl z-50"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-yellow-500" />
                <h3 className="font-bold text-lg text-yellow-500">Admin Panel</h3>
              </div>
              <button
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-yellow-500/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-yellow-500/20">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'messages', label: 'Messages', icon: MessageCircle },
                { id: 'logs', label: 'Logs', icon: Activity }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`flex-1 p-3 flex items-center justify-center space-x-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-yellow-500/20 text-yellow-500 border-b-2 border-yellow-500' 
                        : 'hover:bg-yellow-500/10'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                </div>
              ) : (
                <>
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/50 border border-yellow-500/20 focus:border-yellow-500 focus:outline-none text-sm"
                        />
                      </div>

                      {/* Users List */}
                      <div className="space-y-2">
                        {filteredUsers.map(user => (
                          <motion.div
                            key={user.session_id}
                            className="p-3 rounded-lg bg-card/30 border border-yellow-500/10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-sm">{user.username}</span>
                                {user.team_name && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    [{user.team_name}]
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                {user.is_blocked && (
                                  <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded">
                                    Blocked
                                  </span>
                                )}
                                {user.is_muted && (
                                  <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-500 rounded">
                                    Muted
                                  </span>
                                )}
                                {user.is_admin && (
                                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {!user.is_admin && (
                              <div className="flex space-x-2">
                                {user.is_blocked ? (
                                  <button
                                    onClick={() => unblockUser(user.user_id)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
                                  >
                                    <Volume2 size={12} />
                                    <span>Unblock</span>
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => muteUser(user.user_id, 'Admin action')}
                                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-orange-500/20 text-orange-500 rounded hover:bg-orange-500/30 transition-colors"
                                    >
                                      <VolumeX size={12} />
                                      <span>Mute</span>
                                    </button>
                                    <button
                                      onClick={() => blockUser(user.user_id, 'chat', 'Admin action')}
                                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                                    >
                                      <Ban size={12} />
                                      <span>Block</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages Tab */}
                  {activeTab === 'messages' && (
                    <div className="space-y-4">
                      {/* Team Selector */}
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full p-2 rounded-lg bg-card/50 border border-yellow-500/20 focus:border-yellow-500 focus:outline-none text-sm"
                      >
                        <option value="">Global Chat</option>
                        {uniqueTeams.map(teamId => {
                          const teamUser = users.find(u => u.team_id === teamId);
                          return (
                            <option key={teamId} value={teamId}>
                              {teamUser?.team_name || `Team ${teamId}`}
                            </option>
                          );
                        })}
                      </select>

                      {/* Messages */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(selectedTeam ? getTeamMessages(selectedTeam) : allMessages.global).map(message => (
                          <motion.div
                            key={message.id}
                            className="p-3 rounded-lg bg-card/30 border border-yellow-500/10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{message.username}</span>
                                {message.team_name && (
                                  <span className="text-xs text-muted-foreground">
                                    [{message.team_name}]
                                  </span>
                                )}
                                {message.is_admin && (
                                  <Shield size={12} className="text-yellow-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.timestamp)}
                                </span>
                                <button
                                  onClick={() => deleteMessage(message.id, message.channel_type, selectedTeam)}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm break-words">{message.message}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logs Tab */}
                  {activeTab === 'logs' && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {adminLogs.map(log => (
                        <motion.div
                          key={log.id}
                          className="p-3 rounded-lg bg-card/30 border border-yellow-500/10"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-yellow-500">{log.action}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Admin: </span>
                            <span>{log.admin_user}</span>
                          </div>
                          {log.target_user && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Target: </span>
                              <span>{log.target_user}</span>
                            </div>
                          )}
                          {log.details && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {log.details}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Refresh Button */}
            <div className="p-4 border-t border-yellow-500/20">
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="w-full p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Activity size={16} />
                <span>Refresh Data</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPanel;

