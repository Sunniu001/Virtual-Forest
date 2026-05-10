"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { HOUSES } from '@/lib/constants';

const MAIN_MENU_PLAYLIST = [
  { 
    title: "Midnight Forest", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1544621270-f8641113b28b?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778358273/syouki_takahashi-midnight-forest-184304_1_gru4de.mp3" 
  },
  { 
    title: "Main Horizon 2", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1544621270-f8641113b28b?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778404551/Main_Menu2_bntfg2.mp3" 
  },
  { 
    title: "Atmospheric Descent 3", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1544621270-f8641113b28b?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778404553/Main_Menu3_pbptpd.mp3" 
  }
];

const IBOGA_PLAYLIST = [
  { 
    title: "Kalimba Constellations I", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Kalimba Constellations 1.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449890/Kalimba_Constellations_1_xiygmm.mp3" 
  },
  { 
    title: "Kalimba Constellations II", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Kalimba Constellations 2.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449903/Kalimba_Constellations_2_v1lk9f.mp3" 
  },
  { 
    title: "Bioluminescent River I", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Bioluminescent River 1.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449898/Bioluminescent_River_1_adyu26.mp3" 
  },
  { 
    title: "Bioluminescent River II", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Bioluminescent River 2.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449894/Bioluminescent_River_2_cx90sl.mp3" 
  },
  { 
    title: "Ancestor Pulse I", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Ancestor Pulse 1.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449897/Ancestor_Pulse_1_lsfynb.mp3" 
  },
  { 
    title: "Ancestor Pulse II", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Ancestor Pulse 2.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449895/Ancestor_Pulse_2_bxdfjc.mp3" 
  },
  { 
    title: "Cosmic Griot I", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Cosmic Griot 1.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449898/Cosmic_Griot_1_oispuy.mp3" 
  },
  { 
    title: "Cosmic Griot II", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Cosmic Griot 2.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449896/Cosmic_Griot_2_knkk7y.mp3" 
  },
  { 
    title: "Dream Mushroom Cathedral I", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Dream Mushroom Cathedral 1.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778451710/Dream_Mushroom_Cathedral_1_tvrxbb.mp3" 
  },
  { 
    title: "Dream Mushroom Cathedral II", 
    artist: "Baldsurdist",
    image: "/House Songs/Iboga/Dream Mushroom Cathedral 2.png",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449903/Dream_Mushroom_Cathedral_2_ih6lz1.mp3" 
  }
];

const DATURA_PLAYLIST = [
  { 
    title: "Neural Sutra I", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452795/Neural_Sutra_1_fyxni3.mp3" 
  },
  { 
    title: "Neural Sutra II", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452789/Neural_Sutra_2_amuphc.mp3" 
  },
  { 
    title: "Library Beyond Time I", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452776/Library_Beyond_Time_1_ia3pq4.mp3" 
  },
  { 
    title: "Library Beyond Time II", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452791/Library_Beyond_Time_2_ozwtqn.mp3" 
  },
  { 
    title: "Lanterns in the Snow I", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452791/Lanterns_in_the_Snow_1_gdedr4.mp3" 
  },
  { 
    title: "Lanterns in the Snow II", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452791/Lanterns_in_the_Snow_2_doffra.mp3" 
  },
  { 
    title: "Monastery Above the Clouds I", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452777/Monastery_Above_the_Clouds_1_fupmqo.mp3" 
  },
  { 
    title: "Monastery Above the Clouds II", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452776/Monastery_Above_the_Clouds_2_gjtrhc.mp3" 
  },
  { 
    title: "Geometry of Silence I", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452775/Geometry_of_Silence_1_wtvsrx.mp3" 
  },
  { 
    title: "Geometry of Silence II", 
    artist: "Baldsurdist",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=200&auto=format&fit=crop",
    url: "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778452776/Geometry_of_Silence_2_drhgqp.mp3" 
  }
];

export default function AudioDeck() {
  const [mounted, setMounted] = useState(false);
  const selectedHouse = useStore((state) => state.selectedHouse);
  const view = useStore((state) => state.view);
  const inHouseView = useStore((state) => state.inHouseView);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Decide which playlist to use based on current context
  const getActivePlaylist = () => {
    if (!inHouseView && view !== 'map') return MAIN_MENU_PLAYLIST;
    
    switch (selectedHouse?.id) {
      case 'iboga': return IBOGA_PLAYLIST;
      case 'datura': return DATURA_PLAYLIST;
      default: return MAIN_MENU_PLAYLIST;
    }
  };

  const activePlaylist = getActivePlaylist();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const userHouseId = useStore((state) => state.userHouseId);
  const currentUserHouse = HOUSES.find(h => h.id === userHouseId);
  const themeColor = selectedHouse?.color || currentUserHouse?.color || '#6366f1'; 
  const audioRef = useRef(null);

  // Sync track index when entering/exiting house context
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [inHouseView, view, selectedHouse?.id]);

  // Sync time state with audio element
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [selectedHouse?.id, inHouseView, view]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (isPlaying) {
        audioRef.current.play().catch(e => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, activePlaylist]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(e => console.log("Action pending"));
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % activePlaylist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + activePlaylist.length) % activePlaylist.length);
    setIsPlaying(true);
  };

  if (!mounted) return null;

  const currentTrack = activePlaylist[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto relative flex flex-col items-end z-50"
    >
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        autoPlay={isPlaying}
      />

      <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-3 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-80 relative overflow-hidden group">
        
        {/* Ambient Glow */}
        <div 
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-all duration-1000"
          style={{ backgroundColor: themeColor }}
        />

        <div className="flex items-center justify-between gap-3 relative">
           {/* Track Info Section */}
           <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 shrink-0">
                 <img 
                   src={currentTrack.image} 
                   alt="Cover" 
                   className="w-full h-full object-cover rounded-lg shadow-lg border border-white/10"
                 />
              </div>
              
              <div className="flex flex-col min-w-0">
                 <h4 className="text-white font-bold text-[11px] truncate tracking-wide leading-tight">{currentTrack.title}</h4>
                 <span className="text-[10px] font-medium opacity-50 tracking-wider truncate" style={{ color: themeColor }}>{currentTrack.artist}</span>
              </div>
           </div>

           {/* Controls */}
           <div className="flex items-center space-x-1 shrink-0">
              <button 
                onClick={prevTrack}
                className="p-1 text-white/20 hover:text-white transition-colors active:scale-90"
              >
                <SkipBack size={14} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-lg"
                style={{ 
                  backgroundColor: `${themeColor}20`,
                  border: `1px solid ${themeColor}30`,
                  color: themeColor
                }}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </button>
              
              <button 
                onClick={nextTrack}
                className="p-1 text-white/20 hover:text-white transition-colors active:scale-90"
              >
                <SkipForward size={14} />
              </button>
           </div>
        </div>

        {/* Seeker Bar Container */}
        <div className="flex flex-col gap-1 relative">
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/80 transition-all"
            style={{ 
               background: `linear-gradient(to right, ${themeColor} ${(currentTime/duration)*100}%, #1e293b ${(currentTime/duration)*100}%)`
            }}
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-500 tracking-tighter">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-end space-x-0.5 h-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  animate={isPlaying ? { height: [2, 6, 4, 8][i] } : { height: 1 }}
                  transition={{ repeat: Infinity, duration: 0.6 + (i * 0.1), repeatType: 'mirror' }}
                  className="w-[1.5px] rounded-full opacity-40"
                  style={{ backgroundColor: themeColor }}
                />
              ))}
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
