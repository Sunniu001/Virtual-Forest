import * as PIXI from 'pixi.js';
import * as h3 from 'h3-js';

// ─────────────────────────────────────────────────────────────────────────────
// HexSystem — LOD 2 ONLY.
// This class is instantiated lazily by MapManager only when zoom crosses
// the GAMEPLAY threshold for the first time.
// Hexes do not exist before that moment.
// ─────────────────────────────────────────────────────────────────────────────

// Viewport margin (pixels) — how far outside screen edge we still render
const CULL_MARGIN = 60;
const REDRAW_INTERVAL = 45; // redraw every N frames (not every frame)

export class HexSystem {
  constructor(container, projection) {
    this.container  = container;
    this.projection = projection;

    this._g     = new PIXI.Graphics();
    this.container.addChild(this._g);

    this._hexes       = []; // pre-computed geometry, never recalculated
    this._time        = 0;
    this._dirty       = true;
    this._frameCount  = 0;
  }

  // ───────────────────────────────────────────────────────── data setup
  setDistricts(configs) {
    this._hexes = [];

    configs.forEach(d => {
      if (!d.polygon) return;

      const resolution = 7; // H3 res 7 ~ 5km cells — good granularity
      let ids = [];
      try {
        ids = h3.polygonToCells(d.polygon.coordinates, resolution, true);
      } catch (_) { return; }

      const selected = this._shuffle(ids).slice(0, d.hexCount || 10);

      selected.forEach(id => {
        const boundary = h3.cellToBoundary(id);
        const center   = h3.cellToLatLng(id);
        const pCenter  = this.projection([center[1], center[0]]);
        if (!pCenter) return;

        const pBound = boundary
          .map(c => { const p = this.projection([c[1], c[0]]); return p ? { x: p[0], y: p[1] } : null; })
          .filter(Boolean);

        if (pBound.length < 3) return;

        this._hexes.push({
          id,
          cx: pCenter[0],
          cy: pCenter[1],
          boundary: pBound,
          colorInt: parseInt(d.color.replace('#', '0x')),
          districtId: d.id,
          status: Math.random() > 0.8 ? 'seeded' : 'available',
          pulseOffset: Math.random() * Math.PI * 2,
        });
      });
    });

    this._dirty = true;
  }

  // ───────────────────────────────────────────────────────── per-frame
  update(zoom, worldPos, screenW, screenH, lod) {
    // Hard gate — only active at LOD 2
    this.container.visible = lod === 2;
    if (!this.container.visible) return;

    this._frameCount++;
    if (!this._dirty && this._frameCount < REDRAW_INTERVAL) return;
    this._frameCount = 0;
    this._dirty = false;

    this._time += 0.2; // advance animation time only when drawing

    this._drawHexes(zoom, worldPos, screenW, screenH);
  }

  // ───────────────────────────────────────────────────────── draw (culled)
  _drawHexes(zoom, worldPos, screenW, screenH) {
    const g = this._g;
    g.clear();

    // Screen-space bounds for culling
    const left   = -worldPos.x / zoom - CULL_MARGIN;
    const top    = -worldPos.y / zoom - CULL_MARGIN;
    const right  = left + screenW / zoom + CULL_MARGIN * 2;
    const bottom = top  + screenH / zoom + CULL_MARGIN * 2;

    const borderW = Math.max(0.3, 1.2 / Math.sqrt(zoom));

    let drawn = 0;

    this._hexes.forEach(hex => {
      // Viewport cull — skip hexes outside visible area
      if (hex.cx < left || hex.cx > right || hex.cy < top || hex.cy > bottom) return;

      drawn++;
      const isSeeded = hex.status === 'seeded';
      const pulse    = isSeeded
        ? Math.sin(this._time + hex.pulseOffset) * 0.18 + 0.82
        : 1;

      g.poly(hex.boundary, true);
      g.fill({ color: hex.colorInt, alpha: isSeeded ? 0.38 * pulse : 0.08 });

      g.poly(hex.boundary, true);
      g.stroke({ color: hex.colorInt, width: borderW, alpha: isSeeded ? 0.75 : 0.22 });
    });

    // Optional: emit visible hex count for diagnostics
    if (this._frameCount === 0) {
      window.dispatchEvent(new CustomEvent('vf:hexcount', { detail: drawn }));
    }
  }

  // ───────────────────────────────────────────────────────── utils
  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
