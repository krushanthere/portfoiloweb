"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ShinyText } from "@/components/ShinyText";

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      // Elegant staggered GSAP entrance animation on mount
      gsap.fromTo(
        contentRef.current!.querySelectorAll(".hero-fade"),
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full min-h-screen flex flex-col justify-between pt-36 pb-16 px-6 sm:px-12 md:px-24 bg-transparent text-foreground overflow-hidden"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto w-full my-auto space-y-12">
        {/* Top Status & Role Eyebrow */}
        <div className="hero-fade flex flex-wrap items-center gap-4 text-xs font-mono tracking-[0.25em] text-muted">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-muted/25 bg-background/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-foreground">AVAILABLE FOR INVENTIVE ROLES</span>
          </div>
          <span className="text-muted/60">{"//"}</span>
          <span className="text-silver">AI ENGINEER & RESEARCHER</span>
        </div>

        {/* Massive High-Impact Name Typography */}
        <div className="space-y-4">
          <h1 className="hero-fade text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-bold tracking-tighter uppercase leading-[0.88] select-none">
            <ShinyText
              text="Krushanta"
              speed={3.5}
              color="#e4e4e7"
              shineColor="#ffffff"
              spread={120}
              className="block"
            />
            <ShinyText
              text="Podha"
              speed={3.5}
              delay={0.25}
              color="#a1a1aa"
              shineColor="#ffffff"
              spread={120}
              className="block"
            />
          </h1>
        </div>

        {/* Narrative & Capabilities */}
        <div className="hero-fade grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 items-end">
          <p className="md:col-span-7 text-base sm:text-xl font-light text-silver/90 leading-relaxed max-w-2xl font-mono">
            Designing and engineering high-precision machine learning systems, deep learning architectures, and scalable intelligent software at the frontier of computation.
          </p>

          <div className="md:col-span-5 flex flex-wrap items-center gap-4 md:justify-end">
            <a
              href="#graph"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-sm bg-foreground text-background font-mono text-xs tracking-widest font-semibold hover:bg-silver transition-colors duration-200 group"
            >
              <span>EXPLORE GRAPH</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-sm border border-muted/30 bg-background/60 backdrop-blur-sm font-mono text-xs tracking-widest text-silver hover:text-foreground hover:border-foreground/60 transition-all duration-200 group"
            >
              <span>GET IN TOUCH</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Technical Metadata Bar */}
      <div className="max-w-7xl mx-auto w-full pt-12 border-t border-muted/15 flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-muted">
        <div className="flex items-center gap-6">
          <span>[00] COMPUTATION & AI</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">[01] SYSTEM ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-silver">SCROLL TO DISCOVER</span>
          <ArrowDown className="w-3 h-3 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
