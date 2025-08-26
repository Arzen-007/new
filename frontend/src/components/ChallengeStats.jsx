import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Trophy,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Flag,
  Eye,
  Calendar
} from 'lucide-react';
import '../App.css';

const ChallengeStats = ({ onBack }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call to get challenge statistics
    const fetchChallengeData = async () => {
      setLoading(true);
      
      // Mock challenge data
      const mockData = {
        totalChallenges: 45,
        solvedChallenges: 24,
        unsolvedChallenges: 21,
        totalSolves: 892,
        averageSolveTime: "2h 15m",
        
        // Challenge categories with solve rates
        categories: {
          "Web Security": {
            total: 12,
            solved: 8,
            unsolved: 4,
            totalSolves: 245,
            avgSolveTime: "1h 30m",
            difficulty: "Medium",
            icon: "🕸️"
          },
          "Cryptography": {
            total: 10,
            solved: 6,
            unsolved: 4,
            totalSolves: 178,
            avgSolveTime: "2h 45m",
            difficulty: "Hard",
            icon: "🔐"
          },
          "Forensics": {
            total: 8,
            solved: 4,
            unsolved: 4,
            totalSolves: 156,
            avgSolveTime: "3h 20m",
            difficulty: "Hard",
            icon: "🔍"
          },
          "Reverse Engineering": {
            total: 8,
            solved: 3,
            unsolved: 5,
            totalSolves: 89,
            avgSolveTime: "4h 15m",
            difficulty: "Expert",
            icon: "⚙️"
          },
          "Binary Exploitation": {
            total: 7,
            solved: 3,
            unsolved: 4,
            totalSolves: 67,
            avgSolveTime: "5h 30m",
            difficulty: "Expert",
            icon: "💥"
          }
        },

        // Most solved challenges
        mostSolved: [
          {
            name: "Solar Panel API Hack",
            category: "Web Security",
            solves: 89,
            points: 150,
            difficulty: "Easy",
            firstBlood: "EcoNinjas",
            firstBloodTime: "12m 34s"
          },
          {
            name: "Green Energy Dashboard",
            category: "Web Security", 
            solves: 76,
            points: 200,
            difficulty: "Medium",
            firstBlood: "GreenHackers",
            firstBloodTime: "28m 15s"
          },
          {
            name: "Eco Cipher Basic",
            category: "Cryptography",
            solves: 68,
            points: 100,
            difficulty: "Easy",
            firstBlood: "CyberForest",
            firstBloodTime: "45m 22s"
          },
          {
            name: "Carbon Credit Trading",
            category: "Web Security",
            solves: 54,
            points: 250,
            difficulty: "Medium",
            firstBlood: "EcoWarriors",
            firstBloodTime: "1h 15m"
          },
          {
            name: "Smart Grid Analysis",
            category: "Forensics",
            solves: 43,
            points: 300,
            difficulty: "Hard",
            firstBlood: "GreenBytes",
            firstBloodTime: "2h 45m"
          }
        ],

        // Least solved challenges (hardest)
        leastSolved: [
          {
            name: "Advanced EV Firmware",
            category: "Reverse Engineering",
            solves: 3,
            points: 500,
            difficulty: "Expert",
            firstBlood: "EcoNinjas",
            firstBloodTime: "6h 45m"
          },
          {
            name: "SCADA Hydroelectric Exploit",
            category: "Binary Exploitation",
            solves: 5,
            points: 450,
            difficulty: "Expert",
            firstBlood: "CyberForest",
            firstBloodTime: "8h 20m"
          },
          {
            name: "Quantum Green Cryptography",
            category: "Cryptography",
            solves: 7,
            points: 400,
            difficulty: "Expert",
            firstBlood: "GreenHackers",
            firstBloodTime: "5h 30m"
          },
          {
            name: "Deep Forest Steganography",
            category: "Forensics",
            solves: 9,
            points: 350,
            difficulty: "Hard",
            firstBlood: "EcoWarriors",
            firstBloodTime: "4h 15m"
          },
          {
            name: "IoT Smart Thermostat RCE",
            category: "Binary Exploitation",
            solves: 12,
            points: 350,
            difficulty: "Hard",
            firstBlood: "GreenBytes",
            firstBloodTime: "3h 45m"
          }
        ],

        // Unsolved challenges
        unsolved: [
          {
            name: "Ultimate Eco Cipher",
            category: "Cryptography",
            points: 600,
            difficulty: "Legendary",
            attempts: 156,
            lastAttempt: "2h ago"
          },
          {
            name: "Master SCADA Network",
            category: "Binary Exploitation",
            points: 550,
            difficulty: "Expert",
            attempts: 89,
            lastAttempt: "45m ago"
          },
          {
            name: "Hidden Forest Secrets",
            category: "Forensics",
            points: 500,
            difficulty: "Expert",
            attempts: 67,
            lastAttempt: "1h 30m ago"
          },
          {
            name: "Quantum EV Controller",
            category: "Reverse Engineering",
            points: 500,
            difficulty: "Expert",
            attempts: 45,
            lastAttempt: "3h ago"
          }
        ],

        // Recent solves
        recentSolves: [
          {
            challenge: "Solar Panel API Hack",
            team: "EcoNinjas",
            time: "15m ago",
            points: 150,
            category: "Web Security"
          },
          {
            challenge: "Green Cipher Advanced",
            team: "GreenHackers", 
            time: "32m ago",
            points: 200,
            category: "Cryptography"
          },
          {
            challenge: "Eco Forensics Image",
            team: "CyberForest",
            time: "1h 15m ago",
            points: 100,
            category: "Forensics"
          },
          {
            challenge: "Smart Grid Config",
            team: "EcoWarriors",
            time: "2h 30m ago",
            points: 250,
            category: "Web Security"
          },
          {
            challenge: "Waste Binary Analysis",
            team: "GreenBytes",
            time: "3h 45m ago",
            points: 150,
            category: "Reverse Engineering"
          }
        ]
      };
      
      setTimeout(() => {
        setChallengeData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchChallengeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center py-20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-xl eco-text-glow">Loading Challenge Statistics...</div>
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

  const CategoryCard = ({ category, data }) => {
    const solveRate = (data.solved / data.total) * 100;
    const difficultyColors = {
      "Easy": "text-green-500",
      "Medium": "text-yellow-500", 
      "Hard": "text-orange-500",
      "Expert": "text-red-500",
      "Legendary": "text-purple-500"
    };

    return (
      <motion.div 
        className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{data.icon}</span>
            <h3 className="font-semibold eco-text-glow">{category}</h3>
          </div>
          <span className={`text-sm px-2 py-1 rounded ${difficultyColors[data.difficulty]} bg-opacity-20`}>
            {data.difficulty}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <div className="text-muted-foreground">Solved</div>
            <div className="font-semibold">{data.solved}/{data.total}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Solves</div>
            <div className="font-semibold">{data.totalSolves}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Time</div>
            <div className="font-semibold">{data.avgSolveTime}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Solve Rate</div>
            <div className="font-semibold">{solveRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="leaf-progress">
          <motion.div 
            className="leaf-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${solveRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    );
  };

  const ChallengeItem = ({ challenge, showSolves = true }) => (
    <motion.div 
      className="p-4 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold eco-text-glow">{challenge.name}</h4>
          <div className="text-sm text-muted-foreground">{challenge.category}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg eco-text-glow">{challenge.points} pts</div>
          <div className="text-xs text-muted-foreground">{challenge.difficulty}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {showSolves ? (
          <>
            <div>
              <div className="text-muted-foreground">Solves</div>
              <div className="font-semibold flex items-center space-x-1">
                <Users size={14} />
                <span>{challenge.solves}</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">First Blood</div>
              <div className="font-semibold">{challenge.firstBlood}</div>
              <div className="text-xs text-muted-foreground">{challenge.firstBloodTime}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-muted-foreground">Attempts</div>
              <div className="font-semibold flex items-center space-x-1">
                <Eye size={14} />
                <span>{challenge.attempts}</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Attempt</div>
              <div className="font-semibold">{challenge.lastAttempt}</div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  const RecentSolveItem = ({ solve }) => (
    <motion.div 
      className="p-3 rounded-lg eco-border-glow bg-card/50 backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-500" size={20} />
          <div>
            <div className="font-semibold eco-text-glow">{solve.challenge}</div>
            <div className="text-sm text-muted-foreground">by {solve.team}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-green-500">+{solve.points} pts</div>
          <div className="text-xs text-muted-foreground">{solve.time}</div>
        </div>
      </div>
    </motion.div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'categories', label: 'Categories', icon: Award },
    { id: 'popular', label: 'Most Solved', icon: TrendingUp },
    { id: 'hardest', label: 'Hardest', icon: Trophy },
    { id: 'unsolved', label: 'Unsolved', icon: XCircle },
    { id: 'recent', label: 'Recent Solves', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
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
              <h1 className="text-4xl font-bold eco-text-glow">🎯 Challenge Statistics</h1>
              <p className="text-muted-foreground">Detailed analysis of all CTF challenges</p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard
            icon={Target}
            label="Total Challenges"
            value={challengeData.totalChallenges}
            subtitle="Available"
          />
          <StatCard
            icon={CheckCircle}
            label="Solved"
            value={challengeData.solvedChallenges}
            subtitle={`${((challengeData.solvedChallenges / challengeData.totalChallenges) * 100).toFixed(1)}% complete`}
          />
          <StatCard
            icon={XCircle}
            label="Unsolved"
            value={challengeData.unsolvedChallenges}
            subtitle="Still available"
          />
          <StatCard
            icon={Users}
            label="Total Solves"
            value={challengeData.totalSolves}
            subtitle="All teams"
          />
          <StatCard
            icon={Clock}
            label="Avg Solve Time"
            value={challengeData.averageSolveTime}
            subtitle="Per challenge"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-8 bg-card/30 p-2 rounded-lg"
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
                <span className="text-sm">{tab.label}</span>
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
              <div>
                <h2 className="text-2xl font-bold eco-text-glow mb-6">Category Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(challengeData.categories).map(([category, data]) => (
                    <CategoryCard key={category} category={category} data={data} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold eco-text-glow mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {challengeData.recentSolves.slice(0, 8).map((solve, index) => (
                    <RecentSolveItem key={index} solve={solve} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Challenge Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(challengeData.categories).map(([category, data]) => (
                  <CategoryCard key={category} category={category} data={data} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'popular' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Most Solved Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challengeData.mostSolved.map((challenge, index) => (
                  <ChallengeItem key={index} challenge={challenge} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hardest' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Hardest Challenges (Least Solved)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challengeData.leastSolved.map((challenge, index) => (
                  <ChallengeItem key={index} challenge={challenge} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'unsolved' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Unsolved Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challengeData.unsolved.map((challenge, index) => (
                  <ChallengeItem key={index} challenge={challenge} showSolves={false} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <h2 className="text-2xl font-bold eco-text-glow mb-6">Recent Solves</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challengeData.recentSolves.map((solve, index) => (
                  <RecentSolveItem key={index} solve={solve} />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Live Update Indicator */}
        <motion.div 
          className="text-center mt-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-sm text-muted-foreground">
            🔄 Statistics updated in real-time
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengeStats;

