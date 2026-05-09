import * as THREE from 'three';

/**
 * Custom Shaders for Cinematic WebGL Rendering
 */
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform vec3 color;
    void main() {
      // Fresnel rim lighting glow effect
      float intensity = pow(0.75 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
      gl_FragColor = vec4(color, 1.0) * intensity;
    }
  `
};

export class GlobeEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.onHoverHouse = options.onHoverHouse || (() => {});
    this.onSelectHouse = options.onSelectHouse || (() => {});
    
    this.houses = options.houses || [];
    this.regions = options.regions || {};

    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.disposables = [];
    this.points = {};
    this.hitboxes = [];
    
    this.targetRotation = { x: -Math.PI / 4, y: 0 };
    this.isDragging = false;
    this.dragDistance = 0;
    this.previousMousePosition = { x: 0, y: 0 };
    this.lastHoveredId = null;
    this.isDestroyed = false;

    // Animation tracking
    this.time = 0;
    this.requestRef = null;

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#020617');
    this.scene.fog = new THREE.FogExp2('#020617', 0.012);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 29.5; // Adjusted distance to scale the globe down beautifully for more HUD breathing room

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Interactive canvas settings
    this.canvasDom = this.renderer.domElement;
    this.canvasDom.style.cursor = 'grab';

    // 5. Build Scene
    this.buildStars();
    this.buildGlobe();
    this.buildAtmosphere();
    this.buildOrbitalRings();
    this.buildLights();
    this.buildTerritories();

    // 6. Bind Events
    this.bindEvents();

    // 7. Start Loop
    this.animate();
  }

  buildStars() {
    const starsGeo = new THREE.BufferGeometry();
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      // Give stars subtle color variation (deep blue, white, soft gold)
      const r = Math.random();
      if (r < 0.2) {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 1.0; // soft blue
      } else if (r < 0.4) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.7; // soft gold
      } else {
        colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.9; // white
      }
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(starsGeo, starsMat);
    this.scene.add(this.stars);
    this.disposables.push(starsGeo, starsMat);
  }

  buildGlobe() {
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    const sphereGeo = new THREE.SphereGeometry(10, 64, 64);
    // Sleek holographic continental sphere material
    this.sphereMat = new THREE.MeshPhongMaterial({
      color: 0xffffff, // White base color so satellite texture details render with full bright contrast
      specular: 0x222222,
      shininess: 15,
      bumpScale: 0.05
    });

    this.earth = new THREE.Mesh(sphereGeo, this.sphereMat);
    this.earthGroup.add(this.earth);
    this.disposables.push(sphereGeo, this.sphereMat);

    // Asynchronously load earth marble texture and handle bump map for perceived depth
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (texture) => {
        if (this.isDestroyed) return;
        this.sphereMat.map = texture;
        this.sphereMat.needsUpdate = true;
      }
    );

    this.earthGroup.rotation.y = -Math.PI / 4;
  }

  buildAtmosphere() {
    const atmosGeo = new THREE.SphereGeometry(10.6, 64, 64);
    this.atmosMat = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0x334155) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.atmosphere = new THREE.Mesh(atmosGeo, this.atmosMat);
    this.scene.add(this.atmosphere);
    this.disposables.push(atmosGeo, this.atmosMat);
  }

  buildOrbitalRings() {
    // Generate beautiful futuristic orbital ring rings around the planet
    const ringGroup = new THREE.Group();
    this.earthGroup.add(ringGroup);

    const createRing = (radius, color, speed, rotX, rotY) => {
      const segments = 128;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array((segments + 1) * 3);
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pos[i * 3] = Math.cos(theta) * radius;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = Math.sin(theta) * radius;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geo, mat);
      line.rotation.x = rotX;
      line.rotation.y = rotY;
      ringGroup.add(line);
      this.disposables.push(geo, mat);

      return { line, speed };
    };

    this.orbitalRings = [
      createRing(11.2, 0x3b82f6, 0.002, Math.PI / 6, Math.PI / 12),
      createRing(11.8, 0xa855f7, -0.001, -Math.PI / 4, Math.PI / 6),
      createRing(12.5, 0x22c55e, 0.003, Math.PI / 3, -Math.PI / 8)
    ];
  }

  buildLights() {
    // High ambient light so that all continents and ocean details are perfectly clear (as seen in reference)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Sleek cinematic key light pointing from the top-right camera angle to match reference gradient
    this.sunLight = new THREE.DirectionalLight(0xfffaeb, 2.2);
    this.sunLight.position.set(60, 45, 80);
    this.scene.add(this.sunLight);
  }

  buildTerritories() {
    this.hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    this.disposables.push(this.hitboxMat);
    this.labels = [];

    this.houses.forEach((house) => {
      const houseRegions = this.regions[house.id] || [];
      const geo = new THREE.BufferGeometry();
      let totalCount = 0;
      houseRegions.forEach(region => {
        const count = region.count ? region.count * 6 : 90; // Proportional scale factor
        totalCount += count;
      });
      const positions = new Float32Array(totalCount * 3);
      const colors = new Float32Array(totalCount * 3);
      const color = new THREE.Color(house.colorHex);

      let pIndex = 0;

      houseRegions.forEach((region, index) => {
        const phiCenter = (90 - region.lat) * (Math.PI / 180);
        const thetaCenter = (region.lon + 180) * (Math.PI / 180);
        const clanName = house.clans[index] || `Clan ${index + 1}`;

        // Surface coordinate point (radius = 10.04)
        const pos = new THREE.Vector3(
          -(10.04 * Math.sin(phiCenter) * Math.cos(thetaCenter)),
          (10.04 * Math.cos(phiCenter)),
          (10.04 * Math.sin(phiCenter) * Math.sin(thetaCenter))
        );

        // 3. Futuristic Pointer Leader Line extending to outer label point
        const endPos = pos.clone().normalize().multiplyScalar(10.8 + (index % 3) * 0.2); // offset to prevent overlapping
        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, endPos]);
        const lineMat = new THREE.LineBasicMaterial({
          color: house.colorHex,
          transparent: true,
          opacity: 0.55,
          depthWrite: false
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.earth.add(line);
        this.disposables.push(lineGeo, lineMat);

        // 4. Save label data with dynamic particle count suffix (e.g. "Cameroon (5)")
        const countSuffix = region.count !== undefined ? ` (${region.count})` : '';
        this.labels.push({
          id: `${house.id}-${index}`,
          houseId: house.id,
          text: `${index + 1}. ${clanName.toUpperCase()}${countSuffix}`,
          color: house.color,
          position: endPos
        });

        // Interactive Hitbox sphere
        const hbGeo = new THREE.SphereGeometry(Math.max(region.spread * 12, 1.4), 8, 8);
        const hb = new THREE.Mesh(hbGeo, this.hitboxMat);
        hb.position.copy(pos);
        hb.userData = { houseId: house.id };
        this.earth.add(hb);
        this.hitboxes.push(hb);
        this.disposables.push(hbGeo);

        // Pre-distribute particle coordinates mathematically based on dynamic region weights
        const count = region.count ? region.count * 6 : 90;
        for (let i = 0; i < count; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          
          const angleOffset = Math.random() * region.spread * 0.9;
          let samplePhi = phiCenter + (Math.cos(theta) * angleOffset);
          let sampleTheta = thetaCenter + (Math.sin(theta) * angleOffset);

          // Algorithmic Geographic Clamping to ensure particles reside strictly inside landmasses
          let sampleLat = 90 - (samplePhi * (180 / Math.PI));
          let sampleLon = (sampleTheta * (180 / Math.PI)) - 180;

          if (house.id === 'peyote') { // North America clamping boundaries
            if (sampleLon < -120) sampleLon = -118 + Math.random() * 2;
            if (sampleLon > -75) sampleLon = -77 - Math.random() * 2;
            if (sampleLat < 25 && sampleLon > -95) sampleLat = 26 + Math.random() * 2;
          } else if (house.id === 'ayahuasca') { // South America clamping boundaries
            if (sampleLon < -80 && sampleLat < 0) sampleLon = -76 + Math.random() * 2;
            if (sampleLon > -38 && sampleLat < 0) sampleLon = -42 - Math.random() * 2;
          } else if (house.id === 'iboga') { // Africa clamping boundaries
            if (sampleLon < -16) sampleLon = -12 + Math.random() * 2;
            if (sampleLon > 51) sampleLon = 46 - Math.random() * 2;
            // Southern African funnel clamping (keeps Namibia, South Africa, Zambia, Congo off the oceans)
            if (sampleLat < -10) {
              if (sampleLon < 12) sampleLon = 13 + Math.random() * 2;
              if (sampleLon > 34) sampleLon = 32 - Math.random() * 2;
            }
            if (sampleLat < -20) {
              if (sampleLon < 16) sampleLon = 17 + Math.random() * 1.5;
              if (sampleLon > 31) sampleLon = 29 - Math.random() * 1.5;
            }
            // Western Africa Gulf of Guinea clamping (keeps Nigeria, Cameroon off the ocean)
            if (sampleLat > 0 && sampleLat < 10) {
              if (sampleLon < 15 && sampleLat < 4.5) sampleLat = 5 + Math.random() * 1.5;
            }
          } else if (house.id === 'kava') { // Asia clamping boundaries
            if (sampleLon < 65) sampleLon = 70 + Math.random() * 2;
            if (sampleLat < 10) sampleLat = 12 + Math.random() * 2;
          }

          samplePhi = (90 - sampleLat) * (Math.PI / 180);
          sampleTheta = (sampleLon + 180) * (Math.PI / 180);

          const r = 10.04 + Math.random() * 0.04;
          positions[pIndex * 3] = -(r * Math.sin(samplePhi) * Math.cos(sampleTheta));
          positions[pIndex * 3 + 1] = (r * Math.cos(samplePhi));
          positions[pIndex * 3 + 2] = (r * Math.sin(samplePhi) * Math.sin(sampleTheta));

          colors[pIndex * 3] = color.r * 0.22;
          colors[pIndex * 3 + 1] = color.g * 0.22;
          colors[pIndex * 3 + 2] = color.b * 0.22;
          pIndex++;
        }
      });

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.24, // Crisp, beautifully sized square pixels (matching reference)
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(geo, mat);
      this.earth.add(points);
      this.points[house.id] = points;
      this.disposables.push(geo, mat);
    });
  }

  setFocusedHouse(houseId) {
    this.focusedHouseId = houseId;
  }

  setHoveredHouse(houseId) {
    this.hoveredHouseId = houseId;
    const targetAtmosColor = new THREE.Color(0x334155);
    let targetOpacity = 0.15;

    if (houseId) {
      const house = this.houses.find(h => h.id === houseId);
      if (house) {
        targetAtmosColor.setHex(house.colorHex);
        targetOpacity = 0.35;
      }
    }

    // High performance imperative update to point and atmosphere materials
    Object.keys(this.points).forEach(id => {
      const pts = this.points[id];
      if (!pts) return;
      
      const isHovered = id === houseId;
      const house = this.houses.find(h => h.id === id);
      const col = new THREE.Color(house.colorHex);
      
      const intensity = isHovered || !houseId ? 1.0 : 0.45;
      pts.material.opacity = isHovered || !houseId ? 0.95 : 0.65;

      const colors = pts.geometry.attributes.color.array;
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = col.r * intensity;
        colors[i+1] = col.g * intensity;
        colors[i+2] = col.b * intensity;
      }
      pts.geometry.attributes.color.needsUpdate = true;
    });

    if (this.atmosphere) {
      this.atmosMat.uniforms.color.value.copy(targetAtmosColor);
      this.atmosphere.scale.setScalar(1 + (houseId ? 0.02 : 0));
    }
  }

  bindEvents() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-2, -2);

    this.onPointerDown = (e) => {
      this.isDragging = true;
      this.dragDistance = 0;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.canvasDom.style.cursor = 'grabbing';
    };

    this.onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        this.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        this.targetRotation.x += deltaX * 0.005;
        this.targetRotation.y += deltaY * 0.005;

        this.targetRotation.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.y));
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    this.onPointerUp = () => {
      this.isDragging = false;
      this.canvasDom.style.cursor = this.lastHoveredId ? 'pointer' : 'grab';
      
      if (this.dragDistance < 5) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.hitboxes);
        if (intersects.length > 0) {
          const houseId = intersects[0].object.userData.houseId;
          const house = this.houses.find(h => h.id === houseId);
          if (house) this.onSelectHouse(house);
        }
      }
    };

    this.canvasDom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

    this.handleResize = () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    };
    window.addEventListener('resize', this.handleResize);
  }

  animate() {
    if (this.isDestroyed) return;

    this.time += 0.005;

    // 1. Orbital Rings rotations
    this.orbitalRings.forEach(ring => {
      ring.line.rotation.y += ring.speed;
    });

    // 2. Fixed cinematic key light angle (matches reference image gradient)
    this.sunLight.position.set(60, 45, 80);

    // 3. Camera Interpolation (Smooth cinematic focusing via Lerp)
    if (this.focusedHouseId && !this.isDragging) {
      const house = this.houses.find(h => h.id === this.focusedHouseId);
      if (house && house.focus) {
        const targetX = -(house.focus.lon + 90) * (Math.PI / 180);
        const targetY = house.focus.lat * (Math.PI / 180);
        let dx = targetX - this.targetRotation.x;
        dx = Math.atan2(Math.sin(dx), Math.cos(dx)); 
        this.targetRotation.x += dx * 0.04;
        this.targetRotation.y += (targetY - this.targetRotation.y) * 0.04;
      }
    } else if (!this.isDragging) {
      this.targetRotation.x += 0.001; // slow default planetary spin
      this.targetRotation.y += (0 - this.targetRotation.y) * 0.02;
    }

    this.earthGroup.rotation.y += (this.targetRotation.x - this.earthGroup.rotation.y) * 0.1;
    this.earthGroup.rotation.x += (this.targetRotation.y - this.earthGroup.rotation.x) * 0.1;

    // Subtle atmospheric pulsing
    this.atmosphere.scale.setScalar(1 + Math.sin(this.time * 2) * 0.008 + (this.hoveredHouseId ? 0.012 : 0));

    // 4. Raycasting interaction check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hitboxes);
    if (intersects.length > 0) {
      const hoveredId = intersects[0].object.userData.houseId;
      if (!this.isDragging) this.canvasDom.style.cursor = 'pointer';
      if (hoveredId !== this.lastHoveredId) {
        this.onHoverHouse(hoveredId);
        this.lastHoveredId = hoveredId;
      }
    } else {
      if (!this.isDragging) this.canvasDom.style.cursor = 'grab';
      if (this.lastHoveredId !== null) {
        this.onHoverHouse(null);
        this.lastHoveredId = null;
      }
    }

    // 5. Project 3D labels to 2D screen coordinates
    if (this.labels && this.labels.length > 0) {
      const tempCamPos = new THREE.Vector3();
      this.camera.getWorldPosition(tempCamPos);

      const projected = this.labels.map(lbl => {
        const vector = lbl.position.clone();
        vector.applyMatrix4(this.earth.matrixWorld);

        // Check if label is on camera-facing hemisphere
        const dot = vector.clone().normalize().dot(tempCamPos.clone().normalize());
        const visible = dot > 0.15;

        vector.project(this.camera);
        const x = (vector.x * 0.5 + 0.5) * this.width;
        const y = (-(vector.y * 0.5) + 0.5) * this.height;

        return {
          id: lbl.id,
          houseId: lbl.houseId,
          text: lbl.text,
          color: lbl.color,
          x,
          y,
          visible
        };
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('updateLabels', { detail: projected }));
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.requestRef = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.requestRef);

    // Unbind listeners
    if (this.canvasDom) {
      this.canvasDom.removeEventListener('pointerdown', this.onPointerDown);
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('resize', this.handleResize);

    // Remove canvas
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }

    // Explicitly dispose of Three.js objects
    this.disposables.forEach((item) => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });

    this.renderer.dispose();
  }
}
