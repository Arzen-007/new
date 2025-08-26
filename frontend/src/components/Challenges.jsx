import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import challengesData from '../challenges.json'; // Import the challenges data
import '../App.css';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [flagInput, setFlagInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setChallenges(challengesData);
  }, []);

  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setMessage({ text: '', type: '' }); // Clear previous messages
    setFlagInput('');
  };

  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (selectedChallenge && flagInput.trim() === selectedChallenge.flag) {
      setMessage({ text: 'Correct Flag! Challenge Solved!', type: 'success' });
      // In a real app, you'd send this to the backend to update score
    } else {
      setMessage({ text: 'Incorrect Flag. Try again!', type: 'error' });
    }
  };

  const ChallengeCard = ({ challenge }) => (
    <motion.div
      className="bg-card/70 backdrop-blur-sm rounded-lg p-6 eco-border-glow cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => handleChallengeClick(challenge)}
    >
      <h3 className="text-xl font-bold eco-text-glow mb-2">{challenge.title}</h3>
      <p className="text-muted-foreground text-sm mb-3">{challenge.category} - {challenge.points} Points</p>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${challenge.difficulty === 'easy' ? 'bg-green-600' : challenge.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>
        {challenge.difficulty}
      </span>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6 pt-20">
      <h1 className="text-4xl font-bold text-center mb-8 eco-text-glow">🎯 Challenges</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {selectedChallenge && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card/90 rounded-lg p-8 eco-border-glow max-w-2xl w-full relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl"
              onClick={() => setSelectedChallenge(null)}
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold eco-text-glow mb-4">{selectedChallenge.title}</h2>
            <p className="text-muted-foreground mb-4">Category: {selectedChallenge.category} | Points: {selectedChallenge.points}</p>
            <p className="text-lg mb-6">{selectedChallenge.description}</p>

            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <input
                type="text"
                className="w-full p-3 rounded-md bg-input border border-eco-primary focus:outline-none focus:ring-2 focus:ring-eco-accent"
                placeholder="Enter your flag (e.g., TAZ{flag_here})"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
              />
              <motion.button
                type="submit"
                className="eco-button w-full py-3 rounded-md text-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Flag
              </motion.button>
            </form>

            {message.text && (
              <motion.div
                className={`mt-4 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-700/30 text-green-400' : 'bg-red-700/30 text-red-400'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message.text}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Challenges;


