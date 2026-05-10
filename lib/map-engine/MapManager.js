import * as PIXI from 'pixi.js';
import * as d3 from 'd3-geo';
import { GeoRenderer } from './GeoRenderer';
import { DistrictLayer } from './DistrictLayer';
import { HexSystem } from './HexSystem';

// ─────────────────────────────────────────────────────────────────────────────
// LOD Thresholds
// ─────────────────────────────────────────────────────────────────────────────
const LOD = {
  WORLD:    0,  // zoom < 2        — static world map + district glow silhouettes
  DISTRICT: 1,  // zoom 2–5        — district focus, grid hint, no hexes
  GAMEPLAY: 2,  // zoom > 5        — hex gameplay layer fully active
};

const LOD_THRESHOLDS = {
  WORLD_TO_DISTRICT: 2,
  DISTRICT_TO_GAMEPLAY: 5,
};

export class MapManager {
  constructor(container) {
    this.container = container;
    this.width  = container.clientWidth  || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    this.app = new PIXI.Application();

    // Layer stack (draw order: bottom → top)
    this.backgroundLayer = new PIXI.Container(); // static grid
    this.worldContainer  = new PIXI.Container(); // transforms with zoom/pan
    this.geoLayer        = new PIXI.Container(); // world map (baked texture)
    this.districtLayer   = new PIXI.Container(); // LOD 0-1 glow silhouettes
    this.hexLayer        = new PIXI.Container(); // LOD 2 gameplay hexes

    // Zoom / pan state
    this.zoom         = 1;
    this.targetZoom   = 1;
    this.offset       = { x: 0, y: 0 };
    this.targetOffset = { x: 0, y: 0 };

    // LOD state machine
    this.currentLOD = LOD.WORLD;

    // Subsystem refs (created lazily)
    this.geoRenderer    = null;
    this.districtGlow   = null;
    this.hexSystem      = null;
    this._hexSpawned    = false;  // HexSystem created at most once per session

    // Lifecycle
    this.isInitialized = false;
    this._destroyed    = false;
    this._fpsFrame     = 0;
    this._districtConfigs = [];

    this.projection = d3.geoMercator()
      .scale(this.width / (2 * Math.PI))
      .translate([this.width / 2, this.height / 2]);

    this.init();
  }

  // ───────────────────────────────────────────────────────── init
  async init() {
    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: 0x020617,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), // cap at 2× to spare GPU
      autoDensity: true,
    });

    if (this._destroyed) { this.app.destroy(); return; }

    this.container.appendChild(this.app.canvas);

    // Build layer hierarchy
    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.worldContainer);
    this.worldContainer.addChild(this.geoLayer);
    this.worldContainer.addChild(this.districtLayer);
    this.worldContainer.addChild(this.hexLayer);

    this._buildGrid();

    this.geoRenderer  = new GeoRenderer(this.geoLayer, this.projection, this.app);
    this.districtGlow = new DistrictLayer(this.districtLayer, this.projection);

    this.app.ticker.add(this._update.bind(this));
    this._bindInteractions();

    this.isInitialized = true;
  }

  // ───────────────────────────────────────────────────────── static grid
  _buildGrid() {
    const g    = new PIXI.Graphics();
    const step = 60;
    for (let x = 0; x <= this.width + step; x += step) {
      g.moveTo(x, 0); g.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height + step; y += step) {
      g.moveTo(0, y); g.lineTo(this.width, y);
    }
    g.stroke({ color: 0x1e293b, width: 1, alpha: 0.10 });
    this.backgroundLayer.addChild(g);
  }

  // ───────────────────────────────────────────────────────── interactions
  _bindInteractions() {
    this._onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      this.targetZoom = Math.max(1, Math.min(this.targetZoom * factor, 80));
    };
    this.app.canvas.addEventListener('wheel', this._onWheel, { passive: false });

    let dragging = false;
    let last = { x: 0, y: 0 };
    this.app.stage.interactive = true;
    this.app.stage.on('pointerdown', (e) => { dragging = true; last = { x: e.global.x, y: e.global.y }; });
    this.app.stage.on('pointermove', (e) => {
      if (!dragging) return;
      this.targetOffset.x += (e.global.x - last.x) / this.zoom;
      this.targetOffset.y += (e.global.y - last.y) / this.zoom;
      last = { x: e.global.x, y: e.global.y };
    });
    this.app.stage.on('pointerup',        () => { dragging = false; });
    this.app.stage.on('pointerupoutside', () => { dragging = false; });
  }

  // ───────────────────────────────────────────────────────── LOD resolver
  _resolveLOD(zoom) {
    if (zoom < LOD_THRESHOLDS.WORLD_TO_DISTRICT)    return LOD.WORLD;
    if (zoom < LOD_THRESHOLDS.DISTRICT_TO_GAMEPLAY) return LOD.DISTRICT;
    return LOD.GAMEPLAY;
  }

  // ───────────────────────────────────────────────────────── main loop
  _update(ticker) {
    const lerp = 0.12;
    this.zoom       += (this.targetZoom   - this.zoom)       * lerp;
    this.offset.x   += (this.targetOffset.x - this.offset.x) * lerp;
    this.offset.y   += (this.targetOffset.y - this.offset.y) * lerp;

    this.worldContainer.scale.set(this.zoom);
    this.worldContainer.position.set(
      this.width  / 2 + this.offset.x * this.zoom,
      this.height / 2 + this.offset.y * this.zoom,
    );

    // ── LOD state transition ─────────────────────────────────────────────
    const newLOD = this._resolveLOD(this.zoom);
    if (newLOD !== this.currentLOD) {
      this._onLODChange(this.currentLOD, newLOD);
      this.currentLOD = newLOD;
    }

    // ── Per-LOD updates (minimal work per frame) ─────────────────────────
    if (this.geoRenderer)  this.geoRenderer.update(this.zoom, this.currentLOD);
    if (this.districtGlow) this.districtGlow.update(this.zoom, this.currentLOD, ticker.lastTime);
    if (this._hexSpawned && this.hexSystem) {
      this.hexSystem.update(
        this.zoom,
        this.worldContainer.position,
        this.width, this.height,
        this.currentLOD,
      );
    }

    // ── FPS emission (every 30 frames) ──────────────────────────────────
    this._fpsFrame++;
    if (this._fpsFrame >= 30) {
      this._fpsFrame = 0;
      window.dispatchEvent(new CustomEvent('vf:fps', { detail: Math.round(ticker.FPS) }));
    }
  }

  // ───────────────────────────────────────────────────────── LOD transition
  _onLODChange(prev, next) {
    // LOD 2 → spawn HexSystem on first entry, never unmount
    if (next === LOD.GAMEPLAY && !this._hexSpawned) {
      this.hexSystem = new HexSystem(this.hexLayer, this.projection);
      if (this._districtConfigs.length) {
        this.hexSystem.setDistricts(this._districtConfigs);
      }
      this._hexSpawned = true;
    }

    // Dispatch LOD event so React overlay can react if needed
    window.dispatchEvent(new CustomEvent('vf:lod', { detail: next }));
  }

  // ───────────────────────────────────────────────────────── data loading
  async loadWorldData(url) {
    const res  = await fetch(url);
    const data = await res.json();
    if (this._destroyed) return;
    // GeoRenderer bakes to RenderTexture; subsequent frames are free
    this.geoRenderer.renderCountries(data, this.app);
  }

  setDistricts(configs) {
    this._districtConfigs = configs;
    this.districtGlow.setDistricts(configs);
    // HexSystem gets configs if it already exists (won't re-enter LOD2)
    if (this._hexSpawned && this.hexSystem) {
      this.hexSystem.setDistricts(configs);
    }
  }

  focusOn(lon, lat, zoom = 2.5) {
    this.targetOffset = {
      x: -lon * (this.width  / 360),
      y:  lat * (this.height / 180),
    };
    this.targetZoom = zoom;
  }

  // ───────────────────────────────────────────────────────── cleanup
  destroy() {
    this._destroyed = true;
    if (!this.isInitialized) return;

    this.app.ticker.stop();

    if (this._onWheel && this.app?.canvas) {
      this.app.canvas.removeEventListener('wheel', this._onWheel);
    }
    if (this.app?.canvas?.parentNode) {
      this.app.canvas.parentNode.removeChild(this.app.canvas);
    }
    try { this.app.destroy(); } catch (_) {}
  }
}
