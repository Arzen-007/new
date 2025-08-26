import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Users, Trophy, Target, Clock, Flag, TrendingUp, BarChart3 } from 'lucide-react';
import '../App.css';

const ComparisonMode = ({ onBack, selectedTeams = [] }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, flags, categories
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Initialize comparison data
    const initializeData = () => {
      const teamData = [
        { name: 'EcoNinjas', color: '#00ff88', points: 2850, solves: 15, categories: { web: 5, crypto: 4, pwn: 3, misc: 2, forensics: 1 } },
        { name: 'GreenHackers', color: '#ff6b6b', points: 2720, solves: 14, categories: { web: 4, crypto: 5, pwn: 2, misc: 2, forensics: 1 } },
        { name: 'CyberForest', color: '#4ecdc4', points: 2650, solves: 13, categories: { web: 3, crypto: 3, pwn: 4, misc: 2, forensics: 1 } },
        { name: 'EcoWarriors', color: '#45b7d1', points: 2580, solves: 12, categories: { web: 4, crypto: 2, pwn: 3, misc: 3, forensics: 0 } },
        { name: 'GreenBytes', color: '#96ceb4', points: 2510, solves: 12, categories: { web: 3, crypto: 3, pwn: 2, misc: 3, forensics: 1 } }
      ];

      // Filter teams based on selection
      const filteredTeams = selectedTeams.length > 0 
        ? teamData.filter(team => selectedTeams.includes(team.name))
        : teamData.slice(0, 3); // Default to top 3

      setTeams(filteredTeams);

      // Generate timeline data
      const timePoints = [];
      const now = new Date();
      for (let i = 360; i >= 0; i -= 30) { // Every 30 minutes for 6 hours
        const time = new Date(now.getTime() - i * 60000);
        timePoints.push(time);
      }

      const timelineData = timePoints.map((time, index) => {
        const dataPoint = {
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        };

        filteredTeams.forEach((team, teamIndex) => {
          const progress = index / timePoints.length;
          const basePoints = progress * team.points;
          const variation = Math.sin(progress * 10 + teamIndex) * 50;
          dataPoint[team.name] = Math.max(0, Math.floor(basePoints + variation));
        });

        return dataPoint;
      });

      setComparisonData(timelineData);
    };

    initializeData();
  }, [selectedTeams]);

  const getCategoryData = () => {
    const categories = ['web', 'crypto', 'pwn', 'misc', 'forensics'];
    return categories.map(category => {
      const dataPoint = { category: category.toUpperCase() };
      teams.forEach(team => {
        dataPoint[team.name] = team.categories[category] || 0;
      });
      return dataPoint;
    });
  };

  const getFlagData = () => {
    return teams.map(team => ({
      team: team.name,
      flags: team.solves,
      points: team.points,
      color: team.color
    }));
  };

  const renderTimelineView = () => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff88" opacity={0.2} />
          <XAxis 
            dataKey="time" 
            stroke="#00ff88" 
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#00ff88" 
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid #00ff88',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          
          {teams.map((team) => (
            <Line
              key={team.name}
              type="monotone"
              dataKey={team.name}
              stroke={team.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: team.color, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCategoryView = () => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={getCategoryData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff88" opacity={0.2} />
          <XAxis dataKey="category" stroke="#00ff88" fontSize={12} />
          <YAxis stroke="#00ff88" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid #00ff88',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          
          {teams.map((team, index) => (
            <Bar
              key={team.name}
              dataKey={team.name}
              fill={team.color}
              opacity={0.8}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderFlagView = () => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={getFlagData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff88" opacity={0.2} />
          <XAxis dataKey="team" stroke="#00ff88" fontSize={12} />
          <YAxis stroke="#00ff88" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid #00ff88',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          
          <Bar dataKey="flags" fill="#00ff88" opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white relative overflow-hidden">
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            onClick={onBack}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Live Graph</span>
          </motion.button>
          
          <h1 className="text-3xl font-bold eco-text-glow flex items-center space-x-3">
            <BarChart3 size={32} />
            <span>Team Comparison Analysis</span>
          </h1>
          
          <div className="text-sm text-muted-foreground">
            {teams.length} teams selected
          </div>
        </motion.div>

        {/* Selected Teams */}
        <motion.div 
          className="bg-card/30 backdrop-blur-sm rounded-lg p-4 eco-border-glow mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold eco-text-glow mb-3">Selected Teams</h3>
          <div className="flex flex-wrap gap-3">
            {teams.map((team) => (
              <div
                key={team.name}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card/40"
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-medium">{team.name}</span>
                <span className="text-sm text-muted-foreground">
                  {team.points.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* View Mode Selector */}
        <motion.div 
          className="flex space-x-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { id: 'timeline', label: 'Timeline Progress', icon: TrendingUp },
            { id: 'categories', label: 'Category Breakdown', icon: Target },
            { id: 'flags', label: 'Flag Comparison', icon: Flag }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/30 hover:bg-card/50'
              }`}
              onClick={() => setViewMode(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Comparison Chart */}
        <motion.div 
          className="bg-card/30 backdrop-blur-sm rounded-lg p-6 eco-border-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold eco-text-glow">
              {viewMode === 'timeline' && 'Score Timeline Comparison'}
              {viewMode === 'categories' && 'Category Performance Comparison'}
              {viewMode === 'flags' && 'Flag Submission Comparison'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {viewMode === 'timeline' && 'Last 6 hours progression'}
              {viewMode === 'categories' && 'Challenges solved by category'}
              {viewMode === 'flags' && 'Total flags captured'}
            </div>
          </div>
          
          {viewMode === 'timeline' && renderTimelineView()}
          {viewMode === 'categories' && renderCategoryView()}
          {viewMode === 'flags' && renderFlagView()}
        </motion.div>

        {/* Team Statistics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {teams.map((team) => (
            <div
              key={team.name}
              className="bg-card/30 backdrop-blur-sm rounded-lg p-4 eco-border-glow"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <h3 className="font-bold eco-text-glow">{team.name}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points:</span>
                  <span className="font-semibold eco-counter">{team.points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flags:</span>
                  <span className="font-semibold">{team.solves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg per Flag:</span>
                  <span className="font-semibold">{Math.round(team.points / team.solves)}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ComparisonMode;

