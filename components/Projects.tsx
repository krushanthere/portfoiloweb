"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";
import { projects } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";

export const Projects: React.FC = () => {
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
      id="projects"
      ref={containerRef}
      className="relative w-full bg-transparent text-foreground py-32 px-6 sm:px-12 md:px-24 border-t border-muted/20 overflow-hidden"
    >
      <div className="relative max-w-5xl mx-auto space-y-20 z-10">
        {/* Standardized Eyebrow Label */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.2em] text-muted">02 / SELECTED WORK</span>
          <div className="h-[1px] flex-1 bg-muted/20" />
        </div>

        <div className="space-y-0 divide-y divide-muted/20 border-y border-muted/20">
          {projects.map((project) => (
            <a
              key={project.number}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-14 transition-all duration-300 hover:bg-foreground/[0.02] px-4 -mx-4 rounded-sm flex flex-col md:flex-row md:items-baseline justify-between gap-8"
            >
              {/* Left Column: Number & Title */}
              <div className="space-y-3 md:w-5/12">
                <div className="text-xs font-mono text-muted group-hover:text-accent transition-colors duration-300">
                  PROJECT {project.number}
                </div>
                <h3 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 flex items-center gap-3">
                  <span>{project.name}</span>
                  <ArrowUpRight className="w-6 h-6 opacity-0 -translate-x-3 translate-y-3 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-accent" />
                </h3>
              </div>

              {/* Right Column: Description & Tags */}
              <div className="space-y-6 md:w-6/12 mt-4 md:mt-0">
                <p className="text-base sm:text-lg text-silver leading-relaxed font-light">
                  {project.description}
                </p>

                {project.tags && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono tracking-wider px-3 py-1.5 rounded border border-muted/30 text-silver bg-background group-hover:border-accent/40 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
