"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getRandomQuoteSet, Quote } from "@/lib/quotes";

interface QuoteSphereProps {
  progressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; targetX: number; targetY: number }>;
  burstRef?: React.MutableRefObject<number>;
}

interface QuoteSpriteItem {
  id: number;
  quote: Quote;
  basePos: THREE.Vector3;
  explodeDir: THREE.Vector3;
  speed: number;
  curl: THREE.Vector3;
  texture: THREE.CanvasTexture;
  material: THREE.SpriteMaterial;
  sprite: THREE.Sprite;
}

/**
 * Deterministic pseudo-random number generator for stable particle seeds.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Generates a high-DPI canvas texture for a given quote.
 * Formats quote text with high contrast, crisp pill container, and source attribution.
 */
function createQuoteTexture(quote: Quote, dpr: number = 2): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const width = 560;
  const height = 140;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  if (!ctx) {
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    return fallbackTexture;
  }

  ctx.scale(dpr, dpr);

  // Background rounded pill styling
  const pad = 6;
  const r = 26;
  const pw = width - pad * 2;
  const ph = height - pad * 2;
  const px = pad;
  const py = pad;

  // Glass pill background with deep backdrop
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(px, py, pw, ph, r);
  } else {
    ctx.rect(px, py, pw, ph);
  }
  ctx.fillStyle = "rgba(6, 8, 14, 0.88)";
  ctx.fill();

  // Subtle metallic silver & cyan border gradient
  const borderGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
  borderGrad.addColorStop(0, "rgba(255, 255, 255, 0.50)");
  borderGrad.addColorStop(0.5, "rgba(147, 197, 253, 0.35)");
  borderGrad.addColorStop(1, "rgba(255, 255, 255, 0.18)");
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  // Subtle inner top highlight
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(px + 3, py + 3, pw - 6, (ph - 6) / 2, [r - 2, r - 2, 4, 4]);
  } else {
    ctx.rect(px + 3, py + 3, pw - 6, (ph - 6) / 2);
  }
  const highlightGrad = ctx.createLinearGradient(px, py, px, py + ph / 2);
  highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = highlightGrad;
  ctx.fill();

  // Text Typography
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = pw - 48;
  ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  ctx.fillStyle = "#FFFFFF";

  const fullQuoteText = `"${quote.text}"`;
  const textMetrics = ctx.measureText(fullQuoteText);

  if (textMetrics.width <= maxWidth) {
    // Single line quote
    ctx.fillText(fullQuoteText, width / 2, height / 2 - 12);
    ctx.font = '600 14px system-ui, -apple-system, "Segoe UI", monospace';
    ctx.fillStyle = "#93C5FD";
    ctx.fillText(`— ${quote.source.toUpperCase()}`, width / 2, height / 2 + 22);
  } else {
    // Multi-line wrap
    const words = quote.text.split(" ");
    const mid = Math.ceil(words.length / 2);
    const line1 = `"${words.slice(0, mid).join(" ")}`;
    const line2 = `${words.slice(mid).join(" ")}"`;

    ctx.font = 'bold 20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
    ctx.fillText(line1, width / 2, height / 2 - 24);
    ctx.fillText(line2, width / 2, height / 2 + 2);

    ctx.font = '600 13px system-ui, -apple-system, "Segoe UI", monospace';
    ctx.fillStyle = "#93C5FD";
    ctx.fillText(`— ${quote.source.toUpperCase()}`, width / 2, height / 2 + 28);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export const QuoteSphere: React.FC<QuoteSphereProps> = ({ progressRef, mouseRef, burstRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const trailsGroupRef = useRef<THREE.Group>(null);
  const baseRotation = useRef({ x: 0.15, y: 0 });

  // Responsive sphere configuration
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalQuotesCount = isMobile ? 26 : 38;
  const sphereRadius = isMobile ? 0.76 : 0.94;
  const spriteScale = useMemo(
    () => (isMobile ? new THREE.Vector3(0.32, 0.08, 1) : new THREE.Vector3(0.42, 0.105, 1)),
    [isMobile]
  );

  // 1. Generate randomized quotes on load
  const selectedQuotes = useMemo(() => {
    return getRandomQuoteSet(totalQuotesCount);
  }, [totalQuotesCount]);

  // 2. Build quote sprites with Fibonacci sphere distribution
  const quoteSprites = useMemo<QuoteSpriteItem[]>(() => {
    if (typeof document === "undefined") return [];

    const items: QuoteSpriteItem[] = [];
    const count = selectedQuotes.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const quote = selectedQuotes[i];
      // Fibonacci sphere distribution (avoiding pole clustering)
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const basePos = new THREE.Vector3(x * sphereRadius, y * sphereRadius, z * sphereRadius);
      const explodeDir = basePos.clone().normalize();
      const speed = 0.8 + pseudoRandom(i * 3 + 1) * 0.9;
      const curl = new THREE.Vector3(
        (pseudoRandom(i * 7 + 2) - 0.5) * 1.8,
        (pseudoRandom(i * 11 + 3) - 0.5) * 1.8,
        (pseudoRandom(i * 13 + 4) - 0.5) * 1.8
      );

      const texture = createQuoteTexture(quote);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NormalBlending,
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.copy(basePos);
      sprite.scale.copy(spriteScale);

      items.push({
        id: quote.id,
        quote,
        basePos,
        explodeDir,
        speed,
        curl,
        texture,
        material,
        sprite,
      });
    }

    return items;
  }, [selectedQuotes, sphereRadius, spriteScale]);

  // Cleanup textures & materials on unmount or re-render
  useEffect(() => {
    return () => {
      quoteSprites.forEach((item) => {
        item.material.dispose();
        item.texture.dispose();
      });
    };
  }, [quoteSprites]);

  // 3. Comet / Orbital Trail Ring System
  const { cometGeometry, cometMaterials } = useMemo(() => {
    const numRings = 3;
    const particlesPerRing = 110;
    const ringRadii = [sphereRadius * 1.35, sphereRadius * 1.55, sphereRadius * 1.75];
    const ringTilts = [
      new THREE.Euler(0.45, 0.2, 0.35),
      new THREE.Euler(-0.65, 0.4, -0.45),
      new THREE.Euler(0.85, -0.3, 0.75),
    ];

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.PointsMaterial[] = [];

    for (let r = 0; r < numRings; r++) {
      const radius = ringRadii[r];
      const tilt = ringTilts[r];
      const positions = new Float32Array(particlesPerRing * 3);
      const colors = new Float32Array(particlesPerRing * 3);

      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        const trailIntensity = Math.pow(i / particlesPerRing, 2.5); // Comet head to tail fade

        const pX = Math.cos(angle) * radius;
        const pY = (pseudoRandom(r * 100 + i * 2) - 0.5) * 0.04;
        const pZ = Math.sin(angle) * radius;

        const posVec = new THREE.Vector3(pX, pY, pZ).applyEuler(tilt);
        positions[i * 3] = posVec.x;
        positions[i * 3 + 1] = posVec.y;
        positions[i * 3 + 2] = posVec.z;

        // Comet glowing color: bright white head -> cyan trail -> silver/dim tail
        const col = new THREE.Color();
        if (i > particlesPerRing - 8) {
          col.setRGB(1.0, 1.0, 1.0); // Bright head
        } else {
          col.setRGB(0.4 * trailIntensity + 0.1, 0.75 * trailIntensity + 0.15, 1.0 * trailIntensity + 0.2);
        }

        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometries.push(geom);

      const mat = new THREE.PointsMaterial({
        size: 0.022,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      materials.push(mat);
    }

    return { cometGeometry: geometries, cometMaterials: materials };
  }, [sphereRadius]);

  const activationRef = useRef(0);
  const tempVec3 = useMemo(() => new THREE.Vector3(), []);
  const tempWorldPos = useMemo(() => new THREE.Vector3(), []);

  // Frame animation loop (60 FPS target)
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const progress = progressRef.current || 0;
    const smoothProgress = THREE.MathUtils.smoothstep(progress, 0.0, 1.0);

    // 1. Continuous auto-rotation around Y-axis
    baseRotation.current.y += delta * 0.22;
    const tilt = 0.20 + Math.sin(time * 0.4) * 0.04;
    baseRotation.current.x = tilt;

    // 2. Mouse parallax lerping
    const targetParallaxX = mouseRef.current.y * 0.10;
    const targetParallaxY = mouseRef.current.x * 0.14;

    groupRef.current.rotation.x += (baseRotation.current.x + targetParallaxX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (baseRotation.current.y + targetParallaxY - groupRef.current.rotation.y) * 0.05;

    // Breathing pulse
    activationRef.current = Math.min(1.0, activationRef.current + delta * 1.5);
    const burstVal = burstRef ? burstRef.current : 1.0;
    const baseScale = Math.max(activationRef.current, burstVal > 0.2 ? 1.0 : 0.85);
    const pulse = baseScale * (1.0 + Math.sin(time * 2.0) * 0.035);

    // 3. Update Quote Sprites: Motion, Scroll Disperse & Depth Readability
    quoteSprites.forEach((item) => {
      // Explosion kinematics on scroll
      const travelDist = smoothProgress * item.speed * 4.2;
      const curlDriftX = item.curl.x * smoothProgress * (Math.sin(time * 1.6 + item.speed * 8.0) * 0.35 + 0.7);
      const curlDriftY = item.curl.y * smoothProgress * (Math.cos(time * 1.4 + item.speed * 7.0) * 0.35 + 0.7);
      const curlDriftZ = item.curl.z * smoothProgress * 0.8;

      tempVec3
        .copy(item.basePos)
        .multiplyScalar(pulse)
        .addScaledVector(item.explodeDir, travelDist)
        .add(new THREE.Vector3(curlDriftX, curlDriftY, curlDriftZ));

      item.sprite.position.copy(tempVec3);

      // Depth cueing: calculate facing relative to camera in world coordinates
      item.sprite.getWorldPosition(tempWorldPos);
      const depthZ = tempWorldPos.z; // Closer to camera is higher z

      // Near quotes (front) are crisp 100% opacity; far quotes (back) are gently dimmed to avoid overlap
      const frontFactor = THREE.MathUtils.clamp((depthZ + 0.4) / 1.4, 0.0, 1.0);
      const baseOpacity = THREE.MathUtils.lerp(0.35, 1.0, frontFactor);

      // Fade out smoothly on full scroll explosion
      const explosionFade = 1.0 - THREE.MathUtils.smoothstep(smoothProgress, 0.45, 0.9);
      item.material.opacity = baseOpacity * explosionFade;

      // Subtle dynamic scale cueing
      const scaleMultiplier = THREE.MathUtils.lerp(0.85, 1.1, frontFactor);
      item.sprite.scale.set(
        spriteScale.x * scaleMultiplier,
        spriteScale.y * scaleMultiplier,
        1
      );
    });

    // 4. Update Comet Trail Rings
    if (trailsGroupRef.current) {
      trailsGroupRef.current.rotation.y += delta * 0.35;
      trailsGroupRef.current.rotation.x = groupRef.current.rotation.x * 0.5;

      const trailExpansion = 1.0 + smoothProgress * 2.5;
      trailsGroupRef.current.scale.setScalar(pulse * trailExpansion);

      cometMaterials.forEach((mat) => {
        mat.opacity = 0.85 * (1.0 - THREE.MathUtils.smoothstep(smoothProgress, 0.4, 0.85));
      });
    }
  });

  return (
    <group position={[0.0, 0.0, 0]}>
      {/* Billboarded Quote Orb Sprite Cluster */}
      <group ref={groupRef}>
        {quoteSprites.map((item) => (
          <primitive key={item.id} object={item.sprite} />
        ))}
      </group>

      {/* Orbiting Comet Particle Rings */}
      <group ref={trailsGroupRef}>
        {cometGeometry &&
          cometGeometry.map((geom, idx) => (
            <points key={idx} geometry={geom} material={cometMaterials[idx]} />
          ))}
      </group>
    </group>
  );
};

export default QuoteSphere;
