"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { HOUSES } from '@/lib/constants';

const PLAYLIST = [
  { title: "Midnight Forest", url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778358273/syouki_takahashi-midnight-forest-184304_1_gru4de.mp3" },
  { title: "Main Horizon 2", url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778404551/Main_Menu2_bntfg2.mp3" },
  { title: "Atmospheric Descent 3", url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778404553/Main_Menu3_pbptpd.mp3" }
];

export default function AudioDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const userHouseId = useStore((state) => state.userHouseId);
  const currentUserHouse = HOUSES.find(h => h.id === userHouseId);
  const themeColor = currentUserHouse ? currentUserHouse.color : '#10b981';
  
  const audioRef = useRef(null);

  // Ensure playback on first mount and sequential loads
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          // Handle auto-play restrictions if user hasn't clicked anything yet
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Action pending"));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  // Auto-play next track when current one ends
  const handleEnded = () => {
    nextTrack();
  };

  const currentTrack = PLAYLIST[currentIndex];

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto relative flex flex-col items-end gap-2 z-50"
    >
      {/* Hidden Native Node */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleEnded} 
        autoPlay={isPlaying}
      />

      {/* Hovering Track Title Information Banner */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="bg-black/80 backdrop-blur-xl px-4 py-2 border border-white/10 rounded-xl shadow-2xl flex items-center space-x-3"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center animate-pulse" style={{ backgroundColor: `${themeColor}20` }}>
              <Music size={12} style={{ color: themeColor }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 tracking-widest uppercase">Now Broadcasting</span>
              <span className="text-[11px] font-bold text-white tracking-wide whitespace-nowrap">{currentTrack.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Interface (Player) */}
      <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center space-x-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Audio Active Gradient Edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-500" 
          style={{ 
            backgroundColor: isPlaying ? themeColor : 'rgba(255,255,255,0.2)',
            boxShadow: isPlaying ? `0 0 10px ${themeColor}60` : 'none'
          }} 
        />
        
        {/* Waveform Visualization simulation */}
        <div className="flex items-end space-x-0.5 h-4 mr-1">
           {[0, 1, 2, 3, 4].map((i) => (
             <motion.div 
               key={i}
               animate={isPlaying ? { height: [4, 12, 6, 14, 4][i] } : { height: 2 }}
               transition={{ repeat: Infinity, duration: 0.8 + (i * 0.1), repeatType: 'mirror' }}
               className="w-[2px] rounded-full opacity-80"
               style={{ backgroundColor: themeColor }}
             />
           ))}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={prevTrack}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <SkipBack size={14} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            style={{ 
              backgroundColor: `${themeColor}25`,
              border: `1px solid ${themeColor}50`,
              color: themeColor
            }}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
