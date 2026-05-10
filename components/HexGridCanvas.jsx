"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

const HEX_STATES = {
  UNAVAILABLE: 'Not Available',
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  GROWING: 'growing',
  FLOURISHING: 'flourishing'
};

// Geographically positioned region seeds with target hex counts for the 2,580 Hexagon World Map
// Geographically positioned region seeds with target hex counts for the 1,000 Hexagon World Map
const WORLD_CLUSTERS = [
  // 1. Africa (Purple: #a855f7 - Total exactly 330 hexagons)
  { dx: -40, dy: 20, count: 25, name: 'Cameroon', color: '#a855f7', continent: 'Africa' },
  { dx: 30, dy: -30, count: 25, name: 'Sudan', color: '#a855f7', continent: 'Africa' },
  { dx: 40, dy: 10, count: 25, name: 'Uganda', color: '#a855f7', continent: 'Africa' },
  { dx: -70, dy: -10, count: 25, name: 'Nigeria', color: '#a855f7', continent: 'Africa' },
  { dx: 80, dy: -10, count: 25, name: 'Ethiopia', color: '#a855f7', continent: 'Africa' },
  { dx: -40, dy: 110, count: 25, name: 'Namibia', color: '#a855f7', continent: 'Africa' },
  { dx: 0, dy: 140, count: 30, name: 'South Africa(North Side)', color: '#a855f7', continent: 'Africa' },
  { dx: 20, dy: 180, count: 30, name: 'South Africa(South Side)', color: '#a855f7', continent: 'Africa' },
  { dx: 50, dy: 30, count: 25, name: 'Kenya (P)', color: '#a855f7', continent: 'Africa' },
  { dx: 10, dy: 80, count: 25, name: 'Zambia', color: '#a855f7', continent: 'Africa' },
  { dx: -20, dy: 40, count: 25, name: 'Congo', color: '#a855f7', continent: 'Africa' },
  { dx: 60, dy: -10, count: 25, name: 'Kenya (B)', color: '#a855f7', continent: 'Africa' },
  { dx: -110, dy: -10, count: 20, name: 'Ghana', color: '#a855f7', continent: 'Africa' },

  // 2. North America (Yellow/Gold: #eab308 - Total exactly 200 hexagons)
  { dx: -380, dy: -160, count: 20, name: 'Canada', color: '#eab308', continent: 'North America' },
  { dx: -380, dy: -100, count: 20, name: 'North and South Dakota', color: '#eab308', continent: 'North America' },
  { dx: -310, dy: -90, count: 20, name: 'Michigan', color: '#eab308', continent: 'North America' },
  { dx: -260, dy: -80, count: 20, name: 'North East US', color: '#eab308', continent: 'North America' },
  { dx: -440, dy: -70, count: 20, name: 'California', color: '#eab308', continent: 'North America' },
  { dx: -400, dy: -40, count: 20, name: 'New Mexico', color: '#eab308', continent: 'North America' },
  { dx: -340, dy: -40, count: 20, name: 'Texas Gulf', color: '#eab308', continent: 'North America' },
  { dx: -300, dy: -30, count: 20, name: 'Alabama', color: '#eab308', continent: 'North America' },
  { dx: -260, dy: -20, count: 20, name: 'Southern US', color: '#eab308', continent: 'North America' },
  { dx: -540, dy: -30, count: 20, name: 'Hawaii', color: '#eab308', continent: 'North America' },

  // 3. South America (Green: #22c55e - Total exactly 130 hexagons)
  { dx: -340, dy: 60, count: 15, name: 'Galapagos', color: '#22c55e', continent: 'South America' },
  { dx: -280, dy: 100, count: 20, name: 'Peru', color: '#22c55e', continent: 'South America' },
  { dx: -160, dy: 100, count: 20, name: 'Brazil', color: '#22c55e', continent: 'South America' },
  { dx: -200, dy: 140, count: 20, name: 'Paraguay', color: '#22c55e', continent: 'South America' },
  { dx: -260, dy: 180, count: 15, name: 'Chile', color: '#22c55e', continent: 'South America' },
  { dx: -210, dy: 190, count: 20, name: 'East Argentina', color: '#22c55e', continent: 'South America' },
  { dx: -250, dy: 230, count: 20, name: 'West Argentina', color: '#22c55e', continent: 'South America' },

  // 4. Oceania (Cyan/Teal: #06b6d4 - Total exactly 60 hexagons)
  { dx: 332, dy: 191, count: 30, name: 'South East Australia', color: '#06b6d4', continent: 'Oceania' },
  { dx: 340, dy: 219, count: 6, name: 'Tasmania', color: '#06b6d4', continent: 'Oceania' },
  { dx: 430, dy: 210, count: 24, name: 'New Zealand', color: '#06b6d4', continent: 'Oceania' },

  // 5. South East Asia & Asia (Blue: #3b82f6 - Total exactly 280 hexagons)
  { dx: 280, dy: -180, count: 30, name: 'Russia', color: '#3b82f6', continent: 'Asia' },
  { dx: 340, dy: -100, count: 30, name: 'China', color: '#3b82f6', continent: 'Asia' },
  { dx: 180, dy: -60, count: 28, name: 'Central India', color: '#3b82f6', continent: 'Asia' },
  { dx: 240, dy: -50, count: 28, name: 'India(North East India)', color: '#3b82f6', continent: 'Asia' },
  { dx: 200, dy: -10, count: 28, name: 'SriLanka(Including South India)', color: '#3b82f6', continent: 'Asia' },
  { dx: 280, dy: -40, count: 28, name: 'Myanmar', color: '#3b82f6', continent: 'Asia' },
  { dx: 320, dy: 0, count: 28, name: 'Malaysia', color: '#3b82f6', continent: 'Asia' },
  { dx: 320, dy: 40, count: 26, name: 'Sumatra', color: '#3b82f6', continent: 'Asia' },
  { dx: 380, dy: 50, count: 28, name: 'Borneo', color: '#3b82f6', continent: 'Asia' },
  { dx: 420, dy: 80, count: 26, name: 'Indonesia', color: '#3b82f6', continent: 'Asia' }
];

const NEW_ZEALAND_HEXES = [
  // --- NORTH ISLAND (Locked and Perfect - Do not touch) ---
  { q: 58, r: 44 }, { q: 58, r: 45 }, { q: 58, r: 46 },
  { q: 57, r: 47 }, { q: 58, r: 47 },
  { q: 56, r: 48 }, { q: 57, r: 48 }, { q: 58, r: 48 },
  { q: 57, r: 49 }, { q: 58, r: 49 },
  { q: 57, r: 50 },

  // --- SOUTH ISLAND (Shifted +2 Q and +1 R to align with landmass) ---
  // Top Row (Nelson/Marlborough)
  { q: 53, r: 52 }, { q: 54, r: 52 },

  // Upper Bulge 
  { q: 52, r: 53 }, { q: 53, r: 53 }, { q: 54, r: 53 },

  // The Neck
  { q: 52, r: 54 }, { q: 53, r: 54 },

  // Lower Bulge (Canterbury/Otago)
  { q: 51, r: 55 }, { q: 52, r: 55 }, { q: 53, r: 55 },

  // Lower Body
  { q: 51, r: 56 }, { q: 52, r: 56 },

  // Southland Tip
  { q: 51, r: 57 }
];



// Procedural Biome Assignment
const getBiomeFromPosition = (dx, dy, elev) => {
  if (dy < -140 || elev > 3000) return 'Alpine Tundra';
  if (dy >= -60 && dy <= 10 && ((dx > -140 && dx < 140) || (dx > 120 && dx < 240))) return 'Arid Desert';
  if (dy >= -30 && dy <= 60 && ((dx > -100 && dx < 100) || dx > 200)) return 'Tropical Rainforest';
  if (elev > 1800) return 'Coniferous Forest';
  return 'Temperate Grassland';
};

// Pointy-Top axial neighbors helpers
const getNeighbors = (q, r) => [
  { q: q + 1, r: r },
  { q: q + 1, r: r - 1 },
  { q: q, r: r - 1 },
  { q: q - 1, r: r },
  { q: q - 1, r: r + 1 },
  { q: q, r: r + 1 }
];

export default function HexGridCanvas({ house, onHexClick }) {
  const setActiveHexCount = useStore((state) => state.setActiveHexCount);
  const setTotalHexCount = useStore((state) => state.setTotalHexCount);
  const setDoneHexCount = useStore((state) => state.setDoneHexCount);
  const canvasRef = useRef(null);
  const [hoveredHex, setHoveredHex] = useState(null);
  const [hexes, setHexes] = useState([]);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const requestRef = useRef(null);

  const bgImageRef = useRef(null);
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  const isIboga = house.id === 'iboga' || house.id === 'world';
  const isDatura = house.id === 'datura';

  useEffect(() => {
    if (house.id === 'world') {
      const img = new Image();
      img.src = '/world-map-base.svg';
      img.onload = () => {
        bgImageRef.current = img;
        setIsBgLoaded(true);
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.src = '/world-map-base.jpg';
        fallbackImg.onload = () => {
          bgImageRef.current = fallbackImg;
          setIsBgLoaded(true);
        };
      };
    } else {
      bgImageRef.current = null;
      setIsBgLoaded(false);
    }
  }, [house.id]);

  useEffect(() => {
    if (house.id === 'world') {
      setZoom(0.7);
      setPan({ x: 0, y: 0 });
    } else if (house.id === 'datura') {
      setZoom(0.75);
      setPan({ x: -110, y: 30 });
    } else {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    }
  }, [house.id]);

  useEffect(() => {
    const newHexes = [];

    if (house.id === 'world') {
      const hexSize = 3;
      const hexWidth = Math.sqrt(3) * hexSize;
      const hexHeight = 2 * hexSize;

      const nzSet = new Set(NEW_ZEALAND_HEXES.map(h => `${h.q},${h.r}`));
      const assignedHexes = new Map();

      WORLD_CLUSTERS.forEach((cluster) => {
        if (cluster.count <= 0) return;

        let candidates = [];
        if (cluster.name === 'New Zealand') {
          candidates = NEW_ZEALAND_HEXES.map(h => {
            const dx = hexWidth * (h.q + h.r / 2);
            const dy = (hexHeight * 3 / 4) * h.r;
            return { q: h.q, r: h.r, dx, dy, id: `${h.q},${h.r}`, continent: cluster.continent };
          });
        } else {
          const r_center = Math.round(cluster.dy / (hexHeight * 3 / 4));
          const q_center = Math.round(cluster.dx / hexWidth - r_center / 2);
          const radius = 10;
          const localCandidates = [];
          for (let dq = -radius; dq <= radius; dq++) {
            for (let dr = -radius; dr <= radius; dr++) {
              const q = q_center + dq;
              const r = r_center + dr;
              const dx = hexWidth * (q + r / 2);
              const dy = (hexHeight * 3 / 4) * r;
              localCandidates.push({ q, r, dx, dy, id: `${q},${r}`, continent: cluster.continent });
            }
          }
          candidates = localCandidates
            .map(h => ({ h, dist: Math.hypot(h.dx - cluster.dx, h.dy - cluster.dy) }))
            .sort((a, b) => a.dist - b.dist)
            .map(c => c.h);
        }

        const toTake = Math.min(cluster.count, candidates.length);
        for (let i = 0; i < toTake; i++) {
          const hex = candidates[i];
          assignedHexes.set(hex.id, {
            q: hex.q,
            r: hex.r,
            state: i < toTake * 0.25 ? HEX_STATES.FLOURISHING : (i < toTake * 0.6 ? HEX_STATES.GROWING : HEX_STATES.AVAILABLE),
            region: cluster.name,
            color: cluster.color,
            continent: cluster.continent,
            count: cluster.count
          });
        }
      });

      // Sri Lanka Test Hex injection
      assignedHexes.set('40,-2', {
        q: 40,
        r: -2,
        state: HEX_STATES.FLOURISHING,
        region: 'SRI LANKA TEST',
        color: '#f43f5e', // Hot pink/rose
        continent: 'Asia',
        count: 1
      });

      // 3. Populate final array with procedural metadata directly from assignedHexes
      assignedHexes.forEach((assignment, id) => {
        const q = assignment.q;
        const r = assignment.r;
        const dx = hexWidth * (q + r / 2);
        const dy = (hexHeight * 3 / 4) * r;
        const elev = Math.round(150 + 3800 * Math.pow(Math.abs(Math.sin(dx * 0.01) * Math.cos(dy * 0.01)), 2.5));
        newHexes.push({
          q: assignment.continent === 'Asia' ? q - 18 : q,
          r: assignment.continent === 'Asia' ? r + 30 : r,
          dx,
          dy,
          state: assignment.state,
          id,
          region: assignment.region,
          continent: assignment.continent,
          color: assignment.color,
          count: assignment.count,
          biome: getBiomeFromPosition(dx, dy, elev),
          elevation: elev
        });
      });
    } else if (isIboga || isDatura) {
      // 1. Build original untouch individual maps (Africa/Asia peninsulas)
      const allHexes = [];
      const hexSize = 9;
      const hexWidth = Math.sqrt(3) * hexSize;
      const hexHeight = 2 * hexSize;
      const gridSize = 35;

      // Geographically accurate outline boundaries from original codes
      const AFRICA_POLY = [
        { x: -110, y: -190 }, { x: 100, y: -190 }, { x: 140, y: -100 }, { x: 210, y: -20 },
        { x: 160, y: 60 }, { x: 130, y: 110 }, { x: 90, y: 160 }, { x: 50, y: 240 },
        { x: -10, y: 240 }, { x: -20, y: 140 }, { x: -50, y: 80 }, { x: -70, y: 10 },
        { x: -160, y: -10 }, { x: -210, y: -70 }, { x: -170, y: -160 }
      ];

      const isInsideMadagascar = (px, py) => {
        const dx = px - 170; const dy = py - 130;
        const rotX = dx * 0.8 - dy * 0.6; const rotY = dx * 0.6 + dy * 0.8;
        return (rotX * rotX) / 144 + (rotY * rotY) / 1024 <= 1;
      };

      for (let q = -gridSize; q <= gridSize; q++) {
        for (let r = -gridSize; r <= gridSize; r++) {
          const dx = hexWidth * (q + r / 2);
          const dy = (hexHeight * 3 / 4) * r;

          let inside = false;
          // Polygon Ray Casting Check
          let px = dx, py = dy;
          let insidePoly = false;
          for (let i = 0, j = AFRICA_POLY.length - 1; i < AFRICA_POLY.length; j = i++) {
            if (((AFRICA_POLY[i].y > py) !== (AFRICA_POLY[j].y > py)) &&
              (px < (AFRICA_POLY[j].x - AFRICA_POLY[i].x) * (py - AFRICA_POLY[i].y) / (AFRICA_POLY[j].y - AFRICA_POLY[i].y) + AFRICA_POLY[i].x)) {
              insidePoly = !insidePoly;
            }
          }
          if (insidePoly || isInsideMadagascar(dx, dy)) inside = true;

          if (inside) {
            allHexes.push({ q, r, dx, dy, id: `${q},${r}` });
          }
        }
      }

      const activeClusters = house.id === 'iboga' ? [
        { dx: -80, dy: -15, count: 5, name: 'Cameroon', color: '#a855f7' },
        { dx: 50, dy: -140, count: 5, name: 'Sudan', color: '#a855f7' },
        { dx: 30, dy: -20, count: 25, name: 'Uganda', color: '#a855f7' },
        { dx: -130, dy: -40, count: 15, name: 'Nigeria', color: '#a855f7' },
        { dx: 110, dy: -75, count: 10, name: 'Ethiopia', color: '#a855f7' },
        { dx: -20, dy: 140, count: 45, name: 'Namibia', color: '#a855f7' },
        { dx: 30, dy: 200, count: 45, name: 'South Africa', color: '#a855f7' },
        { dx: 80, dy: -35, count: 10, name: 'Kenya 2', color: '#a855f7' },
        { dx: 40, dy: 50, count: 15, name: 'Zambia', color: '#a855f7' },
        { dx: -30, dy: -10, count: 25, name: 'Congo', color: '#a855f7' }
      ] : [
        { dx: 195, dy: 10, count: 100, name: 'Kenya(Samburu)', color: '#3b82f6' },
        { dx: -130, dy: -60, count: 20, name: 'Ghana(Akan)', color: '#3b82f6' },
        { dx: 380, dy: -140, count: 20, name: 'India(Khasi)', color: '#3b82f6' },
        { dx: 530, dy: -40, count: 20, name: 'Borneo(Batek)', color: '#3b82f6' },
        { dx: 310, dy: -20, count: 20, name: 'SriLanka(Moors)', color: '#3b82f6' },
        { dx: 430, dy: 10, count: 20, name: 'Sumatra(MMB)', color: '#3b82f6' }
      ];

      const assignedHexes = new Map();
      activeClusters.forEach(cluster => {
        const sorted = allHexes
          .map(hex => ({ hex, dist: Math.hypot(hex.dx - cluster.dx, hex.dy - cluster.dy) }))
          .filter(item => !assignedHexes.has(item.hex.id))
          .sort((a, b) => a.dist - b.dist);

        const countToTake = Math.min(cluster.count, sorted.length);
        for (let i = 0; i < countToTake; i++) {
          const { hex } = sorted[i];
          let state = HEX_STATES.AVAILABLE;
          if (i < Math.ceil(countToTake * 0.15)) state = HEX_STATES.FLOURISHING;
          else if (i < Math.ceil(countToTake * 0.35)) state = HEX_STATES.GROWING;

          assignedHexes.set(hex.id, {
            state,
            region: cluster.name,
            color: cluster.color,
            continent: 'Africa'
          });
        }
      });

      allHexes.forEach(hex => {
        const assignment = assignedHexes.get(hex.id);
        
        // PROCEDURAL RANDOM SEED GENERATOR FOR GAMEPLAY POPULATION
        const rand = Math.random();
        let state = HEX_STATES.AVAILABLE;
        
        // 10% Flourishing, 15% Growing, 5% Reserved/Unavailable, 70% Available (Open Soil)
        if (rand < 0.10) state = HEX_STATES.FLOURISHING;
        else if (rand < 0.25) state = HEX_STATES.GROWING;
        else if (rand < 0.30) state = HEX_STATES.RESERVED;

        newHexes.push({
          q: hex.q, r: hex.r, dx: hex.dx, dy: hex.dy, id: hex.id,
          state: assignment ? assignment.state : state, 
          region: assignment ? assignment.region : 'Untamed Wilderness', 
          color: assignment ? assignment.color : (isIboga ? '#a855f7' : '#3b82f6'), 
          continent: 'Africa'
        });
      });
    }

    setHexes(newHexes);
    setActiveHexCount(newHexes.length);
    setTotalHexCount(newHexes.length);
    setDoneHexCount(newHexes.filter(h => h.state === HEX_STATES.FLOURISHING || h.state === HEX_STATES.GROWING).length);
  }, [house.id, isIboga, isDatura, setActiveHexCount, setTotalHexCount, setDoneHexCount]);

  const draw = useCallback((ctx, width, height, currentHovered) => {
    ctx.clearRect(0, 0, width, height);

    // Dark cinematic tactical grid background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const baseSize = house.id === 'world' ? 3 : (isIboga ? 9 : 16);
    const hexSize = baseSize * zoom;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 2 * hexSize;
    const centerX = width / 2 + pan.x;
    const centerY = (house.id === 'world' ? height / 2 : height / 2 - 20) + pan.y;

    // Draw the high-fidelity sci-fi base map background!
    if (house.id === 'world' && bgImageRef.current) {
      const iw = 1180 * zoom; // Perfectly adjusted to match our hex coordinates space
      const ih = 620 * zoom;  // Scaled beautifully with the hex zoom level
      const ix = centerX - iw / 2 - 10 * zoom; // Centered and fine-tuned for absolute pixel-perfect alignment
      const iy = centerY - ih / 2 - 15 * zoom;

      ctx.save();
      ctx.globalAlpha = 0.5; // Perfect cinematic transparency
      ctx.drawImage(bgImageRef.current, ix, iy, iw, ih);
      ctx.restore();
    }

    const drawHexagon = (x, y, size) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i - 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        const hx = x + size * Math.cos(angle_rad);
        const hy = y + size * Math.sin(angle_rad);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };


    hexes.forEach(hex => {
      const x = centerX + hexWidth * (hex.q + hex.r / 2);
      const y = centerY + (hexHeight * 3 / 4) * hex.r;

      if (x < -100 || x > width + 100 || y < -100 || y > height + 100) return;

      const themeColor = hex.color || house.color || '#3b82f6';
      const isHovered = currentHovered?.id === hex.id;
      const isSameRegion = currentHovered?.region && currentHovered.region === hex.region;

      drawHexagon(x, y, hexSize - 0.5);

      if (isHovered) {
        ctx.fillStyle = `${themeColor}66`;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 12;
        ctx.shadowColor = themeColor;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset glow
      } else if (isSameRegion) {
        // High-tech highlight of the entire contiguous region
        ctx.fillStyle = `${themeColor}35`;
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = themeColor;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset glow
      } else {
        // High-Fidelity Gameplay State Projectors
        if (hex.state === HEX_STATES.FLOURISHING) {
          // Fully realized Node
          ctx.fillStyle = `${themeColor}99`; // Dynamic Solid Opacity
          ctx.fill();
          
          ctx.strokeStyle = `${themeColor}cc`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Add central living core
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, hexSize * 0.25), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
          ctx.shadowBlur = 0; // Reset immediately
          
        } else if (hex.state === HEX_STATES.GROWING) {
          // Seed Germinating Node
          ctx.fillStyle = `${themeColor}33`; 
          ctx.fill();
          
          ctx.strokeStyle = `${themeColor}66`;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Small glowing seed artifact
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, hexSize * 0.15), 0, Math.PI * 2);
          ctx.fillStyle = `${themeColor}`;
          ctx.fill();
          
        } else if (hex.state === HEX_STATES.RESERVED) {
          // Blocked/Locked infrastructure
          ctx.fillStyle = `#1e293b`; // Slate Neutral
          ctx.fill();
          ctx.strokeStyle = `#475569`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
        } else {
          // Standard Available Land Plot (Tactical Blueprint Outline)
          ctx.fillStyle = `${themeColor}08`; // Nearly fully clear
          ctx.fill();
          ctx.strokeStyle = `${themeColor}30`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
  }, [hexes, house.color, zoom, pan, isBgLoaded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      draw(ctx, canvas.width, canvas.height, hoveredHex);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw, hoveredHex]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPanX = e.clientX - dragStart.current.x;
      const newPanY = e.clientY - dragStart.current.y;
      setPan({ x: newPanX, y: newPanY });
      return;
    }

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const baseSize = house.id === 'world' ? 3 : (isIboga ? 9 : 16);
      const hexSize = baseSize * zoom;
      const hexWidth = Math.sqrt(3) * hexSize;
      const hexHeight = 2 * hexSize;
      const centerX = canvas.width / 2 + pan.x;
      const centerY = (house.id === 'world' ? canvas.height / 2 : canvas.height / 2 - 20) + pan.y;

      let found = null;
      let minDist = Infinity;

      hexes.forEach(hex => {
        const x = centerX + hexWidth * (hex.q + hex.r / 2);
        const y = centerY + (hexHeight * 3 / 4) * hex.r;
        const d = Math.hypot(mouseX - x, mouseY - y);
        if (d < hexSize && d < minDist) {
          minDist = d;
          found = hex;
        }
      });

      setHoveredHex(found || null);
      const ctx = canvas.getContext('2d');
      draw(ctx, canvas.width, canvas.height, found);
    });
  };

  const handleMouseLeave = () => {
    setHoveredHex(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      draw(ctx, canvas.width, canvas.height, null);
    }
  };

  const handleClick = () => {
    if (hoveredHex && hoveredHex.state === HEX_STATES.AVAILABLE) {
      onHexClick(hoveredHex);
    }
  };

  useEffect(() => {
    const handleHexUpdate = (e) => {
      const { id, newState } = e.detail;
      setHexes(prev => prev.map(h => h.id === id ? { ...h, state: newState } : h));
    };
    window.addEventListener('updateHexState', handleHexUpdate);
    return () => {
      window.removeEventListener('updateHexState', handleHexUpdate);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerX = canvas.width / 2 + pan.x;
      const centerY = (house.id === 'world' ? canvas.height / 2 : canvas.height / 2 - 20) + pan.y;

      const gridMouseX = mouseX - centerX;
      const gridMouseY = mouseY - centerY;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(2.5, Math.max(house.id === 'world' ? 0.15 : 0.5, zoom * zoomFactor));

      if (newZoom !== zoom) {
        const actualFactor = newZoom / zoom;
        const newPanX = mouseX - canvas.width / 2 - gridMouseX * actualFactor;
        const newPanY = mouseY - (house.id === 'world' ? canvas.height / 2 : canvas.height / 2 - 20) - gridMouseY * actualFactor;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, [zoom, pan, house.id]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Sleek tactical Zoom Controller */}
      <div className="absolute bottom-6 left-6 sm:left-8 flex items-center space-x-2 bg-slate-950/80 backdrop-blur border border-slate-800 p-2 rounded-xl pointer-events-auto z-40 select-none shadow-xl">
        <button
          onClick={() => setZoom(prev => Math.max(house.id === 'world' ? 0.25 : 0.75, prev - 0.25))}
          disabled={zoom <= (house.id === 'world' ? 0.25 : 0.75)}
          className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          -
        </button>
        <span className="text-[10px] font-mono text-slate-400 w-12 text-center">
          {zoom < 0.75 ? "ZOOM OUT" : zoom === 1.0 ? "DEFAULT" : "ZOOM IN"}
        </span>
        <button
          onClick={() => setZoom(prev => Math.min(1.5, prev + 0.5))}
          disabled={zoom >= 1.5}
          className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Futuristic Sci-fi Geopolitical / Ecological Tactical Tooltip HUD */}
      <AnimatePresence>
        {hoveredHex && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl pointer-events-none flex flex-col min-w-[280px] z-50 text-left"
          >
            <div className="border-b border-slate-900 pb-3 mb-3">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider block mb-1">
                {hoveredHex.continent ? hoveredHex.continent.toUpperCase() : "UNCLAIMED SECTOR"}
              </span>
              <span className="text-base font-bold text-white tracking-tight flex items-center justify-between">
                <span>{hoveredHex.region ? hoveredHex.region : "WILDERNESS"}</span>
                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: hoveredHex.color || house.color }} />
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">AXIAL COORDINATE</span>
                <span className="text-white font-mono text-[11px] font-semibold">Q: {hoveredHex.q} / R: {hoveredHex.r}</span>
              </div>

              {hoveredHex.biome && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">BIOME</span>
                  <span className="text-indigo-400 font-mono font-semibold">{hoveredHex.biome}</span>
                </div>
              )}

              {hoveredHex.count && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">REGION COUNT</span>
                  <span className="text-cyan-400 font-mono font-semibold">{hoveredHex.count} HEX</span>
                </div>
              )}

              {hoveredHex.elevation && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">ELEVATION</span>
                  <span className="text-emerald-400 font-mono font-semibold">{hoveredHex.elevation}m</span>
                </div>
              )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
