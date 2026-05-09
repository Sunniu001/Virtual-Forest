"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Globe2, Shield, Activity, Cpu, Leaf, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import { HOUSES } from '@/lib/constants';

export default function HUD() {
  const hoveredHouseId = useStore((state) => state.hoveredHouseId);
  const setHoveredHouseId = useStore((state) => state.setHoveredHouseId);
  const setFocusedHouseId = useStore((state) => state.setFocusedHouseId);
  const utcTimeString = useStore((state) => state.utcTimeString);
  const setUtcTimeString = useStore((state) => state.setUtcTimeString);
  const setView = useStore((state) => state.setView);
  const setSelectedHouse = useStore((state) => state.setSelectedHouse);

  // Update Clock from React side to dynamically display user's local timezone at normal interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tzString = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ');
      const timeFormatted = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setUtcTimeString(`${timeFormatted} (${tzString})`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [setUtcTimeString]);

  const handleSelectHouse = (house) => {
    setSelectedHouse(house);
    setView('transition');
    setTimeout(() => {
      setView('map');
    }, 2000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-8 z-10 select-none">
      
      {/* Top Holographic Panel */}
      <header className="flex justify-between items-start w-full">
        <div className="flex items-center space-x-4 pointer-events-auto bg-slate-950/40 backdrop-blur-md border border-slate-800/80 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(15,23,42,0.5)]">
          <Globe2 className="text-blue-400 animate-pulse" size={32} />
          <div>
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Zura</h1>
            <p className="text-[10px] text-blue-400/80 uppercase tracking-[0.3em] font-mono mt-1 flex items-center gap-1.5">
              <Activity size={10} className="text-blue-400" />
              PLANETARY CONSCIOUSNESS INDEX
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 pointer-events-auto bg-slate-950/40 backdrop-blur-md border border-slate-800/80 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(15,23,42,0.5)] font-mono">
          <div className="text-right flex flex-col items-end border-r border-slate-800 pr-6">
            <span className="text-[10px] text-slate-500 tracking-widest uppercase mb-1">COGNITIVE TIME</span>
            <span className="text-sm font-semibold text-emerald-400">{utcTimeString}</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-slate-500 tracking-widest uppercase mb-1">GLOBAL FLOURISHING</span>
            <span className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
              <Cpu size={12} className="text-blue-400 animate-pulse" />
              84.22%
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar: Selected House Navigation */}
      <div className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3 pointer-events-auto z-20 max-w-[320px] w-full">
        <div className="bg-slate-950/30 backdrop-blur-sm border border-slate-900/50 p-4 rounded-2xl mb-2">
          <h3 className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase flex items-center gap-2">
            <Shield size={12} className="text-slate-500" />
            SELECT ORIGIN HOUSE
          </h3>
        </div>

        {HOUSES.map((house) => {
          const isHovered = hoveredHouseId === house.id;
          return (
            <div
              key={house.id}
              onMouseEnter={() => {
                setHoveredHouseId(house.id);
                setFocusedHouseId(house.id);
              }}
              onMouseLeave={() => {
                setHoveredHouseId(null);
                setFocusedHouseId(null);
              }}
              onClick={() => handleSelectHouse(house)}
              className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                isHovered 
                  ? 'bg-slate-900/60 border-slate-700/80 shadow-[0_0_20px_rgba(15,23,42,0.6)] translate-x-2' 
                  : 'bg-slate-950/40 border-slate-800/40 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: house.color,
                      boxShadow: isHovered ? `0 0 12px ${house.color}` : 'none'
                    }}
                  />
                  <span className="text-base font-semibold tracking-wide text-slate-200 group-hover:text-white">
                    {house.name}
                  </span>
                </div>
                {isHovered && (
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full">
                    <Eye size={8} /> FOCUS
                  </span>
                )}
              </div>

              {isHovered ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2 space-y-1.5"
                >
                  <p className="leading-relaxed text-[11px]">{house.identity}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                    <span>NODES: <strong className="text-slate-300">{house.stats.nodes}</strong></span>
                    <span>HEALTH: <strong className="text-emerald-400">{house.stats.flourishing}</strong></span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-[10px] font-mono text-slate-500 flex justify-between mt-1">
                  <span>NODES: {house.stats.nodes}</span>
                  <span style={{ color: `${house.color}b0` }}>{house.stats.flourishing}</span>
                </div>
              )}
            </div>
          );
        })}
        {/* Master World Map Action Button */}
        <div 
          onClick={() => handleSelectHouse({
            id: 'world',
            name: 'World Map',
            color: '#10b981',
            clans: ['Kirdi District', 'Koro District', 'Iteso District', 'Hausa-Fulani District', 'Oromo District', 'San(Bushmen) District', 'Tswana District', 'Masaai District', 'Bemba District', 'Pygmies District'],
            stats: { nodes: '200', flourishing: '100%' }
          })}
          className="group flex items-center justify-between p-4 rounded-2xl border bg-slate-900/80 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-950/60 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <div className="flex items-center space-x-3">
            <Globe2 className="text-emerald-400 group-hover:scale-110 transition-transform duration-300 animate-pulse" size={18} />
            <span className="text-xs font-bold tracking-[0.1em] text-emerald-300 uppercase group-hover:text-emerald-200">
              Master World Map
            </span>
          </div>
          <span className="text-[8px] font-mono text-emerald-400/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest bg-emerald-500/10">
            LAUNCH
          </span>
        </div>
      </div>

      {/* Bottom Informational HUD */}
      <footer className="w-full flex justify-between items-end">
        <div className="pointer-events-auto bg-slate-950/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl max-w-[280px] shadow-[0_0_30px_rgba(15,23,42,0.5)]">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">COGNITIVE BIO-NETWORK</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Holographic connection with localized ecosystems. Tap house points on the globe to explore detailed district biomes.
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-3 pointer-events-auto bg-slate-950/40 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(15,23,42,0.5)] text-xs font-mono text-slate-500">
          <Leaf size={14} className="text-emerald-400 animate-pulse" />
          <span>SYS STATUS: <strong className="text-emerald-400">FLOURISHING</strong></span>
        </div>
      </footer>
      
    </div>
  );
}
