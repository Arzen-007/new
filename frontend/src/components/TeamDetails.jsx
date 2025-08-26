import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Target, 
  Clock, 
  Star,
  Award,
  TrendingUp,
  Calendar,
  Flag
} from 'lucide-react';
import '../App.css';

const TeamDetails = ({ user }) => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get team details
    const fetchTeamData = async () => {
      setLoading(true);
      // Simulated team data - in real app this would come from API
      const mockTeamData = {
        team_name: user.team_name,
        team_id: user.team_id || 1,
        total_points: 2850,
        rank: 1,
        challenges_solved: 24,
        last_solve: "2 hours ago",
        created_date: "2024-01-15",
        members: [
          {
            id: 1,
            username: user.username || "EcoHacker1",
            email: user.email,
            points: 1200,
            challenges_solved: 12,
            last_active: "1 hour ago",
            role: "Team Leader",
            country: "Pakistan",
            flag: "🇵🇰"
          },
          {
            id: 2,
            username: "GreenCoder",
            email: "green@example.com",
            points: 950,
            challenges_solved: 8,
            last_active: "3 hours ago",
            role: "Member",
            country: "India",
            flag: "🇮🇳"
          },
          {
            id: 3,
            username: "EcoNinja",
            email: "ninja@example.com",
            points: 700,
            challenges_solved: 4,
            last_active: "5 hours ago",
            role: "Member",
            country: "Bangladesh",
            flag: "🇧🇩"
          }
        ],
        recent_solves: [
          {
            challenge: "Solar Panel API Hack",
            solver: "EcoHacker1",
            points: 150,
            time: "2 hours ago",
            category: "Web"
          },
          {
            challenge: "Green Cipher Challenge",
            solver: "GreenCoder",
            points: 200,
            time: "4 hours ago",
            category: "Crypto"
          },
          {
            challenge: "Waste Management Binary",
            solver: "EcoNinja",
            points: 100,
            time: "6 hours ago",
            category: "Reverse"
          }
        ],
        category_stats: {
          "Web": { solved: 8, total: 15, points: 1200 },
          "Crypto": { solved: 6, total: 12, points: 900 },
          "Forensics": { solved: 4, total: 10, points: 600 },
          "Reverse": { solved: 3, total: 8, points: 450 },
          "Pwn": { solved: 3, total: 6, points: 300 }
        }
      };
      
      // Set data immediately without timeout
      setTeamData(mockTeamData);
      setLoading(false);
    };

    fetchTeamData();
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
            <div className="text-4xl mb-4">🌱</div>
            <div className="text-xl eco-text-glow">Loading Team Details...</div>
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

  const MemberCard = ({ member, isCurrentUser }) => (
    <motion.div 
      className={`p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm ${
        isCurrentUser ? 'ring-2 ring-green-500/50' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <div className="font-semibold eco-text-glow flex items-center space-x-2">
              <span>{member.username}</span>
              {isCurrentUser && <Star size={16} className="text-yellow-500" />}
              <span className="text-lg">{member.flag}</span>
            </div>
            <div className="text-sm text-muted-foreground">{member.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg eco-text-glow">{member.points}</div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Challenges Solved</div>
          <div className="font-semibold">{member.challenges_solved}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last Active</div>
          <div className="font-semibold">{member.last_active}</div>
        </div>
      </div>
    </motion.div>
  );

  const CategoryProgress = ({ category, stats }) => {
    const percentage = (stats.solved / stats.total) * 100;
    
    return (
      <div className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{category}</span>
          <span className="text-sm text-muted-foreground">
            {stats.solved}/{stats.total}
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
          <span>{percentage.toFixed(1)}% Complete</span>
          <span>{stats.points} pts</span>
        </div>
      </div>
    );
  };

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
          <h1 className="text-4xl font-bold eco-text-glow mb-2">
            🌱 {teamData.team_name}
          </h1>
          <p className="text-muted-foreground">
            Team Details & Member Statistics
          </p>
        </motion.div>

        {/* Team Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard
            icon={Trophy}
            label="Team Rank"
            value={`#${teamData.rank}`}
            subtitle="Global Ranking"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Points"
            value={teamData.total_points.toLocaleString()}
            subtitle="Team Score"
          />
          <StatCard
            icon={Target}
            label="Challenges Solved"
            value={teamData.challenges_solved}
            subtitle="Total Completed"
          />
          <StatCard
            icon={Clock}
            label="Last Solve"
            value={teamData.last_solve}
            subtitle="Recent Activity"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold eco-text-glow mb-6 flex items-center space-x-2">
              <Users size={24} />
              <span>Team Members ({teamData.members.length})</span>
            </h2>
            <div className="space-y-4">
              {teamData.members.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  isCurrentUser={member.email === user.email}
                />
              ))}
            </div>
          </motion.div>

          {/* Category Progress & Recent Solves */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Category Progress */}
            <h2 className="text-2xl font-bold eco-text-glow mb-6 flex items-center space-x-2">
              <Award size={24} />
              <span>Category Progress</span>
            </h2>
            <div className="space-y-4 mb-8">
              {Object.entries(teamData.category_stats).map(([category, stats]) => (
                <CategoryProgress key={category} category={category} stats={stats} />
              ))}
            </div>

            {/* Recent Solves */}
            <h2 className="text-2xl font-bold eco-text-glow mb-6 flex items-center space-x-2">
              <Flag size={24} />
              <span>Recent Solves</span>
            </h2>
            <div className="space-y-3">
              {teamData.recent_solves.map((solve, index) => (
                <motion.div 
                  key={index}
                  className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold eco-text-glow">{solve.challenge}</div>
                    <div className="text-sm bg-primary/20 px-2 py-1 rounded">
                      {solve.category}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Solved by {solve.solver}</span>
                    <span>{solve.points} pts • {solve.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team Info */}
        <motion.div 
          className="mt-8 p-6 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold eco-text-glow mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Team Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Team Created</div>
              <div className="font-semibold">{new Date(teamData.created_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Team ID</div>
              <div className="font-semibold">#{teamData.team_id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Members</div>
              <div className="font-semibold">{teamData.members.length} Active</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamDetails;

