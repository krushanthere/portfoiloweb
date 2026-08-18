"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import WormholeCanvas from "./WormholeCanvas";
import { WormholeHUD } from "./WormholeHUD";
import { wormholeAudio } from "./WormholeAudio";

export interface WormholePreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number; // Minimum duration for the preloader animation
}

const emptySubscribe = () => () => {};

export const WormholePreloader: React.FC<WormholePreloaderProps> = ({
  onComplete,
  minDurationMs = 2800,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [whiteoutOpacity, setWhiteoutOpacity] = useState(0);

  const isExitingRef = useRef(false);
  const progressRef = useRef(0);
  const isBoostingRef = useRef(false);

  // Lock body scroll while preloader is active, unlock when done
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Listen for custom replay event
  useEffect(() => {
    const handleReplayEvent = () => {
      isExitingRef.current = false;
      progressRef.current = 0;
      setProgress(0);
      setIsExiting(false);
      setSpeedMultiplier(1.0);
      setWhiteoutOpacity(0);
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      wormholeAudio.init();
    };

    window.addEventListener("replay-wormhole", handleReplayEvent);
    return () => window.removeEventListener("replay-wormhole", handleReplayEvent);
  }, []);

  // Handle Hyperspace Exit
  const triggerExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    // Play sonic warp blast sound
    wormholeAudio.playWarpExit();

    // Smooth exit hyper-acceleration sequence
    let startTime: number | null = null;
    const duration = 1200; // ms for exit sequence

    const exitStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1.0);

      // Exponential hyper-acceleration
      const speed = 1.0 + Math.pow(t, 2.6) * 16.0;
      setSpeedMultiplier(speed);

      // Supernova Whiteout flash curve (peaks at t: 0.6 to 0.75, then reveals page)
      let whiteout = 0;
      if (t < 0.6) {
        whiteout = Math.min(t / 0.55, 1.0);
      } else {
        whiteout = Math.max(1.0 - (t - 0.6) / 0.4, 0.0);
      }
      setWhiteoutOpacity(whiteout);

      if (t < 1.0) {
        requestAnimationFrame(exitStep);
      } else {
        // Complete transition and restore body scroll
        setIsVisible(false);
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }
        wormholeAudio.stop();
        onComplete?.();
      }
    };

    requestAnimationFrame(exitStep);
  }, [onComplete]);

  // Loading Progress Simulation Loop
  useEffect(() => {
    if (!isVisible || !isMounted || isExiting) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const ratePerMs = 100 / Math.max(minDurationMs, 1000);

    const tick = (now: number) => {
      if (isExitingRef.current) return;

      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const boostFactor = isBoostingRef.current ? 3.0 : 1.0;
      progressRef.current = Math.min(progressRef.current + dt * ratePerMs * boostFactor, 100);
      setProgress(progressRef.current);

      // Update sound engine parameters
      wormholeAudio.updateSpeed(progressRef.current / 100, isBoostingRef.current);

      if (progressRef.current >= 100) {
        triggerExit();
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isMounted, isExiting, minDurationMs, triggerExit]);

  // User Interactive Keyboard & Pointer Listeners
  useEffect(() => {
    if (!isVisible || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isBoostingRef.current) {
        e.preventDefault();
        isBoostingRef.current = true;
        setIsBoosting(true);
        wormholeAudio.init();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        triggerExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        isBoostingRef.current = false;
        setIsBoosting(false);
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      wormholeAudio.init();
      isBoostingRef.current = true;
      setIsBoosting(true);
    };

    const handlePointerUp = () => {
      isBoostingRef.current = false;
      setIsBoosting(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchend", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isVisible, isExiting, triggerExit]);

  const handleToggleMute = useCallback(() => {
    const muted = wormholeAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="wormhole-preloader-root"
      className={`fixed inset-0 z-[9999] w-screen h-screen bg-[#000000] overflow-hidden select-none ${
        isExiting && whiteoutOpacity === 0 && progress >= 100 ? "pointer-events-none" : ""
      }`}
    >
      {/* 3D WebGL Wormhole Tunnel & Particles (Mounted on Client) */}
      {isMounted && (
        <WormholeCanvas
          progress={progress / 100}
          isBoosting={isBoosting}
          speedMultiplier={speedMultiplier}
        />
      )}

      {/* Cyberpunk Telemetry HUD Overlay */}
      <div className={`transition-opacity duration-300 ${isExiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <WormholeHUD
          progress={progress}
          isBoosting={isBoosting}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onSkip={triggerExit}
        />
      </div>

      {/* Hyperspace Supernova Whiteout / Event Horizon Flash */}
      <div
        className="fixed inset-0 pointer-events-none mix-blend-screen transition-none"
        style={{
          opacity: whiteoutOpacity,
          background: "radial-gradient(circle at center, #ffffff 15%, #00f0ff 60%, #8b5cf6 100%)",
          transform: `scale(${1.0 + whiteoutOpacity * 0.25})`,
        }}
      />
    </div>
  );
};

export default WormholePreloader;
