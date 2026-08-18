"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlitterWarpProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  particleCount?: number;
  glitterIntensity?: number;
  starColor?: string;
  glitterColor?: string;
  colorScheme?: "mono" | "aurora" | "ember" | "cyan";
  tunnelRadius?: number;
  warpFactor?: number;
  interactive?: boolean;
  mouseSensitivity?: number;
  fadeDistance?: number;
  className?: string;
  children?: React.ReactNode;
}

export const GlitterWarp: React.FC<GlitterWarpProps> = ({
  speed = 1.0,
  particleCount = 750,
  glitterIntensity = 1.2,
  starColor,
  glitterColor,
  colorScheme = "mono",
  tunnelRadius = 850,
  warpFactor = 1.25,
  interactive = true,
  mouseSensitivity = 0.04,
  fadeDistance = 1400,
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth mouse coordinates with lerp
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let gl = canvas.getContext("webgl2", {
      alpha: true,
      powerPreference: "high-performance",
      antialias: false,
      depth: false,
    }) as WebGLRenderingContext | null;

    if (!gl) {
      gl = (canvas.getContext("webgl", {
        alpha: true,
        powerPreference: "high-performance",
        antialias: false,
        depth: false,
      }) ||
        canvas.getContext("experimental-webgl", {
          alpha: true,
        })) as WebGLRenderingContext | null;
    }

    let animationFrameId: number | null = null;
    let isCleanedUp = false;

    // WebGL Vertex Shader
    const vsSource = `
      precision highp float;
      attribute vec3 aPosition; // x = angle, y = radius, z = initial depth
      attribute vec4 aData;     // x = size, y = glitterPhase, z = glitterSpeed, w = colorSeed

      uniform float uTime;
      uniform float uSpeed;
      uniform float uWarp;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uGlitterIntensity;
      uniform float uTunnelDepth;

      varying vec4 vColor;
      varying float vGlitter;

      void main() {
        // Continuous smooth forward motion modulo tunnel depth
        float depth = mod(aPosition.z - uTime * uSpeed * 380.0, uTunnelDepth);
        if (depth <= 2.0) depth += uTunnelDepth;

        float angle = aPosition.x;
        float radius = aPosition.y;

        // Cylindrical polar to 3D Cartesian coordinates
        float x = cos(angle) * radius;
        float y = sin(angle) * radius;

        // Perspective 3D projection
        float fov = 360.0;
        float z = depth;

        vec2 pos2d = vec2(x, y) / z * (fov / (uResolution.y * 0.5));
        pos2d.x *= uResolution.y / uResolution.x;

        // Smooth interactive parallax with depth scaling
        pos2d += uMouse * (1.0 - z / uTunnelDepth) * 0.25;

        // Glitter sparkle calculation (high precision harmonic twinkle)
        float glitterPhase = aData.y + uTime * aData.z * 6.28318 * uGlitterIntensity;
        float sparkle = sin(glitterPhase);
        float isGlitter = max(0.0, (sparkle - 0.55) / 0.45);

        // Smooth depth fade (distant particles soften, close particles peak)
        float depthRatio = 1.0 - z / uTunnelDepth;
        float depthAlpha = clamp(depthRatio * depthRatio * (0.85 + isGlitter * 1.5), 0.0, 1.0);

        // Responsive point sizing
        float baseSize = aData.x * (fov / z) * 1.4;
        float pointSize = clamp(baseSize * (1.0 + isGlitter * 1.6), 1.2, 36.0);

        gl_PointSize = pointSize;
        gl_Position = vec4(pos2d, 0.0, 1.0);

        // Color grading per seed
        vec3 col = vec3(1.0, 1.0, 1.0); // Pure diamond white
        if (aData.w > 0.8) {
          col = vec3(0.85, 0.88, 0.95); // Silver
        } else if (aData.w > 0.5) {
          col = vec3(0.92, 0.95, 1.0);  // High-reflection crystal
        } else if (aData.w > 0.25) {
          col = vec3(0.72, 0.88, 1.0);  // Subtle cyan/accent sheen
        }

        vColor = vec4(col, depthAlpha);
        vGlitter = isGlitter;
      }
    `;

    // WebGL Fragment Shader with anti-aliased diamond glitter glints
    const fsSource = `
      precision highp float;
      varying vec4 vColor;
      varying float vGlitter;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        if (dist > 0.5) {
          discard;
        }

        // Circular anti-aliased core
        float circle = 1.0 - smoothstep(0.08, 0.5, dist);

        // 4-Point cross sparkle flare
        float flare = 0.0;
        if (vGlitter > 0.05) {
          float crossX = 1.0 - smoothstep(0.0, 0.07, abs(coord.y));
          float crossY = 1.0 - smoothstep(0.0, 0.07, abs(coord.x));
          flare = max(crossX, crossY) * (1.0 - dist * 2.0) * vGlitter;
        }

        float alpha = clamp(circle * 0.85 + flare * 1.3, 0.0, 1.0) * vColor.a;
        vec3 finalColor = mix(vColor.rgb, vec3(1.0), circle * (0.5 + vGlitter * 0.5));

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // If WebGL is supported, use the ultra-smooth GPU pipeline
    if (gl) {
      const compileShader = (type: number, src: string) => {
        const shader = gl!.createShader(type);
        if (!shader) return null;
        gl!.shaderSource(shader, src);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          console.warn(gl!.getShaderInfoLog(shader));
          gl!.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

      if (vs && fs) {
        const program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);

            // Generate particle data buffers
            const count = particleCount;
            const positions = new Float32Array(count * 3);
            const data = new Float32Array(count * 4);

            for (let i = 0; i < count; i++) {
              // Cylindrical distribution
              const angle = Math.random() * Math.PI * 2;
              const radius = Math.pow(Math.random(), 0.55) * tunnelRadius + 30;
              const depth = Math.random() * fadeDistance;

              positions[i * 3 + 0] = angle;
              positions[i * 3 + 1] = radius;
              positions[i * 3 + 2] = depth;

              data[i * 4 + 0] = Math.random() * 1.8 + 0.6; // size
              data[i * 4 + 1] = Math.random() * Math.PI * 2; // glitterPhase
              data[i * 4 + 2] = Math.random() * 0.4 + 0.15; // glitterSpeed
              data[i * 4 + 3] = Math.random(); // colorSeed
            }

            const posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const aPosLoc = gl.getAttribLocation(program, "aPosition");
            gl.enableVertexAttribArray(aPosLoc);
            gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);

            const dataBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            const aDataLoc = gl.getAttribLocation(program, "aData");
            gl.enableVertexAttribArray(aDataLoc);
            gl.vertexAttribPointer(aDataLoc, 4, gl.FLOAT, false, 0, 0);

            // Uniform locations
            const uTimeLoc = gl.getUniformLocation(program, "uTime");
            const uSpeedLoc = gl.getUniformLocation(program, "uSpeed");
            const uWarpLoc = gl.getUniformLocation(program, "uWarp");
            const uResLoc = gl.getUniformLocation(program, "uResolution");
            const uMouseLoc = gl.getUniformLocation(program, "uMouse");
            const uGlitterLoc = gl.getUniformLocation(program, "uGlitterIntensity");
            const uDepthLoc = gl.getUniformLocation(program, "uTunnelDepth");

            // Setup blending for high-refresh additive stars
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

            // Resize handler
            const handleResize = () => {
              if (!container || !canvas || isCleanedUp) return;
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              const w = container.clientWidth;
              const h = container.clientHeight;
              canvas.width = w * dpr;
              canvas.height = h * dpr;
              gl!.viewport(0, 0, canvas.width, canvas.height);
            };

            handleResize();
            window.addEventListener("resize", handleResize);

            // Mouse handler
            const handleMouseMove = (e: MouseEvent) => {
              if (!interactive || isCleanedUp) return;
              const rect = container.getBoundingClientRect();
              const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
              const ny = -(((e.clientY - rect.top) / rect.height - 0.5) * 2);
              mouseRef.current.targetX = nx * mouseSensitivity * 1.5;
              mouseRef.current.targetY = ny * mouseSensitivity * 1.5;
            };

            window.addEventListener("mousemove", handleMouseMove, { passive: true });

            const startTime = performance.now();

            const renderWebGL = () => {
              if (isCleanedUp) return;
              const time = (performance.now() - startTime) / 1000;

              // Smooth mouse interpolation
              mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
              mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

              gl!.clearColor(0, 0, 0, 0);
              gl!.clear(gl!.COLOR_BUFFER_BIT);

              gl!.uniform1f(uTimeLoc, time);
              gl!.uniform1f(uSpeedLoc, speed * warpFactor);
              gl!.uniform1f(uWarpLoc, warpFactor);
              gl!.uniform2f(uResLoc, canvas.width, canvas.height);
              gl!.uniform2f(uMouseLoc, mouseRef.current.x, mouseRef.current.y);
              gl!.uniform1f(uGlitterLoc, glitterIntensity);
              gl!.uniform1f(uDepthLoc, fadeDistance);

              gl!.drawArrays(gl!.POINTS, 0, count);

              animationFrameId = requestAnimationFrame(renderWebGL);
            };

            animationFrameId = requestAnimationFrame(renderWebGL);

            return () => {
              isCleanedUp = true;
              if (animationFrameId) cancelAnimationFrame(animationFrameId);
              window.removeEventListener("mousemove", handleMouseMove);
              window.removeEventListener("resize", handleResize);
              if (gl) {
                gl.deleteBuffer(posBuffer);
                gl.deleteBuffer(dataBuffer);
                gl.deleteProgram(program);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
              }
            };
          }
        }
      }
    }

    // High-performance 2D Canvas Fallback
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize2D = () => {
      if (!container || !canvas || isCleanedUp) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize2D();
    window.addEventListener("resize", handleResize2D);

    const handleMouseMove2D = (e: MouseEvent) => {
      if (!interactive || isCleanedUp) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = nx * 100 * mouseSensitivity;
      mouseRef.current.targetY = ny * 100 * mouseSensitivity;
    };

    window.addEventListener("mousemove", handleMouseMove2D, { passive: true });

    interface FallbackParticle {
      angle: number;
      radius: number;
      z: number;
      size: number;
      phase: number;
      speed: number;
    }

    const pList: FallbackParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      pList.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.pow(Math.random(), 0.6) * tunnelRadius + 30,
        z: Math.random() * fadeDistance,
        size: Math.random() * 1.5 + 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.06 + 0.02,
      });
    }

    let lastT = performance.now();

    const render2D = (t: number) => {
      if (isCleanedUp) return;
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + mouseRef.current.x;
      const cy = height / 2 + mouseRef.current.y;
      const fov = 350;
      const moveStep = speed * warpFactor * 420 * dt;

      ctx.fillStyle = "#ffffff";

      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        p.z -= moveStep;
        if (p.z <= 1) p.z = fadeDistance;

        const k = fov / p.z;
        const px = Math.cos(p.angle) * p.radius * k + cx;
        const py = Math.sin(p.angle) * p.radius * k + cy;

        if (px < 0 || px > width || py < 0 || py > height) continue;

        p.phase += p.speed * glitterIntensity;
        const sparkle = Math.sin(p.phase);
        const alpha = Math.max((1 - p.z / fadeDistance) * (sparkle > 0.6 ? 1 : 0.6), 0);
        const r = Math.max(p.size * k * 0.8, 0.6);

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render2D);
    };

    animationFrameId = requestAnimationFrame(render2D);

    return () => {
      isCleanedUp = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove2D);
      window.removeEventListener("resize", handleResize2D);
    };
  }, [
    speed,
    particleCount,
    glitterIntensity,
    starColor,
    glitterColor,
    colorScheme,
    tunnelRadius,
    warpFactor,
    interactive,
    mouseSensitivity,
    fadeDistance,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden will-change-transform", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
};

export default GlitterWarp;
