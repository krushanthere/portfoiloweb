"use client";

import React from "react";
import { Zap } from "lucide-react";

export const Footer: React.FC = () => {
  const handleReplayWarp = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
      window.dispatchEvent(new CustomEvent("replay-wormhole"));
    }
  };

  return (
    <footer className="w-full bg-[#000000] text-[#555555] py-12 px-6 sm:px-12 md:px-24 border-t border-[#555555]/20 font-mono text-xs">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />
          <span className="text-[#D0D0D0]">KRUSHANTA.dev</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Interactive Warp Replay Trigger */}
        <button
          onClick={handleReplayWarp}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/15 bg-zinc-900/60 hover:bg-zinc-800 hover:border-[#00f0ff]/50 text-zinc-300 hover:text-white transition-all cursor-pointer group"
          title="Replay Wormhole Hyperspace Traversal"
        >
          <Zap className="w-3.5 h-3.5 text-[#00f0ff] group-hover:scale-110 transition-transform" />
          <span className="tracking-widest text-[11px]">REPLAY WORMHOLE</span>
        </button>

        <div className="text-center sm:text-right text-[#555555]">
          MONOCHROME ARCHITECTURE / WEBGL + NEXT.JS
        </div>
      </div>
    </footer>
  );
};

