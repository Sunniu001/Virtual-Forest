"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { GlobeEngine } from '@/lib/globe-engine';
import { HOUSES, HOUSE_REGIONS } from '@/lib/constants';

export default function ZuraGlobe() {
  const mountRef  = useRef(null);
  const engineRef = useRef(null);
  const [labels, setLabels] = useState([]);

  const hoveredHouseId    = useStore((state) => state.hoveredHouseId);
  const focusedHouseId    = useStore((state) => state.focusedHouseId);
  const userHouseId       = useStore((state) => state.userHouseId);
  
  const setHoveredHouseId = useStore((state) => state.setHoveredHouseId);
  const setFocusedHouseId = useStore((state) => state.setFocusedHouseId);
  const setSelectedHouse  = useStore((state) => state.setSelectedHouse);
  const setView           = useStore((state) => state.setView);

  // Instantiate Three.js Engine once on Mount
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GlobeEngine(mountRef.current, {
      houses: HOUSES,
      regions: HOUSE_REGIONS,
      onHoverHouse:  (id)    => setHoveredHouseId(id),
      onSelectHouse: (house) => {
        setSelectedHouse(house);
        setFocusedHouseId(house.id);
      }
    });

    engine.setUserHouseId(userHouseId);
    engineRef.current = engine;

    const handleLabelUpdate = (e) => setLabels(e.detail || []);
    window.addEventListener('updateLabels', handleLabelUpdate);

    return () => {
      window.removeEventListener('updateLabels', handleLabelUpdate);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [setHoveredHouseId, setSelectedHouse, setView]);

  useEffect(() => { engineRef.current?.setHoveredHouse(hoveredHouseId); }, [hoveredHouseId]);
  useEffect(() => { engineRef.current?.setFocusedHouse(focusedHouseId); }, [focusedHouseId]);
  useEffect(() => { engineRef.current?.setUserHouseId(userHouseId);     }, [userHouseId]);

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Screen-projected HTML Labels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {labels.map((label) => {
          if (!label.visible) return null;
          
          const isCurrentHouse    = !userHouseId || label.houseId === userHouseId;
          const displayOpacity    = userHouseId ? (isCurrentHouse ? 1 : 0) : 1;
          const displayColor      = isCurrentHouse ? label.color : '#94a3b8';
          const isYellow          = displayColor === '#eab308' && isCurrentHouse;
          
          return (
            <div
              key={label.id}
              className="absolute left-0 top-0 transition-opacity duration-300"
              style={{
                transform:    `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -100%)`,
                opacity:      label.visible ? displayOpacity : 0,
                zIndex:       isCurrentHouse ? 20 : 10,
                pointerEvents: displayOpacity > 0 ? 'auto' : 'none'
              }}
            >
              <div 
                className="font-mono text-[8.5px] font-bold px-2 py-0.5 uppercase tracking-wider rounded border shadow-lg whitespace-nowrap backdrop-blur-sm transition-colors duration-300"
                style={{
                  backgroundColor: isYellow ? '#eab308' : (isCurrentHouse ? '#090d16' : '#090d16cc'),
                  color:           isYellow ? '#000000' : displayColor,
                  borderColor:     isCurrentHouse ? displayColor : 'rgba(148, 163, 184, 0.3)'
                }}
              >
                {label.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
