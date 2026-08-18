"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/animations";
import { contact } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
import { ShinyText } from "@/components/ShinyText";
import { GradientText } from "@/components/GradientText";

export const Contact: React.FC = () => {
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
      id="contact"
      ref={containerRef}
      className="relative w-full bg-transparent text-foreground py-36 px-6 sm:px-12 md:px-24 border-t border-muted/20 overflow-hidden"
    >
      <div className="relative max-w-5xl mx-auto space-y-20 z-10">
        {/* Standardized Eyebrow Label */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.2em] text-muted">05 / INITIATE</span>
          <div className="h-[1px] flex-1 bg-muted/20" />
        </div>

        <div className="space-y-10">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-light tracking-tight max-w-3xl">
            <ShinyText
              text={contact.headline}
              speed={3.5}
              color="#e4e4e7"
              shineColor="#ffffff"
              spread={120}
            />
          </h2>
          <p className="text-lg sm:text-2xl text-silver max-w-2xl font-light leading-relaxed">
            {contact.supporting}
          </p>
        </div>

        <div className="pt-12 flex flex-wrap items-center gap-6 sm:gap-10 font-mono text-xs sm:text-sm tracking-wider">
          {/* Email Button with Animated Gradient */}
          <a
            href={contact.links.email}
            className="group block"
          >
            <GradientText
              colors={["#FFFFFF", "#93C5FD", "#A855F7", "#38BDF8", "#FFFFFF"]}
              animationSpeed={3.5}
              showBorder={true}
              className="!m-0 px-8 py-4 !rounded-sm bg-foreground text-background font-semibold hover:scale-[1.02] transition-transform duration-200"
            >
              <span className="flex items-center gap-3">
                <span>START A CONVERSATION</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white" />
              </span>
            </GradientText>
          </a>

          {/* GitHub Button with Animated Gradient */}
          <a
            href={contact.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <GradientText
              colors={["#FFFFFF", "#60A5FA", "#C084FC", "#38BDF8", "#FFFFFF"]}
              animationSpeed={4}
              showBorder={true}
              className="!m-0 px-8 py-4 !rounded-sm bg-background/80 hover:scale-[1.02] transition-transform duration-200"
            >
              <span className="flex items-center gap-3">
                <span>GITHUB</span>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
              </span>
            </GradientText>
          </a>

          {/* LinkedIn Button with Animated Gradient */}
          <a
            href={contact.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <GradientText
              colors={["#FFFFFF", "#38BDF8", "#818CF8", "#60A5FA", "#FFFFFF"]}
              animationSpeed={4}
              showBorder={true}
              className="!m-0 px-8 py-4 !rounded-sm bg-background/80 hover:scale-[1.02] transition-transform duration-200"
            >
              <span className="flex items-center gap-3">
                <span>LINKEDIN</span>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
              </span>
            </GradientText>
          </a>
        </div>
      </div>
    </section>
  );
};
