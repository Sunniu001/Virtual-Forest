"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { GlobeEngine } from '@/lib/globe-engine';

import { HOUSES, HOUSE_REGIONS } from '@/lib/constants';

export default function ZuraGlobe() {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const [labels, setLabels] = useState([]);

  const hoveredHouseId = useStore((state) => state.hoveredHouseId);
  const focusedHouseId = useStore((state) => state.focusedHouseId);
  const userHouseId = useStore((state) => state.userHouseId);
  
  const setHoveredHouseId = useStore((state) => state.setHoveredHouseId);
  const setFocusedHouseId = useStore((state) => state.setFocusedHouseId);
  const setSelectedHouse = useStore((state) => state.setSelectedHouse);
  const setView = useStore((state) => state.setView);

  // Instantiate Plain Three.js Engine once on Mount
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GlobeEngine(mountRef.current, {
      houses: HOUSES,
      regions: HOUSE_REGIONS,
      onHoverHouse: (id) => {
        setHoveredHouseId(id);
      },
      onSelectHouse: (house) => {
        // Purely select the house for global focus context, do NOT trigger routing.
        setSelectedHouse(house);
        setFocusedHouseId(house.id);
      }
    });

    // Prime userHouseId immediately if already selected
    engine.setUserHouseId(userHouseId);

    engineRef.current = engine;

    // Listen to custom label updates from the plain Three.js native loop
    const handleLabelUpdate = (e) => {
      setLabels(e.detail || []);
    };
    window.addEventListener('updateLabels', handleLabelUpdate);

    // Destroy and dispose of hardware resources cleanly on unmount
    return () => {
      window.removeEventListener('updateLabels', handleLabelUpdate);
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [setHoveredHouseId, setSelectedHouse, setView]); // Removed userHouseId to prevent engine regeneration, rely on hook below

  // Imperative synchronization from React/Zustand Store to the Plain Three.js Engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setHoveredHouse(hoveredHouseId);
    }
  }, [hoveredHouseId]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFocusedHouse(focusedHouseId);
    }
  }, [focusedHouseId]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setUserHouseId(userHouseId);
    }
  }, [userHouseId]);

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* High-Performance Screen Projected HTML Labels (matches reference perfectly) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {labels.map((label) => {
          if (!label.visible) return null;
          
          const isCurrentHouse = !userHouseId || label.houseId === userHouseId;
          
          // STRICT OCCLUSION: If aligned, other houses are 100% invisible (Opacity 0) per final spec
          const displayOpacity = userHouseId ? (isCurrentHouse ? 1 : 0) : 1;
          const pointerEvents = displayOpacity > 0 ? 'auto' : 'none';
          const opacityBase = label.visible ? 1 : 0;
          
          // Force grey for non-faction elements when factioned
          const displayColor = isCurrentHouse ? label.color : '#94a3b8'; 
          const isYellow = displayColor === '#eab308' && isCurrentHouse;
          
          return (
            <div
              key={label.id}
              className="absolute left-0 top-0 transition-opacity duration-300"
              style={{
                transform: `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -100%)`,
                opacity: opacityBase * displayOpacity,
                zIndex: isCurrentHouse ? 20 : 10,
                pointerEvents: pointerEvents
              }}
            >
              <div 
                className="font-mono text-[8.5px] font-bold px-2 py-0.5 uppercase tracking-wider rounded border shadow-lg whitespace-nowrap backdrop-blur-sm transition-colors duration-300"
                style={{
                  backgroundColor: isYellow ? '#eab308' : (isCurrentHouse ? '#090d16' : '#090d16cc'),
                  color: isYellow ? '#000000' : displayColor,
                  borderColor: isCurrentHouse ? displayColor : 'rgba(148, 163, 184, 0.3)'
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
