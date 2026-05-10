"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, X, Leaf } from 'lucide-react';

const HEX_STATES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  GROWING: 'growing',
  FLOURISHING: 'flourishing'
};

export default function PlantingModal({ hex, house, onClose }) {
  const [planting, setPlanting] = useState(false);

  const handlePlant = () => {
    setPlanting(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vf:planting-success', {
          detail: { 
            id: hex.id, 
            clan: hex.clan, 
            lat: parseFloat(hex.q), 
            lng: parseFloat(hex.r) 
          }
        }));
      }
      setPlanting('done');
    }, 1200);
  };

  if (planting === 'done') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border-emerald-500/50 border-2 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Sprout size={40} className="text-emerald-400" />
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Seed Committed</h2>
          
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed mb-8">
            <p>
              Targeting array locked. Your seed has been successfully deployed to <span className="text-emerald-400 font-bold">{hex.clan}</span>.
            </p>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest mb-2">Protocol: Next Steps</p>
              <p className="text-xs">
                Gestation takes **7 days**. You must return **every 24 hours** to synchronize biosphere levels (water). Failure to nurture will result in seedling expiration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
          >
            Acknowledge & Sync
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border-slate-700 border p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800"
            style={{ boxShadow: `0 0 20px ${house.color}40` }}
          >
            <Leaf size={28} style={{ color: house.color }} />
          </div>
          
          <h2 className="text-2xl font-semibold text-white">
            Claim Territory
          </h2>
          
          <p className="text-slate-300 text-sm leading-relaxed">
            Planting a seed here will reserve this hex for <strong>7 days</strong>. 
            Nurture it daily to permanently claim this territory for the <span style={{color: house.color}}>{house.name}</span> House.
          </p>

          <div className="bg-slate-800 border-slate-700 w-full p-4 rounded-lg flex justify-between items-center text-sm border">
            <div className="flex flex-col items-start">
              <span className="font-mono text-xs text-slate-400">COORDINATES</span>
              <span className="font-mono text-white">{hex.q}, {hex.r}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-xs text-slate-400">DISTRICT</span>
              <span className="text-white">{hex.clan}</span>
            </div>
          </div>

          <button
            onClick={handlePlant}
            disabled={planting}
            className="w-full py-3 px-6 rounded-lg font-medium text-white flex items-center justify-center space-x-2 transition-all"
            style={{ 
              backgroundColor: planting ? '#334155' : house.color,
              opacity: planting ? 0.7 : 1
            }}
          >
            {planting ? (
              <span className="animate-pulse">Planting Seed...</span>
            ) : (
              <React.Fragment>
                <span>Commit Seed</span>
                <Sprout size={18} />
              </React.Fragment>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
