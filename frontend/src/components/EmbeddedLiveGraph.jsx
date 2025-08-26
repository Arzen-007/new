import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const EmbeddedLiveGraph = ({ onViewFullGraph }) => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    // Generate realistic data for the embedded graph
    const generateData = () => {
      const teams = [
        { name: 'EcoNinjas', color: '#00ff88' },
        { name: 'GreenHackers', color: '#ff6b6b' },
        { name: 'CyberForest', color: '#4ecdc4' },
        { name: 'EcoWarriors', color: '#45b7d1' },
        { name: 'GreenBytes', color: '#96ceb4' },
        { name: 'NatureCoders', color: '#feca57' },
        { name: 'EcoSecure', color: '#ff9ff3' },
        { name: 'GreenShield', color: '#54a0ff' },
        { name: 'CyberLeaf', color: '#5f27cd' },
        { name: 'EcoDefenders', color: '#00d2d3' }
      ];

      const timePoints = [];
      const now = new Date();
      
      // Generate time points for the last 6 hours (every 15 minutes)
      for (let i = 360; i >= 0; i -= 15) {
        const time = new Date(now.getTime() - i * 60000);
        timePoints.push(time);
      }

      const data = timePoints.map((time, index) => {
        const dataPoint = {
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        };

        teams.forEach((team, teamIndex) => {
          // Create realistic progression curves
          let basePoints = 0;
          const timeProgress = index / timePoints.length;
          
          switch (teamIndex) {
            case 0: // EcoNinjas - leading team
              basePoints = timeProgress * 2800 + Math.sin(timeProgress * 8) * 100;
              break;
            case 1: // GreenHackers - close second
              basePoints = timeProgress * 2720 + Math.cos(timeProgress * 6) * 80;
              break;
            case 2: // CyberForest - steady third
              basePoints = timeProgress * 2650 + Math.sin(timeProgress * 4) * 60;
              break;
            case 3: // EcoWarriors - fourth
              basePoints = timeProgress * 2580 + Math.cos(timeProgress * 5) * 70;
              break;
            case 4: // GreenBytes - fifth
              basePoints = timeProgress * 2500 + Math.sin(timeProgress * 3) * 50;
              break;
            default:
              basePoints = timeProgress * (2400 - teamIndex * 50) + Math.random() * 40;
          }
          
          dataPoint[team.name] = Math.max(0, Math.floor(basePoints));
        });

        return dataPoint;
      });

      setGraphData(data);
    };

    generateData();

    // Update data every 5 seconds to simulate live updates
    const interval = setInterval(generateData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="bg-card/30 backdrop-blur-sm rounded-lg p-4 eco-border-glow transition-all duration-300"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold eco-text-glow flex items-center space-x-2">
          <span>📈 Score Progression (Last 6 Hours)</span>
        </h3>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Zap size={14} />
          <span>Updates every 5 seconds</span>
        </div>
      </div>
      
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff88" opacity={0.1} />
            <XAxis 
              dataKey="time" 
              stroke="#00ff88" 
              fontSize={10}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              stroke="#00ff88" 
              fontSize={10}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              tick={{ fontSize: 10 }}
            />
            
            {/* Top 10 team lines */}
            <Line
              type="monotone"
              dataKey="EcoNinjas"
              stroke="#00ff88"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="GreenHackers"
              stroke="#ff6b6b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="CyberForest"
              stroke="#4ecdc4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="EcoWarriors"
              stroke="#45b7d1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="GreenBytes"
              stroke="#96ceb4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="NatureCoders"
              stroke="#feca57"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="EcoSecure"
              stroke="#ff9ff3"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="GreenShield"
              stroke="#54a0ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="CyberLeaf"
              stroke="#5f27cd"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="EcoDefenders"
              stroke="#00d2d3"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Team Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {[
          { name: 'EcoNinjas', color: '#00ff88' },
          { name: 'GreenHackers', color: '#ff6b6b' },
          { name: 'CyberForest', color: '#4ecdc4' },
          { name: 'EcoWarriors', color: '#45b7d1' },
          { name: 'GreenBytes', color: '#96ceb4' },
          { name: 'NatureCoders', color: '#feca57' },
          { name: 'EcoSecure', color: '#ff9ff3' },
          { name: 'GreenShield', color: '#54a0ff' },
          { name: 'CyberLeaf', color: '#5f27cd' },
          { name: 'EcoDefenders', color: '#00d2d3' }
        ].map((team) => (
          <div key={team.name} className="flex items-center space-x-1">
            <div 
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-muted-foreground">{team.name}</span>
          </div>
        ))}
      </div>

      {/* Click hint */}
      <div className="text-center mt-4">
        <motion.button
          className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors text-sm"
          onClick={() => onViewFullGraph && onViewFullGraph()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Click to view detailed live scoreboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmbeddedLiveGraph;

