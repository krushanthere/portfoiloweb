"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { resolveMusicUrl, ResolvedMusicMetadata } from "./music-meta";

export type Track = ResolvedMusicMetadata;

export const DEFAULT_DISC_TRACKS: Track[] = [
  {
    id: "track-infinity",
    title: "Infinity (8th Anniversary)",
    artist: "Free Fire",
    coverUrl: "/images/disc-infinity.png",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    type: "audio",
  },
  {
    id: "track-midnight",
    title: "Midnight Study Session",
    artist: "Lofi Dreamer",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-chill-medium-version-159456.mp3",
    type: "audio",
  },
  {
    id: "track-synth",
    title: "Neon Cyberpunk Drift",
    artist: "Retrowave Echoes",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_9242502693.mp3?filename=synthwave-80s-110045.mp3",
    type: "audio",
  },
];

export const DEFAULT_DISC_TRACK: Track = DEFAULT_DISC_TRACKS[0];

interface MusicContextType {
  isPlaying: boolean;
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track;
  currentTime: number;
  duration: number;
  volume: number;
  isLoadingMeta: boolean;
  setVolume: (vol: number) => void;
  togglePlay: () => void;
  playTrackIndex: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  addTrackFromUrl: (url: string) => Promise<void>;
  removeTrack: (index: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_DISC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolumeState] = useState(0.8);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentTrackIndex] || DEFAULT_DISC_TRACK;

  // Initialize native HTML5 Audio for audio-type tracks
  useEffect(() => {
    const audio = new Audio();
    if (currentTrack?.audioUrl) {
      audio.src = currentTrack.audioUrl;
    }
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (tracks.length > 0) {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync audio source when track changes
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const wasPlaying = isPlaying;

    if (currentTrack?.type === "audio" && currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
      if (wasPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [currentTrackIndex, currentTrack, tracks]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = useCallback(() => {
    if (currentTrack.type === "audio" && audioRef.current) {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentTrack.type, isPlaying]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks.length]);

  // Advance timeline smoothly while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          nextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, nextTrack]);

  const playTrackIndex = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current && currentTrack.type === "audio") {
      audioRef.current.currentTime = time;
    }
  }, [currentTrack.type]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const addTrackFromUrl = useCallback(async (url: string) => {
    setIsLoadingMeta(true);
    try {
      const metadata = await resolveMusicUrl(url);
      setTracks((prev) => [metadata, ...prev]);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
    } finally {
      setIsLoadingMeta(false);
    }
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
    setCurrentTrackIndex(0);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        tracks,
        currentTrackIndex,
        currentTrack,
        currentTime,
        duration,
        volume,
        isLoadingMeta,
        setVolume,
        togglePlay,
        playTrackIndex,
        nextTrack,
        prevTrack,
        seek,
        addTrackFromUrl,
        removeTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return ctx;
}
