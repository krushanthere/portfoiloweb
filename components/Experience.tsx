"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";
import { experienceThemes } from "@/lib/content";

export const Experience: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
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
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative w-full bg-transparent text-foreground py-32 px-6 sm:px-12 md:px-24 border-t border-muted/20 overflow-hidden"
    >
      <div className="relative max-w-5xl mx-auto space-y-16 z-10">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.2em] text-muted">04 / TRAJECTORY</span>
          <div className="h-[1px] flex-1 bg-muted/20" />
        </div>

        <div className="space-y-6">
          <p className="text-sm font-mono text-silver max-w-2xl leading-relaxed">
            A continuous progression focused on computational fundamentals, applied machine learning, and high-performance product execution.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {experienceThemes.map((theme, idx) => (
              <div
                key={theme}
                className="p-6 border border-muted/20 rounded-sm hover:border-muted/40 transition-colors group bg-background/80 backdrop-blur-sm"
              >
                <div className="text-xs font-mono text-muted group-hover:text-foreground transition-colors mb-3">
                  {"// FOCUS 0"}{idx + 1}
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground tracking-tight">
                  {theme}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
