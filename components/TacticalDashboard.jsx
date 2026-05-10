"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Zap, Target, Trophy, ShoppingCart, 
  Activity, Lock, Info, MessageSquare, Heart
} from 'lucide-react';

const DashboardContent = ({ id, onClose }) => {
  const contentMap = {
    missions: {
      title: 'Global Directives',
      subtitle: 'Environmental Recovery Missions',
      icon: Target,
      body: (
        <div className="space-y-3 mt-4">
          {[
            { t: 'Cognitive Pulse', d: 'Map 5 new coordinate hexes', r: '500 XP', p: 65 },
            { t: 'Deep Rooting', d: 'Plant 2 apex trees in district Kirdi', r: '800 XP', p: 20 },
            { t: 'Water Carrier', d: 'Check-in 3 days consecutively', r: '1500 XP', p: 0 }
          ].map((m, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:bg-white/[0.06] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">{m.t}</h4>
                  <p className="text-[10px] text-white/50 mt-0.5">{m.d}</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/30">{m.r}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${m.p}%` }} transition={{ duration: 1, delay: 0.3 }}
                  className="absolute top-0 left-0 bottom-0 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    store: {
      title: 'Arsenal Registry',
      subtitle: 'Unlockable ecosystem upgrades',
      icon: ShoppingCart,
      body: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { name: 'Super Sapling', cost: '1200 Karma', img: 'bg-emerald-500/20' },
            { name: 'Drone Scan', cost: '500 Karma', img: 'bg-blue-500/20' },
            { name: 'Deep Soil Patch', cost: '2500 Karma', img: 'bg-amber-500/20' },
            { name: 'Golden Can', cost: '4000 Karma', img: 'bg-purple-500/20' }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 rounded-xl p-3 flex flex-col gap-3 hover:border-white/20 transition-all cursor-pointer">
              <div className={`w-full h-24 rounded-lg ${item.img} flex items-center justify-center border border-white/5 relative overflow-hidden group`}>
                <Lock size={20} className="text-white/30 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">{item.name}</h4>
                <p className="text-[9px] font-mono text-emerald-300 mt-1 flex items-center gap-1"><Zap size={8} /> {item.cost}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    profile: {
      title: 'Operative Profile',
      subtitle: 'Cognitive interface registry',
      icon: Shield,
      body: (
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex items-center space-x-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-white">Z</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Zura User</h3>
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Level 14 Steward</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 flex flex-col">
              <span className="text-[8px] text-white/40 uppercase">Trees Matured</span>
              <span className="text-xl font-black text-white mt-1">42</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 flex flex-col">
              <span className="text-[8px] text-white/40 uppercase">Days Active</span>
              <span className="text-xl font-black text-white mt-1">18</span>
            </div>
          </div>

          <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all uppercase tracking-widest border border-white/10">
             Edit Interface Settings
          </button>
        </div>
      )
    },
    notifications: {
      title: 'Command Ingest',
      subtitle: 'Live sector transmissions',
      icon: Activity,
      body: (
        <div className="mt-4 flex flex-col gap-3">
          {[
            { t: 'System Alignment', d: 'Covenant protocols initialized successfully.', time: '2m ago', urgent: true },
            { t: 'Karma Boost', d: 'Received +50 from user field support.', time: '15m ago', urgent: false },
            { t: 'Environment Update', d: 'District weather sync completed.', time: '1h ago', urgent: false }
          ].map((n, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              {n.urgent && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    {n.urgent && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {n.t}
                  </h4>
                  <p className="text-[11px] text-white/60 mt-1 font-light leading-relaxed">{n.d}</p>
                </div>
                <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    settings: {
      title: 'System Configure',
      subtitle: 'Global operational preference',
      icon: Lock,
      body: (
        <div className="mt-4 flex flex-col gap-4">
          {[
            { l: 'Atmospheric Audio', desc: 'Ambient environment sfx', defaultOn: true },
            { l: 'High Fidelity Rendering', desc: '60 FPS Cinematic particles', defaultOn: true },
            { l: 'Telemetry HUD Data', desc: 'Show extended grid metrics', defaultOn: false }
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">{s.l}</h4>
                <p className="text-[9px] text-white/40 mt-0.5">{s.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full p-0.5 transition-all cursor-pointer ${s.defaultOn ? 'bg-emerald-500/80' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${s.defaultOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
          
          <div className="mt-4 border-t border-white/10 pt-6">
             <h4 className="text-[9px] text-white/40 uppercase tracking-widest mb-3">Visual Calibration</h4>
             <div className="w-full bg-white/5 h-2 rounded-full relative">
               <div className="absolute top-0 left-0 h-full w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
               <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500" />
             </div>
          </div>
        </div>
      )
    }
  };

  // Fallback for tabs like 'world' or 'play' that might have their own unique transitions
  const config = contentMap[id] || {
    title: id ? id.toUpperCase() : 'System',
    subtitle: 'Tactical operations deck',
    icon: Info,
    body: <div className="mt-8 text-center text-white/40 font-mono text-xs">Initializing Subsystem Grid...</div>
  };

  const Icon = config.icon;

  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-400/10 rounded-lg border border-emerald-500/20">
             <Icon size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest leading-tight">{config.title}</h2>
            <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider">{config.subtitle}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
         {config.body}
      </div>
    </div>
  );
};

export default function TacticalDashboard() {
  const activeCommandTab = useStore((state) => state.activeCommandTab);
  const setActiveCommandTab = useStore((state) => state.setActiveCommandTab);

  // Special routing: "World" is technically the map view handled in ZuraApp already,
  // and "Play" might be a specific prompt, so let's handle them implicitly or customly.
  
  // Don't render overlay for 'world' since it triggers the specific full Map View transition in ZuraApp
  const isDashboardVisible = activeCommandTab && activeCommandTab !== 'world';

  return (
    <AnimatePresence>
      {isDashboardVisible && (
        <>
          {/* Global Dark Dimmer Overlay behind panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCommandTab(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer pointer-events-auto"
          />

          {/* Slide-Out Glass Cinematic Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-slate-950/60 backdrop-blur-3xl border-l border-white/10 z-50 shadow-[-20px_0_80px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto"
          >
            {/* Futuristic Left Edge Glow for depth */}
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
            
            <DashboardContent 
              id={activeCommandTab} 
              onClose={() => setActiveCommandTab(null)} 
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
