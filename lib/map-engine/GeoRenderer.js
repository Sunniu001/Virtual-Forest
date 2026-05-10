import * as PIXI from 'pixi.js';

// ─────────────────────────────────────────────────────────────────────────────
// GeoRenderer — renders world geography ONCE into a RenderTexture.
// After the initial bake, every frame is just a Sprite draw — essentially free.
// ─────────────────────────────────────────────────────────────────────────────
export class GeoRenderer {
  constructor(container, projection) {
    this.container  = container;
    this.projection = projection;

    this._sprite        = null;
    this._lastLODBucket = -1;
  }

  // Draw all countries into a RenderTexture once, then display as a Sprite
  renderCountries(geoJson, app) {
    const width  = app.screen.width  || app.renderer.width;
    const height = app.screen.height || app.renderer.height;

    if (!width || !height) {
      console.warn('[GeoRenderer] Zero canvas dimensions — skipping bake');
      return;
    }

    // ── 1. Build Graphics offscreen ────────────────────────────────────────
    const g = new PIXI.Graphics();
    const LAND   = 0x0d1b2a;
    const BORDER = 0x1e293b;
    const GLOW   = 0x3b82f6;

    geoJson.features.forEach(feature => {
      const geom = feature?.geometry;
      if (!geom) return;

      const polys =
        geom.type === 'Polygon'      ? [geom.coordinates] :
        geom.type === 'MultiPolygon' ?  geom.coordinates  : [];

      polys.forEach(poly => {
        const ring = poly[0];
        if (!ring || ring.length < 3) return;

        const pts = ring
          .map(c => { const p = this.projection(c); return p ? { x: p[0], y: p[1] } : null; })
          .filter(Boolean);
        if (pts.length < 3) return;

        g.poly(pts, true);
        g.fill({ color: LAND, alpha: 1 });

        g.poly(pts, true);
        g.stroke({ color: GLOW, width: 1.5, alpha: 0.18 });

        g.poly(pts, true);
        g.stroke({ color: BORDER, width: 0.5, alpha: 0.85 });
      });
    });

    // ── 2. Bake to RenderTexture (one GPU upload, then free) ────────────────
    try {
      const rt = PIXI.RenderTexture.create({ width, height });
      app.renderer.render({ container: g, target: rt });
      g.destroy();

      const sprite = new PIXI.Sprite(rt);
      sprite.x = -width  / 2;
      sprite.y = -height / 2;
      this.container.addChild(sprite);
      this._sprite = sprite;
    } catch (err) {
      // Fallback: live Graphics (slower, always works)
      console.warn('[GeoRenderer] Bake failed, using live Graphics:', err?.message);
      g.x = -width  / 2;
      g.y = -height / 2;
      this.container.addChild(g);
    }
  }

  // Called every frame — only changes when LOD bucket changes
  update(zoom, lod) {
    if (!this._sprite) return;
    if (lod === this._lastLODBucket) return;
    this._lastLODBucket = lod;

    // LOD 0 = full; LOD 1 = slightly dimmed; LOD 2 = faded (hexes dominate)
    this._sprite.alpha = lod === 0 ? 1.0 : lod === 1 ? 0.7 : 0.35;
  }
}
