import { create } from 'zustand';

export const useStore = create((set) => ({
  view: 'title', // 'title' | 'globe' | 'transition' | 'map'
  isLoggedIn: false,
  
  // --- New User Ecosystem Profile State ---
  userHouseId: null, // 'iboga', 'datura', 'peyote', 'ayahuasca', 'kava'
  karmaScore: 1250,
  userRank: '#4,102',
  activeCommandTab: null, // 'play' | 'world' | 'feed' | 'profile' | 'missions' | 'store'
  ceremonyActive: false,
  inHouseView: false,
  // ---------------------------------------

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
  
  // Profile Setters
  setUserHouseId: (userHouseId) => set({ userHouseId }),
  setKarmaScore: (karmaScore) => set({ karmaScore: typeof karmaScore === 'function' ? karmaScore(useStore.getState().karmaScore) : karmaScore }),
  setUserRank: (userRank) => set({ userRank }),
  setActiveCommandTab: (activeCommandTab) => set({ activeCommandTab }),
  setCeremonyActive: (ceremonyActive) => set({ ceremonyActive }),
  setInHouseView: (inHouseView) => set({ inHouseView }),

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
    doneHexCount: 0,
    activeCommandTab: null
  })
}));
