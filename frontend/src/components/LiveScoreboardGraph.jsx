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

const LiveScoreboardGraph = ({ onBack, onViewComparison }) => {
  const [graphData, setGraphData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Handle team selection for filtering
  const handleTeamClick = (teamName) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(teamName)) {
      newSelected.delete(teamName);
    } else {
      newSelected.add(teamName);
    }
    setSelectedTeams(newSelected);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedTeams(new Set());
  };

  // Select all teams
  const selectAllTeams = () => {
    setSelectedTeams(new Set(teams.map(team => team.name)));
  };

  // Get visible teams based on selection
  const getVisibleTeams = () => {
    if (selectedTeams.size === 0) {
      return teams; // Show all if none selected
    }
    return teams.filter(team => selectedTeams.has(team.name));
  };

  // Team colors for the graph
  const teamColors = [
    '#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
  ];

  useEffect(() => {
    // Initialize data with CTFd-style team names
    const initializeData = () => {
      const teamNames = [
        'Marie', 'Carl', 'Megan', 'Tiffany', 'David',
        'Diane', 'Ralph', 'Eugene', 'Stephen', 'Bobby'
      ];

      const teamColors = [
        '#8B4513', '#9932CC', '#9ACD32', '#556B2F', '#ADFF2F',
        '#FF1493', '#CD5C5C', '#FF69B4', '#808000', '#008B8B'
      ];

      const initialTeams = teamNames.map((name, index) => ({
        id: index + 1,
        name,
        color: teamColors[index],
        currentPoints: 3600 - (index * 200) + Math.random() * 100,
        rank: index + 1,
        lastSolve: `${Math.floor(Math.random() * 60)}m ago`,
        solves: 15 - index + Math.floor(Math.random() * 3)
      }));

      // Generate historical data for the CTFd-style timeline (01:00 to 07:00)
      const timePoints = [];
      const startTime = new Date('2017-12-26T01:00:00');
      
      for (let i = 0; i <= 360; i += 60) { // Every hour for 6 hours
        const time = new Date(startTime.getTime() + i * 60000);
        timePoints.push(time);
      }

      const historicalData = timePoints.map((time, timeIndex) => {
        const dataPoint = {
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          timestamp: time.getTime()
        };

        // Create realistic CTFd-style progression curves
        initialTeams.forEach((team, teamIndex) => {
          let points = 0;
          
          // Different progression patterns for each team
          switch (teamIndex) {
            case 0: // Marie - steady growth
              points = Math.min(3200, timeIndex * 400 + Math.random() * 100);
              break;
            case 1: // Carl - explosive growth later
              points = timeIndex < 3 ? timeIndex * 200 + Math.random() * 50 : 
                      600 + (timeIndex - 3) * 800 + Math.random() * 100;
              break;
            case 2: // Megan - early leader, then plateaus
              points = timeIndex < 4 ? timeIndex * 600 + Math.random() * 100 : 
                      2400 + (timeIndex - 4) * 200 + Math.random() * 50;
              break;
            case 3: // Tiffany - consistent growth
              points = timeIndex * 450 + Math.random() * 80;
              break;
            case 4: // David - fast start, slow middle, fast end
              if (timeIndex < 2) points = timeIndex * 800 + Math.random() * 100;
              else if (timeIndex < 4) points = 1600 + (timeIndex - 2) * 100 + Math.random() * 50;
              else points = 1800 + (timeIndex - 4) * 600 + Math.random() * 100;
              break;
            case 5: // Diane - late starter but strong finish
              points = timeIndex < 2 ? timeIndex * 100 + Math.random() * 50 : 
                      200 + (timeIndex - 2) * 600 + Math.random() * 100;
              break;
            case 6: // Ralph - steady but slower
              points = timeIndex * 350 + Math.random() * 70;
              break;
            case 7: // Eugene - spiky growth
              points = timeIndex * 300 + (timeIndex % 2 === 0 ? 200 : 0) + Math.random() * 80;
              break;
            case 8: // Stephen - slow and steady
              points = timeIndex * 380 + Math.random() * 60;
              break;
            case 9: // Bobby - early strong, then moderate
              points = timeIndex < 3 ? timeIndex * 500 + Math.random() * 100 : 
                      1500 + (timeIndex - 3) * 250 + Math.random() * 70;
              break;
            default:
              points = timeIndex * 300 + Math.random() * 100;
          }
          
          dataPoint[team.name] = Math.max(0, Math.floor(points));
        });

        return dataPoint;
      });

      setTeams(initialTeams);
      setGraphData(historicalData);
      setLoading(false);
    };

    initializeData();
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Randomly update team scores (simulate flag submissions)
      if (Math.random() < 0.3) { // 30% chance of update every 5 seconds
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        const pointsGained = 50 + Math.floor(Math.random() * 200);
        
        // Update team data
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === randomTeam.id 
              ? { 
                  ...team, 
                  currentPoints: team.currentPoints + pointsGained,
                  lastSolve: 'Just now',
                  solves: team.solves + 1
                }
              : team
          ).sort((a, b) => b.currentPoints - a.currentPoints)
           .map((team, index) => ({ ...team, rank: index + 1 }))
        );

        // Add to recent activity
        const newActivity = {
          id: Date.now(),
          team: randomTeam.name,
          points: pointsGained,
          time: new Date().toLocaleTimeString(),
          challenge: [
            'Solar Panel API Hack',
            'Green Cipher Challenge', 
            'Eco Forensics Image',
            'Smart Grid Analysis',
            'Carbon Credit Trading',
            'Waste Binary Analysis'
          ][Math.floor(Math.random() * 6)]
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);

        // Update graph data
        setGraphData(prevData => {
          const newDataPoint = {
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            timestamp: Date.now()
          };

          // Add current points for all teams
          teams.forEach(team => {
            newDataPoint[team.name] = team.id === randomTeam.id 
              ? team.currentPoints + pointsGained
              : team.currentPoints;
          });

          // Keep only last 25 data points (about 6 hours of 15-min intervals)
          const updatedData = [...prevData, newDataPoint].slice(-25);
          return updatedData;
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, teams]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-sm p-4 rounded-lg eco-border-glow">
          <p className="font-semibold eco-text-glow mb-2">{`Time: ${label}`}</p>
          {payload
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Show top 5 in tooltip
            .map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.dataKey}: ${entry.value.toLocaleString()} pts`}
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  const ActivityItem = ({ activity }) => (
    <motion.div 
      className="p-3 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Flag className="text-green-500" size={16} />
          <div>
            <div className="font-semibold eco-text-glow text-sm">{activity.challenge}</div>
            <div className="text-xs text-muted-foreground">by {activity.team}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-green-500 text-sm">+{activity.points}</div>
          <div className="text-xs text-muted-foreground">{activity.time}</div>
        </div>
      </div>
    </motion.div>
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
            <div className="text-4xl mb-4">📈</div>
            <div className="text-xl eco-text-glow">Loading Live Scoreboard...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white relative overflow-hidden">
      <MatrixRain />
      <div className="relative z-10 max-w-7xl mx-auto p-6">
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
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-500 border border-blue-500/50 hover:bg-blue-500/30 transition-colors"
              onClick={() => onViewComparison && onViewComparison(getVisibleTeams().map(t => t.name))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 size={16} />
              <span>Compare Teams</span>
            </motion.button>
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

        {/* Current Rankings */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Top 3 Teams */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold eco-text-glow mb-6 flex items-center space-x-2">
              <Trophy size={24} />
              <span>Current Top 10</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.slice(0, 10).map((team, index) => (
                <motion.div 
                  key={team.id}
                  className={`p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm ${
                    index < 3 ? `rank-${index + 1}` : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'badge-crown' : 
                        index === 1 ? 'badge-trophy' : 
                        index === 2 ? 'badge-medal' : 'bg-muted'
                      }`}>
                        {team.rank}
                      </div>
                      <div>
                        <div className="font-semibold eco-text-glow">{team.name}</div>
                        <div className="text-xs text-muted-foreground">{team.solves} solves</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold eco-counter">{team.currentPoints.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{team.lastSolve}</div>
                    </div>
                  </div>
                  <div 
                    className="w-full h-1 rounded-full"
                    style={{ backgroundColor: team.color, opacity: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold eco-text-glow mb-6 flex items-center space-x-2">
              <Activity size={24} />
              <span>Live Activity</span>
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Waiting for flag submissions...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Live Graph - CTFd Style */}
        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <TrendingUp size={24} className="text-gray-600" />
              <span>Top 10 Teams</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap size={16} />
              <span>Dec 26, 2017 - Live Updates</span>
            </div>
          </div>
          
          <div className="h-96 bg-gray-50 rounded border">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={graphData} 
                margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#666" 
                  fontSize={12}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: '#666' }}
                  tickLine={{ stroke: '#666' }}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={12}
                  tickFormatter={(value) => value.toLocaleString()}
                  axisLine={{ stroke: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  domain={[0, 4000]}
                  ticks={[0, 1000, 2000, 3000, 4000]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    color: '#333'
                  }}
                  labelStyle={{ color: '#333' }}
                />
                
                {/* Team Lines with CTFd-style colors */}
                <Line
                  type="monotone"
                  dataKey="Marie"
                  stroke="#8B4513"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#8B4513', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Carl"
                  stroke="#9932CC"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#9932CC', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Megan"
                  stroke="#9ACD32"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#9ACD32', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Tiffany"
                  stroke="#556B2F"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#556B2F', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="David"
                  stroke="#ADFF2F"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#ADFF2F', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Diane"
                  stroke="#FF1493"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#FF1493', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Ralph"
                  stroke="#CD5C5C"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#CD5C5C', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Eugene"
                  stroke="#FF69B4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#FF69B4', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Stephen"
                  stroke="#808000"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#808000', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Bobby"
                  stroke="#008B8B"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#008B8B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CTFd-style Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            {[
              { name: 'Marie', color: '#8B4513' },
              { name: 'Carl', color: '#9932CC' },
              { name: 'Megan', color: '#9ACD32' },
              { name: 'Tiffany', color: '#556B2F' },
              { name: 'David', color: '#ADFF2F' },
              { name: 'Diane', color: '#FF1493' },
              { name: 'Ralph', color: '#CD5C5C' },
              { name: 'Eugene', color: '#FF69B4' },
              { name: 'Stephen', color: '#808000' },
              { name: 'Bobby', color: '#008B8B' }
            ].map((team) => (
              <div key={team.name} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-0.5 rounded"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-gray-700">{team.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Update Indicator */}
        {isLive && (
          <motion.div 
            className="text-center mt-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live updates active - Flag submissions tracked in real-time</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveScoreboardGraph;

