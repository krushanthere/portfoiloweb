"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useMusic } from "@/lib/music-context";
import { getAssetPath } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Loader2,
  Tv,
  Disc3,
  Sparkles,
  Radio,
} from "lucide-react";

export const DiscPlayer: React.FC = () => {
  const {
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
  } = useMusic();

  const [inputUrl, setInputUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isHoveringVinyl, setIsHoveringVinyl] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send control commands to YouTube iframe
  const sendYouTubeCommand = useCallback(
    (func: "playVideo" | "pauseVideo" | "stopVideo" | "setVolume" | "seekTo", args: unknown[] = []) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: func,
            args: args,
          }),
          "*"
        );
      }
    },
    []
  );

  // Synchronize Play/Pause with YouTube
  const handleTogglePlay = () => {
    if (isPlaying) {
      sendYouTubeCommand("pauseVideo");
    } else {
      sendYouTubeCommand("playVideo");
    }
    togglePlay();
  };

  // Synchronize volume with YouTube
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sendYouTubeCommand("setVolume", [Math.round(newVol * 100)]);
  };

  const handleMuteToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolume || 0.8);
    }
  };

  // Synchronize seek with YouTube
  const handleSeek = (time: number) => {
    seek(time);
    sendYouTubeCommand("seekTo", [time, true]);
  };

  // Listen to YouTube postMessage events (onStateChange)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "onStateChange") {
          // YouTube State: 1 = Playing, 2 = Paused, 0 = Ended
          if (data.info === 1 && !isPlaying) {
            togglePlay();
          } else if ((data.info === 2 || data.info === 0) && isPlaying) {
            togglePlay();
          }
        }
      } catch {
        // Ignore non-JSON postMessages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPlaying, togglePlay]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const urlToAdd = inputUrl.trim();
    setInputUrl("");
    await addTrackFromUrl(urlToAdd);
    if (urlToAdd.includes("youtube.com") || urlToAdd.includes("youtu.be")) {
      setShowVideoPlayer(true);
    }
  };

  const activeArtwork = getAssetPath(currentTrack?.coverUrl || "/images/disc-infinity.png");
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <div className="relative w-full min-h-screen bg-[#050508] text-white flex flex-col justify-between items-center py-6 px-4 sm:px-8 select-none overflow-x-hidden">
      
      {/* Background Ambient Glow & Subtle Texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Dynamic ambient color glow from artwork */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 transition-all duration-1000"
          style={{
            background: isPlaying
              ? "radial-gradient(circle, rgba(76,191,255,0.5) 0%, rgba(147,51,234,0.3) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Header Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/90 text-zinc-300 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 shadow-sm backdrop-blur-md group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO PORTFOLIO</span>
        </Link>

        {/* Center Hi-Fi Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/60 bg-zinc-900/30 text-[11px] font-mono tracking-widest text-zinc-400 backdrop-blur-md">
          <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? "text-accent animate-spin" : "text-zinc-500"}`} style={{ animationDuration: "3s" }} />
          <span>VINYL HI-FI DECK</span>
        </div>

        {/* Right Status Indicator & Fullscreen */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/60 text-xs font-mono text-zinc-300 backdrop-blur-md">
            {/* Live Animated Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-3 w-3">
              <span className={`w-0.5 rounded-full bg-accent transition-all ${isPlaying ? "h-3 animate-pulse" : "h-1 bg-zinc-600"}`} />
              <span className={`w-0.5 rounded-full bg-accent transition-all ${isPlaying ? "h-2 animate-pulse [animation-delay:150ms]" : "h-1 bg-zinc-600"}`} />
              <span className={`w-0.5 rounded-full bg-accent transition-all ${isPlaying ? "h-3.5 animate-pulse [animation-delay:300ms]" : "h-1 bg-zinc-600"}`} />
            </div>
            <span className="font-semibold tracking-wider text-[11px]">{isPlaying ? "PLAYING" : "PAUSED"}</span>
          </div>

          <button
            onClick={handleFullscreenToggle}
            className="p-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer backdrop-blur-md"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Stage: Authentic Turntable Deck */}
      <main className="relative flex flex-col items-center justify-center my-auto py-4 z-10">
        
        {/* Turntable Plinth / Platter Base Assembly */}
        <div className="relative flex items-center justify-center p-3 sm:p-5">
          
          {/* Mechanical Tonearm Assembly (Mounted on the Upper-Right Plinth) */}
          <div className="absolute -top-4 -right-6 sm:-top-6 sm:-right-10 md:-top-8 md:-right-14 z-30 pointer-events-none">
            
            {/* Pivot Base Tower */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-zinc-700 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
              
              {/* Outer Gimbal Ring */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-600/70 bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center shadow-inner">
                {/* Center Pivot Bearing with Accent Dot */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-b from-zinc-400 to-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#4cbfff]" />
                </div>
              </div>

              {/* Counterweight Extension (Top-Right of base) */}
              <div className="absolute -top-3 -right-2 w-4 h-7 rounded-sm bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-600 border border-zinc-600 shadow-md" />

              {/* Arm Rest Cradle (Where tonearm rests when paused) */}
              <div className="absolute top-10 -left-1 w-3 h-4 border-l-2 border-b-2 border-zinc-600 rounded-bl-sm opacity-60" />
            </div>

            {/* Pivoting Tonearm Rod & Headshell */}
            <div
              className="absolute top-6 left-6 sm:top-7 sm:left-7 origin-[6px_6px] transition-transform duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
              style={{
                transform: isPlaying ? "rotate(24deg)" : "rotate(-8deg)",
              }}
            >
              {/* Metallic S-Curved Arm Shaft */}
              <div className="relative w-1.5 sm:w-2 h-44 sm:h-52 md:h-60 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-[2px_4px_12px_rgba(0,0,0,0.6)]">
                
                {/* Cartridge Headshell & Stylus Needle */}
                <div className="absolute -bottom-4 -left-2.5 w-6 sm:w-7 h-9 rounded-sm bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 shadow-xl flex flex-col items-center justify-between py-1">
                  
                  {/* Finger Lift Tab */}
                  <div className="absolute -right-2 top-2 w-2 h-1 bg-zinc-400 rounded-r-full" />

                  {/* Stylus Status LED */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                        : "bg-zinc-600"
                    }`}
                  />
                  {/* Needle Tip */}
                  <div className="w-0.5 h-1.5 bg-zinc-300 rounded-b-full shadow-[0_1px_3px_rgba(255,255,255,0.4)]" />
                </div>
              </div>
            </div>
          </div>

          {/* 12" Vinyl Platter with Authentic Grooves & Center Artwork */}
          <div
            onClick={handleTogglePlay}
            onMouseEnter={() => setIsHoveringVinyl(true)}
            onMouseLeave={() => setIsHoveringVinyl(false)}
            className={`group relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.99] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,0,0,0.6)] ${
              isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
            }`}
            style={{
              background: "#0c0c0f",
            }}
          >
            {/* Outer Vinyl Rim Bevel */}
            <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800/80 pointer-events-none" />
            <div className="absolute inset-1 rounded-full border border-zinc-900 pointer-events-none" />

            {/* Concentric Radial Micro-Grooves Layer */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-60"
              style={{
                background:
                  "repeating-radial-gradient(circle, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1.5px, transparent 4px)",
              }}
            />

            {/* Secondary Fine Run-Out Groove Texture */}
            <div
              className="absolute inset-6 sm:inset-8 md:inset-10 rounded-full pointer-events-none opacity-40"
              style={{
                background:
                  "repeating-radial-gradient(circle, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 0.8px, transparent 1.2px, transparent 3px)",
              }}
            />

            {/* Realistic Anisotropic Light Sheen (Specular Reflections) */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
              style={{
                background:
                  "conic-gradient(from 30deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.18) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)",
              }}
            />

            {/* Center Circular Label (Framed Album Artwork) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-[3px] border-[#18181b] shadow-[0_0_20px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center bg-zinc-900">
              
              {/* Album Artwork */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeArtwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Subtle Circular Label Shading */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

              {/* Label Perimeter Ring */}
              <div className="absolute inset-1.5 rounded-full border border-white/20 pointer-events-none" />

              {/* Center Brushed Aluminum Spindle Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-zinc-600 via-zinc-200 to-zinc-700 border border-zinc-400/80 shadow-[0_4px_10px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center">
                {/* Center Spindle Hole */}
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-black border border-zinc-800 shadow-inner" />
              </div>
            </div>

            {/* Hover Play/Pause Quick Overlay */}
            <div
              className={`absolute inset-0 rounded-full bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none ${
                isHoveringVinyl ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl">
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Track Title, Artist & Meta */}
        <div className="text-center mt-5 sm:mt-6 space-y-1.5 max-w-lg px-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            {currentTrack.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-mono text-zinc-400">
            <span className="truncate">{currentTrack.artist}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
              {currentTrack.type === "youtube" ? "YOUTUBE STREAM" : "AUDIO HI-FI"}
            </span>
          </div>
        </div>

      </main>

      {/* Bottom Controls Deck */}
      <footer className="w-full max-w-xl flex flex-col items-center gap-4 z-20 pb-2">
        
        {/* Timeline Scrubber */}
        <div className="w-full space-y-1.5">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(ratio * (duration || 180));
            }}
            className="group relative w-full h-1.5 hover:h-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700/80 transition-all cursor-pointer overflow-hidden"
          >
            {/* Progress Fill Bar */}
            <div
              className="h-full bg-white group-hover:bg-accent transition-all duration-150 rounded-full"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-zinc-400 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Symmetrical 3-Column Primary Controls Deck */}
        <div className="w-full grid grid-cols-3 items-center py-1">
          
          {/* Left Column: Sleek Volume Control */}
          <div className="flex items-center gap-2 justify-start">
            <button
              onClick={handleMuteToggle}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-zinc-800/60"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative flex items-center w-16 sm:w-24">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-accent transition-all"
              />
            </div>
          </div>

          {/* Center Column: Perfectly Centered Playback Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={prevTrack}
              className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white text-black hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center cursor-pointer group"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Video Toggle / Stream Indicator (Balances the Left Column) */}
          <div className="flex items-center justify-end gap-2">
            {currentTrack.embedUrl ? (
              <button
                onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                className={`px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                  showVideoPlayer
                    ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                    : "border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
                title="Toggle YouTube Video Drawer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showVideoPlayer ? "HIDE VIDEO" : "SHOW VIDEO"}</span>
                <span className="sm:hidden">VIDEO</span>
              </button>
            ) : (
              <div className="px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/40 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-accent animate-pulse" />
                <span className="hidden sm:inline">LIVE AUDIO</span>
              </div>
            )}
          </div>
        </div>

        {/* Embedded YouTube Player Drawer */}
        {currentTrack.embedUrl && (
          <div
            className={`w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black/90 shadow-2xl transition-all duration-400 ${
              showVideoPlayer ? "h-52 opacity-100 mt-2" : "h-0 opacity-0 pointer-events-none"
            }`}
          >
            <iframe
              ref={iframeRef}
              src={currentTrack.embedUrl}
              className="w-full h-full border-none"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            />
          </div>
        )}

        {/* Modern YouTube Link Input Form */}
        <form onSubmit={handleAddLink} className="w-full space-y-2 mt-1">
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <svg
                className="absolute left-3.5 w-4 h-4 text-red-500 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <input
                type="url"
                required
                disabled={isLoadingMeta}
                placeholder="Paste YouTube or YouTube Music URL..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-zinc-900/80 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-900 transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingMeta}
              className="px-4 sm:px-5 py-2.5 bg-zinc-100 hover:bg-white text-black font-mono text-xs font-semibold rounded-xl transition-all duration-200 shadow-md cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoadingMeta ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>LOADING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PLAY STREAM</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Curated Playlist Track Chips */}
        {tracks.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-1">
            {tracks.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => playTrackIndex(idx)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  currentTrackIndex === idx
                    ? "bg-zinc-200 text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.2)] scale-105"
                    : "border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentTrackIndex === idx ? "bg-black" : "bg-zinc-600"}`} />
                <span>{t.title.length > 20 ? `${t.title.slice(0, 20)}...` : t.title}</span>
              </button>
            ))}
          </div>
        )}

      </footer>
    </div>
  );
};

export default DiscPlayer;
