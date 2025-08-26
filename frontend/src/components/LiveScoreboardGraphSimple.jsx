import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Trophy,
  TrendingUp,
  Clock,
  Flag,
  Users,
  Zap,
  Activity,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MatrixRain from './MatrixRain';
import '../App.css';

const LiveScoreboardGraphSimple = ({ onBack, onViewComparison }) => {
  const [graphData, setGraphData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate mock data
  useEffect(() => {
    const generateMockData = () => {
      const teamNames = ['EcoNinjas', 'GreenHackers', 'CyberForest', 'EcoWarriors', 'GreenBytes', 'NatureCoders', 'EcoSecure', 'GreenShield', 'CyberLeaf', 'EcoDefenders'];
      const colors = ['#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'];
      
      const mockTeams = teamNames.map((name, index) => ({
        name,
        color: colors[index],
        points: 2850 - (index * 130),
        rank: index + 1
      }));

      const timePoints = [];
      const now = new Date();
      for (let i = 0; i < 25; i++) {
        const time = new Date(now.getTime() - (24 - i) * 15 * 60 * 1000);
        const timeStr = time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        const dataPoint = { time: timeStr };
        mockTeams.forEach(team => {
          const baseScore = team.points;
          const progress = (i / 24) * 0.8 + Math.random() * 0.2;
          dataPoint[team.name] = Math.floor(baseScore * progress);
        });
        timePoints.push(dataPoint);
      }

      setGraphData(timePoints);
      setTeams(mockTeams);
    };

    generateMockData();
  }, []);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10 p-6">
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
              <h1 className="text-4xl font-bold eco-text-glow">📈 Live Scoreboard</h1>
              <p className="text-muted-foreground">Real-time top 10 teams progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {onViewComparison && (
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-500 border border-blue-500/50 hover:bg-blue-500/30 transition-colors"
                onClick={() => onViewComparison(teams.slice(0, 5).map(t => t.name))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 size={16} />
                <span>Compare Teams</span>
              </motion.button>
            )}
            <motion.button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLive 
                  ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
                  : 'bg-red-500/20 text-red-500 border border-red-500/50'
              }`}
              onClick={() => setIsLive(!isLive)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLive ? <Pause size={16} /> : <Play size={16} />}
              <span>{isLive ? 'Live' : 'Paused'}</span>
            </motion.button>
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* Live Graph */}
        <motion.div 
          className="bg-card/30 backdrop-blur-sm rounded-lg p-6 eco-border-glow mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold eco-text-glow">Score Progression (Last 6 Hours)</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap size={16} />
              <span>Updates every 5 seconds</span>
            </div>
          </div>
          
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00ff88" opacity={0.1} />
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
                    color: '#00ff88'
                  }}
                  formatter={(value, name) => [`${value.toLocaleString()} pts`, name]}
                />
                <Legend />
                {teams.map((team) => (
                  <Line
                    key={team.name}
                    type="monotone"
                    dataKey={team.name}
                    stroke={team.color}
                    strokeWidth={2}
                    dot={{ fill: team.color, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: team.color, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {teams.map((team, index) => (
              <motion.div
                key={team.name}
                className="flex items-center space-x-2 p-2 rounded-lg bg-card/20 hover:bg-card/40 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm font-medium">{team.name}</span>
                <span className="text-xs text-muted-foreground">#{team.rank}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-card/30 backdrop-blur-sm rounded-lg p-6 eco-border-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold eco-text-glow mb-4 flex items-center space-x-2">
            <Activity size={20} />
            <span>Recent Activity</span>
          </h3>
          
          <div className="space-y-3">
            {[
              { team: 'EcoNinjas', action: 'solved', challenge: 'Web Security Challenge #5', points: 250, time: '2 minutes ago' },
              { team: 'GreenHackers', action: 'solved', challenge: 'Crypto Challenge #3', points: 200, time: '5 minutes ago' },
              { team: 'CyberForest', action: 'solved', challenge: 'Forensics Challenge #2', points: 150, time: '8 minutes ago' },
              { team: 'EcoWarriors', action: 'solved', challenge: 'Reverse Engineering #1', points: 300, time: '12 minutes ago' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-card/20 hover:bg-card/40 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <Flag size={16} className="text-green-500" />
                  <div>
                    <span className="font-medium eco-text-glow">{activity.team}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="font-medium">{activity.challenge}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-500">+{activity.points} pts</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveScoreboardGraphSimple;

