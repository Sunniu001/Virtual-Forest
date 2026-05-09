import { create } from 'zustand';

export const useStore = create((set) => ({
  view: 'title', // 'title' | 'globe' | 'transition' | 'map'
  isLoggedIn: false,
  hoveredHouseId: null,
  focusedHouseId: null,
  selectedHouse: null,
  selectedHex: null,
  utcTimeString: '--:-- GMT',
  activeHexCount: 0,
  totalHexCount: 0,
  doneHexCount: 0,

  setView: (view) => set({ view }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setHoveredHouseId: (hoveredHouseId) => set({ hoveredHouseId }),
  setFocusedHouseId: (focusedHouseId) => set({ focusedHouseId }),
  setSelectedHouse: (selectedHouse) => set({ selectedHouse }),
  setSelectedHex: (selectedHex) => set({ selectedHex }),
  setUtcTimeString: (utcTimeString) => set({ utcTimeString }),
  setActiveHexCount: (activeHexCount) => set({ activeHexCount }),
  setTotalHexCount: (totalHexCount) => set({ totalHexCount }),
  setDoneHexCount: (doneHexCount) => set({ doneHexCount }),

  resetToGlobe: () => set({
    view: 'globe',
    selectedHouse: null,
    selectedHex: null,
    focusedHouseId: null,
    hoveredHouseId: null,
    activeHexCount: 0,
    totalHexCount: 0,
    doneHexCount: 0
  })
}));
