"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { resolveMusicUrl, ResolvedMusicMetadata } from "./music-meta";

export type Track = ResolvedMusicMetadata;

export const DEFAULT_DISC_TRACKS: Track[] = [
  {
    id: "track-infinity",
    title: "Infinity (8th Anniversary)",
    artist: "Krushanta • Lo-Fi Beats",
    coverUrl: "/images/disc-infinity.png",
    audioUrl: "/audio/infinity-lofi.wav",
    type: "audio",
  },
  {
    id: "track-midnight",
    title: "Midnight Study Session",
    artist: "Lofi Dreamer • Jazz Chill",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    audioUrl: "/audio/midnight-session.wav",
    type: "audio",
  },
  {
    id: "track-synth",
    title: "Neon Cyberpunk Drift",
    artist: "Retrowave Echoes • 80s Synth",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    audioUrl: "/audio/cyberpunk-drift.wav",
    type: "audio",
  },
  {
    id: "track-yt-lofi",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    artist: "Lofi Girl",
    coverUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    type: "youtube",
    videoId: "jfKfPfyJRdk",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?enablejsapi=1&autoplay=1&playsinline=1&controls=1",
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
  isMuted: boolean;
  isLoadingMeta: boolean;
  showVideoDrawer: boolean;
  setShowVideoDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  togglePlay: () => void;
  playTrackIndex: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  addTrackFromUrl: (url: string) => Promise<void>;
  removeTrack: (index: number) => void;
  sendYouTubeCommand: (func: string, args?: unknown[]) => void;
  registerYouTubeIframe: (iframe: HTMLIFrameElement | null) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_DISC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(32);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [showVideoDrawer, setShowVideoDrawer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

  const currentTrack = tracks[currentTrackIndex] || DEFAULT_DISC_TRACK;

  // Send control command to registered YouTube iframe
  const sendYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    if (youtubeIframeRef.current && youtubeIframeRef.current.contentWindow) {
      try {
        youtubeIframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func,
            args,
          }),
          "*"
        );
      } catch {}
    }
  }, []);

  // Register YouTube iframe from GlobalMusicEngine
  const registerYouTubeIframe = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      youtubeIframeRef.current = iframe;
      if (iframe && iframe.contentWindow) {
        // Initialize listening on the iframe
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*");
        } catch {}
      }
    },
    []
  );

  const nextTrack = useCallback(() => {
    setTracks((prevTracks) => {
      if (prevTracks.length === 0) return prevTracks;
      setCurrentTrackIndex((prevIdx) => (prevIdx + 1) % prevTracks.length);
      setCurrentTime(0);
      setIsPlaying(true);
      return prevTracks;
    });
  }, []);

  const prevTrack = useCallback(() => {
    setTracks((prevTracks) => {
      if (prevTracks.length === 0) return prevTracks;
      setCurrentTrackIndex((prevIdx) => (prevIdx - 1 + prevTracks.length) % prevTracks.length);
      setCurrentTime(0);
      setIsPlaying(true);
      return prevTracks;
    });
  }, []);

  const playTrackIndex = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  // Native HTML5 Audio lifecycle & event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      nextTrack();
    };

    const onPlay = () => setIsPlaying(true);
    const onError = () => {
      console.warn("Audio element error during playback");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
    };
  }, [nextTrack]);

  // Synchronize playback between HTML5 Audio and YouTube
  useEffect(() => {
    const audio = audioRef.current;

    if (currentTrack?.type === "audio") {
      // Pause YouTube if switching from YouTube to Audio
      sendYouTubeCommand("pauseVideo");

      if (audio) {
        if (audio.src !== currentTrack.audioUrl && currentTrack.audioUrl) {
          audio.src = currentTrack.audioUrl;
          audio.load();
        }
        audio.volume = isMuted ? 0 : volume;

        if (isPlaying) {
          audio.play().catch(() => {
            // Autoplay policy or interrupt
            setIsPlaying(false);
          });
        } else {
          audio.pause();
        }
      }
    } else if (currentTrack?.type === "youtube") {
      // Pause native Audio if switching to YouTube
      if (audio) {
        audio.pause();
      }

      if (isPlaying) {
        sendYouTubeCommand("playVideo");
      } else {
        sendYouTubeCommand("pauseVideo");
      }
      sendYouTubeCommand("setVolume", [isMuted ? 0 : Math.round(volume * 100)]);
    }
  }, [currentTrack, isPlaying, volume, isMuted, sendYouTubeCommand]);

  // YouTube postMessage event listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data) return;

        if (data.event === "onStateChange") {
          // YouTube State: 1 = Playing, 2 = Paused, 0 = Ended
          if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          } else if (data.info === 0) {
            nextTrack();
          }
        } else if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (data.info.playerState === 1) {
            setIsPlaying(true);
          } else if (data.info.playerState === 2) {
            setIsPlaying(false);
          } else if (data.info.playerState === 0) {
            nextTrack();
          }
        } else if (data.event === "initialDelivery" && data.info) {
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [nextTrack]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const seek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      if (currentTrack?.type === "audio" && audioRef.current) {
        audioRef.current.currentTime = time;
      } else if (currentTrack?.type === "youtube") {
        sendYouTubeCommand("seekTo", [time, true]);
      }
    },
    [currentTrack?.type, sendYouTubeCommand]
  );

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setVolumeState(clamped);
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : clamped;
      }
      sendYouTubeCommand("setVolume", [isMuted ? 0 : Math.round(clamped * 100)]);
    },
    [isMuted, sendYouTubeCommand]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      sendYouTubeCommand("setVolume", [nextMuted ? 0 : Math.round(volume * 100)]);
      return nextMuted;
    });
  }, [volume, sendYouTubeCommand]);

  const addTrackFromUrl = useCallback(async (url: string) => {
    setIsLoadingMeta(true);
    try {
      const metadata = await resolveMusicUrl(url);
      setTracks((prev) => [metadata, ...prev]);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
      if (metadata.type === "youtube") {
        setShowVideoDrawer(true);
      }
    } finally {
      setIsLoadingMeta(false);
    }
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one track
      const newTracks = prev.filter((_, i) => i !== index);
      return newTracks;
    });
    setCurrentTrackIndex(0);
    setCurrentTime(0);
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
        isMuted,
        isLoadingMeta,
        showVideoDrawer,
        setShowVideoDrawer,
        setVolume,
        toggleMute,
        togglePlay,
        playTrackIndex,
        nextTrack,
        prevTrack,
        seek,
        addTrackFromUrl,
        removeTrack,
        sendYouTubeCommand,
        registerYouTubeIframe,
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
