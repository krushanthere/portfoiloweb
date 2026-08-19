"use client";

import React, { useRef, useEffect } from "react";
import { useMusic } from "@/lib/music-context";
import { X, Tv, Maximize2, Minimize2 } from "lucide-react";

export const GlobalMusicEngine: React.FC = () => {
  const {
    currentTrack,
    showVideoDrawer,
    setShowVideoDrawer,
    registerYouTubeIframe,
  } = useMusic();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPipExpanded, setIsPipExpanded] = React.useState(false);

  // Register the single global iframe with context
  useEffect(() => {
    registerYouTubeIframe(iframeRef.current);
    return () => registerYouTubeIframe(null);
  }, [registerYouTubeIframe, currentTrack?.embedUrl]);

  if (!currentTrack?.embedUrl || currentTrack.type !== "youtube") {
    return null;
  }

  return (
    <div
      className={`fixed transition-all duration-300 ${
        showVideoDrawer
          ? `z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 ${
              isPipExpanded
                ? "w-[90vw] max-w-[560px] h-[52vw] max-h-[315px]"
                : "w-[280px] sm:w-[360px] h-[160px] sm:h-[205px]"
            } rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-zinc-700/80 bg-black/95 backdrop-blur-lg flex flex-col`
          : "bottom-0 right-0 w-[1px] h-[1px] opacity-0 pointer-events-none z-[-10] overflow-hidden"
      }`}
      aria-hidden={!showVideoDrawer}
    >
      {/* Header bar when visible */}
      {showVideoDrawer && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-xs font-mono text-zinc-300 select-none">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate text-[11px] font-semibold">{currentTrack.title}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPipExpanded(!isPipExpanded)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isPipExpanded ? "Compact View" : "Expand Video"}
            >
              {isPipExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowVideoDrawer(false)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Hide Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent YouTube Iframe */}
      <div className="flex-1 w-full h-full relative bg-black">
        <iframe
          ref={iframeRef}
          src={currentTrack.embedUrl}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          title={currentTrack.title}
        />
      </div>
    </div>
  );
};

export default GlobalMusicEngine;
