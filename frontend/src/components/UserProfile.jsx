import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  Clock, 
  Star,
  Award,
  TrendingUp,
  Calendar,
  Flag,
  Mail,
  MapPin,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import '../App.css';

const UserProfile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call to get user profile data
    const fetchProfileData = async () => {
      setLoading(true);
      // Simulated user profile data - in real app this would come from API
      const mockProfileData = {
        user_id: user.id || 1,
        username: user.username || "EcoHacker1",
        email: user.email,
        team_name: user.team_name,
        country: "Pakistan",
        flag: "🇵🇰",
        join_date: "2024-01-15",
        last_active: "1 hour ago",
        total_points: 1200,
        global_rank: 15,
        team_rank: 1,
        challenges_solved: 12,
        challenges_attempted: 18,
        success_rate: 66.7,
        longest_streak: 5,
        current_streak: 2,
        favorite_category: "Web",
        total_time_spent: "24h 30m",
        
        // Challenge statistics by category
        category_stats: {
          "Web": { 
            solved: 5, 
            attempted: 7, 
            points: 450, 
            success_rate: 71.4,
            avg_time: "45m",
            best_time: "12m"
          },
          "Crypto": { 
            solved: 3, 
            attempted: 4, 
            points: 300, 
            success_rate: 75.0,
            avg_time: "1h 20m",
            best_time: "35m"
          },
          "Forensics": { 
            solved: 2, 
            attempted: 3, 
            points: 250, 
            success_rate: 66.7,
            avg_time: "2h 15m",
            best_time: "1h 45m"
          },
          "Reverse": { 
            solved: 1, 
            attempted: 2, 
            points: 150, 
            success_rate: 50.0,
            avg_time: "3h 30m",
            best_time: "3h 30m"
          },
          "Pwn": { 
            solved: 1, 
            attempted: 2, 
            points: 50, 
            success_rate: 50.0,
            avg_time: "4h 15m",
            best_time: "4h 15m"
          }
        },

        // Recent activity
        recent_activity: [
          {
            type: "solve",
            challenge: "Solar Panel API Hack",
            category: "Web",
            points: 150,
            time: "2 hours ago",
            duration: "45 minutes"
          },
          {
            type: "attempt",
            challenge: "Green Cipher Advanced",
            category: "Crypto",
            points: 0,
            time: "5 hours ago",
            duration: "2 hours"
          },
          {
            type: "solve",
            challenge: "Eco Forensics Image",
            category: "Forensics",
            points: 100,
            time: "1 day ago",
            duration: "1h 30m"
          },
          {
            type: "solve",
            challenge: "Waste Binary Analysis",
            category: "Reverse",
            points: 150,
            time: "2 days ago",
            duration: "3h 30m"
          }
        ],

        // Achievements/Badges
        achievements: [
          {
            id: 1,
            name: "First Blood",
            description: "First to solve a challenge",
            icon: "🩸",
            earned_date: "2024-01-20",
            rarity: "rare"
          },
          {
            id: 2,
            name: "Web Master",
            description: "Solved 5 web challenges",
            icon: "🕸️",
            earned_date: "2024-01-25",
            rarity: "common"
          },
          {
            id: 3,
            name: "Eco Warrior",
            description: "Completed all environmental challenges",
            icon: "🌱",
            earned_date: "2024-01-28",
            rarity: "epic"
          },
          {
            id: 4,
            name: "Speed Demon",
            description: "Solved a challenge in under 15 minutes",
            icon: "⚡",
            earned_date: "2024-01-30",
            rarity: "rare"
          }
        ],

        // Skill progression
        skill_levels: {
          "Web Security": { level: 7, xp: 450, next_level_xp: 500 },
          "Cryptography": { level: 5, xp: 300, next_level_xp: 400 },
          "Digital Forensics": { level: 4, xp: 250, next_level_xp: 350 },
          "Reverse Engineering": { level: 2, xp: 150, next_level_xp: 250 },
          "Binary Exploitation": { level: 1, xp: 50, next_level_xp: 150 }
        }
      };
      
      // Set data immediately without timeout
      setProfileData(mockProfileData);
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center py-20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-4xl mb-4">👤</div>
            <div className="text-xl eco-text-glow">Loading Profile...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, subtitle, color = "eco" }) => (
    <motion.div 
      className={`p-6 rounded-lg ${color}-border-glow bg-card/50 backdrop-blur-sm`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`${color}-text-glow`} size={24} />
        <div className="text-lg font-semibold">{label}</div>
      </div>
      <div className={`text-3xl font-bold ${color}-text-glow mb-1`}>{value}</div>
      {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
    </motion.div>
  );

  const CategoryCard = ({ category, stats }) => {
    const percentage = stats.attempted > 0 ? (stats.solved / stats.attempted) * 100 : 0;
    
    return (
      <motion.div 
        className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold eco-text-glow">{category}</h3>
          <div className="text-sm bg-primary/20 px-2 py-1 rounded">
            {stats.points} pts
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <div className="text-muted-foreground">Solved</div>
            <div className="font-semibold">{stats.solved}/{stats.attempted}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Success Rate</div>
            <div className="font-semibold">{stats.success_rate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Time</div>
            <div className="font-semibold">{stats.avg_time}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Best Time</div>
            <div className="font-semibold">{stats.best_time}</div>
          </div>
        </div>

        <div className="leaf-progress">
          <motion.div 
            className="leaf-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-xs text-center mt-1 text-muted-foreground">
          {percentage.toFixed(1)}% Success Rate
        </div>
      </motion.div>
    );
  };

  const AchievementBadge = ({ achievement }) => {
    const rarityColors = {
      common: "border-gray-500 bg-gray-500/20",
      rare: "border-blue-500 bg-blue-500/20",
      epic: "border-purple-500 bg-purple-500/20",
      legendary: "border-yellow-500 bg-yellow-500/20"
    };

    return (
      <motion.div 
        className={`p-4 rounded-lg ${rarityColors[achievement.rarity]} border backdrop-blur-sm`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <div className="font-semibold eco-text-glow text-sm">{achievement.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{achievement.description}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {new Date(achievement.earned_date).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    );
  };

  const SkillBar = ({ skill, data }) => {
    const percentage = (data.xp / data.next_level_xp) * 100;
    
    return (
      <div className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{skill}</span>
          <span className="text-sm bg-primary/20 px-2 py-1 rounded">
            Level {data.level}
          </span>
        </div>
        <div className="leaf-progress mb-2">
          <motion.div 
            className="leaf-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{data.xp} XP</span>
          <span>{data.next_level_xp} XP to next level</span>
        </div>
      </div>
    );
  };

  const ActivityItem = ({ activity }) => (
    <motion.div 
      className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {activity.type === 'solve' ? (
            <CheckCircle className="text-green-500" size={20} />
          ) : (
            <XCircle className="text-red-500" size={20} />
          )}
          <div>
            <div className="font-semibold eco-text-glow">{activity.challenge}</div>
            <div className="text-sm text-muted-foreground">{activity.category}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${activity.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {activity.points > 0 ? `+${activity.points}` : '0'} pts
          </div>
          <div className="text-xs text-muted-foreground">{activity.duration}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{activity.time}</div>
    </motion.div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold eco-text-glow flex items-center space-x-2">
                <span>{profileData.username}</span>
                <span className="text-2xl">{profileData.flag}</span>
              </h1>
              <p className="text-muted-foreground">
                {profileData.team_name} • Rank #{profileData.global_rank}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard
            icon={TrendingUp}
            label="Total Points"
            value={profileData.total_points.toLocaleString()}
            subtitle={`Rank #${profileData.global_rank}`}
          />
          <StatCard
            icon={Target}
            label="Challenges Solved"
            value={profileData.challenges_solved}
            subtitle={`${profileData.success_rate}% success rate`}
          />
          <StatCard
            icon={Zap}
            label="Current Streak"
            value={profileData.current_streak}
            subtitle={`Best: ${profileData.longest_streak}`}
          />
          <StatCard
            icon={Clock}
            label="Time Spent"
            value={profileData.total_time_spent}
            subtitle="Total playtime"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex space-x-1 mb-8 bg-card/30 p-1 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary/20 eco-text-glow' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold eco-text-glow mb-6">User Information</h2>
                <div className="space-y-4">
                  <div className="p-6 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail size={20} />
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-semibold">{profileData.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin size={20} />
                        <div>
                          <div className="text-sm text-muted-foreground">Country</div>
                          <div className="font-semibold flex items-center space-x-2">
                            <span>{profileData.country}</span>
                            <span>{profileData.flag}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar size={20} />
                        <div>
                          <div className="text-sm text-muted-foreground">Joined</div>
                          <div className="font-semibold">
                            {new Date(profileData.join_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity size={20} />
                        <div>
                          <div className="text-sm text-muted-foreground">Last Active</div>
                          <div className="font-semibold">{profileData.last_active}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Levels */}
              <div>
                <h2 className="text-2xl font-bold eco-text-glow mb-6">Skill Progression</h2>
                <div className="space-y-4">
                  {Object.entries(profileData.skill_levels).map(([skill, data]) => (
                    <SkillBar key={skill} skill={skill} data={data} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Category Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(profileData.category_stats).map(([category, stats]) => (
                  <CategoryCard key={category} category={category} stats={stats} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">
                Achievements ({profileData.achievements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileData.achievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {profileData.recent_activity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;

