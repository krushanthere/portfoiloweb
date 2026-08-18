"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";

export const About: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Simple, elegant GSAP entrance: fade in and slide up slightly
      gsap.fromTo(
        containerRef.current!.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%", // trigger when section is 20% into view
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full bg-transparent text-foreground py-32 px-6 sm:px-12 md:px-24 border-t border-muted/20 overflow-hidden"
    >
      <div className="relative max-w-5xl mx-auto space-y-20 z-10">
        {/* Standardized Eyebrow Label */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.2em] text-muted">01 / PHILOSOPHY</span>
          <div className="h-[1px] flex-1 bg-muted/20" />
        </div>

        <div className="space-y-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight text-foreground">
            Engineering intelligence at the intersection of{" "}
            <span className="text-silver italic font-serif">machine perception</span>,{" "}
            <span className="text-silver italic font-serif">system architecture</span>, and{" "}
            <span className="text-accent">human-centered software</span>.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8 text-silver font-light leading-relaxed text-lg sm:text-xl">
            <p>
              Dedicated to designing robust AI systems and scalable full-stack applications that transform raw mathematical formulations and neural models into performant, intuitive tools.
            </p>
            <p>
              Focusing on high-impact domains including computer vision, explainable AI, intelligent logistics, and experimental interactive WebGL environments.
            </p>
          </div>
        </div>

        {/* Minimal metrics / principle bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pt-16 border-t border-muted/20 font-mono text-xs tracking-wider text-muted">
          <div className="group cursor-default">
            <span className="block text-foreground text-xl font-sans mb-2 group-hover:text-accent transition-colors duration-500">AI & ML</span>
            <span>Perception & Models</span>
          </div>
          <div className="group cursor-default">
            <span className="block text-foreground text-xl font-sans mb-2 group-hover:text-accent transition-colors duration-500">SYSTEMS</span>
            <span>Scalable & Resilient</span>
          </div>
          <div className="group cursor-default">
            <span className="block text-foreground text-xl font-sans mb-2 group-hover:text-accent transition-colors duration-500">CREATIVE</span>
            <span>Interactive WebGL</span>
          </div>
          <div className="group cursor-default">
            <span className="block text-foreground text-xl font-sans mb-2 group-hover:text-accent transition-colors duration-500">ETHICS</span>
            <span>Explainable Design</span>
          </div>
        </div>
      </div>
    </section>
  );
};
