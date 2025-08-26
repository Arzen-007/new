import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Target, 
  Trophy, 
  User, 
  Settings, 
  LogIn, 
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import '../App.css';

const Navigation = ({ currentPage, onPageChange, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    ...(user ? [
      { id: 'profile', label: 'Profile', icon: User },
      ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
    ] : [
      { id: 'login', label: 'Login', icon: LogIn },
      { id: 'register', label: 'Register', icon: UserPlus }
    ])
  ];

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const NavItem = ({ item, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    
    return (
      <motion.button
        className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          isActive ? 'active' : ''
        } ${isMobile ? 'w-full justify-start' : ''}`}
        onClick={() => handleNavClick(item.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </motion.button>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav 
        className="hidden md:flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl">🌱</div>
          <div>
            <h1 className="text-xl font-bold eco-text-glow">Green Eco CTF</h1>
            <p className="text-xs text-muted-foreground">Hack for a Greener Tomorrow</p>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          
          {user && (
            <motion.button
              className="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg ml-4"
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Logout</span>
            </motion.button>
          )}
        </div>

        {/* User Info */}
        {user && (
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="text-right cursor-pointer hover:bg-primary/10 p-2 rounded-lg transition-colors"
              onClick={() => handleNavClick('team')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="View Team Details"
            >
              <div className="text-sm font-medium eco-text-glow">{user.team_name}</div>
              <div className="text-xs text-muted-foreground">{user.points || 0} points</div>
            </motion.button>
            <motion.button
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
              onClick={() => handleNavClick('profile')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="View Profile"
            >
              <User size={16} />
            </motion.button>
          </motion.div>
        )}
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav 
        className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl">🌱</div>
          <div>
            <h1 className="text-lg font-bold eco-text-glow">Green Eco CTF</h1>
          </div>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className="p-2 rounded-lg eco-border-glow"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        className={`md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-md ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="text-xl">🌱</div>
              <h1 className="text-lg font-bold eco-text-glow">Green Eco CTF</h1>
            </div>
            <motion.button
              className="p-2 rounded-lg eco-border-glow"
              onClick={() => setIsMobileMenuOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} isMobile />
            ))}
            
            {user && (
              <motion.button
                className="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg w-full justify-start mt-4 border-t border-border pt-4"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Logout</span>
              </motion.button>
            )}
          </div>

          {/* Mobile User Info */}
          {user && (
            <motion.div 
              className="p-4 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                <motion.button
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
                  onClick={() => {
                    handleNavClick('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="View Profile"
                >
                  <User size={20} />
                </motion.button>
                <motion.button
                  className="flex-1 text-left cursor-pointer hover:bg-primary/10 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    handleNavClick('team');
                    setIsMobileMenuOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="View Team Details"
                >
                  <div className="font-medium eco-text-glow">{user.team_name}</div>
                  <div className="text-sm text-muted-foreground">{user.points || 0} points</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Navigation;

