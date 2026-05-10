"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

// ─────────────────────────────────────────────────────────────────────────────
// HouseAmbientAudio — Curated playlist for House Iboga
// ─────────────────────────────────────────────────────────────────────────────

const IBOGA_PLAYLIST = [
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449890/Kalimba_Constellations_1_xiygmm.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449894/Bioluminescent_River_2_cx90sl.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449895/Ancestor_Pulse_2_bxdfjc.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449896/Cosmic_Griot_2_knkk7y.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449897/Ancestor_Pulse_1_lsfynb.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449898/Cosmic_Griot_1_oispuy.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449898/Bioluminescent_River_1_adyu26.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449902/Dream_Mushroom_Cathedral_2_1_gawtx8.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449903/Kalimba_Constellations_2_v1lk9f.mp3",
  "https://res.cloudinary.com/dwgpeeu0r/video/upload/v1778449903/Dream_Mushroom_Cathedral_2_ih6lz1.mp3"
];

export default function HouseAmbientAudio() {
  const audioRef = useRef(null);
  const view = useStore((state) => state.view);
  const selectedHouse = useStore((state) => state.selectedHouse);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => 
    Math.floor(Math.random() * IBOGA_PLAYLIST.length)
  );

  // Sync audio state with game mode
  useEffect(() => {
    const isIbogaMode = view === 'map' && selectedHouse?.id === 'iboga';

    if (isIbogaMode) {
      if (!audioRef.current) {
        audioRef.current = new Audio(IBOGA_PLAYLIST[currentTrackIndex]);
        audioRef.current.volume = 0; // Fade in start
        audioRef.current.loop = false; // We use onEnded to cycle
        
        audioRef.current.onended = () => {
          setCurrentTrackIndex((prev) => (prev + 1) % IBOGA_PLAYLIST.length);
        };

        const playAudio = async () => {
          try {
            await audioRef.current.play();
            // Smooth Fade In
            let vol = 0;
            const interval = setInterval(() => {
              if (vol < 0.4) {
                vol += 0.02;
                if (audioRef.current) audioRef.current.volume = vol;
              } else {
                clearInterval(interval);
              }
            }, 100);
          } catch (err) {
            console.warn("Audio playback blocked by browser. User interaction required.");
          }
        };
        playAudio();
      }
    } else {
      // Not in Iboga mode — fade out and kill
      if (audioRef.current) {
        const currentAudio = audioRef.current;
        let vol = currentAudio.volume;
        const interval = setInterval(() => {
          if (vol > 0.05) {
            vol -= 0.05;
            currentAudio.volume = vol;
          } else {
            clearInterval(interval);
            currentAudio.pause();
            currentAudio.src = "";
            audioRef.current = null;
          }
        }, 100);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [view, selectedHouse?.id, currentTrackIndex]);

  return null; // Headless component
}
