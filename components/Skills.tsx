"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";
import { skills } from "@/lib/content";

export const Skills: React.FC = () => {
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
      id="skills"
      ref={containerRef}
      className="relative w-full bg-transparent text-foreground py-32 px-6 sm:px-12 md:px-24 border-t border-muted/20 overflow-hidden"
    >
      <div className="relative max-w-5xl mx-auto space-y-16 z-10">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.2em] text-muted">03 / EXPERTISE</span>
          <div className="h-[1px] flex-1 bg-muted/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="space-y-6 p-6 rounded-sm border border-muted/20 bg-background/80 backdrop-blur-sm hover:border-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-muted/20 pb-4">
                <h3 className="text-lg font-mono tracking-wider text-foreground">{category}</h3>
                <span className="text-xs font-mono text-muted">[{items.length}]</span>
              </div>

              <ul className="space-y-3 font-mono text-xs sm:text-sm text-silver">
                {items.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-3 text-silver hover:text-foreground transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted group-hover:bg-accent transition-colors" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
