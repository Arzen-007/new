import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import '../App.css';

const AmbientSounds = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const tracks = [
    { name: 'Forest', icon: '🌲', frequency: 200, type: 'sine' },
    { name: 'Rain', icon: '🌧️', frequency: 150, type: 'sawtooth' },
    { name: 'Wind', icon: '💨', frequency: 100, type: 'triangle' },
    { name: 'Ocean', icon: '🌊', frequency: 80, type: 'square' }
  ];

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startAudio = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Stop existing oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    // Create new oscillator and gain node
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure oscillator
    const track = tracks[currentTrack];
    oscillator.type = track.type;
    oscillator.frequency.setValueAtTime(track.frequency, audioContext.currentTime);
    
    // Add some variation to make it more natural
    oscillator.frequency.setValueAtTime(
      track.frequency + Math.random() * 20 - 10, 
      audioContext.currentTime + 1
    );

    // Configure gain (volume)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.5);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start oscillator
    oscillator.start();

    // Store references
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // Add some modulation for more natural sound
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    lfo.frequency.setValueAtTime(0.5, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(track.frequency * 0.1, audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();

    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current) {
      // Fade out
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
      
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current = null;
        }
      }, 500);
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const changeTrack = (trackIndex) => {
    const wasPlaying = isPlaying;
    if (isPlaying) {
      stopAudio();
    }
    setCurrentTrack(trackIndex);
    if (wasPlaying) {
      setTimeout(() => startAudio(), 100);
    }
  };

  const updateVolume = (newVolume) => {
    setVolume(newVolume);
    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.setValueAtTime(
        newVolume * 0.1, 
        audioContextRef.current.currentTime
      );
    }
  };

  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Toggle Button */}
      <motion.button
        className="mb-2 p-3 rounded-full eco-button eco-hover-glow"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </motion.button>

      {/* Sound Control Panel */}
      <motion.div
        className={`bg-background/90 backdrop-blur-md rounded-lg p-4 eco-border-glow w-64 ${
          isVisible ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-sm font-bold mb-3 eco-text-glow flex items-center">
          🎵 Ambient Nature Sounds
        </h4>

        {/* Track Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {tracks.map((track, index) => (
            <motion.button
              key={index}
              className={`p-2 rounded text-xs flex items-center justify-center space-x-1 transition-all ${
                currentTrack === index
                  ? 'eco-button'
                  : 'bg-card/50 hover:bg-card/80 eco-border-glow'
              }`}
              onClick={() => changeTrack(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{track.icon}</span>
              <span>{track.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Play/Pause Button */}
        <motion.button
          className="w-full p-2 rounded eco-button mb-3 flex items-center justify-center space-x-2"
          onClick={togglePlayback}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </motion.button>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => updateVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer eco-slider"
            style={{
              background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${volume * 100}%, #1a4a1a ${volume * 100}%, #1a4a1a 100%)`
            }}
          />
        </div>

        {/* Current Track Info */}
        <div className="mt-3 text-xs text-center text-muted-foreground">
          <motion.div
            animate={isPlaying ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isPlaying ? `🎶 Playing: ${tracks[currentTrack].name}` : '⏸️ Paused'}
          </motion.div>
        </div>

        {/* Sound Visualization */}
        {isPlaying && (
          <div className="mt-3 flex justify-center space-x-1">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [4, 16, 4],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AmbientSounds;

