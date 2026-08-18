"use client";

import React, { useMemo } from "react";
import { Volume2, VolumeX, FastForward, Compass, Zap } from "lucide-react";

interface WormholeHUDProps {
  progress: number; // 0 to 100
  isBoosting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onSkip: () => void;
}

const STATUS_LOGS = [
  { threshold: 0, text: "INITIATING GRAVITATIONAL COMPRESSION..." },
  { threshold: 18, text: "BENDING SPACETIME CONTINUUM..." },
  { threshold: 38, text: "CALIBRATING NEURAL SYNAPSE WEIGHTS..." },
  { threshold: 60, text: "ENGAGING SUPERLUMINAL HYPERDRIVE..." },
  { threshold: 82, text: "APPROACHING SINGULARITY EVENT HORIZON..." },
  { threshold: 96, text: "TRANSIT COMPLETE. ENTERING KRUSHANTA.DEV" },
];

export const WormholeHUD: React.FC<WormholeHUDProps> = ({
  progress,
  isBoosting,
  isMuted,
  onToggleMute,
  onSkip,
}) => {
  // Current diagnostic message based on progress
  const currentStatus = useMemo(() => {
    let active = STATUS_LOGS[0].text;
    for (const log of STATUS_LOGS) {
      if (progress >= log.threshold) {
        active = log.text;
      }
    }
    return active;
  }, [progress]);

  // Telemetry metrics calculation
  const velocity = (1.2 + (progress / 100) * 8.78 + (isBoosting ? 3.5 : 0)).toFixed(2);
  const flux = (2.1 + (progress / 100) * 5.4 + (isBoosting ? 2.8 : 0)).toFixed(2);
  const dilation = (0.012 / (1 + (progress / 100) * 6)).toFixed(4);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none font-mono text-xs text-[#FFFFFF]">
      {/* 1. TOP TELEMETRY BAR */}
      <div className="flex justify-between items-start w-full">
        {/* Top Left: Quantum Diagnostics */}
        <div className="space-y-1.5 bg-black/40 backdrop-blur-md p-3.5 rounded border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 text-[#00f0ff] font-semibold tracking-widest text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            <span>WARP TRANSIT // ACTIVE</span>
          </div>
          <div className="text-[10px] text-zinc-400 space-y-0.5">
            <div>METRIC TENSOR: <span className="text-white">G_μν CALIBRATED</span></div>
            <div>SINGULARITY CHOC: <span className="text-[#8b5cf6]">CONVERGENT</span></div>
            <div>CHRONO-DRIFT: <span className="text-white">±0.0004 ns</span></div>
          </div>
        </div>

        {/* Top Center: Sub-reticle Header */}
        <div className="hidden md:flex flex-col items-center gap-1 text-center">
          <div className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase">
            SUPERLUMINAL TRAVERSAL PROTOCOL
          </div>
          <div className="text-xs text-white/90 tracking-widest font-semibold flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#00f0ff] animate-spin" style={{ animationDuration: "12s" }} />
            <span>KRUSHANTA // AI & SYSTEMS</span>
          </div>
        </div>

        {/* Top Right: Destination & Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right bg-black/40 backdrop-blur-md p-3.5 rounded border border-white/10 shadow-lg space-y-1">
            <div className="text-[10px] tracking-widest text-zinc-400">TARGET DESTINATION</div>
            <div className="text-xs font-semibold text-white tracking-wider">KRUSHANTA.DEV</div>
            <div className="text-[10px] text-[#38bdf8]">SECTOR 0x7F // DIMENSION-4</div>
          </div>

          {/* Quick Actions (Interactive pointer-events-auto) */}
          <div className="flex items-center gap-2 pointer-events-auto mt-1">
            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded bg-black/50 hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[10px] tracking-wider"
              title={isMuted ? "Unmute Hyperspace Audio" : "Mute Hyperspace Audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? "MUTED" : "SFX ON"}</span>
            </button>

            {/* Skip Button */}
            <button
              onClick={onSkip}
              className="px-3 py-2 rounded bg-white text-black hover:bg-zinc-200 font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-[10px] tracking-widest shadow-md hover:scale-105 active:scale-95"
            >
              <span>SKIP</span>
              <FastForward className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTER RETICLE / CROSSHAIR */}
      <div className="absolute inset-0 m-auto w-32 h-32 pointer-events-none flex items-center justify-center">
        {/* Outer targeting brackets */}
        <div className="absolute w-24 h-24 border border-white/15 rounded-full animate-ping opacity-25" style={{ animationDuration: "3s" }} />
        <div className="absolute w-16 h-16 border border-[#00f0ff]/30 rounded-full" />
        <div className="w-2 h-2 rounded-full bg-[#00f0ff]/60" />
        
        {/* Reticle ticks */}
        <div className="absolute -top-3 w-[1px] h-2 bg-[#00f0ff]/50" />
        <div className="absolute -bottom-3 w-[1px] h-2 bg-[#00f0ff]/50" />
        <div className="absolute -left-3 h-[1px] w-2 bg-[#00f0ff]/50" />
        <div className="absolute -right-3 h-[1px] w-2 bg-[#00f0ff]/50" />

        {isBoosting && (
          <div className="absolute -bottom-8 text-[9px] tracking-widest text-[#00f0ff] font-bold bg-black/60 px-2 py-0.5 rounded border border-[#00f0ff]/40 animate-pulse flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00f0ff]" />
            <span>BOOST ENGAGED</span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM TELEMETRY & LOADING PROGRESS BAR */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Real-time telemetry readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/50 backdrop-blur-md p-3.5 rounded border border-white/10 text-[10px]">
          <div>
            <div className="text-zinc-500">VELOCITY</div>
            <div className="text-white font-semibold text-xs tracking-wider text-[#00f0ff] tabular-nums">
              {velocity} <span className="text-[10px] text-zinc-400">c</span>
            </div>
          </div>
          <div>
            <div className="text-zinc-500">GRAV-FLUX</div>
            <div className="text-white font-semibold text-xs tracking-wider tabular-nums">
              {flux} <span className="text-[10px] text-zinc-400">T</span>
            </div>
          </div>
          <div>
            <div className="text-zinc-500">TEMPORAL DILATION</div>
            <div className="text-white font-semibold text-xs tracking-wider tabular-nums">
              Δt = {dilation} <span className="text-[10px] text-zinc-400">s</span>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <div className="text-zinc-500">QUANTUM CORE</div>
            <div className="text-[#38bdf8] font-semibold text-xs tracking-wider flex items-center sm:justify-start justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
              <span>STABLE</span>
            </div>
          </div>
        </div>

        {/* Main Progress Bar & Monospace Percentage */}
        <div className="space-y-2.5 bg-black/60 backdrop-blur-lg p-4 sm:p-5 rounded-lg border border-white/15 shadow-2xl">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase">SYSTEM INITIALIZATION</div>
              <div className="text-xs sm:text-sm font-medium text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {currentStatus}
              </div>
            </div>

            <div className="text-right flex items-baseline justify-end">
              <span className="text-2xl sm:text-3xl font-bold tracking-tighter text-white font-mono drop-shadow-[0_0_12px_rgba(0,240,255,0.6)] tabular-nums">
                {Math.min(Math.floor(progress), 100).toString().padStart(3, "0")}
              </span>
              <span className="text-sm font-normal text-[#00f0ff] ml-1 font-mono">%</span>
            </div>
          </div>

          {/* GPU-accelerated glowing progress bar with zero reflow */}
          <div className="relative w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-white/15 p-[1px]">
            <div
              className="h-full w-full bg-gradient-to-r from-[#3b82f6] via-[#00f0ff] to-[#ffffff] origin-left shadow-[0_0_16px_#00f0ff] will-change-transform rounded-full"
              style={{
                transform: `scaleX(${Math.min(Math.max(progress / 100, 0), 1)})`,
                transition: "none",
              }}
            />
          </div>

          {/* Hint Footer */}
          <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
            <span className="hidden sm:inline tracking-wider">HOLD [CLICK / SPACE] FOR HYPER BOOST</span>
            <span className="ml-auto tracking-wider">PRESS [ESC] OR [SKIP] TO ENTER IMMEDIATELY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WormholeHUD;
