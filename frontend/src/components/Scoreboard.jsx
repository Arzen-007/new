import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trophy, Crown, Medal, Users, Target, Award } from 'lucide-react';
import EmbeddedLiveGraph from './EmbeddedLiveGraph';
import '../App.css';

const Scoreboard = ({ onViewAllTeams, onViewChallengeStats, onViewLiveGraph }) => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState({
    totalTeams: 156,
    activeTeams: 89,
    challengesSolved: 24
  });

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTeams = [
      { id: 1, name: 'EcoNinjas', points: 2850, country: 'US', solved: 15, rank: 1 },
      { id: 2, name: 'GreenHackers', points: 2720, country: 'CA', solved: 14, rank: 2 },
      { id: 3, name: 'CyberForest', points: 2650, country: 'UK', solved: 13, rank: 3 },
      { id: 4, name: 'EcoWarriors', points: 2580, country: 'DE', solved: 12, rank: 4 },
      { id: 5, name: 'GreenBytes', points: 2510, country: 'FR', solved: 12, rank: 5 },
      { id: 6, name: 'NatureCoders', points: 2440, country: 'JP', solved: 11, rank: 6 },
      { id: 7, name: 'EcoSecure', points: 2370, country: 'AU', solved: 11, rank: 7 },
      { id: 8, name: 'GreenShield', points: 2300, country: 'BR', solved: 10, rank: 8 },
      { id: 9, name: 'CyberLeaf', points: 2230, country: 'IN', solved: 10, rank: 9 },
      { id: 10, name: 'EcoDefenders', points: 2160, country: 'SE', solved: 9, rank: 10 }
    ];
    
    setTeams(mockTeams);
    setFilteredTeams(mockTeams);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = teams;
    
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      // Add category filtering logic here if needed
    }
    
    setFilteredTeams(filtered);
  }, [teams, searchTerm, filterCategory]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return { icon: Crown, class: 'badge-crown', label: '1st Place' };
      case 2:
        return { icon: Trophy, class: 'badge-trophy', label: '2nd Place' };
      case 3:
        return { icon: Medal, class: 'badge-medal', label: '3rd Place' };
      default:
        return { icon: Award, class: 'bg-muted', label: `${rank}th Place` };
    }
  };

  const getCountryFlag = (countryCode) => {
    const flags = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'UK': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'JP': '🇯🇵', 'AU': '🇦🇺', 'BR': '🇧🇷', 'IN': '🇮🇳', 'SE': '🇸🇪'
    };
    return flags[countryCode] || '🌍';
  };

  const LeafProgressBar = ({ percentage }) => (
    <div className="leaf-progress">
      <motion.div 
        className="leaf-progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );

  return (
    <motion.div 
      className="min-h-screen p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-2 eco-text-glow">🏆 Eco Scoreboard</h1>
        <p className="text-muted-foreground">Hack for a Greener Tomorrow</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.button
          className="bg-card/50 backdrop-blur-sm rounded-lg p-6 eco-border-glow text-center hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => onViewAllTeams && onViewAllTeams('all')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users className="mx-auto mb-2 text-primary" size={32} />
          <div className="text-2xl font-bold eco-counter">{stats.totalTeams}</div>
          <div className="text-sm text-muted-foreground">Total Teams</div>
          <div className="text-xs text-primary mt-1">Click to view all</div>
        </motion.button>
        
        <motion.button
          className="bg-card/50 backdrop-blur-sm rounded-lg p-6 eco-border-glow text-center hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => onViewAllTeams && onViewAllTeams('active')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Target className="mx-auto mb-2 text-primary" size={32} />
          <div className="text-2xl font-bold eco-counter">{stats.activeTeams}</div>
          <div className="text-sm text-muted-foreground">Active Teams</div>
          <div className="text-xs text-primary mt-1">Click to view active</div>
        </motion.button>
        
        <motion.button
          className="bg-card/50 backdrop-blur-sm rounded-lg p-6 eco-border-glow text-center hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => onViewChallengeStats && onViewChallengeStats()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Award className="mx-auto mb-2 text-primary" size={32} />
          <div className="text-2xl font-bold eco-counter">{stats.challengesSolved}</div>
          <div className="text-sm text-muted-foreground">Challenges Solved</div>
          <div className="text-xs text-primary mt-1">Click for details</div>
        </motion.button>
      </motion.div>

      {/* Embedded Live Graph */}
      <EmbeddedLiveGraph onViewFullGraph={onViewLiveGraph} />

      {/* Search and Filter */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search teams or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg eco-input"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg eco-input appearance-none"
          >
            <option value="all">All Categories</option>
            <option value="web">Web Security</option>
            <option value="crypto">Cryptography</option>
            <option value="forensics">Forensics</option>
            <option value="reverse">Reverse Engineering</option>
          </select>
        </div>
      </motion.div>

      {/* Scoreboard Table */}
      <motion.div 
        className="bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden eco-border-glow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Team</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Country</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Points</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Solved</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, index) => {
                const badge = getRankBadge(team.rank);
                const BadgeIcon = badge.icon;
                const maxPoints = Math.max(...teams.map(t => t.points));
                const progressPercentage = (team.points / maxPoints) * 100;
                
                return (
                  <motion.tr
                    key={team.id}
                    className={`scoreboard-row ${
                      team.rank <= 3 ? `rank-${team.rank}` : ''
                    }`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${badge.class} flex items-center justify-center`}>
                          <BadgeIcon size={16} />
                        </div>
                        <span className="font-bold">{team.rank}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium eco-text-glow">{team.name}</div>
                    </td>
                    
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getCountryFlag(team.country)}</span>
                          <span>{team.country}</span>
                        </div>
                      </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-bold eco-counter text-lg">{team.points.toLocaleString()}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{team.solved}</span>
                        <span className="text-sm text-muted-foreground">challenges</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <LeafProgressBar percentage={progressPercentage} />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Live Update Indicator */}
      <motion.div 
        className="text-center mt-6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-sm text-muted-foreground">
          🔄 Live updates every 30 seconds
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Scoreboard;

