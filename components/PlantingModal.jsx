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
        window.dispatchEvent(new CustomEvent('updateHexState', {
          detail: { id: hex.id, newState: HEX_STATES.RESERVED }
        }));
      }
      onClose();
    }, 1200);
  };

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
