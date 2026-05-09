"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { Globe2 } from 'lucide-react';

export default function MapOverlay() {
  const selectedHouse = useStore((state) => state.selectedHouse);
  const resetToGlobe = useStore((state) => state.resetToGlobe);
  const activeHexCount = useStore((state) => state.activeHexCount);
  const totalHexes = useStore((state) => state.totalHexCount);
  const doneHexes = useStore((state) => state.doneHexCount);

  if (!selectedHouse) return null;

  const isIboga = selectedHouse.id === 'iboga' || selectedHouse.id === 'world';
  const remainingHexes = totalHexes - doneHexes;
  const percentDone = totalHexes > 0 ? Math.round((doneHexes / totalHexes) * 100) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 sm:p-8 flex flex-col justify-between z-10 select-none">
      
      {/* Top Header */}
      <header className="flex justify-between items-start w-full">
        <button 
          onClick={resetToGlobe}
          className="pointer-events-auto flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 bg-slate-950/60 backdrop-blur border border-slate-800 hover:border-slate-700 px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(15,23,42,0.6)]"
        >
          <Globe2 size={16} />
          <span className="text-sm font-medium tracking-wide">Return to Planet</span>
        </button>

        <div className="flex items-center space-x-4 pointer-events-auto bg-slate-950/60 backdrop-blur border border-slate-800 px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(15,23,42,0.6)]">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block mb-1">TERRITORIAL SECTOR</span>
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse" style={{backgroundColor: selectedHouse.color, color: selectedHouse.color}} />
              {selectedHouse.name} House
            </span>
          </div>
        </div>
      </header>

      {/* World Map minimalist stats card & Cyber HUD */}
      {selectedHouse.id === 'world' && (
        <React.Fragment>
          {/* Top-Left Cyber HUD */}
          <div className="absolute left-6 sm:left-8 top-24 flex flex-col space-y-4 pointer-events-auto z-10 w-72">
            <div className="bg-slate-950/75 backdrop-blur-md border border-emerald-500/30 p-5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-3 font-semibold">
                <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-400 uppercase">
                  GLOBAL FACTIONS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase">
                  COGNITION ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">RES (COGNITION)</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">3</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">PLOTS MAPPED</span>
                  <span className="text-2xl font-bold font-mono text-white">1,000</span>
                </div>
              </div>

              {/* Faction color index */}
              <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-2">FACTION SECTOR ASSIGNMENTS</span>
                
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />
                    Africa (Iboga)
                  </span>
                  <span className="text-slate-400 font-semibold">330 Plots</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#eab308', boxShadow: '0 0 6px #eab308' }} />
                    N. America (Peyote)
                  </span>
                  <span className="text-slate-400 font-semibold">200 Plots</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                    S. America (Ayahuasca)
                  </span>
                  <span className="text-slate-400 font-semibold">130 Plots</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
                    Oceania (Ayahuasca)
                  </span>
                  <span className="text-slate-400 font-semibold">60 Plots</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
                    Asia / SE Asia (Datura)
                  </span>
                  <span className="text-slate-400 font-semibold">280 Plots</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top-Right Stats Card */}
          <div className="absolute right-6 sm:right-8 top-24 flex flex-col items-end space-y-4 pointer-events-none z-10 w-72">
            <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl pointer-events-auto w-full">
              <h4 className="text-[10px] font-mono tracking-widest uppercase mb-3 flex items-center justify-between text-indigo-400">
                <span>GLOBAL BIOSPHERE STATUS</span>
                <span className="px-2 py-0.5 rounded-full text-[8px] border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                  MASTER SYSTEM
                </span>
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Hexagons</span>
                  <span className="text-3xl font-bold text-white font-mono">{activeHexCount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-900 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>SECURED NETWORKS:</span>
                  <span className="text-indigo-400 font-bold">5 CONTINENTS</span>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

      {/* Right Sidebar panels */}
      {selectedHouse.id !== 'world' && (
        <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col items-end space-y-4 pointer-events-none z-10 w-72">
          
          {/* Dynamic House Overall Status Dashboard Card */}
          <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl pointer-events-auto w-full">
            <h4 className="text-[10px] font-mono tracking-widest uppercase mb-3 flex items-center justify-between" style={{ color: selectedHouse.color }}>
              <span>HOUSE OVERALL STATUS</span>
              <span 
                className="px-2 py-0.5 rounded-full text-[8px] border" 
                style={{ 
                  backgroundColor: `${selectedHouse.color}15`, 
                  borderColor: `${selectedHouse.color}40`,
                  color: selectedHouse.color
                }}
              >
                {selectedHouse.name.toUpperCase()}
              </span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Hexagons</span>
                  <span className="text-2xl font-bold text-white font-mono">{totalHexes}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Completion</span>
                  <span className="text-sm font-semibold text-emerald-400 font-mono">{percentDone}%</span>
                </div>
              </div>

              {/* Glowing tactical progress bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-[1px]">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${percentDone}%`,
                    background: `linear-gradient(to right, ${selectedHouse.color}, #6366f1)`,
                    boxShadow: `0 0 8px ${selectedHouse.color}80`
                  }} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-center">
                <div className="p-1.5 rounded-lg bg-slate-900/30">
                  <span className="text-[9px] text-slate-500 font-mono block">SEEDED (DONE)</span>
                  <span className="text-xs font-bold font-mono" style={{ color: selectedHouse.color }}>{doneHexes}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/30">
                  <span className="text-[9px] text-slate-500 font-mono block">REMAINS</span>
                  <span className="text-xs font-bold text-slate-300 font-mono">{remainingHexes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Territory states legend */}
          <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl pointer-events-auto w-full">
            <h4 className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-4">TERRITORY STATES</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border border-[#1b2332] bg-[#101520]" />
                <span className="text-slate-400">Locked Wilderness</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border flex items-center justify-center" style={{borderColor: selectedHouse.color, backgroundColor: `${selectedHouse.color}22`}} />
                <span className="text-emerald-400 font-medium">Available (Free to plant)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border" style={{borderColor: selectedHouse.color, backgroundColor: `${selectedHouse.color}88`}} />
                <span className="text-slate-300">Reserved (7d Gestation)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md shadow-[0_0_10px_currentColor] animate-pulse" style={{backgroundColor: selectedHouse.color, color: selectedHouse.color}} />
                <span className="text-white">Flourishing Dome</span>
              </div>
            </div>
          </div>

          {/* Districts / Countries list with live counts & stats */}
          <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl pointer-events-auto p-5 w-full max-h-[50vh] overflow-y-auto hidden sm:block scrollbar-thin scrollbar-thumb-slate-800">
            <h4 className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-4 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span>{isIboga ? "AFRICAN SECTORS" : "SECTOR DISTRICTS"}</span>
              <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-mono border border-slate-800">{selectedHouse.clans?.length || 0}</span>
            </h4>
            <div className="space-y-2">
              {(() => {
                const clansToRender = selectedHouse.clans || [];

                return (
                  <>
                    <span className="hidden select-none" id="clan-count-helper">{clansToRender.length}</span>
                    {clansToRender.map((clan, index) => {
                      const bulletColor = selectedHouse.color;
                      const totalVal = 15 + (index % 3) * 5;
                      const activeVal = Math.round(totalVal * 0.25);
                      const gestatingVal = Math.round(totalVal * 0.15);
                      
                      return (
                        <div 
                          key={clan} 
                          className="flex flex-col p-2.5 rounded-xl hover:bg-slate-900/40 transition-colors cursor-default group border border-transparent hover:border-slate-800/80"
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full shadow-sm" style={{backgroundColor: bulletColor, boxShadow: `0 0 8px ${bulletColor}`}} />
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{clan}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60 group-hover:text-white transition-colors">
                              {totalVal} Hex
                            </span>
                          </div>
                          
                          {/* Stats detail row */}
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pl-4 w-full">
                            <span>Active: <strong className="text-slate-300">{activeVal}</strong></span>
                            <span>Gestating: <strong className="text-slate-300">{gestatingVal}</strong></span>
                            <span>Status: <strong style={{color: bulletColor}} className="opacity-90">LIVE</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Bottom info */}
      <footer className="w-full flex justify-between items-end">
        <div className="pointer-events-auto bg-slate-950/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl max-w-[280px] shadow-[0_0_20px_rgba(15,23,42,0.6)]">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
            {selectedHouse.id === 'world' ? "GLOBAL BIOSPHERE" : "DISTRICT MAP NAVIGATION"}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {selectedHouse.id === 'world' ? (
              <span>Move mouse to explore. Hovering over territories reveals global biosphere data across all active continents.</span>
            ) : (
              <span>Move mouse to analyze hex cells. Hovering reveals coordinates. Click an <strong>available</strong> cell to claim territory.</span>
            )}
          </p>
        </div>
      </footer>

    </div>
  );
}
