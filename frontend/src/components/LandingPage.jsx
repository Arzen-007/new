import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Trophy, 
  Zap, 
  Leaf, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';
import '../App.css';

const LandingPage = ({ onSignIn, onSignUp }) => {
  const [stats, setStats] = useState({
    users: 1247,
    teams: 156,
    challenges: 24,
    treesPlanted: 204
  });

  useEffect(() => {
    // Animate stats on load
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        teams: prev.teams + Math.floor(Math.random() * 2),
        challenges: prev.challenges,
        treesPlanted: prev.treesPlanted + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Cybersecurity Challenges",
      description: "Master web security, cryptography, forensics, and more through hands-on challenges"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Form teams, compete together, and learn from the global cybersecurity community"
    },
    {
      icon: Leaf,
      title: "Environmental Impact",
      description: "Every challenge solved contributes to real environmental initiatives and awareness"
    },
    {
      icon: Trophy,
      title: "Global Leaderboard",
      description: "Compete with hackers worldwide and track your progress on our live scoreboard"
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Security Researcher",
      content: "This platform transformed my understanding of cybersecurity while contributing to environmental causes.",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "CTF Team Leader",
      content: "The perfect blend of challenging problems and meaningful environmental impact. Highly recommended!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Penetration Tester",
      content: "Innovative approach to CTFs. Love how each solve helps plant trees and offset carbon emissions.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Globe className="text-green-400 w-16 h-16 mr-4" />
              <h1 className="text-5xl md:text-7xl font-bold eco-text-glow">
                Green Eco CTF
              </h1>
            </div>
            <p className="text-2xl md:text-3xl mb-8 text-green-300">
              Hack for a Greener Tomorrow
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto">
              Join the ultimate cybersecurity challenge where every solved problem contributes to environmental awareness. 
              Compete with teams worldwide while making a positive impact on our planet.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUp}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="px-8 py-4 bg-transparent border-2 border-green-400 text-green-400 font-semibold rounded-lg hover:bg-green-400 hover:text-black transition-all duration-300"
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">{stats.users.toLocaleString()}</div>
              <div className="text-sm text-gray-300">Active Hackers</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">{stats.teams}</div>
              <div className="text-sm text-gray-300">Teams Competing</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">{stats.challenges}</div>
              <div className="text-sm text-gray-300">Challenges</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">{stats.treesPlanted}</div>
              <div className="text-sm text-gray-300">Trees Planted</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 eco-text-glow">
              Why Choose Green Eco CTF?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience cybersecurity challenges like never before, with a meaningful environmental mission
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 hover:border-green-400/50 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-green-300">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 eco-text-glow">
              What Hackers Say
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of satisfied cybersecurity enthusiasts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-green-400">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 eco-text-glow">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the movement where cybersecurity meets environmental responsibility
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUp}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Start Your Journey Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

