"use client";

import React, { useState, useEffect, useMemo, useRef, startTransition } from "react";

interface GridBackgroundProps {
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
  proximityRadius?: number;
  maxOpacity?: number;
  backgroundOpacity?: number;
  gridType?: "dots-lines" | "lines" | "dots" | "plus" | "plus-lines";
  fadeDelay?: number;
  thickness?: number;
  hoverDarken?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  dotColor = "#555555",
  dotSize = 4,
  spacing = 60,
  proximityRadius = 150,
  maxOpacity = 1,
  backgroundOpacity = 0.1,
  gridType = "plus",
  thickness = 1.5,
  hoverDarken = 0.3,
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      startTransition(() => {
        setDimensions({ width, height });
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      startTransition(() => {
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const dots = useMemo(() => {
    const dotsArray = [];
    const cols = Math.ceil(dimensions.width / spacing);
    const rows = Math.ceil(dimensions.height / spacing);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        dotsArray.push({ x, y, key: `${col}-${row}` });
      }
    }
    return dotsArray;
  }, [dimensions.width, dimensions.height, spacing]);

  const getOpacity = (dotX: number, dotY: number) => {
    const distance = Math.sqrt(Math.pow(mousePos.x - dotX, 2) + Math.pow(mousePos.y - dotY, 2));
    if (distance > proximityRadius) return backgroundOpacity;
    const hoverOpacity = (1 - distance / proximityRadius) * maxOpacity;
    return Math.max(backgroundOpacity, hoverOpacity);
  };

  const getColorWithHover = (dotX: number, dotY: number) => {
    const opacity = getOpacity(dotX, dotY);
    if (opacity > backgroundOpacity) {
      const hoverAmount = (opacity - backgroundOpacity) / (maxOpacity - backgroundOpacity);
      return { color: dotColor, opacity: opacity + hoverAmount * hoverDarken };
    }
    return { color: dotColor, opacity };
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {(gridType === "dots-lines" || gridType === "lines" || gridType === "plus-lines") && (
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {Array.from({ length: Math.ceil(dimensions.width / spacing) }).map((_, i) => {
            const x = i * spacing + spacing / 2;
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={dimensions.height}
                stroke={dotColor}
                strokeWidth={1}
                opacity={backgroundOpacity}
              />
            );
          })}
          {Array.from({ length: Math.ceil(dimensions.height / spacing) }).map((_, i) => {
            const y = i * spacing + spacing / 2;
            return (
              <line
                key={`h-${i}`}
                x1={0}
                y1={y}
                x2={dimensions.width}
                y2={y}
                stroke={dotColor}
                strokeWidth={1}
                opacity={backgroundOpacity}
              />
            );
          })}
        </svg>
      )}

      {gridType === "dots-lines" || gridType === "dots" ? (
        dots.map((dot) => {
          const opacity = getOpacity(dot.x, dot.y);
          return (
            <div
              key={dot.key}
              style={{
                position: "absolute",
                left: dot.x,
                top: dot.y,
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: dotColor,
                opacity,
                transform: "translate(-50%, -50%)",
                transition: "opacity 0.2s ease-out",
                pointerEvents: "none",
              }}
            />
          );
        })
      ) : gridType === "plus" || gridType === "plus-lines" ? (
        dots.map((dot) => {
          const { color, opacity } = getColorWithHover(dot.x, dot.y);
          const plusSize = dotSize * 2;
          const halfThickness = thickness / 2;
          return (
            <svg
              key={dot.key}
              style={{
                position: "absolute",
                left: dot.x,
                top: dot.y,
                width: plusSize,
                height: plusSize,
                opacity,
                transform: "translate(-50%, -50%)",
                transition: "opacity 0.2s ease-out",
                pointerEvents: "none",
              }}
            >
              <path
                d={`
                  M ${plusSize / 2 - halfThickness} 0
                  L ${plusSize / 2 + halfThickness} 0
                  L ${plusSize / 2 + halfThickness} ${plusSize / 2 - halfThickness}
                  L ${plusSize} ${plusSize / 2 - halfThickness}
                  L ${plusSize} ${plusSize / 2 + halfThickness}
                  L ${plusSize / 2 + halfThickness} ${plusSize / 2 + halfThickness}
                  L ${plusSize / 2 + halfThickness} ${plusSize}
                  L ${plusSize / 2 - halfThickness} ${plusSize}
                  L ${plusSize / 2 - halfThickness} ${plusSize / 2 + halfThickness}
                  L 0 ${plusSize / 2 + halfThickness}
                  L 0 ${plusSize / 2 - halfThickness}
                  L ${plusSize / 2 - halfThickness} ${plusSize / 2 - halfThickness}
                  Z
                `}
                fill={color}
              />
            </svg>
          );
        })
      ) : (
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {Array.from({ length: Math.ceil(dimensions.width / spacing) }).map((_, i) => {
            const x = i * spacing + spacing / 2;
            const opacity = getOpacity(x, mousePos.y);
            return (
              <line
                key={`v-hover-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={dimensions.height}
                stroke={dotColor}
                strokeWidth={1}
                opacity={opacity}
                style={{ transition: "opacity 0.2s ease-out" }}
              />
            );
          })}
          {Array.from({ length: Math.ceil(dimensions.height / spacing) }).map((_, i) => {
            const y = i * spacing + spacing / 2;
            const opacity = getOpacity(mousePos.x, y);
            return (
              <line
                key={`h-hover-${i}`}
                x1={0}
                y1={y}
                x2={dimensions.width}
                y2={y}
                stroke={dotColor}
                strokeWidth={1}
                opacity={opacity}
                style={{ transition: "opacity 0.2s ease-out" }}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};
