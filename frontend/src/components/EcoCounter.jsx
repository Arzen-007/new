import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

const EcoCounter = () => {
  const [stats, setStats] = useState({
    treesPlanted: 204,
    co2Offset: 452.4,
    energySaved: 183.6,
    waterSaved: 1267.2
  });

  const [previousStats, setPreviousStats] = useState(stats);
  const [isVisible, setIsVisible] = useState(true); // New state for visibility

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prevStats => {
        const newStats = {
          treesPlanted: prevStats.treesPlanted + Math.floor(Math.random() * 3),
          co2Offset: prevStats.co2Offset + (Math.random() * 2),
          energySaved: prevStats.energySaved + (Math.random() * 1.5),
          waterSaved: prevStats.waterSaved + (Math.random() * 5)
        };
        
        setPreviousStats(prevStats);
        return newStats;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const StatItem = ({ icon, label, value, unit, previousValue }) => {
    const hasIncreased = value > previousValue;
    
    return (
      <motion.div 
        className="flex items-center space-x-3 p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">{label}</div>
          <motion.div 
            className={`text-xl font-bold eco-counter ${hasIncreased ? 'eco-counter-increment' : ''}`}
            animate={hasIncreased ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {typeof value === 'number' ? value.toFixed(1) : value} {unit}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const ProgressBar = ({ current, target, label }) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <div className="mt-6 p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">
            {current.toFixed(0)} / {target}
          </span>
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
          {percentage.toFixed(1)}% Complete
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="p-2 rounded-full bg-background/70 backdrop-blur-sm eco-border-glow text-2xl mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isVisible ? "Minimize Environmental Impact" : "Maximize Environmental Impact"}
      >
        🌍
      </motion.button>
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="w-80"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-background/90 backdrop-blur-md rounded-lg p-6 eco-border-glow">
              <motion.h3 
                className="text-lg font-bold mb-4 text-center eco-text-glow"
                animate={{ 
                  textShadow: [
                    '0 0 10px rgba(0, 255, 136, 0.5)',
                    '0 0 20px rgba(0, 255, 136, 0.8)',
                    '0 0 10px rgba(0, 255, 136, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌍 Environmental Impact
              </motion.h3>
              
              <div className="space-y-3">
                <StatItem
                  icon="🌱"
                  label="Trees Planted"
                  value={stats.treesPlanted}
                  unit=""
                  previousValue={previousStats.treesPlanted}
                />
                
                <StatItem
                  icon="🌍"
                  label="CO₂ Offset"
                  value={stats.co2Offset}
                  unit="kg"
                  previousValue={previousStats.co2Offset}
                />
                
                <StatItem
                  icon="⚡"
                  label="Energy Saved"
                  value={stats.energySaved}
                  unit="kWh"
                  previousValue={previousStats.energySaved}
                />
                
                <StatItem
                  icon="💧"
                  label="Water Saved"
                  value={stats.waterSaved}
                  unit="L"
                  previousValue={previousStats.waterSaved}
                />
              </div>

              <ProgressBar
                current={stats.treesPlanted}
                target={1000}
                label="🎯 Next Milestone: 1000 Trees"
              />

              <motion.div 
                className="mt-4 text-center text-xs text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Updated every challenge solved! 🚀
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcoCounter;


