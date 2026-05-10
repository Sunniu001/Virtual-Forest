import * as PIXI from 'pixi.js';

// ─────────────────────────────────────────────────────────────────────────────
// DistrictLayer — LOD 0 & 1 only.
// Renders lightweight glowing ellipse silhouettes for each district region.
// These are simple Graphics objects — trivially cheap, no hex calculations.
// Hexes do NOT exist at this level.
// ─────────────────────────────────────────────────────────────────────────────
export class DistrictLayer {
  constructor(container, projection) {
    this.container  = container;
    this.projection = projection;

    this._graphics  = new PIXI.Graphics();
    this.container.addChild(this._graphics);

    this._districts = [];     // { cx, cy, rx, ry, color }
    this._time      = 0;
    this._lastLOD   = -1;
    this._PULSE_INTERVAL = 4; // redraw every 4 frames (lightweight animation)
    this._frameCount = 0;
  }

  // Call once after district configs are loaded
  setDistricts(configs) {
    this._districts = configs.map(d => {
      if (!d.center) return null;

      // Project geographic center to canvas coords
      const [lon, lat] = d.center;
      const p = this.projection([lon, lat]);
      if (!p) return null;

      // Radius in canvas pixels (spread degrees → pixels at base scale)
      const spreadPx = (d.spread || 5) * (this.projection.scale() / 60);

      return {
        cx:    p[0],
        cy:    p[1],
        rx:    spreadPx * 1.4, // slightly wider ellipse
        ry:    spreadPx,
        color: parseInt(d.color.replace('#', '0x')),
        label: d.name,
      };
    }).filter(Boolean);

    this._dirty = true;
  }

  update(zoom, lod, timeMs) {
    // DistrictLayer is only relevant at LOD 0 and 1
    this.container.visible = lod <= 1;
    if (!this.container.visible) return;

    this._frameCount++;
    if (!this._dirty && this._frameCount < this._PULSE_INTERVAL) return;
    this._frameCount = 0;
    this._dirty = false;

    this._time = timeMs / 1000;
    this._draw(zoom, lod);
  }

  _draw(zoom, lod) {
    const g = this._graphics;
    g.clear();

    const pulse = Math.sin(this._time * 1.2) * 0.15 + 0.85;

    // At LOD 1 districts glow stronger
    const baseAlpha = lod === 0 ? 0.25 : 0.5;

    this._districts.forEach(d => {
      const { cx, cy, rx, ry, color } = d;

      // Outer soft glow ellipse
      g.ellipse(cx, cy, rx * 1.5, ry * 1.5);
      g.fill({ color, alpha: 0.04 * pulse });

      // Mid glow ellipse
      g.ellipse(cx, cy, rx, ry);
      g.fill({ color, alpha: baseAlpha * 0.25 * pulse });

      // Inner bright ring
      g.ellipse(cx, cy, rx * 0.6, ry * 0.6);
      g.stroke({ color, width: 1.5 / Math.max(1, zoom * 0.5), alpha: baseAlpha * pulse });
      g.fill({ color, alpha: baseAlpha * 0.08 * pulse });
    });
  }
}
