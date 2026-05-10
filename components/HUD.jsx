"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { 
  Globe2, Shield, User, Bell, Settings, 
  Zap, Trophy, Hexagon, Play, Map, 
  Rss, Target, ShoppingBag, Eye, ChevronRight, LogOut, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HOUSES } from '@/lib/constants';
import AudioDeck from './AudioDeck';
import HouseLeaderboard from './HouseLeaderboard';
import { sfx } from '@/lib/sfx';

export default function HUD() {
  const [showGuide, setShowGuide] = React.useState(false);
  const [bounceNotice, setBounceNotice] = React.useState(false);
  const [cognitiveTime, setCognitiveTime] = React.useState('');

  // Cogntive Time Engine (Self-Updating Local Zone Ticker)
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tzString = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ');
      const timeStr = now.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCognitiveTime(`${timeStr} (${tzString})`);
    };
    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Global User/Game State from extended store
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const userHouseId = useStore((state) => state.userHouseId);
  const karmaScore = useStore((state) => state.karmaScore);
  const userRank = useStore((state) => state.userRank);
  const activeCommandTab = useStore((state) => state.activeCommandTab);

  const setActiveCommandTab = useStore((state) => state.setActiveCommandTab);
  const setUserHouseId = useStore((state) => state.setUserHouseId);
  const setCeremonyActive = useStore((state) => state.setCeremonyActive);
  const inHouseView = useStore((state) => state.inHouseView);
  const setInHouseView = useStore((state) => state.setInHouseView);
  
  // Legacy Interactions
  const hoveredHouseId = useStore((state) => state.hoveredHouseId);
  const setHoveredHouseId = useStore((state) => state.setHoveredHouseId);
  const setFocusedHouseId = useStore((state) => state.setFocusedHouseId);
  const setSelectedHouse = useStore((state) => state.setSelectedHouse);
  const setView = useStore((state) => state.setView);

  const currentUserHouse = HOUSES.find(h => h.id === userHouseId);
  
  // Global Dynamic Theme Evaluation
  const themeColor = currentUserHouse ? currentUserHouse.color : '#10b981';

  // 8-Second Onboarding Delayed Guide Activation
  React.useEffect(() => {
    if (!userHouseId) {
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 8000); // Display elegant tutorial prompt after 8 seconds
      return () => clearTimeout(timer);
    } else {
      setShowGuide(false);
    }
  }, [userHouseId]);

  const handleSelectHouse = (houseId) => {
    const house = HOUSES.find(h => h.id === houseId);
    if (!house) return;
    
    // Set the user's persistent loyalty
    setUserHouseId(houseId);
    setFocusedHouseId(houseId);
    setShowGuide(false); // Dismiss guide upon successful choice
  };

  const handleLaunchMap = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    sfx.playClick();
    
    // Read fresh state directly — avoids any stale closure issues
    const storeState = useStore.getState();
    const targetHouseId = storeState.userHouseId || storeState.focusedHouseId || 'iboga';
    const targetHouse = HOUSES.find(h => h.id === targetHouseId);
    
    if (!targetHouse) {
      console.error('[HUD] LAUNCH FAILED: No valid house found. userHouseId:', storeState.userHouseId);
      return;
    }

    console.log('[HUD] Launching map for house:', targetHouse.id);
    setSelectedHouse(targetHouse);
    // Go directly to map — skip transition intermediate state
    setView('map');
  };

  const handleBackToMenu = () => {
    sfx.playClick();
    setInHouseView(false); // Lower the active command deck back to Global view
    setActiveCommandTab(null);
  };

  // Navigation tabs logic
  const NAV_ITEMS = [
    { id: 'play', label: 'PLAY', icon: Play },
    { id: 'world', label: 'WORLD', icon: Map },
    { id: 'timeline', label: 'TIMELINE', icon: Rss },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'missions', label: 'MISSIONS', icon: Target },
    { id: 'store', label: 'STORE', icon: ShoppingBag }
  ];

  const handleNavClick = (tabId) => {
    sfx.playClick(); 
    
    // Enforce Alignment if trying to enter locked systems
    if (!userHouseId) {
       setCeremonyActive(true);
       return;
    }

    // If user IS aligned, hitting 'PLAY' boosts them directly into the Active House View console!
    if (tabId === 'play') {
      setInHouseView(true);
      return;
    }

    setActiveCommandTab(activeCommandTab === tabId ? null : tabId);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-5 sm:p-6 z-20 select-none font-sans overflow-hidden">
      
      {/* ============================== UNIFIED TOP HUD COMMAND SYSTEM ============================== */}
      {inHouseView ? (
        // ==================== STATE A: WIDESCREEN UNIFIED HOUSE HEADER ====================
        <header 
          className="fixed top-0 left-0 w-full z-50 pointer-events-auto bg-slate-950/40 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          
          {/* --- LEFT: BRANDED LOGO ARCHITECTURE --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center space-x-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
              <Globe2 style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${themeColor}80)` }} size={18} />
              <div className="flex flex-col">
                <span className="text-[12px] font-black tracking-[0.2em] text-white uppercase leading-tight">Zura Earth</span>
                <span className="text-[7px] font-mono opacity-70 tracking-[0.1em] uppercase" style={{ color: themeColor }}>Sector 01 Online</span>
              </div>
            </div>
            
            {/* Compact Status (House context) */}
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${themeColor}15`, border: `1px solid ${themeColor}40` }}>
                <Hexagon size={12} style={{ color: themeColor }} fill="currentColor" className="opacity-70" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{currentUserHouse.name}</span>
            </div>
          </motion.div>

          {/* --- CENTER: CORE SUB-SYSTEM NAVIGATION --- */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-2xl px-1 py-1"
          >
             {[
               { id: 'world', label: 'WORLD', icon: Map },
               { id: 'timeline', label: 'TIMELINE', icon: Rss },
               { id: 'store', label: 'STORE', icon: ShoppingBag },
             ].map((item) => {
               const Icon = item.icon;
               const isActive = activeCommandTab === item.id;
               return (
                 <button 
                   key={item.id} 
                   onClick={() => handleNavClick(item.id)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all group ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                 >
                   <Icon size={14} style={{ color: isActive ? themeColor : 'rgba(255,255,255,0.4)' }} />
                   <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white/60 transition-colors" style={{ color: isActive ? themeColor : 'inherit' }}>
                     {item.label}
                   </span>
                 </button>
               );
             })}
             
             <div className="w-[1px] h-4 bg-white/10 mx-1" />
             
             <button 
               onClick={handleBackToMenu}
               className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-red-400/70 hover:text-red-400 hover:bg-red-500/10 group"
             >
               <LogOut size={14} />
               <span className="text-[9px] font-black tracking-[0.15em] uppercase">Exit</span>
             </button>
          </motion.nav>

          {/* --- RIGHT: COMS & OPERATIONS CENTER --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >


            <button 
              onClick={() => setActiveCommandTab('notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] transition-all relative group"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 6px ${themeColor}` }} />
            </button>
            <button 
              onClick={() => setActiveCommandTab('profile')}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <User size={16} />
            </button>
            <button 
              onClick={() => setActiveCommandTab('settings')}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Settings size={16} />
            </button>
          </motion.div>
        </header>
      ) : (
        // ==================== STATE B: DEFAULT SEPARATE FLOATING BLOCKS (UNASSIGNED) ====================
        <>
          <header className="flex justify-between items-start w-full relative z-30">
            {/* TOP LEFT: Identity & House Station */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex flex-col gap-3 pointer-events-auto"
            >
              <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-xl border border-white/10 pl-4 pr-6 py-2 rounded-full shadow-2xl shadow-black/50">
                <Globe2 style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${themeColor}80)` }} size={18} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-black tracking-[0.25em] text-white uppercase leading-tight">Zura Earth</span>
                  <span className="text-[8px] font-mono opacity-70 tracking-[0.15em] uppercase" style={{ color: themeColor }}>Sector 01 online</span>
                </div>
              </div>
              
              <div className="min-w-[280px] bg-slate-950/50 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] flex flex-col">
                {userHouseId ? (
                  // --- ASSIGNED PROFILE (PERMANENT ID) ---
                  <div className="px-5 py-4 flex items-center bg-gradient-to-br from-white/[0.03] to-transparent border-b border-white/5">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center border mr-3" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}40` }}>
                       <Shield size={14} style={{ color: themeColor }} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold tracking-widest mb-0.5" style={{ color: themeColor }}>ALIGNED OPERATIVE</span>
                        <span className="text-xs font-black text-white tracking-widest uppercase">{currentUserHouse.name} NODE</span>
                     </div>
                  </div>
                ) : (
                  // --- TRULY UNASSIGNED PROXY ---
                  <div className="px-5 py-4 flex items-center bg-gradient-to-br from-white/[0.03] to-transparent border-b border-white/5">
                     <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30 mr-3">
                       <Shield size={14} className="text-amber-400 animate-pulse" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-amber-400/60 font-bold tracking-widest mb-0.5">Awaiting Protocols</span>
                        <span className="text-xs font-black text-white tracking-widest uppercase">Unassigned Node</span>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
  
            {/* TOP RIGHT: Comms & Ops */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-2.5 pointer-events-auto"
            >
              <button 
                onClick={() => setActiveCommandTab('notifications')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950/40 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-slate-900/60 transition-all shadow-lg relative group"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full group-hover:scale-125 transition-all" style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${themeColor}` }} />
              </button>
              <button 
                onClick={() => setActiveCommandTab('profile')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950/40 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-slate-900/60 transition-all shadow-lg"
              >
                <User size={18} />
              </button>
              <button 
                onClick={() => setActiveCommandTab('settings')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950/40 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-slate-900/60 transition-all shadow-lg"
              >
                <Settings size={18} />
              </button>
            </motion.div>
          </header>
  

        </>
      )}


      {/* ============================== CENTER INTERACTIVE LAYER ============================== */}
      <main className="flex-1 relative w-full flex items-center justify-between px-4 pointer-events-none">
        {/* NO LONGER INHABITED BY LEGACY ALIGNMENT SIDEBARS */}
      </main>


      {/* ============================== BOTTOM COMMAND DOCK ============================== */}
      <footer className="relative z-40 w-full flex justify-center pb-4 pointer-events-auto">
        {inHouseView ? (
          // ASSIGNED STATE: ISOLATED BIG PLAY BUTTON
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={handleLaunchMap}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="group relative pointer-events-auto flex items-center gap-4 px-10 py-4 rounded-2xl overflow-hidden transition-all active:scale-95 shadow-2xl cursor-pointer"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', border: `1px solid ${themeColor}40` }}
          >
             <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: themeColor }} />
             <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />
             
             <Play size={20} fill={themeColor} style={{ color: themeColor, filter: `drop-shadow(0 0 10px ${themeColor}80)` }} className="group-hover:scale-110 transition-transform" />
             
             <div className="flex flex-col items-start">
                <span className="text-[9px] font-black tracking-[0.3em] text-white/50 uppercase leading-none mb-1">Initialize</span>
                <span className="text-xl font-black tracking-[0.25em] text-white uppercase leading-none">Play Now</span>
             </div>

             {/* Dynamic underglow line */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] blur-[2px]" style={{ backgroundColor: themeColor }} />
          </motion.button>
        ) : (
          // UNASSIGNED STATE: STANDARD HUB NAV
          <motion.nav 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
            className="flex items-center px-3 py-2.5 bg-slate-950/50 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] pointer-events-auto relative overflow-hidden group"
          >
            {/* Inner Glass Edge Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
  
            {NAV_ITEMS.map((tab) => {
              const isActive = activeCommandTab === tab.id;
              const isLocked = !userHouseId && ['play', 'profile', 'missions', 'timeline'].includes(tab.id);
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id)}
                  className={`relative group flex flex-col items-center justify-center w-20 sm:w-24 h-14 rounded-xl transition-all duration-300 overflow-hidden
                    ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.04]'}
                    ${isLocked ? 'cursor-not-allowed grayscale opacity-50' : ''}
                  `}
                  style={{ borderBottom: isActive ? `2px solid ${themeColor}` : 'none' }}
                >
                  {/* Selection Bar Indication */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabNav"
                        className="absolute inset-0 rounded-xl"
                        style={{ borderColor: `${themeColor}40`, borderWidth: '1px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] shadow-xl" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
  
                   <div className="relative">
                     <Icon 
                       size={18} 
                       className="mb-1.5 transition-all duration-300"
                       style={{ 
                         color: isActive ? themeColor : 'rgba(255,255,255,0.4)',
                         filter: isActive ? `drop-shadow(0 0 8px ${themeColor}60)` : 'none',
                         transform: isActive ? 'scale(1.1)' : 'scale(1)'
                       }} 
                     />
                     {isLocked && (
                       <div className="absolute -top-1 -right-1 bg-black/80 p-0.5 rounded-full border border-white/10">
                         <Shield size={8} className="text-amber-400" />
                       </div>
                     )}
                  </div>
                  <span className="text-[9px] font-black tracking-[0.15em] uppercase transition-all duration-300"
                    style={{ color: isActive ? themeColor : 'rgba(255,255,255,0.4)' }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </footer>
      
      {/* ============================== CORNER HUD OVERLAY (GLOBAL ANCHORED) ============================== */}
      {/* ============================== UNIFIED SYMMETRIC TACTICAL DECK ============================== */}
      <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 pointer-events-none z-50 flex flex-col justify-end items-stretch">
        
        {/* 🚀 THE UPPER HORIZON: PASSPORT & CHRONO SYSTEM */}
        <div className="flex justify-between items-end mb-[160px]">
           {/* LEFT: Personal Operative Passport */}
           <div className="flex-1 hidden md:flex justify-start items-end pointer-events-none">
             {userHouseId && (
               <motion.div 
                 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                 className="min-w-[280px] bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col pointer-events-auto"
               >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                     <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: `radial-gradient(circle, ${themeColor}40 0%, ${themeColor}10 100%)`, border: `1px solid ${themeColor}30` }}>
                       <User size={16} style={{ color: themeColor }} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">AlphaNode</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest opacity-80" style={{ color: themeColor }}>Sapien Vector Lvl 12</span>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 divide-x divide-white/5 bg-black/30">
                     <div className="px-4 py-2.5">
                        <div className="text-[7px] text-white/40 uppercase font-mono tracking-wider mb-0.5">Karma Reserves</div>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                           <Zap size={10} fill={themeColor} className="opacity-90" style={{ color: themeColor }} />
                           {karmaScore.toLocaleString()}
                        </div>
                     </div>
                     <div className="px-4 py-2.5">
                        <div className="text-[7px] text-white/40 uppercase font-mono tracking-wider mb-0.5">House Standings</div>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                           <Trophy size={10} className="text-amber-400/80" fill="currentColor" />
                           {userRank}
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}
           </div>

           {/* RIGHT: Unified Chrono Matrix (Matched Symmetry) */}
           <div className="flex-1 hidden lg:flex justify-end items-end pointer-events-none">
             <motion.div 
               initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
               className="min-w-[280px] bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col pointer-events-auto"
             >

                
                <div className="grid grid-cols-2 divide-x divide-white/5 bg-black/30">
                   <div className="px-4 py-2.5">
                      <div className="text-[7px] text-white/40 uppercase font-mono tracking-wider mb-0.5">System Time</div>
                      <div className="text-sm font-black text-white tracking-widest font-mono">
                         {cognitiveTime.split('(')[0] || "00:00:00"}
                      </div>
                   </div>
                   <div className="px-4 py-2.5 text-right flex flex-col items-end">
                      <div className="text-[7px] text-white/40 uppercase font-mono tracking-wider mb-0.5">Zone Matrix</div>
                      <div className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-full">
                         {cognitiveTime.split('(')[1]?.replace(')', '') || "LOCATING..."}
                      </div>
                   </div>
                </div>
             </motion.div>
           </div>
        </div>

        {/* 🌍 THE LOWER HORIZON: LEADERBOARD & UTILITIES */}
        <div className="flex justify-between items-end w-full">
           {/* LEFT: Core House Rankings */}
           <div className="flex-1 hidden md:flex justify-start pointer-events-none">
             <HouseLeaderboard />
           </div>

           {/* RIGHT: Diagnostic & Audio Metrics */}
           <div className="flex-1 hidden lg:flex flex-col items-end gap-4 pointer-events-none">
             <div className="bg-black/30 px-4 py-2 backdrop-blur min-w-[180px] border-b border-b-white/5 pointer-events-auto" style={{ borderRight: `2px solid ${themeColor}` }}>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5 opacity-80" style={{ color: themeColor }}>Global Karma Points</div>
                <div className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center justify-end gap-2">
                  345 <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 6px ${themeColor}` }} />
                </div>
             </div>
             <AudioDeck />
           </div>
        </div>

      </div>
      
    </div>
  );
}
