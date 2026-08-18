"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMusic } from "@/lib/music-context";
import { getAssetPath } from "@/lib/utils";

const navItems = [
  { label: "GRAPH", href: "#graph" },
  { label: "ABOUT", href: "#about" },
  { label: "PROJECTS", href: "#projects" },
  { label: "SKILLS", href: "#skills" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "CONTACT", href: "#contact" },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isPlaying, currentTrack } = useMusic();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#000000]/85 backdrop-blur-md border-b border-[#555555]/20 py-4 shadow-lg shadow-black/40"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
        <Link
          href="#"
          className="group flex items-center gap-2 text-sm tracking-widest font-mono text-[#FFFFFF] hover:text-[#D0D0D0] transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] group-hover:scale-125 transition-transform" />
          <span className="font-semibold">KRUSHANTA</span>
          <span className="text-[#555555]">.dev</span>
        </Link>

        {/* Desktop Nav with sliding underline animation */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-[#D0D0D0]">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative py-1 text-[#D0D0D0] hover:text-[#FFFFFF] transition-colors group overflow-hidden"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#FFFFFF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            </a>
          ))}
        </div>

        {/* Top-Right: Status & Mini Vinyl DiscPlayer Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#555555]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] animate-pulse" />
            <span className="hidden sm:inline text-[#D0D0D0]">AI ENGINEER</span>
          </div>

          {/* Mini Vinyl DiscPlayer Link */}
          <Link
            href="/player"
            className="group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-muted/30 bg-black/60 hover:bg-black/90 hover:border-accent/60 transition-all duration-300 shadow-md cursor-pointer"
            title="Open DiscPlayer"
          >
            {/* Spinning Mini Vinyl Record with active album art */}
            <div
              className={`relative w-6 h-6 rounded-full border border-zinc-700 overflow-hidden shadow-sm ${
                isPlaying ? "animate-spin" : "group-hover:rotate-45 transition-transform duration-500"
              }`}
              style={{
                animationDuration: "4s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath(currentTrack.coverUrl || "/images/disc-infinity.png")}
                alt="Vinyl Disc"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-500" />
            </div>

            <span className="text-[11px] font-mono tracking-wider text-silver group-hover:text-foreground font-semibold">
              {isPlaying ? "PLAYING" : "DiscPlayer"}
            </span>

            {/* Equalizer Wave / Pulse */}
            <div className="flex items-end gap-0.5 h-3">
              {[60, 100, 75].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full bg-accent transition-all ${
                    isPlaying ? "animate-pulse" : "opacity-40"
                  }`}
                  style={{
                    height: isPlaying ? `${h}%` : "30%",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
