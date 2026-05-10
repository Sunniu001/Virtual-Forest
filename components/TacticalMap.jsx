"use client";

import React, { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { MapManager } from '@/lib/map-engine/MapManager';
import { HOUSES, HOUSE_REGIONS } from '@/lib/constants';
import * as turf from '@turf/turf';

export default function TacticalMap() {
  const containerRef = useRef(null);
  const managerRef   = useRef(null);

  const selectedHouse = useStore((s) => s.selectedHouse);
  const userHouseId   = useStore((s) => s.userHouseId);

  // ── Mount / unmount engine ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new MapManager(containerRef.current);
    managerRef.current = manager;

    const boot = async () => {
      // Wait for PixiJS async init
      await new Promise(resolve => {
        const check = () => manager.isInitialized ? resolve() : setTimeout(check, 20);
        check();
      });
      if (manager._destroyed) return;

      // 1. Load world geography (baked to RenderTexture — one-time cost)
      await manager.loadWorldData('/data/world.json');
      if (manager._destroyed) return;

      // 2. Build district configs for the active house
      const houseId = userHouseId
        || (selectedHouse && selectedHouse.id !== 'world' ? selectedHouse.id : null)
        || 'iboga';

      const regions = HOUSE_REGIONS[houseId] || [];
      const house   = HOUSES.find(h => h.id === houseId);
      if (!house) return;

      const districtConfigs = regions.map((reg, idx) => {
        // Geographic center [lon, lat]
        const center = [reg.lon, reg.lat];

        // Circular polygon for H3 filling (radius in km from spread degrees)
        const radiusKm = Math.max(50, reg.spread * 1500);
        const poly     = turf.circle(center, radiusKm, { units: 'kilometers', steps: 32 });

        return {
          id:       `${houseId}-${idx}`,
          name:     house.clans[idx] || `District ${idx + 1}`,
          color:    house.color,
          hexCount: reg.count || 10,
          center,                    // for DistrictLayer glow ellipses
          spread:   reg.spread * 15, // glow radius in approx degrees
          polygon:  poly.geometry,   // for HexSystem at LOD 2
        };
      });

      manager.setDistricts(districtConfigs);

      // 3. Focus camera on house territory
      if (selectedHouse && selectedHouse.focus) {
        manager.focusOn(selectedHouse.focus.lon, selectedHouse.focus.lat, 1.5);
      } else if (house.focus) {
        manager.focusOn(house.focus.lon, house.focus.lat, 1.5);
      }
    };

    boot();

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, []); // mount once

  // ── Respond to house selection changes without remounting ─────────────────
  useEffect(() => {
    const m = managerRef.current;
    if (!m || !selectedHouse || !selectedHouse.focus) return;
    m.focusOn(selectedHouse.focus.lon, selectedHouse.focus.lat, 1.5);
  }, [selectedHouse]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#020617] overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Minimal zoom hint — fades once user starts interacting */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <p className="text-[10px] font-mono text-slate-600 tracking-[0.25em] uppercase animate-pulse">
          scroll to zoom · drag to navigate
        </p>
      </div>
    </div>
  );
}
