"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Clock } from 'lucide-react';

const HOUSES = [
  {
    id: 'iboga',
    name: 'Iboga',
    color: '#a855f7',
    colorHex: 0xa855f7,
    territory: 'Africa',
    identity: 'Dense jungle, deep ecology, ancient biosphere.',
    stats: { nodes: '24,102', flourishing: '89%' },
    clans: ['Kirdi', 'Koro', 'Iteso', 'Hausa-Fulani', 'Oromo', 'San Bushmen', 'Tswana', 'Masaai', 'Bemba', 'Pygmies'],
    focus: { lat: 0, lon: 20 }
  },
  {
    id: 'datura',
    name: 'Datura',
    color: '#3b82f6',
    colorHex: 0x3b82f6,
    territory: 'Africa, India & SE Asia',
    identity: 'Mystical trade routes, transcontinental pathways.',
    stats: { nodes: '18,540', flourishing: '76%' },
    clans: ['Akan', 'Umoja Samburu', 'Khasi', 'Batek', 'Ceylon Moors', 'Minangkabau'],
    focus: { lat: 10, lon: 60 }
  },
  {
    id: 'peyote',
    name: 'Peyote',
    color: '#eab308',
    colorHex: 0xeab308,
    territory: 'North America',
    identity: 'Resilience, sacred landscapes, canyon biomes.',
    stats: { nodes: '12,300', flourishing: '92%' },
    clans: ['Sioux', 'Inuit', 'Zuni', 'Iroquois', 'Karankawa', 'Ojibwe', 'Shoshone', 'Cherokee', 'Apache', 'Kanaka Maoli'],
    focus: { lat: 40, lon: -100 }
  },
  {
    id: 'ayahuasca',
    name: 'Ayahuasca',
    color: '#22c55e',
    colorHex: 0x22c55e,
    territory: 'South America, Africa & Oceania',
    identity: 'Rivers, biodiversity, deep rainforest.',
    stats: { nodes: '31,000', flourishing: '95%' },
    clans: ['Salasaca', 'Maori', 'Koori', 'Diaguita', 'Zulu', 'Pakawa', 'Toba (Qom)', 'Quecha', 'Mapuche', 'Guarani'],
    focus: { lat: -20, lon: -60 }
  },
  {
    id: 'kava',
    name: 'Kava',
    color: '#ef4444',
    colorHex: 0xef4444,
    territory: 'Asia',
    identity: 'Coastal harmony, high-altitude ecology.',
    stats: { nodes: '9,850', flourishing: '81%' },
    clans: ['Nanai', 'Soligas', 'Chin', 'Orang Asli', 'Akha', 'Mentawai'],
    focus: { lat: 25, lon: 100 }
  }
];

const HOUSE_REGIONS = {
  iboga: [
    { lat: 10, lon: 15, spread: 0.15 }, { lat: 8, lon: 30, spread: 0.15 },
    { lat: 2, lon: 34, spread: 0.12 }, { lat: 12, lon: 8, spread: 0.2 },
    { lat: 5, lon: 42, spread: 0.15 }, { lat: -22, lon: 18, spread: 0.2 },
    { lat: -22, lon: 24, spread: 0.2 }, { lat: -3, lon: 36, spread: 0.15 },
    { lat: -10, lon: 31, spread: 0.2 }, { lat: -2, lon: 22, spread: 0.2 }
  ],
  datura: [
    { lat: 7, lon: -2, spread: 0.15 }, { lat: 1, lon: 37, spread: 0.15 },
    { lat: 8, lon: 80, spread: 0.1 }, { lat: 25, lon: 91, spread: 0.1 },
    { lat: 4, lon: 102, spread: 0.15 }, { lat: -0.5, lon: 100, spread: 0.15 }
  ],
  peyote: [
    { lat: 43, lon: -100, spread: 0.2 }, { lat: 65, lon: -100, spread: 0.4 },
    { lat: 35, lon: -108, spread: 0.15 }, { lat: 43, lon: -75, spread: 0.2 },
    { lat: 28, lon: -97, spread: 0.15 }, { lat: 48, lon: -88, spread: 0.2 },
    { lat: 40, lon: -115, spread: 0.15 }, { lat: 35, lon: -85, spread: 0.15 },
    { lat: 30, lon: -105, spread: 0.15 }, { lat: 20, lon: -155, spread: 0.1 }
  ],
  ayahuasca: [
    { lat: -1, lon: -78, spread: 0.1 }, { lat: -13, lon: -72, spread: 0.15 },
    { lat: -38, lon: -71, spread: 0.15 }, { lat: -40, lon: 174, spread: 0.15 },
    { lat: -29, lon: -69, spread: 0.15 }, { lat: -26, lon: -60, spread: 0.2 },
    { lat: -25, lon: -53, spread: 0.2 }, { lat: -28, lon: 31, spread: 0.15 },
    { lat: -34, lon: 138, spread: 0.1 }, { lat: -36, lon: 145, spread: 0.15 }
  ],
  kava: [
    { lat: 50, lon: 136, spread: 0.2 }, { lat: 21, lon: 100, spread: 0.15 },
    { lat: 22, lon: 93, spread: 0.1 }, { lat: 12, lon: 77, spread: 0.15 },
    { lat: 4, lon: 101, spread: 0.15 }, { lat: -2, lon: 99, spread: 0.15 }
  ]
};

// Global land mask cache to prevent redundant fetches and memory leaks across mounts
let cachedLandMask = null;

const loadLandMask = () => {
  if (cachedLandMask) return Promise.resolve(cachedLandMask);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'https://unpkg.com/three-globe/example/img/earth-water.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const data = ctx.getImageData(0, 0, img.width, img.height).data;
        cachedLandMask = { data, width: img.width, height: img.height };
        resolve(cachedLandMask);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
};

const isLand = (lat, lon, mask) => {
  if (!mask) return true;
  let x = Math.floor(((lon + 180) / 360) * mask.width);
  let y = Math.floor(((90 - lat) / 180) * mask.height);
  x = Math.max(0, Math.min(x, mask.width - 1));
  y = Math.max(0, Math.min(y, mask.height - 1));
  const index = (y * mask.width + x) * 4;
  return mask.data[index] < 128;
};

export default function GlobeView({ hoveredHouseId, focusedHouseId, onHoverHouse, onSelectHouse }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const pointsRef = useRef({});
  const atmosphereRef = useRef(null);
  const requestRef = useRef(null);
  const utcRef = useRef(null);

  const focusedHouseIdRef = useRef(focusedHouseId);
  useEffect(() => {
    focusedHouseIdRef.current = focusedHouseId;
  }, [focusedHouseId]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Track geometries and materials for absolute cleanup to prevent WebGL leaks
    const disposables = [];

    // Stars background
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(1000 * 3); // Slightly fewer stars for better performance
    for (let i = 0; i < 1000; i++) {
       starsPos[i*3] = (Math.random() - 0.5) * 300;
       starsPos[i*3+1] = (Math.random() - 0.5) * 300;
       starsPos[i*3+2] = (Math.random() - 0.5) * 300;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({color: 0x64748b, size: 0.3, transparent: true, opacity: 0.8});
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    disposables.push(starsGeo, starsMat);

    // Earth Sphere
    const sphereGeo = new THREE.SphereGeometry(10, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x222222, shininess: 15 });
    const earth = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(earth);
    disposables.push(sphereGeo, sphereMat);

    // Load Texture asynchronously and clean up
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (texture) => {
        sphereMat.map = texture;
        sphereMat.needsUpdate = true;
      }
    );
    disposables.push(earthTexture);

    earth.rotation.y = -Math.PI / 4;

    // Atmosphere
    const atmosGeo = new THREE.SphereGeometry(10.5, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x334155, transparent: true, opacity: 0.15, side: THREE.BackSide, blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);
    atmosphereRef.current = atmosphere;
    disposables.push(atmosGeo, atmosMat);

    const hitboxes = [];
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    disposables.push(hitboxMat);

    let isComponentMounted = true;

    // Initialize environment with non-blocking async loops
    const initEnvironment = async () => {
      const landMask = await loadLandMask();
      if (!isComponentMounted) return;

      const generateTerritoryPoints = async (houseId, colorHex, regions) => {
        const geo = new THREE.BufferGeometry();
        const pointsPerRegion = 100;
        const totalCount = regions.length * pointsPerRegion;
        const positions = new Float32Array(totalCount * 3);
        const colors = new Float32Array(totalCount * 3);
        const color = new THREE.Color(colorHex);
        
        let pIndex = 0;

        for (let rIndex = 0; rIndex < regions.length; rIndex++) {
          if (!isComponentMounted) return null;
          const region = regions[rIndex];
          const phiCenter = (90 - region.lat) * (Math.PI / 180);
          const thetaCenter = (region.lon + 180) * (Math.PI / 180);

          const hbGeo = new THREE.SphereGeometry(Math.max(region.spread * 12, 1.5), 8, 8);
          const hb = new THREE.Mesh(hbGeo, hitboxMat);
          hb.position.set(
            -(10 * Math.sin(phiCenter) * Math.cos(thetaCenter)),
            (10 * Math.cos(phiCenter)),
            (10 * Math.sin(phiCenter) * Math.sin(thetaCenter))
          );
          hb.userData = { houseId };
          earth.add(hb);
          hitboxes.push(hb);
          disposables.push(hbGeo); // Track for cleanup

          for (let i = 0; i < pointsPerRegion; i++) {
            let phi, theta;
            let attempts = 0;
            let found = false;

            while (!found && attempts < 5) { // Reduced max attempts from 10 to 5 to prevent UI freezes
              const r1 = Math.max(Math.random(), 0.0001);
              const r2 = Math.random();
              const uDist = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);
              const vDist = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2.0 * Math.PI * r2);
              
              const sampleLat = region.lat + (uDist * region.spread * 23); 
              const sampleLon = region.lon + (vDist * region.spread * 23);

              if (isLand(sampleLat, sampleLon, landMask)) {
                phi = (90 - sampleLat) * (Math.PI / 180);
                theta = (sampleLon + 180) * (Math.PI / 180);
                found = true;
              }
              attempts++;
            }

            if (!found) {
              phi = phiCenter;
              theta = thetaCenter;
            }
            
            const r = 10.05; 
            positions[pIndex * 3] = -(r * Math.sin(phi) * Math.cos(theta));
            positions[pIndex * 3 + 1] = (r * Math.cos(phi));
            positions[pIndex * 3 + 2] = (r * Math.sin(phi) * Math.sin(theta));

            colors[pIndex * 3] = color.r * 0.3;
            colors[pIndex * 3 + 1] = color.g * 0.3;
            colors[pIndex * 3 + 2] = color.b * 0.3;
            pIndex++;
          }
          // Non-blocking yield to main thread so that frame rate remains high during loading
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
          size: 0.15, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        earth.add(points);
        disposables.push(geo, mat);
        return points;
      };

      pointsRef.current['iboga'] = await generateTerritoryPoints('iboga', 0xa855f7, HOUSE_REGIONS.iboga);
      pointsRef.current['datura'] = await generateTerritoryPoints('datura', 0x3b82f6, HOUSE_REGIONS.datura);
      pointsRef.current['peyote'] = await generateTerritoryPoints('peyote', 0xeab308, HOUSE_REGIONS.peyote);
      pointsRef.current['ayahuasca'] = await generateTerritoryPoints('ayahuasca', 0x22c55e, HOUSE_REGIONS.ayahuasca);
      pointsRef.current['kava'] = await generateTerritoryPoints('kava', 0xef4444, HOUSE_REGIONS.kava);
    };

    initEnvironment();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); 
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xfffaeb, 2.5); 
    earth.add(sunLight); 

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-2, -2);
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: -Math.PI / 4, y: 0 };
    let lastHoveredId = null;

    const onPointerDown = (e) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      if (mountRef.current) mountRef.current.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        targetRotation.x += deltaX * 0.005;
        targetRotation.y += deltaY * 0.005;

        targetRotation.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.y));
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      if (mountRef.current) mountRef.current.style.cursor = lastHoveredId ? 'pointer' : 'grab';
      
      if (dragDistance < 5) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hitboxes);
        if (intersects.length > 0) {
          const houseId = intersects[0].object.userData.houseId;
          const house = HOUSES.find(h => h.id === houseId);
          if (house && onSelectHouse) onSelectHouse(house);
        }
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.style.cursor = 'grab';
    canvasDom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let time = 0;
    let lastUiUpdate = 0;

    const animate = () => {
      time += 0.005;
      
      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
      const sunLon = (12 - utcHours) * 15; 
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const declination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365.25);
      
      const sunPhi = (90 - declination) * (Math.PI / 180);
      const sunTheta = (sunLon + 180) * (Math.PI / 180);
      
      sunLight.position.set(
        -(100 * Math.sin(sunPhi) * Math.cos(sunTheta)),
        (100 * Math.cos(sunPhi)),
        (100 * Math.sin(sunPhi) * Math.sin(sunTheta))
      );

      // DOM-based performance optimization: update the innerText of the ref directly
      // rather than triggering a React state update which re-renders the component 60 times/sec!
      if (Date.now() - lastUiUpdate > 1000) {
        if (utcRef.current) {
          utcRef.current.innerText = `SOLAR ORBIT: ${now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })} GMT`;
        }
        lastUiUpdate = Date.now();
      }
      
      const currentFocusedHouseId = focusedHouseIdRef.current;

      if (currentFocusedHouseId && !isDragging) {
        const house = HOUSES.find(h => h.id === currentFocusedHouseId);
        if (house && house.focus) {
          const targetX = -(house.focus.lon + 90) * (Math.PI / 180);
          const targetY = house.focus.lat * (Math.PI / 180);
          let dx = targetX - targetRotation.x;
          dx = Math.atan2(Math.sin(dx), Math.cos(dx)); 
          targetRotation.x += dx * 0.04;
          targetRotation.y += (targetY - targetRotation.y) * 0.04;
        }
      } else if (!isDragging) {
        targetRotation.x += 0.001; 
        targetRotation.y += (0 - targetRotation.y) * 0.02; 
      }

      earth.rotation.y += (targetRotation.x - earth.rotation.y) * 0.1;
      earth.rotation.x += (targetRotation.y - earth.rotation.x) * 0.1;
      atmosphere.scale.setScalar(1 + Math.sin(time * 2) * 0.01);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitboxes);
      if (intersects.length > 0) {
        const hoveredId = intersects[0].object.userData.houseId;
        if (!isDragging && canvasDom) canvasDom.style.cursor = 'pointer';
        if (hoveredId !== lastHoveredId) {
          if (onHoverHouse) onHoverHouse(hoveredId);
          lastHoveredId = hoveredId;
        }
      } else {
        if (!isDragging && canvasDom) canvasDom.style.cursor = 'grab';
        if (lastHoveredId !== null) {
          if (onHoverHouse) onHoverHouse(null);
          lastHoveredId = null;
        }
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Strict cleanup function to prevent WebGL context leaks, CPU spikes, and computer crashes
    return () => {
      isComponentMounted = false;
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      cancelAnimationFrame(requestRef.current);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Explicitly dispose of all geometries, materials, and textures
      disposables.forEach(item => {
        if (item && typeof item.dispose === 'function') {
          item.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [onSelectHouse, onHoverHouse]); 

  // Fast response to hoveredHouseId changes to change the intensity of points in a performant way
  useEffect(() => {
    if (!sceneRef.current) return;

    const targetAtmosColor = new THREE.Color(0x334155);
    let targetOpacity = 0.15;

    if (hoveredHouseId) {
      const house = HOUSES.find(h => h.id === hoveredHouseId);
      if (house) {
        targetAtmosColor.setHex(house.colorHex);
        targetOpacity = 0.3;
      }
    }

    Object.keys(pointsRef.current).forEach(id => {
      const points = pointsRef.current[id];
      if (!points) return; 
      
      const isHovered = id === hoveredHouseId;
      const house = HOUSES.find(h => h.id === id);
      
      const targetColor = new THREE.Color(house.colorHex);
      const intensity = isHovered ? 1.0 : 0.2;
      const opacity = isHovered ? 1.0 : 0.6;
      
      points.material.opacity = opacity;
      
      const colors = points.geometry.attributes.color.array;
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = targetColor.r * intensity;
        colors[i+1] = targetColor.g * intensity;
        colors[i+2] = targetColor.b * intensity;
      }
      points.geometry.attributes.color.needsUpdate = true;
    });

    if (atmosphereRef.current) {
      atmosphereRef.current.material.color.copy(targetAtmosColor);
      atmosphereRef.current.material.opacity = targetOpacity;
    }

  }, [hoveredHouseId]);

  return (
    <React.Fragment>
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full text-xs font-mono text-slate-300 pointer-events-none z-10 shadow-lg">
        <Clock size={14} className="text-amber-400" />
        <span ref={utcRef}>SOLAR ORBIT: --:-- GMT</span>
      </div>
    </React.Fragment>
  );
}
