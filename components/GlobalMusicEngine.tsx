"use client";

import React, { useRef, useEffect } from "react";
import { useMusic } from "@/lib/music-context";

export const GlobalMusicEngine: React.FC = () => {
  const { currentTrack, isPlaying, volume, togglePlay } = useMusic();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send command to the persistent YouTube iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    const command = isPlaying ? "playVideo" : "pauseVideo";
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: [],
      }),
      "*"
    );
  }, [isPlaying]);

  // Sync volume to persistent YouTube iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: "setVolume",
        args: [Math.round(volume * 100)],
      }),
      "*"
    );
  }, [volume]);

  // Listen to YouTube playback state changes globally
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "onStateChange") {
          // YouTube: 1 = Playing, 2 = Paused, 0 = Ended
          if (data.info === 1 && !isPlaying) {
            togglePlay();
          } else if ((data.info === 2 || data.info === 0) && isPlaying) {
            togglePlay();
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPlaying, togglePlay]);

  if (!currentTrack?.embedUrl) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 right-0 w-[1px] h-[1px] opacity-[0.01] pointer-events-none z-[-1] overflow-hidden"
    >
      <iframe
        ref={iframeRef}
        src={currentTrack.embedUrl}
        className="w-full h-full border-none"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    </div>
  );
};

export default GlobalMusicEngine;
