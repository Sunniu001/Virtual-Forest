"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { buildHolographicStyle, AFRICA_BOUNDS, IBOGA_DISTRICTS } from '@/lib/map-engine/holographic-style';
import * as h3 from 'h3-js';
import * as turf from '@turf/turf';

// ─────────────────────────────────────────────────────────────────────────────
// IbogaMap — MapLibre GL JS vector map for the Iboga house (Africa continent)
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_COLOR = '#a855f7'; // Iboga purple

// Mock Player Stats
const PLAYER_STATS = {
  planted: 24,
  matured: 18,
  gestating: 4,
  died: 2,
  ratio: '85%'
};

export default function IbogaMap() {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // UI States
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [hoveredHex, setHoveredHex] = useState(null);
  const [zoomState, setZoomState] = useState(1); // 1 = Global, 2 = District Focus, 3 = Hex View

  // District analysis state
  const [districtStats, setDistrictStats] = useState({});
  const [activeDistrictId, setActiveDistrictId] = useState(null);

  const setSelectedHex = useStore((s) => s.setSelectedHex);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map;
    let pulseRef;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      map = new maplibregl.Map({
        container: containerRef.current,
        style:     buildHolographicStyle(HOUSE_COLOR),
        bounds:  AFRICA_BOUNDS,
        fitBoundsOptions: { padding: 60 },
        dragRotate:   true,
        pitch:        0, // Start flat
        touchPitch:   true,
        pitchWithRotate: true,
        antialias:    true,
        maxZoom:      12,
        minZoom:      2,
      });

      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', async () => {
        const res = await fetch('/data/world.json');
        const worldData = await res.json();
        
        _setupCountryDistricts(map, worldData, setDistrictStats);
        _bindInteractions(map, setHoveredDistrict, setHoveredHex, setZoomState, setSelectedHex, setActiveDistrictId);
        setMapLoaded(true);

        // Pulsating animation for gestating hexes
        let startTime = Date.now();
        const animatePulse = () => {
          if (!map.getLayer('hex-gestating')) return;
          const time = (Date.now() - startTime) / 1000;
          const opacity = 0.5 + Math.sin(time * 3) * 0.3;
          map.setPaintProperty('hex-gestating', 'fill-extrusion-opacity', opacity);
          
          if (map.getLayer('hex-gestating-beacon')) {
            const beaconRadius = 10 + Math.sin(time * 5) * 5;
            map.setPaintProperty('hex-gestating-beacon', 'circle-radius', beaconRadius);
          }

          pulseRef = requestAnimationFrame(animatePulse);
        };
        animatePulse();
      });
    };

    initMap();

    return () => {
      if (pulseRef) cancelAnimationFrame(pulseRef);
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full font-mono select-none">
      {/* MapLibre container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* CSS overrides to strip default MapLibre chrome */}
      <style>{`
        .maplibregl-ctrl-logo { display: none !important; }
        .maplibregl-ctrl-attrib { display: none !important; }
        .maplibregl-ctrl-group {
          background: rgba(2, 11, 24, 0.8) !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px !important;
        }
        .maplibregl-ctrl-group button { color: #94a3b8 !important; }
        .maplibregl-ctrl-group button:hover { background: rgba(59, 130, 246, 0.1) !important; color: #fff !important; }
        
        /* Custom Premium Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(168, 85, 247, 0.3); 
          border-radius: 10px; 
          border: 1px solid rgba(168, 85, 247, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
      `}</style>



      {/* Zoom Level Indicator */}
      <div className="absolute top-6 right-6 z-20 bg-slate-950/80 backdrop-blur border border-purple-500/30 rounded px-3 py-1.5 text-[10px] text-purple-300 tracking-widest uppercase flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 1 ? 'bg-purple-500' : 'bg-slate-700'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 2 ? 'bg-purple-500' : 'bg-slate-700'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 3 ? 'bg-purple-500' : 'bg-slate-700'}`} />
        <span className="ml-2">OPTICS: L{zoomState}</span>
      </div>

      {/* District tooltip (Only visible in Level 1/2) */}
      {hoveredDistrict && zoomState < 3 && !hoveredHex && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-950/90 border border-purple-500/50 rounded-xl px-4 py-3 text-xs shadow-2xl transition-all duration-75"
          style={{ top: hoveredDistrict.y + 15, left: hoveredDistrict.x + 15 }}
        >
          <div className="text-purple-400 font-bold uppercase tracking-wider mb-1">
            {hoveredDistrict.name}
          </div>
          <div className="text-slate-400">{hoveredDistrict.hexCount} Hexagonal Plots</div>
          <div className="text-purple-300/60 mt-2 text-[9px] uppercase tracking-widest">Click to isolate sector</div>
        </div>
      )}

      {/* Hex tooltip (Visible in Level 3) */}
      {hoveredHex && zoomState === 3 && (
        <div
          className="absolute pointer-events-none z-30 bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-xs shadow-2xl w-64 transition-all duration-75"
          style={{ top: hoveredHex.y - 10, left: hoveredHex.x + 15, transform: 'translateY(-50%)' }}
        >
          <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-800">
            <div>
              <div className="text-slate-400 text-[9px] tracking-[0.2em] uppercase mb-1">Cell ID</div>
              <div className="text-slate-200 font-bold tracking-wider">{hoveredHex.cellId.substring(0, 10)}...</div>
            </div>
            {hoveredHex.isMine && (
              <div className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest border border-purple-500/30">
                Your Sector
              </div>
            )}
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">Elevation</span>
              <span className="text-slate-300">{hoveredHex.elevation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">Biome</span>
              <span className="text-slate-300">{hoveredHex.landType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">Coordinates</span>
              <span className="text-slate-300">{hoveredHex.lat.toFixed(4)}, {hoveredHex.lng.toFixed(4)}</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900/50 border border-slate-800">
            {hoveredHex.status === 'available' && (
              <div className="text-purple-400 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                Empty — Click to Plant
              </div>
            )}
            {hoveredHex.status === 'tree' && (
              <div>
                <div className="text-green-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Matured Tree
                </div>
                <div className="text-slate-400 text-[10px]">Owner: <span className="text-slate-200">{hoveredHex.owner}</span></div>
                <div className="text-slate-400 text-[10px]">Age: <span className="text-slate-200">{hoveredHex.daysMatured} days</span></div>
              </div>
            )}
            {hoveredHex.status === 'gestating' && (
              <div>
                <div className="text-yellow-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                  Seed Gestating
                </div>
                <div className="text-slate-400 text-[10px] mb-1">Owner: <span className="text-slate-200">{hoveredHex.owner}</span></div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mb-1 overflow-hidden">
                  <div className="bg-yellow-400 h-full" style={{ width: `${100 - (hoveredHex.daysRemaining / 7) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">{hoveredHex.daysRemaining} days left</span>
                  <span className="text-slate-300">{hoveredHex.survivalChance}% survival</span>
                </div>
              </div>
            )}
            {hoveredHex.status === 'dead' && (
              <div>
                <div className="text-red-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Failed Seedling
                </div>
                <div className="text-slate-400 text-[10px]">Owner: <span className="text-slate-200">{hoveredHex.owner}</span></div>
                <div className="text-slate-500 text-[10px] italic mt-1">Returned to the earth.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Right Panel (African Sector / District Analysis) */}
      <div className="absolute top-[140px] right-6 z-20 w-80 pointer-events-none flex flex-col space-y-4 max-h-[calc(100vh-260px)]">
        {zoomState < 3 ? (
          <div className="bg-slate-950/80 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 border-b border-purple-500/20 bg-purple-500/5">
              <h3 className="text-purple-400 font-bold tracking-[0.2em] uppercase text-sm mb-1">House Iboga</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">African Sector Overview</p>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
              {Object.values(districtStats)
                .sort((a, b) => b.completed - a.completed) // Rank by completed
                .map((dist, idx) => {
                  const progress = Math.round((dist.completed / dist.total) * 100) || 0;
                  return (
                    <div key={dist.name} className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 font-mono">#{idx + 1}</span>
                          <span className="text-xs font-bold text-purple-100">{dist.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">{progress}% done</span>
                      </div>
                      
                      <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Cells: {dist.total}</span>
                        <span className="text-emerald-400/80">Trees: {dist.completed}</span>
                        <span className="text-yellow-400/80">Gest: {dist.gestating}</span>
                        <span className="text-slate-500">Empty: {dist.empty}</span>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        ) : activeDistrictId && districtStats[activeDistrictId] ? (
          <div className="bg-slate-950/80 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-purple-500/20 bg-purple-500/10">
              <h3 className="text-purple-400 font-bold tracking-[0.2em] uppercase text-sm mb-1">{districtStats[activeDistrictId].name}</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Sector Diagnostics</p>
            </div>
            <div className="p-5 space-y-5">
              
              <div>
                <h4 className="text-[9px] font-mono text-slate-500 uppercase mb-2">Sector Status</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-emerald-400/80 font-mono mb-1">Matured</div>
                    <div className="text-lg font-bold text-emerald-400">{districtStats[activeDistrictId].completed}</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-mono mb-1">Empty</div>
                    <div className="text-lg font-bold text-slate-300">{districtStats[activeDistrictId].empty}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-mono text-slate-500 uppercase mb-2 border-b border-slate-800 pb-1">
                  Gestation Survival Rates ({districtStats[activeDistrictId].gestating} Total)
                </h4>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-emerald-400">Excellent (&gt;81%)</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-white">{districtStats[activeDistrictId].gestationTiers.excellent}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-yellow-400">Good (61-80%)</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-white">{districtStats[activeDistrictId].gestationTiers.good}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-orange-400">Average (31-60%)</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-white">{districtStats[activeDistrictId].gestationTiers.average}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-red-400">Bad (&lt;30%)</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-white">{districtStats[activeDistrictId].gestationTiers.bad}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </div>

      {/* Loading veil */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020b18] z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500/40 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-[10px] text-purple-400/70 tracking-[0.3em] uppercase animate-pulse">
              Initializing Intelligence System
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup Logic
// ─────────────────────────────────────────────────────────────────────────────
function _setupCountryDistricts(map, worldData, setDistrictStats) {
  const countryFeatures = [];
  const labelFeatures = [];
  const hexAvailable = [];
  const hexGestating = [];
  const hexTrees = [];
  const hexDead = [];

  let featureIdCounter = 1;
  const tempStats = {};

  IBOGA_DISTRICTS.forEach(d => {
    tempStats[d.id] = {
      name: d.name,
      total: d.hex,
      completed: 0,
      gestating: 0,
      empty: 0,
      gestationTiers: { bad: 0, average: 0, good: 0, excellent: 0 }
    };

    const matchedFeatures = worldData.features.filter(f => d.countries.includes(f.properties.name));
    if (matchedFeatures.length === 0) return;

    let districtCells = [];

    matchedFeatures.forEach(feature => {
      const id = featureIdCounter++;
      const countryFeat = {
        ...feature,
        id,
        properties: { ...feature.properties, districtId: d.id, districtName: d.name, featureId: id }
      };
      countryFeatures.push(countryFeat);

      if (feature.geometry.type === 'Polygon') {
        try { districtCells.push(...h3.polygonToCells(feature.geometry.coordinates, 4, true)); } catch (e) { }
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => {
          try { districtCells.push(...h3.polygonToCells(poly, 4, true)); } catch (e) { }
        });
      }
    });

    const featureCollection = turf.featureCollection(matchedFeatures);
    const centroid = turf.centroid(featureCollection);
    labelFeatures.push({
      type: 'Feature',
      id: featureIdCounter++,
      properties: { id: d.id, name: d.name, hexCount: d.hex },
      geometry: centroid.geometry,
    });

    const shuffled = districtCells.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(d.hex, shuffled.length));

    selected.forEach((cellId) => {
      const boundary = h3.cellToBoundary(cellId);
      const coords = boundary.map(([lat, lng]) => [lng, lat]);
      coords.push(coords[0]);
      
      const centerLat = boundary.reduce((sum, p) => sum + p[0], 0) / boundary.length;
      const centerLng = boundary.reduce((sum, p) => sum + p[1], 0) / boundary.length;

      // Mock rich data
      const r = Math.random();
      let status = 'available';
      let owner = null;
      let isMine = false;
      let daysMatured = 0;
      let survivalChance = 0;
      let daysRemaining = 0;

      if (r < 0.05) {
        status = 'tree';
        isMine = Math.random() < 0.3;
        owner = isMine ? 'You' : '0x' + Math.floor(Math.random()*16777215).toString(16);
        daysMatured = Math.floor(Math.random() * 300) + 1;
      } else if (r < 0.08) {
        status = 'gestating';
        isMine = Math.random() < 0.3;
        owner = isMine ? 'You' : '0x' + Math.floor(Math.random()*16777215).toString(16);
        survivalChance = Math.floor(Math.random() * 40) + 60;
        daysRemaining = Math.floor(Math.random() * 7) + 1;
      } else if (r < 0.1) {
        status = 'dead';
        isMine = Math.random() < 0.3;
        owner = isMine ? 'You' : '0x' + Math.floor(Math.random()*16777215).toString(16);
      }

      const feature = {
        type: 'Feature',
        id: featureIdCounter++,
        properties: {
          districtId: d.id,
          districtName: d.name,
          cellId,
          status,
          owner,
          isMine,
          daysMatured,
          survivalChance,
          daysRemaining,
          lat: centerLat,
          lng: centerLng,
          elevation: (Math.floor(Math.random() * 1500) + 200) + 'm',
          landType: ['Savanna', 'Tropical Forest', 'Grassland', 'Scrub', 'Wetland'][Math.floor(Math.random()*5)]
        },
        geometry: { type: 'Polygon', coordinates: [coords] },
      };

      if (status === 'available') { hexAvailable.push(feature); tempStats[d.id].empty++; }
      if (status === 'gestating') { 
        hexGestating.push(feature); 
        tempStats[d.id].gestating++; 
        if (survivalChance < 30) tempStats[d.id].gestationTiers.bad++;
        else if (survivalChance <= 60) tempStats[d.id].gestationTiers.average++;
        else if (survivalChance <= 80) tempStats[d.id].gestationTiers.good++;
        else tempStats[d.id].gestationTiers.excellent++;
      }
      if (status === 'tree') { hexTrees.push(feature); tempStats[d.id].completed++; }
      if (status === 'dead') hexDead.push(feature);
    });
  });

  setDistrictStats(tempStats);

  // Sources
  map.addSource('district-countries', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: countryFeatures })) });
  map.addSource('district-labels', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: labelFeatures })) });
  
  map.addSource('hex-available', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexAvailable })) });
  map.addSource('hex-gestating', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexGestating })) });
  map.addSource('hex-tree', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexTrees })) });
  map.addSource('hex-dead', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexDead })) });

  // Country Fill (Driven by Feature State for hover/focus)
  map.addLayer({
    id: 'district-country-fill',
    type: 'fill',
    source: 'district-countries',
    paint: {
      'fill-color': HOUSE_COLOR,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.25,
        ['boolean', ['feature-state', 'unfocused'], false], 0.02,
        0.12 // Default
      ],
    },
  });

  map.addLayer({
    id: 'district-country-stroke',
    type: 'line',
    source: 'district-countries',
    paint: {
      'line-color': HOUSE_COLOR,
      'line-width': 1.5,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 1.0,
        ['boolean', ['feature-state', 'unfocused'], false], 0.1,
        0.6
      ],
    },
  });

  // Hex Layers (Only visible at Zoom Level 3: zoom >= 5)
  const minHexZoom = 5;

  // Available (Using fill instead of line so it's clickable)
  map.addLayer({
    id: 'hex-available',
    type: 'fill',
    source: 'hex-available',
    minzoom: minHexZoom,
    paint: { 
      'fill-color': HOUSE_COLOR, 
      'fill-opacity': 0.05 // Subtle fill so user can see it's interactive
    }
  });

  // Add a thin stroke for available hexes as well
  map.addLayer({
    id: 'hex-available-stroke',
    type: 'line',
    source: 'hex-available',
    minzoom: minHexZoom,
    paint: { 'line-color': HOUSE_COLOR, 'line-width': 1, 'line-opacity': 0.15 }
  });

  // Gestating (3D Extrusion for depth)
  map.addLayer({
    id: 'hex-gestating',
    type: 'fill-extrusion',
    source: 'hex-gestating',
    minzoom: minHexZoom,
    paint: { 
      'fill-extrusion-color': '#eab308', 
      'fill-extrusion-height': [
        'case',
        ['==', ['get', 'isMine'], true], 800, // User's seeds are taller
        400
      ],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.8
    }
  });

  // Beacon for user's gestating hexes
  map.addLayer({
    id: 'hex-gestating-beacon',
    type: 'circle',
    source: 'hex-gestating',
    minzoom: minHexZoom,
    filter: ['==', ['get', 'isMine'], true],
    paint: {
      'circle-radius': 8,
      'circle-color': '#eab308',
      'circle-blur': 1,
      'circle-opacity': [
        'interpolate', ['linear'], ['zoom'],
        5, 0,
        7, 0.8
      ]
    }
  });

  // Matured Trees
  map.addLayer({
    id: 'hex-tree',
    type: 'fill',
    source: 'hex-tree',
    minzoom: minHexZoom,
    paint: {
      'fill-color': ['case', ['==', ['get', 'isMine'], true], '#a855f7', '#22c55e'],
      'fill-opacity': 0.65
    }
  });

  // Dead
  map.addLayer({
    id: 'hex-dead',
    type: 'fill',
    source: 'hex-dead',
    minzoom: minHexZoom,
    paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.15 }
  });

  // Hex Hover setup
  map.addSource('hex-hover', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'hex-hover-fill', type: 'fill', source: 'hex-hover', minzoom: minHexZoom, paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.2 } });
  map.addLayer({ id: 'hex-hover-stroke', type: 'line', source: 'hex-hover', minzoom: minHexZoom, paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 1 } });

  // Water Mask
  try {
    map.addLayer({
      id: 'water-mask',
      type: 'fill',
      source: 'demotiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#020b18' },
    });
  } catch(e) { }

  // District labels
  map.addLayer({
    id: 'district-label',
    type: 'symbol',
    source: 'district-labels',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-anchor': 'center',
    },
    paint: {
      'text-color': HOUSE_COLOR,
      'text-halo-color': '#020b18',
      'text-halo-width': 2,
      'text-opacity': [
        'case',
        ['boolean', ['feature-state', 'unfocused'], false], 0,
        1
      ]
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactions
// ─────────────────────────────────────────────────────────────────────────────
function _bindInteractions(map, setHoveredDistrict, setHoveredHex, setZoomState, setSelectedHex, setActiveDistrictId) {
  let activeDistrictId = null;
  let hoveredFeatureId = null;

  // Zoom tracker to update UI state
  map.on('zoom', () => {
    const z = map.getZoom();
    if (z < 4.5) setZoomState(1);
    else if (z < 5.5) setZoomState(2);
    else setZoomState(3);
  });

  const updateFocusStates = (hoverId) => {
    const features = map.querySourceFeatures('district-countries');
    const labels = map.querySourceFeatures('district-labels');
    
    // Clear all states first
    features.forEach(f => map.setFeatureState({ source: 'district-countries', id: f.id }, { hover: false, unfocused: false }));
    labels.forEach(l => map.setFeatureState({ source: 'district-labels', id: l.id }, { unfocused: false }));

    features.forEach(f => {
      const isHovered = f.properties.districtId === hoverId;
      const isFocused = f.properties.districtId === activeDistrictId;
      
      // Logic: If there is an active district OR a hover, unfocus everything else.
      const hasActiveContext = activeDistrictId || hoverId;
      const shouldUnfocus = hasActiveContext && !isHovered && !isFocused;

      map.setFeatureState({ source: 'district-countries', id: f.id }, { 
        hover: isHovered, 
        unfocused: shouldUnfocus 
      });
    });

    labels.forEach(l => {
      const isHovered = l.properties.id === hoverId;
      const isFocused = l.properties.id === activeDistrictId;
      const hasActiveContext = activeDistrictId || hoverId;
      const shouldUnfocus = hasActiveContext && !isHovered && !isFocused;
      
      map.setFeatureState({ source: 'district-labels', id: l.id }, { unfocused: shouldUnfocus });
    });
  };

  // Country Hover
  map.on('mousemove', 'district-country-fill', (e) => {
    if (map.getZoom() >= 5.5) return; // Disable country hover in Level 3
    const props = e.features[0]?.properties;
    if (props && props.districtId !== hoveredFeatureId) {
      map.getCanvas().style.cursor = 'pointer';
      hoveredFeatureId = props.districtId;
      updateFocusStates(hoveredFeatureId);
      
      const labelFeat = map.querySourceFeatures('district-labels').find(f => f.properties.id === props.districtId);
      setHoveredDistrict({ 
        name: props.districtName, 
        hexCount: labelFeat ? labelFeat.properties.hexCount : 0, 
        x: e.point.x, y: e.point.y 
      });
    } else if (props) {
      // Just update tooltip position
      setHoveredDistrict(prev => prev ? { ...prev, x: e.point.x, y: e.point.y } : prev);
    }
  });
  
  map.on('mouseleave', 'district-country-fill', () => {
    if (map.getZoom() >= 5.5) return;
    map.getCanvas().style.cursor = '';
    hoveredFeatureId = null;
    updateFocusStates(null);
    setHoveredDistrict(null);
  });

  // Country Click -> Zoom Level 2/3
  map.on('click', 'district-country-fill', (e) => {
    const feature = e.features[0];
    if (feature) {
      activeDistrictId = feature.properties.districtId;
      setActiveDistrictId(activeDistrictId); // Update React State for the left panel
      updateFocusStates(hoveredFeatureId);
      const bbox = turf.bbox(feature);
      // Zoom straight to level 3 (hex view)
      map.fitBounds(bbox, { padding: 40, maxZoom: 6, duration: 1500, essential: true });
      setHoveredDistrict(null);
    }
  });

  // Global click clears focus if zoomed out
  map.on('click', (e) => {
    if (!map.queryRenderedFeatures(e.point, { layers: ['district-country-fill'] }).length) {
      activeDistrictId = null;
      setActiveDistrictId(null);
      updateFocusStates(null);
      if (map.getZoom() > 4) map.flyTo({ center: map.getCenter(), zoom: 3.5, duration: 1000 });
    }
  });

  // Hex Interactions
  const hexLayers = ['hex-available', 'hex-gestating', 'hex-tree', 'hex-dead'];
  
  map.on('mousemove', (e) => {
    if (map.getZoom() < 5) return; // Only active in Level 3
    
    const hexes = map.queryRenderedFeatures(e.point, { layers: hexLayers });
    if (hexes.length > 0) {
      const feature = hexes[0];
      // Only allow interaction if it belongs to the active district
      if (activeDistrictId && feature.properties.districtId !== activeDistrictId) {
        map.getCanvas().style.cursor = '';
        setHoveredHex(null);
        map.getSource('hex-hover')?.setData({ type: 'FeatureCollection', features: [] });
        return;
      }

      map.getCanvas().style.cursor = 'crosshair';
      map.getSource('hex-hover').setData({ type: 'FeatureCollection', features: [feature] });
      setHoveredHex({ ...feature.properties, x: e.point.x, y: e.point.y });
    } else {
      map.getCanvas().style.cursor = '';
      setHoveredHex(null);
      map.getSource('hex-hover')?.setData({ type: 'FeatureCollection', features: [] });
    }
  });

  map.on('click', (e) => {
    if (map.getZoom() < 5) return;
    const hexes = map.queryRenderedFeatures(e.point, { layers: hexLayers });
    if (hexes.length > 0) {
      const props = hexes[0].properties;
      if (activeDistrictId && props.districtId !== activeDistrictId) return; // Blocked

      if (props.status === 'available') {
        setSelectedHex({ 
          id: props.cellId, 
          clan: props.districtName, 
          status: props.status,
          q: props.lat.toFixed(4), 
          r: props.lng.toFixed(4)
        });
      }
    }
  });

  // Global event listener for successful planting
  const handlePlantingSuccess = (e) => {
    const { lat, lng } = e.detail;
    // Fly to the new seed
    map.flyTo({
      center: [lng, lat],
      zoom: 8,
      pitch: 45,
      bearing: 0,
      duration: 3000,
      essential: true
    });

    // Temp highlight for the new cell
    setHoveredHex({ 
      lat, lng, 
      status: 'gestating', 
      owner: 'You', 
      daysRemaining: 7, 
      survivalChance: 98,
      landType: 'Fresh Soil',
      elevation: 'Synced',
      cellId: e.detail.id,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  };

  window.addEventListener('vf:planting-success', handlePlantingSuccess);

  return () => {
    window.removeEventListener('vf:planting-success', handlePlantingSuccess);
  };
}
