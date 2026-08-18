"use client";

import React, { useRef, useEffect } from "react";
import { QuoteNodeGraph } from "./QuoteNodeGraph";
import { gsap } from "@/lib/animations";
import { ShinyText } from "./ShinyText";

export const HandSphereSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="graph"
      className="relative w-full min-h-screen py-24 px-4 sm:px-8 md:px-12 bg-transparent text-foreground border-t border-muted/20"
    >
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header Overlay */}
        <div
          ref={textRef}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono tracking-[0.25em] text-muted">
                01.5 / SYNAPSE GRAPH
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight uppercase mt-1 font-mono">
              <ShinyText
                text="Perception & Synthesis"
                speed={3}
                color="#f4f4f5"
                shineColor="#ffffff"
                spread={120}
              />
            </h2>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-muted/25 bg-background/60 backdrop-blur-md text-xs font-mono text-silver">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>INTERACTIVE NODE GRAPH // DRAG TO RE-ROUTE</span>
          </div>
        </div>

        {/* Interactive Connected Quote Node Graph Canvas */}
        <div className="relative w-full z-10">
          <QuoteNodeGraph />
        </div>
      </div>
    </section>
  );
};

export default HandSphereSection;
