"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface WormholeCanvasProps {
  progress: number; // 0 to 1
  isBoosting: boolean;
  speedMultiplier: number;
}

export const WormholeCanvas: React.FC<WormholeCanvasProps> = ({
  progress,
  isBoosting,
  speedMultiplier,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep updated values accessible in the render loop without re-instantiating
  const progressRef = useRef(progress);
  const boostRef = useRef(isBoosting);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    boostRef.current = isBoosting;
  }, [isBoosting]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010106, 0.01);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2));

    // Mouse Parallax & Roll Physics
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.targetY = -(((e.clientY - rect.top) / rect.height - 0.5) * 2);
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Touch Parallax for Mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          mouse.targetX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
          mouse.targetY = -(((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 2);
        }
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // --- 1. PARAMETRIC CURVED WORMHOLE TUNNEL ---
    const pointsCount = 65;
    const curvePoints: THREE.Vector3[] = [];
    const totalSplineZ = (pointsCount - 1) * 8; // 512 units long

    for (let i = 0; i < pointsCount; i++) {
      const z = -i * 8;
      // Gentle organic cosmic S-curves through hyperspace
      const x = Math.sin(i * 0.16) * 4.2 + Math.cos(i * 0.07) * 2.0;
      const y = Math.cos(i * 0.14) * 3.6 + Math.sin(i * 0.05) * 1.4;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const spline = new THREE.CatmullRomCurve3(curvePoints);

    // Tube Geometry
    const tubeGeometry = new THREE.TubeGeometry(spline, 200, 5.4, 32, false);

    // Custom GLSL Shader for Wormhole Spacetime Wall
    const wormholeUniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uProgress: { value: 0 },
      uBoost: { value: 0 },
      uColor1: { value: new THREE.Color("#00f0ff") }, // Electric Cyan
      uColor2: { value: new THREE.Color("#8b5cf6") }, // Deep Violet
      uColor3: { value: new THREE.Color("#3b82f6") }, // Cyber Blue
      uColorAcc: { value: new THREE.Color("#ffffff") }, // Diamond White
    };

    const wormholeMaterial = new THREE.ShaderMaterial({
      uniforms: wormholeUniforms,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDepth;
        uniform float uTime;
        uniform float uSpeed;

        void main() {
          vUv = uv;
          vNormal = normal;

          // Undulate tunnel walls with relativistic ripples
          vec3 pos = position;
          float ripple = sin(pos.z * 0.12 - uTime * uSpeed * 4.5) * cos(atan(pos.y, pos.x) * 4.0);
          pos += normal * ripple * 0.22;

          vPosition = pos;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDepth;

        uniform float uTime;
        uniform float uSpeed;
        uniform float uProgress;
        uniform float uBoost;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColorAcc;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        void main() {
          // Relativistic warp coordinates along tube
          float zOffset = vUv.x * 28.0 - uTime * uSpeed * 3.8;
          float angle = vUv.y * 3.14159265 * 2.0;

          // 1. Grid structure (longitudinal filaments & circumferential rings)
          float longitudinalLines = pow(abs(sin(angle * 8.0 + uTime * 0.8)), 32.0);
          float ringLines = pow(abs(sin(zOffset * 1.6)), 26.0);
          float grid = max(longitudinalLines * 0.8, ringLines * 0.9);

          // 2. High-speed plasma energy vortex filaments
          vec2 noiseUv = vec2(angle * 2.0 + sin(zOffset * 0.2), zOffset * 0.35);
          float n1 = noise(noiseUv * 3.0);
          float n2 = noise(noiseUv * 6.0 + uTime * 1.8);
          float plasma = pow(n1 * 0.65 + n2 * 0.35, 2.2) * 2.6;

          // 3. Relativistic Speed Streaks
          float streaks = pow(noise(vec2(angle * 14.0, zOffset * 0.12)), 4.0) * 3.2;

          // Dynamic Color Blending
          vec3 col = mix(uColor1, uColor2, sin(zOffset * 0.5 + angle) * 0.5 + 0.5);
          col = mix(col, uColor3, sin(angle * 3.0 - uTime) * 0.5 + 0.5);

          // Highlights & accents
          col += uColorAcc * (grid * 1.8 + streaks * 2.2 + uBoost * 0.9);
          col += col * plasma * (1.2 + uBoost * 1.1);

          // Depth fogging & event horizon attenuation
          float fog = clamp((vDepth - 2.0) / 480.0, 0.0, 1.0);
          float alpha = (grid * 0.6 + plasma * 0.45 + streaks * 0.55 + 0.18) * (1.0 - fog * 0.85);

          // Superluminal boost surge
          alpha = clamp(alpha * (1.0 + uBoost * 0.6 + uProgress * 0.5), 0.0, 1.0);

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const wormholeMesh = new THREE.Mesh(tubeGeometry, wormholeMaterial);
    scene.add(wormholeMesh);

    // --- 2. RELATIVISTIC WARP PARTICLE STREAKS ---
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 6); // 2 vertices per line streak
    const starColors = new Float32Array(starCount * 6);
    const starSpeeds = new Float32Array(starCount);
    const starRadii = new Float32Array(starCount);
    const starAngles = new Float32Array(starCount);
    const starRelZ = new Float32Array(starCount); // Relative to camera

    const tunnelRange = 360;

    for (let i = 0; i < starCount; i++) {
      starRadii[i] = Math.pow(Math.random(), 0.6) * 4.6 + 0.3;
      starAngles[i] = Math.random() * Math.PI * 2;
      starRelZ[i] = -Math.random() * tunnelRange;
      starSpeeds[i] = Math.random() * 0.8 + 0.6;

      // Color variation per particle
      const isCyan = Math.random() > 0.4;
      const r = isCyan ? 0.25 : 0.8;
      const g = isCyan ? 0.9 : 0.6;
      const b = 1.0;

      // Start vertex color (tail)
      starColors[i * 6 + 0] = r * 0.7;
      starColors[i * 6 + 1] = g * 0.7;
      starColors[i * 6 + 2] = b * 0.7;
      // End vertex color (head of streak is brilliant white-cyan)
      starColors[i * 6 + 3] = 1.0;
      starColors[i * 6 + 4] = 1.0;
      starColors[i * 6 + 5] = 1.0;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starLines = new THREE.LineSegments(starGeometry, starMaterial);
    scene.add(starLines);

    // --- 3. SINGULARITY ACCRETION HORIZON CORE ---
    const coreTexture = (() => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.2, "rgba(0, 240, 255, 0.85)");
      grad.addColorStop(0.5, "rgba(139, 92, 246, 0.45)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    })();

    const coreSpriteMat = new THREE.SpriteMaterial({
      map: coreTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreSprite = new THREE.Sprite(coreSpriteMat);
    coreSprite.scale.set(38, 38, 1);
    scene.add(coreSprite);

    // Pulsing Singularity Gravitational Wave Rings
    const ringCount = 5;
    const ringMeshes: THREE.Mesh[] = [];
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.RingGeometry(0.5, 0.9, 32);
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      scene.add(ring);
      ringMeshes.push(ring);
    }

    // --- 4. RESIZE OBSERVER & HANDLER ---
    const updateSize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          updateSize(w, h);
        }
      });
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => {
      if (!container) return;
      updateSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleWindowResize);

    // --- 5. RENDER & FLIGHT SIMULATION LOOP ---
    let animationId: number;
    let cameraTravelT = 0.02;
    let lastTime = performance.now();
    let elapsedTime = 0;
    let currentFov = 72;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      elapsedTime += delta;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const currentProg = progressRef.current;
      const isBoost = boostRef.current;
      const mult = speedRef.current;

      // Warp speed calculation
      const baseSpeed = 1.0 + currentProg * 3.0 + (isBoost ? 2.5 : 0);
      const effectiveSpeed = baseSpeed * mult;

      // Smooth camera progression along spline
      // During 0-100% progress, camera advances from 0.02 to 0.72.
      // During exit acceleration (mult > 1), surges forward towards 0.98.
      const targetTravelT = THREE.MathUtils.clamp(
        0.02 + currentProg * 0.68 + (mult > 1 ? (mult - 1) * 0.025 : 0),
        0.01,
        0.985
      );
      cameraTravelT += (targetTravelT - cameraTravelT) * (mult > 1 ? 0.15 : 0.08);

      // Smooth camera position on spline + mouse sway
      const camPos = spline.getPointAt(cameraTravelT);
      const lookAtT = Math.min(cameraTravelT + 0.06, 0.995);
      const lookAtPos = spline.getPointAt(lookAtT);

      camera.position.copy(camPos);
      camera.position.x += mouse.x * 0.75;
      camera.position.y += mouse.y * 0.75;

      camera.lookAt(lookAtPos.x + mouse.x * 1.8, lookAtPos.y + mouse.y * 1.8, lookAtPos.z);
      // Dynamic camera roll into curves
      camera.rotation.z = -mouse.x * 0.3 + Math.sin(cameraTravelT * 18.0) * 0.06;

      // Dynamic FOV (Warp dilation effect)
      const targetFov = 72 + effectiveSpeed * 6.5 + (isBoost ? 12 : 0);
      currentFov += (targetFov - currentFov) * 0.08;
      camera.fov = currentFov;
      camera.updateProjectionMatrix();

      // Update Wormhole Shader Uniforms
      wormholeUniforms.uTime.value = elapsedTime;
      wormholeUniforms.uSpeed.value = effectiveSpeed;
      wormholeUniforms.uProgress.value = currentProg;
      wormholeUniforms.uBoost.value = isBoost ? 1.0 : 0.0;

      // Update Star Streaks along the 3D spline curve
      const posAttr = starGeometry.getAttribute("position") as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const streakLength = (1.8 + effectiveSpeed * 3.5) * (isBoost ? 1.6 : 1.0);

      for (let i = 0; i < starCount; i++) {
        // Move particle forward (towards camera)
        starRelZ[i] += delta * effectiveSpeed * 110.0 * starSpeeds[i];
        if (starRelZ[i] > 2.0) {
          starRelZ[i] = -tunnelRange + Math.random() * 20.0;
        }

        const zHead = camera.position.z + starRelZ[i];
        const zTail = zHead - streakLength;

        // Spiral rotation
        starAngles[i] += delta * 0.75 * starSpeeds[i];
        const angle = starAngles[i];
        const r = starRadii[i];

        // Spline curvature mapping: directly map world Z to spline parameter t
        const tHead = THREE.MathUtils.clamp(-zHead / totalSplineZ, 0.001, 0.999);
        const tTail = THREE.MathUtils.clamp(-zTail / totalSplineZ, 0.001, 0.999);

        const offsetHead = spline.getPointAt(tHead);
        const offsetTail = spline.getPointAt(tTail);

        const x1 = Math.cos(angle) * r + offsetHead.x;
        const y1 = Math.sin(angle) * r + offsetHead.y;
        const x2 = Math.cos(angle) * r * 0.98 + offsetTail.x;
        const y2 = Math.sin(angle) * r * 0.98 + offsetTail.y;

        // Tail vertex
        positions[i * 6 + 0] = x2;
        positions[i * 6 + 1] = y2;
        positions[i * 6 + 2] = zTail;

        // Head vertex
        positions[i * 6 + 3] = x1;
        positions[i * 6 + 4] = y1;
        positions[i * 6 + 5] = zHead;
      }
      posAttr.needsUpdate = true;

      // Position Singularity Core at the distant focal point
      const distantPoint = spline.getPointAt(Math.min(cameraTravelT + 0.4, 0.995));
      coreSprite.position.copy(distantPoint);
      const coreScale = (32 + Math.sin(elapsedTime * 7.0) * 4.0) * (1.0 + currentProg * 1.3);
      coreSprite.scale.set(coreScale, coreScale, 1);

      // Animate Gravitational Wave Rings expanding from singularity
      for (let i = 0; i < ringCount; i++) {
        const ring = ringMeshes[i];
        const ringTime = (elapsedTime * (1.2 + effectiveSpeed * 0.25) + (i / ringCount) * 4.0) % 4.0;
        const ringDist = ringTime * 40.0;
        const ringT = THREE.MathUtils.clamp(cameraTravelT + 0.4 - ringDist * 0.0016, 0.01, 0.995);
        const ringPos = spline.getPointAt(ringT);
        ring.position.copy(ringPos);
        ring.lookAt(camera.position);
        const ringScale = (1.0 + ringTime * 2.6) * (1.0 + currentProg * 0.6);
        ring.scale.set(ringScale, ringScale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(
          (1.0 - ringTime / 4.0) * 0.65,
          0
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleWindowResize);
      resizeObserver?.disconnect();

      // Dispose Three.js objects
      tubeGeometry.dispose();
      wormholeMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      coreTexture.dispose();
      coreSpriteMat.dispose();
      ringMat.dispose();
      ringMeshes.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default WormholeCanvas;
