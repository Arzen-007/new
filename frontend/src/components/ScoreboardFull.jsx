import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Trophy, 
  Crown, 
  Medal, 
  Users, 
  Target, 
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import '../App.css';

const ScoreboardFull = ({ filter = 'all', onBack }) => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(50);
  const [loading, setLoading] = useState(true);

  // Generate mock data for 156 teams
  useEffect(() => {
    const generateMockTeams = () => {
      const teamNames = [
        'EcoNinjas', 'GreenHackers', 'CyberForest', 'EcoWarriors', 'GreenBytes',
        'NatureCoders', 'EcoSecure', 'GreenShield', 'CyberLeaf', 'EcoDefenders',
        'ForestGuards', 'GreenCyber', 'EcoElite', 'NatureHackers', 'GreenForce',
        'CyberTrees', 'EcoMasters', 'GreenStorm', 'NatureTech', 'EcoVanguard',
        'GreenPhoenix', 'CyberNature', 'EcoLegends', 'GreenTitans', 'NatureStrike',
        'EcoRangers', 'GreenShadow', 'CyberEco', 'NatureElite', 'GreenFury'
      ];
      
      const countries = [
        'US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'SE',
        'NL', 'IT', 'ES', 'KR', 'CN', 'RU', 'MX', 'AR', 'ZA', 'EG',
        'PK', 'BD', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG', 'NZ', 'FI'
      ];

      const mockTeams = [];
      
      for (let i = 1; i <= 156; i++) {
        const basePoints = Math.max(3000 - (i * 15) + Math.random() * 100, 50);
        const solved = Math.max(20 - Math.floor(i / 8) + Math.floor(Math.random() * 5), 0);
        const isActive = Math.random() > 0.43; // ~57% active teams (89 out of 156)
        
        mockTeams.push({
          id: i,
          name: i <= 30 ? teamNames[i - 1] : `${teamNames[Math.floor(Math.random() * teamNames.length)]}${i}`,
          points: Math.floor(basePoints),
          country: countries[Math.floor(Math.random() * countries.length)],
          solved: solved,
          rank: i,
          isActive: isActive,
          lastActive: isActive ? 
            `${Math.floor(Math.random() * 24)}h ago` : 
            `${Math.floor(Math.random() * 7) + 1}d ago`
        });
      }
      
      return mockTeams;
    };

    setLoading(true);
    setTimeout(() => {
      const mockTeams = generateMockTeams();
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter teams based on the filter prop and search term
  useEffect(() => {
    let filtered = teams;
    
    // Apply filter (all, active, etc.)
    if (filter === 'active') {
      filtered = filtered.filter(team => team.isActive);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTeams(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [teams, filter, searchTerm]);

  // Pagination logic
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

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
      'JP': '🇯🇵', 'AU': '🇦🇺', 'BR': '🇧🇷', 'IN': '🇮🇳', 'SE': '🇸🇪',
      'NL': '🇳🇱', 'IT': '🇮🇹', 'ES': '🇪🇸', 'KR': '🇰🇷', 'CN': '🇨🇳',
      'RU': '🇷🇺', 'MX': '🇲🇽', 'AR': '🇦🇷', 'ZA': '🇿🇦', 'EG': '🇪🇬',
      'PK': '🇵🇰', 'BD': '🇧🇩', 'ID': '🇮🇩', 'TH': '🇹🇭', 'VN': '🇻🇳',
      'PH': '🇵🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'NZ': '🇳🇿', 'FI': '🇫🇮'
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

  const PaginationButton = ({ page, isActive, onClick, disabled, children }) => (
    <motion.button
      className={`px-3 py-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-primary/20 eco-text-glow border border-primary/50' 
          : disabled
          ? 'bg-muted/20 text-muted-foreground cursor-not-allowed'
          : 'bg-card/50 hover:bg-primary/10 eco-border-glow'
      }`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center py-20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-4xl mb-4">🏆</div>
            <div className="text-xl eco-text-glow">Loading Teams...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              className="p-2 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm hover:bg-primary/10 transition-colors"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold eco-text-glow">
                🏆 {filter === 'active' ? 'Active Teams' : 'All Teams'}
              </h1>
              <p className="text-muted-foreground">
                Showing {filteredTeams.length} teams
                {filter === 'active' && ' (Active only)'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
            <div className="text-xs text-muted-foreground">
              {indexOfFirstTeam + 1}-{Math.min(indexOfLastTeam, filteredTeams.length)} of {filteredTeams.length}
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search teams or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg eco-input"
            />
          </div>
        </motion.div>

        {/* Teams Table */}
        <motion.div 
          className="bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden eco-border-glow mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {currentTeams.map((team, index) => {
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
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
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
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            team.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-sm ${
                            team.isActive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {team.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {team.lastActive}
                          </span>
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

        {/* Pagination */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstTeam + 1} to {Math.min(indexOfLastTeam, filteredTeams.length)} of {filteredTeams.length} teams
          </div>
          
          <div className="flex items-center space-x-2">
            <PaginationButton
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </PaginationButton>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationButton
                  key={pageNum}
                  isActive={currentPage === pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </PaginationButton>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-muted-foreground">...</span>
                <PaginationButton
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </PaginationButton>
              </>
            )}
            
            <PaginationButton
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </PaginationButton>
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
      </div>
    </motion.div>
  );
};

export default ScoreboardFull;

