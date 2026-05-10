"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { buildHolographicStyle, HOUSE_MAP_CONFIGS } from '@/lib/map-engine/holographic-style';
import * as h3 from 'h3-js';
import * as turf from '@turf/turf';

// ─────────────────────────────────────────────────────────────────────────────
// HouseVectorMap — Generic MapLibre GL JS vector map for any house faction
// ─────────────────────────────────────────────────────────────────────────────

export default function HouseVectorMap() {
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

  const selectedHouse = useStore((s) => s.selectedHouse);
  const setSelectedHex = useStore((s) => s.setSelectedHex);

  // Get config for the selected house
  const config = HOUSE_MAP_CONFIGS[selectedHouse?.id] || HOUSE_MAP_CONFIGS['iboga'];
  const HOUSE_COLOR = config.color;

  useEffect(() => {
    if (!containerRef.current || !selectedHouse) return;

    // Reset map if house changes
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    let map;
    let pulseRef;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      map = new maplibregl.Map({
        container: containerRef.current,
        style:     buildHolographicStyle(HOUSE_COLOR),
        bounds:    config.bounds,
        fitBoundsOptions: { padding: 60 },
        dragRotate:   true,
        pitch:        0, 
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
        
        _setupDistricts(map, worldData, setDistrictStats, config);
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
  }, [selectedHouse?.id]); // Re-init map when house changes

  return (
    <div className="absolute inset-0 w-full h-full font-mono select-none">
      <div ref={containerRef} className="w-full h-full" />

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
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${HOUSE_COLOR}44; 
          border-radius: 10px; 
          border: 1px solid ${HOUSE_COLOR}22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${HOUSE_COLOR}66; }
      `}</style>

      {/* Zoom Level Indicator */}
      <div className="absolute top-6 right-6 z-20 bg-slate-950/80 backdrop-blur border border-white/10 rounded px-3 py-1.5 text-[10px] text-slate-400 tracking-widest uppercase flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 1 ? 'bg-white' : 'bg-slate-700'}`} style={{ backgroundColor: zoomState >= 1 ? HOUSE_COLOR : undefined }} />
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 2 ? 'bg-white' : 'bg-slate-700'}`} style={{ backgroundColor: zoomState >= 2 ? HOUSE_COLOR : undefined }} />
        <div className={`w-1.5 h-1.5 rounded-full ${zoomState >= 3 ? 'bg-white' : 'bg-slate-700'}`} style={{ backgroundColor: zoomState >= 3 ? HOUSE_COLOR : undefined }} />
        <span className="ml-2">OPTICS: L{zoomState}</span>
      </div>

      {/* Tooltips ... (Identical to IbogaMap Tooltips) */}
      {hoveredDistrict && zoomState < 3 && !hoveredHex && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-950/90 border border-white/20 rounded-xl px-4 py-3 text-xs shadow-2xl transition-all duration-75"
          style={{ 
            top: hoveredDistrict.y + 15, 
            left: hoveredDistrict.x + 15,
            borderLeft: `3px solid ${HOUSE_COLOR}`
          }}
        >
          <div className="text-white font-bold uppercase tracking-wider mb-1">
            {hoveredDistrict.name}
          </div>
          <div className="text-slate-400">{hoveredDistrict.hexCount} Hexagonal Plots</div>
        </div>
      )}

      {hoveredHex && zoomState === 3 && (
        <div
          className="absolute pointer-events-none z-30 bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-xs shadow-2xl w-64 transition-all duration-75"
          style={{ 
            top: hoveredHex.y - 10, 
            left: hoveredHex.x + 15, 
            transform: 'translateY(-50%)',
            borderLeft: `4px solid ${hoveredHex.status === 'gestating' ? '#eab308' : hoveredHex.status === 'tree' ? HOUSE_COLOR : '#ef4444'}`
          }}
        >
          <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-800">
            <div>
              <div className="text-slate-400 text-[9px] tracking-[0.2em] uppercase mb-1">Cell ID</div>
              <div className="text-slate-200 font-bold tracking-wider">{hoveredHex.cellId.substring(0, 10)}...</div>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">Biome</span>
              <span className="text-slate-300">{hoveredHex.landType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">Coordinates</span>
              <span className="text-slate-300">{hoveredHex.lat.toFixed(4)}, {hoveredHex.lng.toFixed(4)}</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900/50 border border-slate-800 text-center">
             {hoveredHex.status === 'available' ? 'Empty — Click to Plant' : hoveredHex.status.toUpperCase()}
          </div>
        </div>
      )}

      {/* Dynamic Right Panel (District Analysis) */}
      <div className="absolute top-[100px] right-6 z-20 w-80 pointer-events-none flex flex-col space-y-4 max-h-[calc(100vh-260px)]">
        {zoomState < 3 ? (
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold tracking-[0.2em] uppercase text-sm mb-1">House {config.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Global Sector Overview</p>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
              {Object.values(districtStats)
                .sort((a, b) => b.completed - a.completed)
                .map((dist, idx) => {
                  const progress = Math.round((dist.completed / dist.total) * 100) || 0;
                  return (
                    <div key={dist.name} className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/80 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 font-mono">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-200">{dist.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">{progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                        <div className="h-full" style={{ width: `${progress}%`, backgroundColor: HOUSE_COLOR }} />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>Cells: {dist.total}</span>
                        <span className="text-emerald-400/80">Trees: {dist.completed}</span>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        ) : activeDistrictId && districtStats[activeDistrictId] ? (
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold tracking-[0.2em] uppercase text-sm mb-1">{districtStats[activeDistrictId].name}</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Sector Diagnostics</p>
            </div>
            <div className="p-5 space-y-4">
               <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <div className="text-[9px] text-emerald-400/80 font-mono mb-1 uppercase">Matured</div>
                    <div className="text-xl font-bold text-emerald-400">{districtStats[activeDistrictId].completed}</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">Empty</div>
                    <div className="text-xl font-bold text-slate-300">{districtStats[activeDistrictId].empty}</div>
                  </div>
               </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Loading veil */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] text-white/40 tracking-[0.3em] uppercase animate-pulse">
              SYNCING HOUSE GEOGRAPHY...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function _setupDistricts(map, worldData, setDistrictStats, houseConfig) {
  const HOUSE_COLOR = houseConfig.color;
  const countryFeatures = [];
  const labelFeatures = [];
  const hexAvailable = [];
  const hexGestating = [];
  const hexTrees = [];
  const hexDead = [];

  let featureIdCounter = 1;
  const tempStats = {};

  houseConfig.districts.forEach(d => {
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
      countryFeatures.push({
        ...feature,
        id,
        properties: { ...feature.properties, districtId: d.id, districtName: d.name, featureId: id }
      });

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

      const r = Math.random();
      let status = 'available';
      let isMine = false;
      let survivalChance = 0;

      if (r < 0.05) { status = 'tree'; isMine = Math.random() < 0.3; } 
      else if (r < 0.08) { status = 'gestating'; isMine = Math.random() < 0.3; survivalChance = 75; }

      const feature = {
        type: 'Feature',
        id: featureIdCounter++,
        properties: {
          districtId: d.id,
          districtName: d.name,
          cellId, status, isMine, survivalChance,
          lat: centerLat, lng: centerLng,
          landType: 'Arable Land'
        },
        geometry: { type: 'Polygon', coordinates: [coords] },
      };

      if (status === 'available') { hexAvailable.push(feature); tempStats[d.id].empty++; }
      if (status === 'gestating') { hexGestating.push(feature); tempStats[d.id].gestating++; }
      if (status === 'tree') { hexTrees.push(feature); tempStats[d.id].completed++; }
      if (status === 'dead') hexDead.push(feature);
    });
  });

  setDistrictStats(tempStats);

  map.addSource('district-countries', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: countryFeatures })) });
  map.addSource('district-labels', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: labelFeatures })) });
  map.addSource('hex-available', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexAvailable })) });
  map.addSource('hex-gestating', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexGestating })) });
  map.addSource('hex-tree', { type: 'geojson', data: JSON.parse(JSON.stringify({ type: 'FeatureCollection', features: hexTrees })) });

  map.addLayer({
    id: 'district-country-fill',
    type: 'fill',
    source: 'district-countries',
    paint: {
      'fill-color': HOUSE_COLOR,
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.25, ['boolean', ['feature-state', 'unfocused'], false], 0.02, 0.1],
    },
  });

  map.addLayer({
    id: 'district-country-stroke',
    type: 'line',
    source: 'district-countries',
    paint: { 'line-color': HOUSE_COLOR, 'line-width': 1.5, 'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1.0, ['boolean', ['feature-state', 'unfocused'], false], 0.1, 0.5] },
  });

  const minHexZoom = 5;
  map.addLayer({ id: 'hex-available', type: 'fill', source: 'hex-available', minzoom: minHexZoom, paint: { 'fill-color': HOUSE_COLOR, 'fill-opacity': 0.05 } });
  map.addLayer({ id: 'hex-available-stroke', type: 'line', source: 'hex-available', minzoom: minHexZoom, paint: { 'line-color': HOUSE_COLOR, 'line-width': 1, 'line-opacity': 0.15 } });

  map.addLayer({
    id: 'hex-gestating',
    type: 'fill-extrusion',
    source: 'hex-gestating',
    minzoom: minHexZoom,
    paint: { 
      'fill-extrusion-color': '#eab308', 
      'fill-extrusion-height': ['case', ['==', ['get', 'isMine'], true], 800, 400],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.8
    }
  });

  map.addLayer({
    id: 'hex-gestating-beacon',
    type: 'circle',
    source: 'hex-gestating',
    minzoom: minHexZoom,
    filter: ['==', ['get', 'isMine'], true],
    paint: { 'circle-radius': 8, 'circle-color': '#eab308', 'circle-blur': 1, 'circle-opacity': 0.8 }
  });

  map.addLayer({
    id: 'hex-tree',
    type: 'fill',
    source: 'hex-tree',
    minzoom: minHexZoom,
    paint: {
      'fill-color': ['case', ['==', ['get', 'isMine'], true], HOUSE_COLOR, '#22c55e'],
      'fill-opacity': 0.65
    }
  });

  map.addSource('hex-hover', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'hex-hover-fill', type: 'fill', source: 'hex-hover', minzoom: minHexZoom, paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.2 } });
  map.addLayer({ id: 'hex-hover-stroke', type: 'line', source: 'hex-hover', minzoom: minHexZoom, paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 1 } });

  map.addLayer({
    id: 'district-label',
    type: 'symbol',
    source: 'district-labels',
    layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold'], 'text-size': 11, 'text-anchor': 'center' },
    paint: { 'text-color': HOUSE_COLOR, 'text-halo-color': '#050505', 'text-halo-width': 2, 'text-opacity': ['case', ['boolean', ['feature-state', 'unfocused'], false], 0, 1] },
  });
}

function _bindInteractions(map, setHoveredDistrict, setHoveredHex, setZoomState, setSelectedHex, setActiveDistrictId) {
  let activeDistrictId = null;
  let hoveredFeatureId = null;

  map.on('zoom', () => {
    const z = map.getZoom();
    if (z < 4.5) setZoomState(1);
    else if (z < 5.5) setZoomState(2);
    else setZoomState(3);
  });

  const updateFocusStates = (hoverId) => {
    const features = map.querySourceFeatures('district-countries');
    const labels = map.querySourceFeatures('district-labels');
    features.forEach(f => map.setFeatureState({ source: 'district-countries', id: f.id }, { hover: f.properties.districtId === hoverId, unfocused: (activeDistrictId || hoverId) && f.properties.districtId !== hoverId && f.properties.districtId !== activeDistrictId }));
    labels.forEach(l => map.setFeatureState({ source: 'district-labels', id: l.id }, { unfocused: (activeDistrictId || hoverId) && l.properties.id !== hoverId && l.properties.id !== activeDistrictId }));
  };

  map.on('mousemove', 'district-country-fill', (e) => {
    if (map.getZoom() >= 5.5) return;
    const props = e.features[0]?.properties;
    if (props && props.districtId !== hoveredFeatureId) {
      map.getCanvas().style.cursor = 'pointer';
      hoveredFeatureId = props.districtId;
      updateFocusStates(hoveredFeatureId);
      const labelFeat = map.querySourceFeatures('district-labels').find(f => f.properties.id === props.districtId);
      setHoveredDistrict({ name: props.districtName, hexCount: labelFeat ? labelFeat.properties.hexCount : 0, x: e.point.x, y: e.point.y });
    }
  });
  
  map.on('mouseleave', 'district-country-fill', () => {
    map.getCanvas().style.cursor = '';
    hoveredFeatureId = null;
    updateFocusStates(null);
    setHoveredDistrict(null);
  });

  map.on('click', 'district-country-fill', (e) => {
    const feature = e.features[0];
    if (feature) {
      activeDistrictId = feature.properties.districtId;
      setActiveDistrictId(activeDistrictId);
      updateFocusStates(hoveredFeatureId);
      map.fitBounds(turf.bbox(feature), { padding: 40, maxZoom: 6, duration: 1500, essential: true });
    }
  });

  map.on('mousemove', (e) => {
    if (map.getZoom() < 5) return;
    const hexes = map.queryRenderedFeatures(e.point, { layers: ['hex-available', 'hex-gestating', 'hex-tree'] });
    if (hexes.length > 0) {
      const feature = hexes[0];
      if (activeDistrictId && feature.properties.districtId !== activeDistrictId) return;
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
    const hexes = map.queryRenderedFeatures(e.point, { layers: ['hex-available', 'hex-gestating', 'hex-tree'] });
    if (hexes.length > 0) {
      const props = hexes[0].properties;
      if (activeDistrictId && props.districtId !== activeDistrictId) return;
      if (props.status === 'available') {
        setSelectedHex({ id: props.cellId, clan: props.districtName, status: props.status, q: props.lat.toFixed(4), r: props.lng.toFixed(4) });
      }
    }
  });

  const handlePlantingSuccess = (e) => {
    map.flyTo({ center: [e.detail.lng, e.detail.lat], zoom: 8, pitch: 45, duration: 3000, essential: true });
    setHoveredHex({ lat: e.detail.lat, lng: e.detail.lng, status: 'gestating', owner: 'You', daysRemaining: 7, survivalChance: 98, cellId: e.detail.id, x: window.innerWidth/2, y: window.innerHeight/2 });
  };
  window.addEventListener('vf:planting-success', handlePlantingSuccess);
  return () => window.removeEventListener('vf:planting-success', handlePlantingSuccess);
}
