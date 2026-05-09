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
        setSelectedHouse(house);
        setView('transition');
        setTimeout(() => {
          setView('map');
        }, 2000);
      }
    });

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
  }, [setHoveredHouseId, setSelectedHouse, setView]);

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

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* High-Performance Screen Projected HTML Labels (matches reference perfectly) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {labels.map((label) => {
          if (!label.visible) return null;
          
          // Style yellow labels with black text, others with white text for premium contrast (as seen in reference)
          const isYellow = label.color === '#eab308';
          
          return (
            <div
              key={label.id}
              className="absolute left-0 top-0 transition-opacity duration-200"
              style={{
                transform: `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -100%)`,
                opacity: label.visible ? 1 : 0
              }}
            >
              <div 
                className="font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide rounded border shadow-lg whitespace-nowrap"
                style={{
                  backgroundColor: isYellow ? '#eab308' : '#090d16',
                  color: isYellow ? '#000000' : label.color,
                  borderColor: label.color
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
