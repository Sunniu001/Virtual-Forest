"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { useStore } from '@/lib/store';
import { User, LogOut, Volume2, VolumeX } from 'lucide-react';
import { sfx } from '@/lib/sfx';

// THEME TRACK EXCLUSIVE
const RAIN_THEME = "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778358273/nourishedbymusic-ambient-forest-rain-375365_kmsbpb.mp3";

export default function TitleScreen() {
  const setView = useStore((state) => state.setView);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);

  // 1. High-Energy Cinematic Drone Engine
  const mousePos = useRef({ x: 0, y: 0 });
  const visualX = useMotionValue(0);
  const visualY = useMotionValue(0);

  const bgX = useTransform(visualX, v => v * 15);
  const bgY = useTransform(visualY, v => v * 10);
  const mgX = useTransform(visualX, v => v * 45);
  const mgY = useTransform(visualY, v => v * 30);
  const fgX = useTransform(visualX, v => v * -120);
  const fgY = useTransform(visualY, v => v * -80);
  const uiX = useTransform(visualX, v => v * -10);
  const uiY = useTransform(visualY, v => v * -8);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: (e.clientX / window.innerWidth) - 0.5, y: (e.clientY / window.innerHeight) - 0.5 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useAnimationFrame((time) => {
    const speedFactorX = time / 2000; 
    const speedFactorY = time / 2500;
    const orbitX = Math.sin(speedFactorX) * 0.28;
    const orbitY = Math.cos(speedFactorY) * 0.18;
    const targetX = mousePos.current.x + orbitX;
    const targetY = mousePos.current.y + orbitY;
    const currentX = visualX.get();
    const currentY = visualY.get();
    const smoothFactor = 0.055; 
    visualX.set(currentX + (targetX - currentX) * smoothFactor);
    visualY.set(currentY + (targetY - currentY) * smoothFactor);
  });

  // 2. Reinforced Audio Auto-Start Routine
  const audioRef = useRef(null);
  // Force visual default to TRUE to match intention immediately
  const [isPlaying, setIsPlaying] = useState(true);

  const triggerAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { 
          // If direct blocked, keep logic alive for immediate user-event retry
        });
    }
  };

  useEffect(() => {
    // Prime it instantly
    triggerAudio();

    const autoForcePlay = () => {
      triggerAudio();
      window.removeEventListener('click', autoForcePlay);
      window.removeEventListener('keydown', autoForcePlay);
    };
    
    window.addEventListener('click', autoForcePlay);
    window.addEventListener('keydown', autoForcePlay);
    
    return () => {
      window.removeEventListener('click', autoForcePlay);
      window.removeEventListener('keydown', autoForcePlay);
    };
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    sfx.playClick();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  const [showReadme, setShowReadme] = useState(false);

  const handleStartGame = () => {
    sfx.playTransitionPower(); // Engage atmospheric heavy frequency logic
    if (!isLoggedIn) setIsLoggedIn(true);
    setTimeout(() => setView('globe'), 100); // Micro offset to ensure sfx executes context
  };

  const menuItems = [
    { label: isLoggedIn ? "CONTINUE" : "NEW GAME - LOG IN", onClick: handleStartGame, primary: true },
    { label: "READ ME", onClick: () => { sfx.playClick(); setShowReadme(true); } },
    { label: "CREDITS", onClick: () => { sfx.playClick(); alert("Ecosystem Online"); } },
    { label: "EXIT", onClick: () => { sfx.playClick(); window.close(); } },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 w-full h-screen bg-[#050a08] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Direct browser-level Autoplay enforced alongside React controls */}
      <audio ref={audioRef} src={RAIN_THEME} loop autoPlay />

      <div className="absolute top-0 left-0 w-full h-[60px] bg-black z-50 pointer-events-none opacity-90" />

      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] pointer-events-none z-1"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dwgpeeu0r/image/upload/v1778355241/background_malirj.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          x: bgX, y: bgY, scale: 1.04,
        }}
      />

      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] pointer-events-none z-2"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dwgpeeu0r/image/upload/v1778355235/Midground_ixhu7p.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          x: mgX, y: mgY, scale: 1.04,
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-5" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.7) 100%)' }} />

      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] pointer-events-none z-6"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dwgpeeu0r/image/upload/v1778355547/ChatGPT_Image_May_10_2026_01_07_47_AM_1_qtxhmd.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(6px) brightness(0.35) contrast(1.1)',
          x: fgX, y: fgY, scale: 1.15,
        }}
      />

      <motion.div className="relative z-10 flex flex-col items-center text-center pointer-events-auto" style={{ x: uiX, y: uiY }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.8 }}
          className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white tracking-[0.15em] uppercase mb-2"
          style={{ textShadow: '0 10px 40px rgba(0,0,0,0.95)' }}
        >
          VIRTUAL FOREST
        </motion.h1>
        
        {/* ADDED SUBTITLE */}
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.5, duration: 1.5 }}
          className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase text-emerald-300 mb-14 italic"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,1)' }}
        >
          Grow Virtually. Restore Naturally.
        </motion.p>

        <nav className="flex flex-col gap-5">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`group text-base md:text-lg font-bold tracking-[0.5em] uppercase transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]
                ${item.primary ? "text-emerald-300 hover:text-emerald-100" : "text-white"}
                hover:tracking-[0.6em] hover:scale-[1.05]`}
              style={{ textShadow: '0 2px 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.8)' }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </motion.div>

      <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black z-50 pointer-events-none opacity-90 flex items-center justify-center">
        <span className="text-[10px] text-white/50 tracking-[0.5em] font-bold font-mono uppercase">
          A game by Zura Studios
        </span>
      </div>

      {/* READ ME IMMERSIVE OVERLAY */}
      <AnimatePresence>
        {showReadme && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(25px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-[100] bg-black/85 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
                <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase">Read Me</h2>
                <button onClick={() => setShowReadme(false)} className="text-white/50 hover:text-white text-xs tracking-widest font-bold uppercase border border-white/20 px-4 py-2 rounded hover:bg-white/10 transition-all">
                  Close
                </button>
              </div>
              
              {/* Scrolling Content */}
              <div className="overflow-y-auto p-8 md:px-12 md:py-10 custom-scrollbar space-y-6 text-white/80 text-sm md:text-base leading-relaxed font-light tracking-wide text-justify">
                <p>
                  <span className="text-emerald-300 font-bold uppercase tracking-widest">Virtual Forest</span> is a slow and meditative online world built around the simple act of growing trees.
                </p>
                <p>
                  Each player receives one seed every day. That seed can be planted anywhere across a shared global forest. Once planted, the sapling must be cared for daily. Miss a day, and the plant fades away. Protect it for long enough, and it grows into a permanent tree within the world.
                </p>
                <p className="font-bold text-white/90 text-center italic py-2 tracking-widest">
                  The game is designed around patience, routine, responsibility, and long-term thinking.
                </p>
                <p>
                  Unlike fast-paced competitive systems built to maximize stimulation, Virtual Forest encourages quiet participation and mindful interaction. The forest evolves gradually through the collective actions of its players, creating a living environment shaped by consistency rather than speed.
                </p>
                <p>
                  The project is also intended as a behavioral experiment in climate awareness and digital habit formation. By creating emotional attachment to growth, care, and continuity, the experience aims to strengthen real-world sensitivity toward ecological restoration and afforestation efforts.
                </p>
                
                <div className="bg-emerald-950/20 border border-emerald-500/10 p-6 rounded-lg space-y-4 mt-8">
                  <p className="font-bold text-emerald-300 uppercase tracking-widest text-xs">Impact Network:</p>
                  <p className="text-white/70 text-sm">
                    Player activity inside the game contributes toward real-world plantation initiatives conducted with environmental partners and community organizations, including:
                  </p>
                  <ul className="list-disc list-inside text-white text-sm font-semibold space-y-1 ml-2">
                    <li>Better Planet Together</li>
                    <li>Ecoserve Council</li>
                  </ul>
                </div>

                <div className="text-center pt-8 pb-4">
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] mb-2">Broader Initiative:</p>
                  <p className="text-emerald-400 font-black text-lg tracking-[0.3em]">#betterplanettogether</p>
                </div>

                <p className="border-t border-white/10 pt-6 text-xs text-white/50 text-center italic">
                  Every tree planted in the virtual world represents participation in a larger collective effort — one that connects digital presence with environmental awareness, restoration, and long-term planetary stewardship.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMAL FLOATING AUDIO TOGGLE */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-20 right-8 z-50 p-3 bg-black/50 backdrop-blur border border-white/10 rounded-full text-white/70 hover:text-emerald-300 hover:border-emerald-500/30 transition-all shadow-lg group"
      >
        {isPlaying ? (
          <Volume2 size={18} className="group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX size={18} className="text-white/40 group-hover:text-emerald-300" />
        )}
      </button>

      <div className="absolute top-20 right-8 z-50 flex items-center pointer-events-auto">
        {isLoggedIn ? (
          <div className="flex items-center bg-black/70 border border-white/10 px-5 py-2 rounded-full text-white shadow-2xl backdrop-blur-sm">
            <User size={14} className="mr-3 text-emerald-400" />
            <span className="tracking-[0.2em] uppercase font-bold text-[10px] mr-6">Commander Established</span>
            <button onClick={(e) => { e.stopPropagation(); setIsLoggedIn(false); }} className="hover:text-red-400 transition-colors"><LogOut size={14} /></button>
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setIsLoggedIn(true); }} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase px-4 py-2 rounded-md tracking-widest backdrop-blur shadow-md transition-all">
            Log In
          </button>
        )}
      </div>
    </motion.div>
  );
}
