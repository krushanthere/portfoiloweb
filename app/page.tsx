"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import WormholePreloader from "@/components/WormholePreloader";

// Optimizing bundle size via dynamic client-only imports
const GlitterWarp = dynamic(() => import("@/components/GlitterWarp"), {
  ssr: false,
});

const HandSphereSection = dynamic(() => import("@/components/HandSphereSection"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative bg-[#000000] text-[#FFFFFF] min-h-screen selection:bg-[#FFFFFF] selection:text-[#000000]">
      {/* 3D Traveling Through a Wormhole Animation Preloader */}
      <WormholePreloader minDurationMs={3200} />

      {/* Global Interactive Glitter Warp Starfield Background Across Entire Site */}
      <GlitterWarp
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        speed={1.0}
        particleCount={650}
        glitterIntensity={1.2}
        colorScheme="mono"
        tunnelRadius={950}
        warpFactor={1.25}
        interactive={true}
        mouseSensitivity={0.035}
      />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <HandSphereSection />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
