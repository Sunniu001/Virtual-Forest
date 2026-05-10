"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, Zap, Compass, Globe2, Sparkles, Users, Feather, X } from 'lucide-react';
import { HOUSES } from '@/lib/constants';
import { sfx } from '@/lib/sfx';

// Decorative Icon Mapping based on traits for visual flair
const getIconForHouse = (id) => {
  switch(id) {
    case 'iboga': return Sparkles;
    case 'datura': return Globe2;
    case 'peyote': return Feather;
    case 'ayahuasca': return Shield;
    case 'kava': return Compass;
    default: return Zap;
  }
};

export default function AlignmentCeremony({ show, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const setUserHouseId = useStore((state) => state.setUserHouseId);
  const setFocusedHouseId = useStore((state) => state.setFocusedHouseId);
  const setInHouseView = useStore((state) => state.setInHouseView);

  // Trigger Ambient Welcome Sound when activated
  useEffect(() => {
    if (show) {
      sfx.playAtmospheric();
    }
  }, [show]);

  const currentHouse = HOUSES[currentIndex];
  const Icon = getIconForHouse(currentHouse.id);

  const handlePrev = () => {
    sfx.playSlide();
    setCurrentIndex((prev) => (prev - 1 + HOUSES.length) % HOUSES.length);
  };

  const handleNext = () => {
    sfx.playSlide();
    setCurrentIndex((prev) => (prev + 1) % HOUSES.length);
  };

  const handleSelect = () => {
    sfx.playClick();
    setUserHouseId(currentHouse.id);
    setFocusedHouseId(currentHouse.id);
    setInHouseView(true); // IMMEDIATELY WARP TO HOUSE INTERFACE
    onComplete(); // Hide the modal logic
  };

  const handleClose = () => {
    sfx.playClick();
    onComplete();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none"
      >
        {/* Atmospheric Backdrop Dimming */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Dynamically Animated Glowing Halo centered behind the card */}
        <motion.div 
          key={`halo-${currentHouse.id}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 m-auto w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
          style={{ backgroundColor: currentHouse.color }}
        />

        {/* Cinematic Modal Container - Scaled down footprint */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.2 }}
          className="relative w-full max-w-3xl bg-slate-950/40 border border-white/10 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col min-h-[480px]"
        >
          
          {/* Sub Header protocol */}
          <div className="w-full pt-6 px-10 flex justify-between items-center z-10">
             <div className="flex items-center gap-3 text-white/40">
               <Shield size={14} className="animate-pulse" />
               <span className="text-[10px] font-mono uppercase tracking-[0.4em]">SELECT YOUR HOUSE</span>
             </div>
             
             <div className="flex items-center space-x-6">
               <div className="flex space-x-2">
                 {HOUSES.map((_, idx) => (
                   <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white' : 'w-3 bg-white/10'}`} />
                 ))}
               </div>
               
               {/* Standard Escape Close Node */}
               <button 
                 onClick={handleClose}
                 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
               >
                 <X size={14} />
               </button>
             </div>
          </div>

          {/* Main Layout Content */}
          <div className="flex-1 flex px-12 items-center relative">
            
            {/* Carousel Navigation Controls - Floated Sides */}
            <button onClick={handlePrev} className="absolute left-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all z-20">
              <ChevronLeft size={24} />
            </button>
            <button onClick={handleNext} className="absolute right-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all z-20">
              <ChevronRight size={24} />
            </button>

            {/* Animated Content Slide System */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentHouse.id}
                initial={{ x: 40, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ x: -40, opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full flex items-center justify-between gap-10 py-8"
              >
                
                {/* Left side: Massive Cinematic Faction Motif */}
                <div className="w-[40%] h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 m-auto w-[80%] h-[80%] rounded-full blur-3xl opacity-20" style={{ backgroundColor: currentHouse.color }} />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
                    className="w-full aspect-square rounded-full border border-white/5 flex items-center justify-center relative"
                  >
                     <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/10 opacity-50" />
                     <div className="absolute inset-10 rounded-full border border-white/5 bg-white/[0.02]" />
                  </motion.div>
                  
                  {/* The Core Symbol */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl relative group">
                       <div className="absolute inset-0 bg-white/5 scale-90 rounded-2xl blur-xl group-hover:scale-110 transition-all" />
                       <Icon size={40} style={{ color: currentHouse.color }} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                     </div>
                  </div>
                </div>

                {/* Right Side: Philosophical Archetype Details */}
                <div className="w-[60%] flex flex-col pr-4">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 block" style={{ color: currentHouse.color }}>
                      {currentHouse.motto}
                    </span>
                    <h1 className="text-4xl font-black text-white tracking-wide uppercase mb-0.5">{currentHouse.name}</h1>
                    <h2 className="text-base text-white/50 font-light tracking-widest uppercase border-b border-white/10 pb-4 mb-5">{currentHouse.archetype}</h2>
                    
                    <p className="text-base text-white/80 font-light leading-relaxed tracking-wide italic font-serif opacity-90 mb-6">
                      "{currentHouse.philosophy}"
                    </p>
                    
                    {/* Traits Matrix */}
                    <div className="flex flex-wrap gap-2.5 mb-6">
                      {currentHouse.traits.map((trait, tIdx) => (
                        <span key={tIdx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentHouse.color }} />
                          {trait}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Action */}
          <div className="w-full pb-8 px-10 flex justify-center z-10 mt-auto">
             <motion.button
               whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
               whileTap={{ scale: 0.98 }}
               onClick={handleSelect}
               className="px-16 py-4 rounded-xl font-black uppercase tracking-[0.3em] text-sm transition-all duration-300 flex items-center gap-3 group shadow-2xl border border-white/10 text-white hover:shadow-[0_0_40px_-5px_rgba(0,0,0,0.5)]"
               style={{ backgroundColor: currentHouse.color }}
             >
               JOIN HOUSE {currentHouse.name.toUpperCase()}
               <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </motion.button>
          </div>

          {/* Ambient light noise pattern texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
