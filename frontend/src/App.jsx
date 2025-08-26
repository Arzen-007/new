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
    localStorage.setItem('auth_token', `demo_token_${Date.now()}`);
  };

  const handleSignInSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
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

  // Page navigation handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setComparisonMode(false);
    setChallengeStatsView(false);
    setLiveGraphView(false);
  };

  // Comparison mode handlers
  const handleViewComparison = (selectedTeams = []) => {
    setSelectedTeamsForComparison(selectedTeams);
    setComparisonMode(true);
  };

  const handleExitComparison = () => {
    setComparisonMode(false);
    setSelectedTeamsForComparison([]);
  };

  // View handlers
  const handleViewAllTeams = (filter = 'all') => {
    setCurrentPage('scoreboard-full');
    setComparisonMode(false);
    setChallengeStatsView(false);
    setLiveGraphView(false);
  };

  const handleViewChallengeStats = () => {
    setChallengeStatsView(true);
    setComparisonMode(false);
    setLiveGraphView(false);
  };

  const handleViewLiveGraph = () => {
    setLiveGraphView(true);
    setComparisonMode(false);
    setChallengeStatsView(false);
  };

  const handleBackToScoreboard = () => {
    setChallengeStatsView(false);
    setLiveGraphView(false);
    setComparisonMode(false);
  };

  // Chat and admin handlers
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleAdminPanel = () => {
    setAdminPanelOpen(!adminPanelOpen);
  };

  // If not authenticated, show authentication pages
  if (!isAuthenticated) {
    if (currentPage === 'signup') {
      return (
        <SignUp 
          onBack={handleBackToLanding}
          onSignIn={handleSignIn}
          onSignUpSuccess={handleSignUpSuccess}
        />
      );
    }
    
    if (currentPage === 'signin') {
      return (
        <SignIn 
          onBack={handleBackToLanding}
          onSignUp={handleSignUp}
          onSignInSuccess={handleSignInSuccess}
        />
      );
    }
    
    // Default to landing page
    return (
      <LandingPage 
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
      />
    );
  }

  // Main authenticated app
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      
      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-16">
        {currentPage === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {comparisonMode ? (
              <ComparisonMode 
                selectedTeams={selectedTeamsForComparison}
                onBack={handleExitComparison}
              />
            ) : challengeStatsView ? (
              <ChallengeStats onBack={handleBackToScoreboard} />
            ) : liveGraphView ? (
              <LiveScoreboardGraph onBack={handleBackToScoreboard} />
            ) : (
              <Scoreboard 
                onViewComparison={handleViewComparison}
                onViewAllTeams={handleViewAllTeams}
                onViewChallengeStats={handleViewChallengeStats}
                onViewLiveGraph={handleViewLiveGraph}
              />
            )}
          </motion.div>
        )}

        {currentPage === 'scoreboard' && (
          <motion.div
            key="scoreboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {comparisonMode ? (
              <ComparisonMode 
                selectedTeams={selectedTeamsForComparison}
                onBack={handleExitComparison}
              />
            ) : challengeStatsView ? (
              <ChallengeStats onBack={handleBackToScoreboard} />
            ) : liveGraphView ? (
              <LiveScoreboardGraph onBack={handleBackToScoreboard} />
            ) : (
              <Scoreboard 
                onViewComparison={handleViewComparison}
                onViewAllTeams={handleViewAllTeams}
                onViewChallengeStats={handleViewChallengeStats}
                onViewLiveGraph={handleViewLiveGraph}
              />
            )}
          </motion.div>
        )}

        {currentPage === 'scoreboard-full' && (
          <motion.div
            key="scoreboard-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ScoreboardFull onBack={() => setCurrentPage('home')} />
          </motion.div>
        )}

        {currentPage === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Challenges />
          </motion.div>
        )}

        {currentPage === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <UserProfile user={user} />
          </motion.div>
        )}

        {currentPage === 'team-details' && (
          <motion.div
            key="team-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TeamDetails user={user} />
          </motion.div>
        )}
      </main>

      {/* Floating Components */}
      <EcoCounter />
      <AmbientSounds />

      {/* Chat System */}
      <ChatSystem 
        isOpen={chatOpen}
        onToggle={toggleChat}
        user={user}
      />

      {/* Admin Panel */}
      {user?.is_admin && (
        <AdminPanel 
          isOpen={adminPanelOpen}
          onToggle={toggleAdminPanel}
          user={user}
        />
      )}
    </div>
  );
}

export default App;

