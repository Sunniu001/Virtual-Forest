import * as d3 from 'd3-geo';
import { HOUSES, HOUSE_REGIONS } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// HolographicGlobe — Canvas 2D + D3 geoOrthographic.
//
// Why Canvas 2D instead of PixiJS here:
//   • D3's geoPath renders directly into a Canvas 2D context in a single pass
//   • Handles hemisphere clipping automatically (backface culling for free)
//   • Zero object allocation per frame — no new Graphics() per draw
//   • For orthographic globe rendering, this is 5-10× faster than PixiJS Graphics
// ─────────────────────────────────────────────────────────────────────────────
export class HolographicGlobe {
  constructor(container, options = {}) {
    this.container = container;
    this.width  = container.clientWidth  || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;
    this.options = options;

    this.radius = Math.min(this.width, this.height) * 0.40;

    // Rotation
    this.lon          = 20;
    this.lat          = 0;
    this.rotVx        = 0;
    this.rotVy        = 0;
    this.autoSpeed    = 0.035; // degrees/frame

    // Interaction
    this._dragging  = false;
    this._lastMouse = { x: 0, y: 0 };

    // Data
    this._geoJson     = null;
    this._regionDots  = [];   // { lon, lat, colorCss, houseId }
    this._sphere      = { type: 'Sphere' };
    this._graticule   = d3.geoGraticule()();

    // Lifecycle
    this.isReady    = false;
    this._destroyed = false;
    this._rafId     = null;
    this._frame     = 0;
    this._SKIP      = 2; // render every N rAF ticks (halves GPU load)

    this._buildCanvas();
    this._buildProjection();
    this._bindInteractions();

    // Kick off render loop
    this._loop();
    this.isReady = true;
  }

  // ───────────────────────────────────────────────────────── canvas setup
  _buildCanvas() {
    this._canvas = document.createElement('canvas');
    this._canvas.width  = this.width  * Math.min(window.devicePixelRatio || 1, 2);
    this._canvas.height = this.height * Math.min(window.devicePixelRatio || 1, 2);
    this._canvas.style.width  = '100%';
    this._canvas.style.height = '100%';
    this._canvas.style.position = 'absolute';
    this._canvas.style.inset    = '0';
    this.container.appendChild(this._canvas);

    this._ctx = this._canvas.getContext('2d');

    // Scale context for device pixel ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._ctx.scale(dpr, dpr);
  }

  // ───────────────────────────────────────────────────────── projection
  _buildProjection() {
    this._proj = d3.geoOrthographic()
      .scale(this.radius)
      .translate([this.width / 2, this.height / 2])
      .clipAngle(90)
      .rotate([-this.lon, -this.lat]);

    this._path = d3.geoPath(this._proj, this._ctx);
  }

  // ───────────────────────────────────────────────────────── interactions
  _bindInteractions() {
    this._onDown  = (e) => {
      this._dragging = true;
      this.autoSpeed = 0;
      const src = e.touches ? e.touches[0] : e;
      this._lastMouse = { x: src.clientX, y: src.clientY };
    };
    this._onMove  = (e) => {
      if (!this._dragging) return;
      const src = e.touches ? e.touches[0] : e;
      this.rotVx += (src.clientX - this._lastMouse.x) * 0.35;
      this.rotVy += (src.clientY - this._lastMouse.y) * 0.25;
      this._lastMouse = { x: src.clientX, y: src.clientY };
    };
    this._onUp    = () => { this._dragging = false; this.autoSpeed = 0.035; };

    this._canvas.addEventListener('mousedown',  this._onDown,  { passive: true });
    this._canvas.addEventListener('touchstart', this._onDown,  { passive: true });
    window.addEventListener('mousemove',  this._onMove, { passive: true });
    window.addEventListener('touchmove',  this._onMove, { passive: true });
    window.addEventListener('mouseup',    this._onUp,   { passive: true });
    window.addEventListener('touchend',   this._onUp,   { passive: true });
  }

  // ───────────────────────────────────────────────────────── data
  async loadWorldData(url) {
    try {
      const res  = await fetch(url);
      const data = await res.json();
      if (this._destroyed) return;
      this._geoJson = data;
      this._buildDots();
    } catch (e) {
      console.warn('[HolographicGlobe] Failed to load world data:', e);
    }
  }

  _buildDots() {
    this._regionDots = [];
    HOUSES.forEach(house => {
      (HOUSE_REGIONS[house.id] || []).forEach(reg => {
        this._regionDots.push({ lon: reg.lon, lat: reg.lat, color: house.color, houseId: house.id });
      });
    });
  }

  // ───────────────────────────────────────────────────────── render loop
  _loop() {
    if (this._destroyed) return;

    this._rafId = requestAnimationFrame(() => this._loop());
    this._frame++;

    // Apply rotation
    this.lon  += this.autoSpeed + this.rotVx * 0.05;
    this.lat  += this.rotVy * 0.03;
    this.lat   = Math.max(-65, Math.min(65, this.lat));
    this.rotVx *= 0.90;
    this.rotVy *= 0.90;

    // Skip every other frame — halves GPU work, imperceptible at 60fps
    if (this._frame % this._SKIP !== 0) return;

    this._proj.rotate([-this.lon, -this.lat]);
    this._draw();

    // FPS telemetry
    if (this._frame % 60 === 0 && this._lastFrameTime) {
      const fps = Math.round(60000 / (performance.now() - this._lastFrameTime));
      window.dispatchEvent(new CustomEvent('vf:fps', { detail: Math.min(fps, 60) }));
    }
    if (this._frame % 60 === 0) this._lastFrameTime = performance.now();
  }

  // ───────────────────────────────────────────────────────── draw
  _draw() {
    const ctx = this._ctx;
    const w   = this.width;
    const h   = this.height;
    const cx  = w / 2;
    const cy  = h / 2;
    const r   = this.radius;

    ctx.clearRect(0, 0, w, h);

    // ── 1. Atmosphere rings (cheap, static draw) ─────────────────────────
    [[r + 20, 0.03], [r + 10, 0.06], [r + 4, 0.10], [r + 1.5, 0.20]].forEach(([rad, a]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(59, 130, 246, ${a})`;
      ctx.lineWidth   = 4;
      ctx.stroke();
    });

    // ── 2. Ocean fill ─────────────────────────────────────────────────────
    ctx.beginPath();
    this._path(this._sphere);
    ctx.fillStyle = '#020b18';
    ctx.fill();

    // ── 3. Graticule (lat/lon grid) ───────────────────────────────────────
    ctx.beginPath();
    this._path(this._graticule);
    ctx.strokeStyle = 'rgba(30, 58, 95, 0.35)';
    ctx.lineWidth   = 0.4;
    ctx.stroke();

    if (!this._geoJson) return;

    // ── 4. Land masses ────────────────────────────────────────────────────
    ctx.fillStyle = '#0d1b2a';
    this._geoJson.features.forEach(f => {
      ctx.beginPath();
      this._path(f);
      ctx.fill();
    });

    // ── 5. Country borders — glow layer ──────────────────────────────────
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
    ctx.lineWidth   = 1.2;
    this._geoJson.features.forEach(f => {
      ctx.beginPath();
      this._path(f);
      ctx.stroke();
    });

    // ── 6. Country borders — crisp inner layer ────────────────────────────
    ctx.strokeStyle = 'rgba(30, 58, 95, 0.80)';
    ctx.lineWidth   = 0.5;
    this._geoJson.features.forEach(f => {
      ctx.beginPath();
      this._path(f);
      ctx.stroke();
    });

    // ── 7. Faction region dots ────────────────────────────────────────────
    const pulse = Math.sin(this._frame * 0.06) * 0.25 + 0.75;
    this._regionDots.forEach(dot => {
      const projected = this._proj([dot.lon, dot.lat]);
      if (!projected) return; // behind globe

      const [px, py] = projected;

      // Outer glow
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = dot.color + '28';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      const alpha = Math.round(pulse * 200).toString(16).padStart(2, '0');
      ctx.fillStyle = dot.color + alpha;
      ctx.fill();
    });

    // ── 8. Sphere clip border ─────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // ───────────────────────────────────────────────────────── public API
  setHoveredHouse(id)  {}
  setFocusedHouse(id)  {}
  setUserHouseId(id)   {}

  focusOn(lon, lat) {
    this.lon = lon;
    this.lat = lat;
  }

  // ───────────────────────────────────────────────────────── cleanup
  destroy() {
    this._destroyed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);

    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup',   this._onUp);
    window.removeEventListener('touchmove', this._onMove);
    window.removeEventListener('touchend',  this._onUp);

    if (this._canvas?.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  }
}
