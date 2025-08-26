import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Scoreboard from './components/Scoreboard';
import ScoreboardFull from './components/ScoreboardFull';
import Challenges from './components/Challenges';
import UserProfile from './components/UserProfile';
import TeamDetails from './components/TeamDetails';
import ChallengeStats from './components/ChallengeStats';
import LiveScoreboardGraph from './components/LiveScoreboardGraph';
import EmbeddedLiveGraph from './components/EmbeddedLiveGraph';
import ComparisonMode from './components/ComparisonMode';
import LiveScoreboardGraphSimple from './components/LiveScoreboardGraphSimple';
import ChatSystem from './components/ChatSystem';
import AdminPanel from './components/AdminPanel';
import EcoCounter from './components/EcoCounter';
import AmbientSounds from './components/AmbientSounds';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [scoreboardView, setScoreboardView] = useState('main'); // main, full, stats, live
  const [compafunction App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [challengeStatsView, setChallengeStatsView] = useState(false);
  const [liveGraphView, setLiveGraphView] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
            setCurrentPage('home');
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
    };
    
    checkAuth();
  }, []);

  // Authentication handlers
  const handleSignUp = () => {
    setCurrentPage('signup');
  };

  const handleSignIn = () => {
    setCurrentPage('signin');
  };

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
    // In a real app, you'd also store the auth token
    localStorage.setItem('auth_token', `demo_token_${Date.now()}`);
  };

  const handleSignInSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
    // In a real app, you'd store the actual token from the response
    localStorage.setItem('auth_token', `demo_token_${Date.now()}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      setCurrentPage('landing');
    }
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };
  // Comparison mode handlers
  const handleViewComparison = (selectedTeams = []) => {
    setSelectedTeamsForComparison(selectedTeams);
    setComparisonMode(true);
  };

  const handleBackFromComparison = () => {
    setComparisonMode(false);
    setSelectedTeamsForComparison([]);
  };

  // Scoreboard navigation handlers
  const handleViewAllTeams = (filter = 'all') => {
    setScoreboardView('full');
    setScoreboardFilter(filter);
  };

  const handleViewActiveTeams = () => {
    setScoreboardView('full');
    setScoreboardFilter('active');
  };

  const handleViewChallengeStats = () => {
    setChallengeStatsView(true);
  };

  const handleViewLiveGraph = () => {
    setLiveGraphView(true);
  };

  const handleBackToScoreboard = () => {
    setScoreboardView('main');
    setChallengeStatsView(false);
    setLiveGraphView(false);
    setComparisonMode(false);
  };

  const handleTeamClick = (teamName) => {
    setCurrentPage('team');
    // You can add team-specific logic here
  };

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset all sub-views when changing main pages
    if (page !== 'scoreboard') {
      setScoreboardView('main');
      setChallengeStatsView(false);
      setLiveGraphView(false);
      setComparisonMode(false);
    }
  };

  const renderContent = () => {
    if (currentPage === 'home') {
      return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Green Eco CTF
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-green-300">
              Hack for a Greener Tomorrow
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Join the ultimate cybersecurity challenge where every solved problem contributes to environmental awareness. 
              Compete with teams worldwide while making a positive impact on our planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('challenges')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Challenges
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('scoreboard')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Scoreboard
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    } else if (currentPage === 'challenges') {
      return <Challenges />;
    } else if (currentPage === 'team') {
      return <TeamDetails user={user} onBack={() => setCurrentPage('scoreboard')} />;
    } else if (currentPage === 'profile') {
      return <UserProfile user={user} onBack={() => setCurrentPage('scoreboard')} />;
    } else if (currentPage === 'scoreboard') {
      if (comparisonMode) {
        return (
          <ComparisonMode 
            onBack={handleBackFromComparison}
            selectedTeams={selectedTeamsForComparison}
          />
        );
      } else if (liveGraphView) {
        return (
          <LiveScoreboardGraphSimple 
            onBack={handleBackToScoreboard}
            onViewComparison={handleViewComparison}
          />
        );
      } else if (scoreboardView === 'full') {
        return (
          <ScoreboardFull 
            onBack={handleBackToScoreboard}
            filter={scoreboardFilter}
          />
        );
      } else if (challengeStatsView) {
        return (
          <ChallengeStats 
            onBack={handleBackToScoreboard}
          />
        );
      } else {
        return (
          <Scoreboard 
            onViewAllTeams={handleViewAllTeams}
            onViewActiveTeams={handleViewActiveTeams}
            onViewChallengeStats={handleViewChallengeStats}
            onViewLiveGraph={handleViewLiveGraph}
            onTeamClick={handleTeamClick}
          />
        );
      }
    }
    
    return <Scoreboard />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Hero Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/heromap.jpg)' }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 bg-black/60" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Navigation 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          user={user}
          onTeamClick={handleTeamClick}
          onProfileClick={handleProfileClick}
        />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {renderContent()}
        </motion.main>
      </div>

      {/* Chat System */}
      <ChatSystem 
        user={user}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />

      {/* Admin Panel */}
      {user.is_admin && (
        <AdminPanel 
          user={user}
          isOpen={adminPanelOpen}
          onToggle={() => setAdminPanelOpen(!adminPanelOpen)}
        />
      )}

      {/* Environmental Impact Counter */}
      <EcoCounter />

      {/* Ambient Sounds */}
      <AmbientSounds />
    </div>
  );
}

export default App;

