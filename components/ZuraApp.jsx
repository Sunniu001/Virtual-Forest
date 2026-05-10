"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Loader2 } from 'lucide-react';

import HUD from './HUD';
import MapOverlay from './MapOverlay';
import HexGridCanvas from './HexGridCanvas';
import PlantingModal from './PlantingModal';
import TitleScreen from './TitleScreen';
import TacticalDashboard from './TacticalDashboard';
import TimelineView from './TimelineView';
import AlignmentCeremony from './AlignmentCeremony';

// Dynamically import the Three.js WebGL container with SSR disabled
// to completely prevent any reference errors or canvas crashes during SSR compilation
const ZuraGlobe = dynamic(() => import('./ZuraGlobe'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] text-slate-400">
      <Globe2 className="animate-spin text-blue-500/80 mb-4" size={48} />
      <span className="text-xs font-mono tracking-[0.3em] animate-pulse uppercase text-blue-400/80">BOOTING PLANETARY COGNITION...</span>
    </div>
  )
});

// Dynamically import our custom Deck.gl land-masked map with SSR disabled
const DeckGLMap = dynamic(() => import('./DeckGLMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] text-slate-400 font-mono">
      <Loader2 className="animate-spin text-emerald-400 mb-4" size={48} />
      <span className="text-xs font-semibold tracking-[0.25em] animate-pulse uppercase text-emerald-400/80">BOOTING TACTICAL GRID ENGINE...</span>
    </div>
  )
});

export default function ZuraApp() {
  const view = useStore((state) => state.view);
  const setView = useStore((state) => state.setView);
  const selectedHouse = useStore((state) => state.selectedHouse);
  const setSelectedHouse = useStore((state) => state.setSelectedHouse);
  const selectedHex = useStore((state) => state.selectedHex);
  const setSelectedHex = useStore((state) => state.setSelectedHex);
  
  const activeCommandTab = useStore((state) => state.activeCommandTab);
  const setActiveCommandTab = useStore((state) => state.setActiveCommandTab);
  const userHouseId = useStore((state) => state.userHouseId);
  
  const ceremonyActive = useStore((state) => state.ceremonyActive);
  const setCeremonyActive = useStore((state) => state.setCeremonyActive);

  // Ceremonial Protocol Initiation Loop
  React.useEffect(() => {
    if (view === 'globe' && !userHouseId) {
      const timer = setTimeout(() => {
        setCeremonyActive(true);
      }, 10000); // Extended to exact 10-second environmental immersion delay
      return () => clearTimeout(timer);
    }
  }, [view, userHouseId]);

  // Global Command Deck Routing Logic
  React.useEffect(() => {
    if (activeCommandTab === 'world') {
      // Automatically force open the World view
      setSelectedHouse({
        id: 'world',
        name: 'World Map',
        color: '#10b981',
        clans: ['Global Sector'],
        stats: { nodes: '200', flourishing: '100%' }
      });
      setView('transition');
      
      // Reset tab state so user can use it again next time
      setTimeout(() => {
        setView('map');
        setActiveCommandTab(null); 
      }, 1200);
    }
  }, [activeCommandTab, setView, setSelectedHouse, setActiveCommandTab]);

  return (
    <div className="w-full h-screen bg-[#020617] text-white font-sans overflow-hidden relative selection:bg-white/10">
      
      {/* Alignment Covenant Ceremony protocol Overlay */}
      <AlignmentCeremony show={ceremonyActive} onComplete={() => setCeremonyActive(false)} />

      {/* Full Screen Immersive Social Timeline */}
      <TimelineView />

      {/* Floating Command Tactical Dashboard (Missions, Store, etc) */}
      <TacticalDashboard />

      {/* Immersive Cinematic Title Screen */}
      <AnimatePresence mode="wait">
        {view === 'title' && (
          <TitleScreen key="title-screen-container" />
        )}
      </AnimatePresence>
      
      {/* 3D Cinematic Planet Canvas (WebGL Container) */}
      <AnimatePresence mode="wait">
        {(view === 'globe' || view === 'transition') && (
          <motion.div 
            key="globe-view-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.4, filter: 'blur(12px)' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full z-0"
          >
            <ZuraGlobe />
            
            {view === 'globe' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <HUD />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2D High-Performance Canvas Hex Sector Map */}
      <AnimatePresence mode="wait">
        {view === 'map' && selectedHouse && (
          <motion.div 
            key="map-view-container"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col bg-[#0f172a] z-0"
          >
            <div className="flex-1 w-full h-full z-0 pointer-events-auto">
              {selectedHouse.id === 'world' ? (
                <DeckGLMap />
              ) : (
                <HexGridCanvas house={selectedHouse} onHexClick={setSelectedHex} />
              )}
            </div>

            {selectedHouse.id !== 'world' && <MapOverlay />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seed Planting Overlay Modal */}
      <AnimatePresence>
        {selectedHex && selectedHouse && (
          <PlantingModal 
            hex={selectedHex} 
            house={selectedHouse} 
            onClose={() => setSelectedHex(null)}
          />
        )}
      </AnimatePresence>
      
    </div>
  );
}
