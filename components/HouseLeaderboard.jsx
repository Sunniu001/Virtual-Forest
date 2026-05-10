"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Hexagon, User } from 'lucide-react';
import { HOUSES } from '@/lib/constants';

// Cumulative Global Faction Parity Data
const GLOBAL_HOUSE_STANDINGS = [
  { id: 'iboga', karma: 45820 },
  { id: 'datura', karma: 41200 },
  { id: 'ayahuasca', karma: 38950 },
  { id: 'peyote', karma: 36110 },
  { id: 'kava', karma: 32440 }
];

// Internal Top Operatives (Mocked per house access)
const INTERNAL_HOUSE_MEMBERS = [
  { name: 'AlphaNode', karma: 12850, designation: 'House Monitor' },
  { name: 'Genesis_01', karma: 11420, designation: 'Vice Monitor' },
  { name: 'ECHO-7', karma: 9840, designation: 'Field Warden' },
  { name: 'ZuraOps', karma: 8750, designation: 'Operative' },
  { name: 'RootUser', karma: 7910, designation: 'Operative' }
];

export default function HouseLeaderboard() {
  const userHouseId = useStore((state) => state.userHouseId);
  const currentUserHouse = HOUSES.find(h => h.id === userHouseId);
  
  // Dynamic theme injection: fallback to standard emerald if unassigned
  const themeColor = currentUserHouse ? currentUserHouse.color : '#10b981';

  // Calculate current mode dynamically
  const isAligned = !!userHouseId;

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="pointer-events-auto bg-slate-950/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.5)] w-[280px] overflow-hidden relative"
    >
      {/* Top Border Dynamic Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-700" style={{ backgroundColor: themeColor, opacity: 0.6 }} />
      
      <header className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy size={12} style={{ color: themeColor }} className="transition-colors duration-700" />
          <h3 className="text-[9px] font-mono text-white/60 uppercase tracking-[0.2em]">
            {isAligned ? `${currentUserHouse.name} Ranks` : 'House Parity'}
          </h3>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded tracking-widest uppercase">
          {isAligned ? 'INTERNAL' : 'GLOBAL'}
        </span>
      </header>

      <AnimatePresence mode="wait">
        {!isAligned ? (
          // MODE A: GLOBAL FACTION RANKINGS (DEFAULT)
          <motion.div 
            key="global"
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-2"
          >
            {GLOBAL_HOUSE_STANDINGS.map((rankData, idx) => {
              const house = HOUSES.find(h => h.id === rankData.id);
              if (!house) return null;
              const isTop = idx === 0;
              return (
                <div key={house.id} className="flex items-center justify-between p-2 rounded-xl transition-all hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                     <div className="w-4 text-center flex items-center justify-center">
                       {isTop ? <Crown size={11} className="text-amber-400" /> : <span className="text-[10px] font-mono text-white/40 font-bold">{idx + 1}</span>}
                     </div>
                     <Hexagon size={12} fill={house.color} style={{ color: house.color, filter: `drop-shadow(0 0 4px ${house.color}80)` }} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{house.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-white font-mono tracking-wider">{rankData.karma.toLocaleString()}</span>
                </div>
              );
            })}
          </motion.div>
        ) : (
          // MODE B: INTERNAL HOUSE OPERATIVE RANKINGS
          <motion.div 
            key="internal"
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-2"
          >
            {INTERNAL_HOUSE_MEMBERS.map((member, idx) => {
              const isTop = idx === 0;
              const hasDesignation = idx < 3;
              return (
                <div key={member.name} className={`flex items-center justify-between p-2 rounded-xl transition-all hover:bg-white/[0.03] ${isTop ? 'bg-white/[0.02]' : ''}`}>
                  <div className="flex items-center gap-3">
                     <div className="w-4 text-center flex items-center justify-center">
                       {isTop ? <Crown size={11} className="text-amber-400" /> : <span className="text-[10px] font-mono text-white/30 font-bold">{idx + 1}</span>}
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">{member.name}</span>
                           {hasDesignation && <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />}
                        </div>
                        {hasDesignation && (
                           <span className="text-[8px] font-mono uppercase tracking-widest font-bold transition-colors" style={{ color: themeColor, filter: 'brightness(1.2)' }}>
                             {member.designation}
                           </span>
                        )}
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-white font-mono tracking-wider">{member.karma.toLocaleString()}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Subspace Aesthetic Pattern */}
      <div className="absolute bottom-[-20px] right-[-10px] opacity-[0.03] pointer-events-none">
        <Medal size={100} className="text-white" />
      </div>
    </motion.div>
  );
}


