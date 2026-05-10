"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, Globe2, Activity, AlertTriangle, 
  Zap, TreePine, Database, Radio, BarChart3, Layers, RefreshCw
} from 'lucide-react';
import { HOUSES } from '@/lib/constants';

const TELEMETRY_EVENTS = [
  {
    id: 1,
    type: 'Restoration',
    title: 'Canopy Density Increase Detected',
    details: 'District Kirdi reports a 12% expansion in deep mycorrhizal networks. Global sequestration potential optimized.',
    time: 'Active Now',
    severity: 'high',
    icon: TreePine,
    color: '#10b981'
  },
  {
    id: 2,
    type: 'Alert',
    title: 'Hydrological Shift Warning',
    details: 'Elevated runoff probabilities detected in Sector Ayahuasca upper basins. Automated terracing initiation recommended.',
    time: '14m ago',
    severity: 'medium',
    icon: AlertTriangle,
    color: '#f59e0b'
  },
  {
    id: 3,
    type: 'Achievement',
    title: 'Iboga Planetary Synchronization',
    details: 'Phase 4 milestones achieved. Faction operatives successfully interconnected 5,000 root nodes.',
    time: '2h ago',
    severity: 'low',
    icon: Shield,
    color: '#a855f7'
  },
  {
    id: 4,
    type: 'System',
    title: 'Flora-Net Mesh Upgrade Deployment',
    details: 'Diagnostic packet transmission complete. Sensor relay latency reduced to 12ms globally.',
    time: '5h ago',
    severity: 'low',
    icon: RefreshCw,
    color: '#3b82f6'
  }
];

export default function TimelineView() {
  const activeCommandTab = useStore((state) => state.activeCommandTab);
  const setActiveCommandTab = useStore((state) => state.setActiveCommandTab);
  const userHouseId = useStore((state) => state.userHouseId);

  const currentUserHouse = HOUSES.find(h => h.id === userHouseId);
  const themeColor = currentUserHouse ? currentUserHouse.color : '#10b981';

  const isVisible = activeCommandTab === 'timeline';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-3xl flex overflow-hidden"
        >
          <div className="max-w-7xl w-full mx-auto h-full flex flex-col relative px-6 py-6">
            
            {/* HEADER TACTICAL COMMAND */}
            <header className="w-full flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl border" style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}20` }}>
                  <Globe2 size={24} style={{ color: themeColor }} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase leading-tight">Planetary Intelligence Network</h1>
                  <p className="text-[9px] font-mono tracking-widest flex items-center gap-2 mt-0.5 opacity-80" style={{ color: themeColor }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                    LIVE ECOLOGICAL TELEMETRY FEED OVERRIDE
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setActiveCommandTab(null)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-xs font-bold flex items-center gap-3 uppercase tracking-widest transition-all shadow-xl"
              >
                <ArrowLeft size={14} /> Close Tactical Deck
              </button>
            </header>

            {/* MAIN OPERATIONS INTERFACE */}
            <main className="flex-1 flex gap-6 pt-6 overflow-hidden">
              
              {/* LEFT COLUMN: Real-Time Event Logs (The Stream) */}
              <div className="flex-[2] flex flex-col h-full bg-black/20 border border-white/5 rounded-2xl overflow-hidden flex shrink-0">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                   <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2"><Database size={12} /> Network Event Stream</span>
                   <span className="px-2 py-0.5 text-[8px] font-mono rounded border" style={{ backgroundColor: `${themeColor}20`, color: themeColor, borderColor: `${themeColor}30` }}>AUTO-SYNCING</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {TELEMETRY_EVENTS.map((evt) => {
                    const EventIcon = evt.icon;
                    return (
                      <motion.div 
                        key={evt.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="group p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all flex gap-5"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative" style={{ backgroundColor: `${evt.color}10`, border: `1px solid ${evt.color}30` }}>
                           <div className="absolute inset-0 blur-lg opacity-20" style={{ backgroundColor: evt.color }} />
                           <EventIcon size={22} style={{ color: evt.color }} />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60" style={{ color: evt.color }}>{evt.type} LOG</span>
                            <span className="text-[9px] font-mono text-white/30">{evt.time}</span>
                          </div>
                          <h3 className="text-white font-bold text-lg tracking-wide mb-2 group-hover:text-emerald-300 transition-colors">{evt.title}</h3>
                          <p className="text-xs text-white/60 leading-relaxed mb-3 font-light">{evt.details}</p>
                          
                          <div className="flex gap-2 mt-auto">
                            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/40 hover:text-white hover:border-white/30 transition-all uppercase">Inspect Node</button>
                            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/40 hover:text-white hover:border-white/30 transition-all uppercase">Map Vector</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: Diagnostic Modules & Visualizers */}
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                 
                 {/* Planetary Status Tile */}
                 <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} style={{ color: themeColor }} /></div>
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={12} /> Ecological Flux</h4>
                    <div className="flex flex-col">
                       <span className="text-3xl font-black text-white tracking-widest font-mono flex items-baseline gap-1">
                         92.4 <span className="text-xs font-bold" style={{ color: themeColor }}>%</span>
                       </span>
                       <span className="text-[9px] uppercase tracking-widest mt-1 opacity-80" style={{ color: themeColor }}>Current Sequestration Index</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden relative">
                       <motion.div 
                         initial={{ width: 0 }} animate={{ width: '92.4%' }} transition={{ duration: 1.5, ease: 'easeOut' }}
                         className="absolute inset-y-0 left-0" 
                         style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}80` }}
                       />
                    </div>
                 </div>

                 {/* Active Signals Monitor */}
                 <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex-1 flex flex-col">
                   <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Radio size={12} className="animate-pulse" /> Sub-Sector Signatures</h4>
                   <div className="flex-1 flex flex-col gap-3">
                     {[
                       { label: 'Amazonia Canopy', val: 'OPTIMAL', col: 'text-emerald-400' },
                       { label: 'Congo Basin', val: 'RECOVERING', col: 'text-blue-400' },
                       { label: 'Pacific Coastline', val: 'STABLE', col: 'text-emerald-400' },
                       { label: 'Boreal Shield', val: 'CRITICAL', col: 'text-amber-400' }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5">
                          <span className="text-[11px] text-white/70 font-bold tracking-wide">{item.label}</span>
                          <span className={`text-[9px] font-mono font-black ${item.col}`}>{item.val}</span>
                       </div>
                     ))}
                   </div>
                 </div>

              </div>
            </main>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
