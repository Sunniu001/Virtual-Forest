/**
 * Holographic MapLibre style
 * Uses MapLibre's own free demo vector tiles (no API key required)
 * Schema: https://demotiles.maplibre.org — country + ocean layers only
 *
 * The style is intentionally minimal — no roads, labels, buildings, or POI.
 * Only geography. House faction color is passed in to tint district overlays.
 */

export function buildHolographicStyle(houseColor = '#a855f7') {
  return {
    version: 8,
    name: 'Zura Holographic',

    // ── Tile source ────────────────────────────────────────────────────────
    sources: {
      demotiles: {
        type: 'vector',
        url: 'https://demotiles.maplibre.org/tiles/tiles.json',
      },
    },

    // ── Layers (render order: first = bottom) ─────────────────────────────
    layers: [
      // 1. Deep ocean
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#050505' },
      },
 
      // 2. Land mass fill
      {
        id: 'land',
        type: 'fill',
        source: 'demotiles',
        'source-layer': 'countries',
        paint: {
          'fill-color': '#0f0f0f',
          'fill-opacity': 1,
        },
      },
 
      // 3. Country borders — soft glow layer (wide, low opacity)
      {
        id: 'country-border-glow',
        type: 'line',
        source: 'demotiles',
        'source-layer': 'countries',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
          'line-opacity': 0.05,
          'line-blur': 4,
        },
      },
 
      // 4. Country borders — crisp inner line
      {
        id: 'country-border',
        type: 'line',
        source: 'demotiles',
        'source-layer': 'countries',
        paint: {
          'line-color': '#2a2a2a',
          'line-width': 0.8,
          'line-opacity': 0.8,
        },
      },
 
      // 5. Coastlines — slightly brighter
      {
        id: 'coastline',
        type: 'line',
        source: 'demotiles',
        'source-layer': 'coastlines',
        paint: {
          'line-color': '#444444',
          'line-width': 1,
          'line-opacity': 0.3,
        },
      },
    ],
  };
}

/**
 * Africa continent bbox — used to set initial map bounds for Iboga house
 */
export const AFRICA_BOUNDS = [-20, -37, 55, 38];

export const HOUSE_MAP_CONFIGS = {
  iboga: {
    name: 'Iboga',
    color: '#a855f7',
    bounds: [-20, -37, 55, 38], // Africa
    districts: [
      { id: 'akan',        name: 'Akan District',         countries: ['Ghana'], hex: 20 },
      { id: 'kirdi',       name: 'Kirdi District',        countries: ['Cameroon'], hex: 50 },
      { id: 'koro',        name: 'Koro District',         countries: ['Sudan'], hex: 50 },
      { id: 'iteso',       name: 'Iteso District',        countries: ['United Republic of Tanzania', 'Burundi', 'Rwanda', 'Uganda'], hex: 250 },
      { id: 'hausa',       name: 'Hausa-Fulani District', countries: ['Nigeria'], hex: 150 },
      { id: 'oromo',       name: 'Oromo District',        countries: ['Ethiopia'], hex: 100 },
      { id: 'san',         name: 'San (Bushmen) District',countries: ['Namibia'], hex: 450 },
      { id: 'tswana',      name: 'Tswana District',       countries: ['South Africa'], hex: 450 },
      { id: 'maasai',      name: 'Maasai District',       countries: ['Kenya'], hex: 100 },
      { id: 'bemba',       name: 'Bemba District',        countries: ['Zambia'], hex: 150 },
      { id: 'pygmies',     name: 'Pygmies District',      countries: ['Democratic Republic of the Congo'], hex: 250 },
    ]
  },
  datura: {
    name: 'Datura',
    color: '#3b82f6',
    bounds: [30, -10, 150, 45], // SE Asia + Middle East + South India
    districts: [
      { id: 'umoja',     name: 'Umoja Samburu',      countries: ['Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Jordan', 'Syrian Arab Republic'], hex: 100 },
      { id: 'khasi',     name: 'Khasi District',      countries: ['India'], hex: 20 }, // NE India handled by country name filter + location logic
      { id: 'batek',     name: 'Batek, Orang Asli',  countries: ['Malaysia', 'Indonesia'], hex: 20 }, // Borneo
      { id: 'moors',     name: 'Ceylon Moors',       countries: ['Sri Lanka', 'India'], hex: 20 }, // Sri Lanka & South India
      { id: 'minang',    name: 'Minangkabau',        countries: ['Indonesia'], hex: 20 }, // Sumatra
      { id: 'mekong',    name: 'Mekong Sector',      countries: ['Vietnam', 'Cambodia', 'Lao PDR'], hex: 300 },
      { id: 'sunda',     name: 'Sunda District',      countries: ['Indonesia', 'Malaysia'], hex: 500 },
    ]
  },
  peyote: {
    name: 'Peyote',
    color: '#eab308',
    bounds: [-170, 18, -50, 75], // North America + Hawaii
    districts: [
      { id: 'cascadia',  name: 'Cascadia Sector',   countries: ['Canada'], hex: 800 },
      { id: 'appalachia',name: 'Appalachian Dist.', countries: ['United States of America'], hex: 1200 },
      { id: 'pacifica',  name: 'Pacifica Hawaii',   countries: ['Hawaii'], hex: 100 }, // Specific handling might be needed
      { id: 'mojave',    name: 'Mojave Sector',     countries: ['Mexico'], hex: 400 },
    ]
  },
  ayahuasca: {
    name: 'Ayahuasca',
    color: '#22c55e',
    bounds: [-95, -55, 155, 15], // South America + Australia
    districts: [
      { id: 'amazon',    name: 'Amazonas Sector',   countries: ['Brazil', 'Peru', 'Colombia', 'Ecuador'], hex: 1500 },
      { id: 'andes',     name: 'Andean District',   countries: ['Chile', 'Argentina', 'Bolivia'], hex: 600 },
      { id: 'outback',   name: 'Outback Sector',    countries: ['Australia'], hex: 900 },
      { id: 'tasmania',  name: 'Tasmania District', countries: ['Tasmania'], hex: 100 },
      { id: 'pampas',    name: 'Pampas Sector',     countries: ['Uruguay', 'Paraguay'], hex: 200 },
    ]
  },
  kava: {
    name: 'Kava',
    color: '#ef4444',
    bounds: [5, 45, 190, 85], // Russia, China, Scandinavia
    districts: [
      { id: 'siberia',   name: 'Siberian Sector',   countries: ['Russia'], hex: 1800 },
      { id: 'han',       name: 'Han District',      countries: ['China'], hex: 1500 },
      { id: 'nordic',    name: 'Nordic Sector',     countries: ['Norway', 'Sweden', 'Finland', 'Denmark'], hex: 400 },
      { id: 'mongol',    name: 'Mongol Steppe',     countries: ['Mongolia', 'Kazakhstan'], hex: 300 },
    ]
  }
};
