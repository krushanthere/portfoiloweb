"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { QuoteSphere } from "./QuoteSphere";
import { gsap, ScrollTrigger } from "@/lib/animations";

interface HeroSceneProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function SceneContent({ progressRef, mouseRef }: {
  progressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; targetX: number; targetY: number }>;
}) {
  const burstRef = useRef<number>(0);

  return (
    <group position={[0, 0, 0]}>
      <QuoteSphere progressRef={progressRef} mouseRef={mouseRef} burstRef={burstRef} />

      {/* Post-Processing Pipeline tuned for Crisp Text Readability */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.75}
          luminanceSmoothing={0.4}
          intensity={0.55}
          mipmapBlur
        />
        <Vignette offset={0.25} darkness={0.35} />
        <Noise opacity={0.02} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </group>
  );
}

export const HeroScene: React.FC<HeroSceneProps> = ({ scrollContainerRef }) => {
  const progressRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Mouse move listener with normalized coordinates (-1 to 1)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.x = normX;
      mouseRef.current.y = normY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, [scrollContainerRef]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        <SceneContent progressRef={progressRef} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
