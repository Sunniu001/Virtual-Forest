export const HOUSES = [
  {
    id: 'iboga',
    name: 'Iboga',
    archetype: 'The Dreamers',
    motto: 'Visionary Consciousness',
    color: '#a855f7',
    colorHex: 0xa855f7,
    philosophy: 'The Ibogans wander through imagination, memory, and myth. They transform dreams into futures yet unseen.',
    traits: ['Creative', 'Visionary', 'Social'],
    territory: 'Central Africa',
    stats: { nodes: '24,102', flourishing: '89%' },
    clans: ['Kirdi District', 'Koro District', 'Iteso District', 'Hausa-Fulani District', 'Oromo District', 'San(Bushmen) District', 'Tswana District', 'Masaai District', 'Bemba District', 'Pygmies District'],
    focus: { lat: 0, lon: 20 }
  },
  {
    id: 'datura',
    name: 'Datura',
    archetype: 'The Philosophers',
    motto: 'Cognitive Order',
    color: '#3b82f6',
    colorHex: 0x3b82f6,
    philosophy: 'The Daturathustars seek understanding beyond instinct. They preserve knowledge, decode systems, and pursue clarity across the cosmos.',
    traits: ['Analytical', 'Strategic', 'Wisdom core'],
    territory: 'Africa, India & SE Asia',
    stats: { nodes: '18,540', flourishing: '76%' },
    clans: ['Kenya(Samburu)', 'Ghana(Akan)', 'India(Khasi)', 'Borneo(Batek)', 'SriLanka(Moors)', 'Sumatra(MMB)'],
    focus: { lat: 10, lon: 60 }
  },
  {
    id: 'peyote',
    name: 'Peyote',
    archetype: 'The Optimists',
    motto: 'Solar Resilience',
    color: '#eab308',
    colorHex: 0xeab308,
    philosophy: 'The Peyotics believe flourishing is inevitable. Even in collapse, they build hope, warmth, and collective momentum.',
    traits: ['Hopeful', 'Mystical', 'Adaptive'],
    territory: 'North America',
    stats: { nodes: '12,300', flourishing: '92%' },
    clans: ['Sioux', 'Inuit', 'Zuni', 'Iroquois', 'Karankawa', 'Ojibwe', 'Shoshone', 'Cherokee', 'Apache', 'Kanaka Maoli'],
    focus: { lat: 40, lon: -100 }
  },
  {
    id: 'ayahuasca',
    name: 'Ayahuasca',
    archetype: 'The Stewards',
    motto: 'Ecological Harmony',
    color: '#22c55e',
    colorHex: 0x22c55e,
    philosophy: 'The Ayahuascans protect the balance between civilization and nature. They cultivate life where others consume it.',
    traits: ['Nurturing', 'Ecological', 'Cooperative'],
    territory: 'South America, Africa & Oceania',
    stats: { nodes: '31,000', flourishing: '95%' },
    clans: ['Salasaca', 'Maori', 'Koori', 'Diaguita', 'Zulu', 'Pakawa', 'Toba (Qom)', 'Quecha', 'Mapuche', 'Guarani'],
    focus: { lat: -20, lon: -60 }
  },
  {
    id: 'kava',
    name: 'Kava',
    archetype: 'The Adventurers',
    motto: 'Frontier Instinct',
    color: '#ef4444',
    colorHex: 0xef4444,
    philosophy: 'The Kaivics cross forbidden territories, confront uncertainty, and expand the boundaries of the known world.',
    traits: ['Bold', 'Exploratory', 'Competitive'],
    territory: 'Asia',
    stats: { nodes: '9,850', flourishing: '81%' },
    clans: ['Nanai', 'Soligas', 'Chin', 'Orang Asli', 'Akha', 'Mentawai'],
    focus: { lat: 25, lon: 100 }
  }
];

export const HOUSE_REGIONS = {
  iboga: [
    { lat: 10, lon: 15, spread: 0.15, count: 5 }, { lat: 8, lon: 30, spread: 0.15, count: 5 },
    { lat: 2, lon: 34, spread: 0.12, count: 25 }, { lat: 12, lon: 8, spread: 0.2, count: 15 },
    { lat: 5, lon: 42, spread: 0.15, count: 10 }, { lat: -22, lon: 18, spread: 0.2, count: 45 },
    { lat: -22, lon: 24, spread: 0.2, count: 45 }, { lat: -3, lon: 36, spread: 0.15, count: 10 },
    { lat: -10, lon: 31, spread: 0.2, count: 15 }, { lat: -2, lon: 22, spread: 0.2, count: 25 }
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
