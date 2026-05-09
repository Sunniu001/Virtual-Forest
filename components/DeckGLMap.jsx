"use client";

import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import * as h3 from 'h3-js';
import { Loader2, Globe2 } from 'lucide-react';
import { useStore } from '@/lib/store';


// Country faction mapping lists for true land-masking
const AFRICA_COUNTRIES = new Set([
  "algeria", "angola", "benin", "botswana", "burkina faso", "burundi", "cameroon", "cape verde", "central african republic", 
  "chad", "comoros", "congo", "democratic republic of the congo", "djibouti", "egypt", "equatorial guinea", "eritrea", 
  "ethiopia", "gabon", "gambia", "ghana", "guinea", "guinea-bissau", "ivory coast", "kenya", "lesotho", "liberia", 
  "libya", "madagascar", "malawi", "mali", "mauritania", "mauritius", "morocco", "mozambique", "namibia", "niger", 
  "nigeria", "rwanda", "sao tome and principe", "senegal", "seychelles", "sierra leone", "somalia", "south africa", 
  "south sudan", "sudan", "swaziland", "tanzania", "togo", "tunisia", "uganda", "western sahara", "zambia", "zimbabwe",
  "cote d'ivoire", "dem. rep. congo", "congo, dem. rep."
]);

const NA_COUNTRIES = new Set([
  "united states of america", "united states", "canada", "mexico", "greenland", "cuba", "guatemala", "honduras", 
  "nicaragua", "el salvador", "costa rica", "panama", "dominican republic", "haiti", "jamaica", "bahamas", "belize"
]);

const SA_COUNTRIES = new Set([
  "brazil", "argentina", "peru", "colombia", "bolivia", "venezuela", "chile", "paraguay", "ecuador", "uruguay", 
  "guyana", "suriname", "falkland islands"
]);

const OCEANIA_COUNTRIES = new Set([
  "australia", "new zealand", "papua new guinea", "fiji", "solomon islands", "vanuatu", "new caledonia"
]);

const NORTH_ASIA_COUNTRIES = new Set([
  "russia", "china", "mongolia", "kazakhstan", "japan", "north korea", "south korea", "taiwan"
]);

const EUROPE_COUNTRIES = new Set([
  "france", "germany", "united kingdom", "italy", "spain", "poland", "ukraine", "romania", "sweden", "norway", 
  "finland", "turkey", "greece", "portugal", "austria", "hungary", "switzerland", "belarus", "bulgaria", "serbia", 
  "slovakia", "czech republic", "denmark", "ireland", "island", "iceland", "lithuania", "latvia", "estonia", "belgium", 
  "netherlands", "luxembourg", "moldova", "croatia", "bosnia and herzegovina", "albania", "macedonia", "slovenia"
]);

const SEA_COUNTRIES = new Set([
  "india", "indonesia", "philippines", "vietnam", "thailand", "myanmar", "malaysia", "cambodia", "laos", "bangladesh", 
  "pakistan", "iran", "saudi arabia", "iraq", "afghanistan", "nepal", "sri lanka", "yemen", "oman", "syria", "jordan",
  "uzbekistan", "turkmenistan", "kyrgyzstan", "tajikistan"
]);

export default function DeckGLMap() {
  const setView = useStore((state) => state.setView);
  const [hexData, setHexData] = useState([]);
  const [clickedHex, setClickedHex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Initializing tactical grid...");

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    let isMounted = true;

    const generateMesh = async () => {
      try {
        setStatusMessage("Fetching world country boundaries...");
        const response = await fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
        if (!response.ok) throw new Error("Failed to load country GeoJSON");
        const geojson = await response.json();

        if (!isMounted) return;
        setStatusMessage("Polyfilling boundaries into H3 hex grids...");

        // Faction bucket arrays
        const buckets = {
          Africa: [],
          NorthAmerica: [],
          SouthAmerica: [],
          Australia: [],
          NorthAsia: [],
          Europe: [],
          SoutheastAsia: []
        };

        geojson.features.forEach(feature => {
          const name = (feature.properties.ADMIN || feature.properties.name || "").toLowerCase().trim();

          // Geographic centroid fallback for smaller islands or unmapped boundaries
          let lng = 0, lat = 0;
          try {
            if (feature.geometry.type === "Polygon") {
              const ring = feature.geometry.coordinates[0];
              ring.forEach(([x, y]) => { lng += x; lat += y; });
              lng /= ring.length;
              lat /= ring.length;
            } else if (feature.geometry.type === "MultiPolygon") {
              const ring = feature.geometry.coordinates[0][0];
              ring.forEach(([x, y]) => { lng += x; lat += y; });
              lng /= ring.length;
              lat /= ring.length;
            }
          } catch (e) {}

          let faction = null;
          if (AFRICA_COUNTRIES.has(name) || name.includes("africa") || name === "madagascar" || name === "egypt" || name === "morocco" || name === "algeria") {
            faction = "Africa";
          } else if (NA_COUNTRIES.has(name) || name === "united states" || name === "canada" || name === "mexico" || name === "greenland") {
            faction = "NorthAmerica";
          } else if (SA_COUNTRIES.has(name) || name === "brazil" || name === "argentina" || name === "chile" || name === "peru" || name === "colombia") {
            faction = "SouthAmerica";
          } else if (OCEANIA_COUNTRIES.has(name) || name === "australia" || name === "new zealand" || name === "papua new guinea") {
            faction = "Australia";
          } else if (NORTH_ASIA_COUNTRIES.has(name) || name === "russia" || name === "china" || name === "mongolia" || name === "kazakhstan" || name === "japan") {
            faction = "NorthAsia";
          } else if (EUROPE_COUNTRIES.has(name) || name === "france" || name === "germany" || name === "united kingdom" || name === "italy" || name === "spain") {
            faction = "Europe";
          } else if (SEA_COUNTRIES.has(name) || name === "india" || name === "indonesia" || name === "philippines" || name === "vietnam" || name === "thailand") {
            faction = "SoutheastAsia";
          } else {
            // Coordinate boundaries bounding-box fallback classification
            if (lat < -60) return; // ignore Antarctica
            if (lng > -25 && lng < 55 && lat > -35 && lat < 37) faction = "Africa";
            else if (lng > -170 && lng < -50 && lat > 15 && lat < 85) faction = "NorthAmerica";
            else if (lng > -90 && lng < -30 && lat > -60 && lat < 15) faction = "SouthAmerica";
            else if (lng > 110 && lng < 180 && lat > -50 && lat < 0) faction = "Australia";
            else if (lng > 25 && lng < 180 && lat > 35 && lat < 85) faction = "NorthAsia";
            else if (lng > -25 && lng < 45 && lat > 35 && lat < 72) faction = "Europe";
            else if (lng > 60 && lng < 145 && lat > -10 && lat < 35) faction = "SoutheastAsia";
          }

          if (faction && buckets[faction]) {
            let polygons = [];
            if (feature.geometry.type === "Polygon") {
              polygons.push(feature.geometry.coordinates);
            } else if (feature.geometry.type === "MultiPolygon") {
              polygons.push(...feature.geometry.coordinates);
            }

            polygons.forEach(polyCoords => {
              try {
                // Swap GeoJSON [lng, lat] to H3 [lat, lng]
                const h3Polygon = polyCoords.map(ring => ring.map(([lng, lat]) => [lat, lng]));
                const cells = h3.polygonToCells(h3Polygon, 3);
                cells.forEach(cell => {
                  buckets[faction].push(cell);
                });
              } catch (err) {}
            });
          }
        });

        setStatusMessage("Deduplicating and shuffling regional hex grids...");

        // Deduplicate and Shuffle helper to achieve uniform 'mesh' distribution
        const processGroup = (arr) => {
          const unique = Array.from(new Set(arr));
          // Fisher-Yates Shuffle
          for (let i = unique.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unique[i], unique[j]] = [unique[j], unique[i]];
          }
          return unique;
        };

        const africaCells = processGroup(buckets.Africa).slice(0, 1000);
        const naCells = processGroup(buckets.NorthAmerica).slice(0, 1000);
        
        const saCells = processGroup(buckets.SouthAmerica).slice(0, 500);
        const ausCells = processGroup(buckets.Australia).slice(0, 500);
        const saAusCells = [...saCells, ...ausCells]; // exactly 1,000 hexes total

        const northAsiaCells = processGroup(buckets.NorthAsia).slice(0, 1000);

        const europeCells = processGroup(buckets.Europe).slice(0, 500);
        const seaCells = processGroup(buckets.SoutheastAsia).slice(0, 500);
        const euSeaCells = [...europeCells, ...seaCells]; // exactly 1,000 hexes total

        const finalHexes = [];

        // Faction 1: Africa (Purple)
        africaCells.forEach(cell => {
          finalHexes.push({ id: cell, faction: 'Africa', color: [128, 0, 128] });
        });

        // Faction 2: North America (Yellow)
        naCells.forEach(cell => {
          finalHexes.push({ id: cell, faction: 'North America', color: [255, 255, 0] });
        });

        // Faction 3: South America & Australia (Green)
        saAusCells.forEach(cell => {
          finalHexes.push({ id: cell, faction: 'South America & Australia', color: [34, 139, 34] });
        });

        // Faction 4: North Asia (Red)
        northAsiaCells.forEach(cell => {
          finalHexes.push({ id: cell, faction: 'North Asia (Russia/China)', color: [220, 20, 60] });
        });

        // Faction 5: SE Asia & Europe (Blue)
        euSeaCells.forEach(cell => {
          finalHexes.push({ id: cell, faction: 'SE Asia & Europe', color: [30, 144, 255] });
        });

        if (isMounted) {
          setHexData(finalHexes);
          setLoading(false);
        }
      } catch (err) {
        console.error("Tactical mesh construction failed:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    generateMesh();
    return () => { isMounted = false; };
  }, []);

  const layers = [
    new H3HexagonLayer({
      id: 'h3-hexagon-layer',
      data: hexData,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: false,
      coverage: 0.9,
      stroked: false, // Ensure we remove borders so they look like distinct solid plots instead of tiny dots
      getHexagon: d => d.id,
      getFillColor: d => [...d.color, 120],
      onClick: (info) => {
        if (info.object) {
          setClickedHex(info.object);
        } else {
          setClickedHex(null);
        }
      },
      updateTriggers: {
        getFillColor: [hexData]
      }
    })
  ];

  return (
    <div className="w-full h-screen relative bg-[#020617] overflow-hidden">
      
      {/* Sleek, Dark Sci-Fi Top-Left Header with Return to Planet button */}
      <div className="absolute top-6 left-6 z-10 flex items-center space-x-3 pointer-events-auto select-none">
        <button 
          onClick={() => setView('globe')}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <Globe2 size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide font-mono uppercase">Return to Planet</span>
        </button>

        <div className="bg-slate-950/90 border border-slate-800/80 backdrop-blur-md px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <span className="text-sm font-mono tracking-wider text-emerald-400 font-bold uppercase">
            GLOBAL FACTIONS <span className="text-slate-600 px-1.5">|</span> RES: 3 <span className="text-slate-600 px-1.5">|</span> PLOTS: 5,000
          </span>
        </div>
      </div>

      {/* Cyberpunk Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 text-slate-400 font-mono select-none">
          
          {/* SVG Seed-to-Tree Growing Animation */}
          <svg width="140" height="140" viewBox="0 0 100 100" className="mb-4">
            <style>{`
              @keyframes seed-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5)); }
                50% { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.9)); }
              }
              @keyframes grow-trunk {
                0% { stroke-dashoffset: 40; }
                40%, 100% { stroke-dashoffset: 0; }
              }
              @keyframes grow-branch-left {
                0%, 30% { stroke-dashoffset: 25; }
                65%, 100% { stroke-dashoffset: 0; }
              }
              @keyframes grow-branch-right {
                0%, 40% { stroke-dashoffset: 25; }
                75%, 100% { stroke-dashoffset: 0; }
              }
              @keyframes bloom {
                0%, 55% { transform: scale(0); opacity: 0; }
                80% { transform: scale(1.3); opacity: 1; }
                100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.9)); }
              }
              .seed {
                animation: seed-pulse 4s infinite ease-in-out;
                transform-origin: 50px 84px;
              }
              .trunk {
                stroke-dasharray: 40;
                stroke-dashoffset: 40;
                animation: grow-trunk 4s infinite ease-out;
              }
              .branch-left {
                stroke-dasharray: 25;
                stroke-dashoffset: 25;
                animation: grow-branch-left 4s infinite ease-out;
              }
              .branch-right {
                stroke-dasharray: 25;
                stroke-dashoffset: 25;
                animation: grow-branch-right 4s infinite ease-out;
              }
              .leaf {
                transform-origin: center;
                animation: bloom 4s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275);
              }
            `}</style>

            {/* Soil / Ground Line */}
            <line x1="15" y1="85" x2="85" y2="85" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Growing Trunk */}
            <path d="M50,85 L50,45" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" className="trunk" />

            {/* Left Branch */}
            <path d="M50,65 Q42,58 35,52" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" className="branch-left" />

            {/* Right Branch */}
            <path d="M50,55 Q58,48 65,42" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" className="branch-right" />

            {/* Left Leaf */}
            <circle cx="35" cy="52" r="4.5" fill="#34d399" className="leaf" style={{ transformOrigin: '35px 52px' }} />
            
            {/* Right Leaf */}
            <circle cx="65" cy="42" r="4.5" fill="#34d399" className="leaf" style={{ transformOrigin: '65px 42px' }} />

            {/* Top Canopy Leaf */}
            <circle cx="50" cy="45" r="5.5" fill="#059669" className="leaf" style={{ transformOrigin: '50px 45px' }} />

            {/* Seed at bottom */}
            <ellipse cx="50" cy="84" rx="3.5" ry="2.5" fill="#fbbf24" className="seed" />
          </svg>

          <span className="text-sm font-bold tracking-[0.25em] animate-pulse text-emerald-400 uppercase mb-2">
            The world map is loading...
          </span>
          <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
            {statusMessage}
          </span>
        </div>
      )}

      {/* Interactive Deck.gl / MapLibre Canvas View */}
      <div className="w-full h-full z-0">
        <DeckGL
          viewState={viewState}
          onViewStateChange={e => setViewState(e.viewState)}
          layers={layers}
          getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'default')}
          controller={true}
        >
          <Map
            reuseMaps
            mapLib={maplibregl}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            preventStyleDiffing={true}
          />
        </DeckGL>
      </div>

      {/* Floating Info Card in Bottom-Right */}
      {clickedHex && (
        <div className="absolute bottom-6 right-6 z-10 w-80 bg-gray-900/90 border border-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-300 select-none">
          <div className="flex justify-between items-start mb-4 border-b border-slate-800/60 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">TERRITORY CONTROL</span>
              <span className="text-base font-bold font-mono tracking-tight" style={{ color: `rgb(${clickedHex.color.join(',')})` }}>
                {clickedHex.faction}
              </span>
            </div>
            <button 
              onClick={() => setClickedHex(null)}
              className="text-slate-500 hover:text-white transition-colors text-sm font-bold bg-slate-800/40 hover:bg-slate-800/80 w-6 h-6 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">HEX ID</span>
              <span className="text-slate-300 font-semibold text-right max-w-[150px] truncate" title={clickedHex.id}>{clickedHex.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">STATUS</span>
              <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase text-[10px]">
                UNCLAIMED
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
