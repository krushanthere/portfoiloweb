"use client";

import React, { useState, useCallback, useMemo } from "react";
import { getRandomQuoteSet, Quote } from "@/lib/quotes";
import { RefreshCw, Layers, Cpu, Move } from "lucide-react";

interface NodeData {
  id: string;
  nodeType: "input" | "synapse" | "inference" | "synthesis" | "output";
  tag: string;
  role: string;
  quote: Quote;
  x: number; // in percentage of viewBox width (0 to 100)
  y: number; // in percentage of viewBox height (0 to 100)
  widthPct: number;
  heightPct: number;
  color: string;
}

interface Connection {
  fromId: string;
  toId: string;
  color?: string;
}

const DEFAULT_CONNECTIONS: Connection[] = [
  { fromId: "node-0", toId: "node-3", color: "#93C5FD" },
  { fromId: "node-0", toId: "node-2", color: "#C084FC" },
  { fromId: "node-1", toId: "node-2", color: "#60A5FA" },
  { fromId: "node-2", toId: "node-4", color: "#A78BFA" },
  { fromId: "node-3", toId: "node-4", color: "#38BDF8" },
];

const NODE_PRESETS: {
  nodeType: NodeData["nodeType"];
  tag: string;
  role: string;
  color: string;
  defaultX: number;
  defaultY: number;
}[] = [
  {
    nodeType: "input",
    tag: "PROMPT_01",
    role: "LATENT INPUT",
    color: "#60A5FA",
    defaultX: 8,
    defaultY: 15,
  },
  {
    nodeType: "input",
    tag: "CONTEXT_02",
    role: "SEMANTIC CONTEXT",
    color: "#38BDF8",
    defaultX: 6,
    defaultY: 60,
  },
  {
    nodeType: "synapse",
    tag: "SYNAPSE_03",
    role: "NEURAL ATTENTION",
    color: "#A78BFA",
    defaultX: 38,
    defaultY: 66,
  },
  {
    nodeType: "inference",
    tag: "INFERENCE_04",
    role: "NEURAL DECODER",
    color: "#C084FC",
    defaultX: 65,
    defaultY: 16,
  },
  {
    nodeType: "synthesis",
    tag: "SYNTHESIS_05",
    role: "MANIFESTED OUTPUT",
    color: "#F472B6",
    defaultX: 68,
    defaultY: 62,
  },
];

function generateNodes(): NodeData[] {
  const randomQuotes = getRandomQuoteSet(5);
  return NODE_PRESETS.map((preset, idx) => ({
    id: `node-${idx}`,
    nodeType: preset.nodeType,
    tag: preset.tag,
    role: preset.role,
    color: preset.color,
    quote: randomQuotes[idx] || { id: idx + 1, text: "Thinking in probabilities...", source: "Unknown" },
    x: preset.defaultX,
    y: preset.defaultY,
    widthPct: 26,
    heightPct: 24,
  }));
}

export const QuoteNodeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>(() => generateNodes());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ clientX: number; clientY: number; nodeX: number; nodeY: number }>({
    clientX: 0,
    clientY: 0,
    nodeX: 0,
    nodeY: 0,
  });
  const [pulseKey, setPulseKey] = useState(0);

  // Re-seed quotes randomly
  const shuffleQuotes = useCallback(() => {
    setNodes(generateNodes());
    setPulseKey((k) => k + 1);
  }, []);

  // Pointer drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    setDragStartPos({
      clientX: e.clientX,
      clientY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    });
    setActiveDragId(id);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeDragId) return;

      const container = e.currentTarget.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartPos.clientX) / container.width) * 100;
      const deltaY = ((e.clientY - dragStartPos.clientY) / container.height) * 100;

      const newX = Math.max(2, Math.min(72, dragStartPos.nodeX + deltaX));
      const newY = Math.max(4, Math.min(74, dragStartPos.nodeY + deltaY));

      setNodes((prev) =>
        prev.map((n) => (n.id === activeDragId ? { ...n, x: newX, y: newY } : n))
      );
    },
    [activeDragId, dragStartPos]
  );

  const handlePointerUp = useCallback(() => {
    setActiveDragId(null);
  }, []);

  // SVG Coordinates calculation in 1000x650 coordinate space
  const splinePaths = useMemo(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return DEFAULT_CONNECTIONS.map((conn, idx) => {
      const from = nodeMap.get(conn.fromId);
      const to = nodeMap.get(conn.toId);

      if (!from || !to) return null;

      // Start: Right port of fromNode in 0-1000 and 0-650 viewBox space
      const x1 = (from.x + from.widthPct) * 10;
      const y1 = (from.y + from.heightPct / 2) * 6.5;

      // End: Left port of toNode in viewBox space
      const x2 = to.x * 10;
      const y2 = (to.y + to.heightPct / 2) * 6.5;

      // Cubic Bezier curvature
      const dx = Math.abs(x2 - x1);
      const curvature = Math.max(dx * 0.55, 60);

      const c1x = x1 + curvature;
      const c1y = y1;
      const c2x = x2 - curvature;
      const c2y = y2;

      const pathData = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

      return {
        id: `spline-${idx}`,
        pathData,
        color: conn.color || "#93C5FD",
        x1,
        y1,
        x2,
        y2,
      };
    }).filter(Boolean);
  }, [nodes]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-[85vh] max-h-[850px] min-h-[580px] rounded-xl border border-muted/25 bg-[#05070D]/90 backdrop-blur-xl overflow-hidden select-none shadow-2xl"
    >
      {/* Blueprint Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-900/15 via-purple-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Toolbar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-black/60 border border-muted/30 px-3.5 py-1.5 rounded-md backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-foreground font-semibold">
            NODE GRAPH PRO // SYNAPSE GRAPH
          </span>
          <span className="text-muted/60 text-xs">{"//"}</span>
          <span className="text-xs font-mono text-silver">v2.4 ACTIVE</span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={shuffleQuotes}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-background/80 hover:bg-foreground hover:text-background border border-muted/30 text-xs font-mono tracking-wider text-silver transition-all duration-200 group shadow-sm active:scale-95 cursor-pointer"
            title="Randomize connected quotes"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span>SHUFFLE QUOTES</span>
          </button>
        </div>
      </div>

      {/* SVG Connecting Bezier Cables Layer (ViewBox 1000x650) */}
      <svg
        viewBox="0 0 1000 650"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <defs>
          <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {splinePaths.map((spline) => {
          if (!spline) return null;
          return (
            <g key={spline.id}>
              {/* Soft background glow spline */}
              <path
                d={spline.pathData}
                fill="none"
                stroke={spline.color}
                strokeWidth="6"
                strokeOpacity="0.12"
                strokeLinecap="round"
              />

              {/* Main crisp connection wire */}
              <path
                d={spline.pathData}
                fill="none"
                stroke={spline.color}
                strokeWidth="2.2"
                strokeOpacity="0.75"
                strokeLinecap="round"
              />

              {/* Animated Glowing Signal Pulses traveling along path */}
              <circle r="4" fill="#FFFFFF" filter="url(#glow-blur)">
                <animateMotion
                  key={`pulse-${pulseKey}-${spline.id}`}
                  path={spline.pathData}
                  dur="3.2s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>

              <circle r="2.5" fill={spline.color}>
                <animateMotion
                  key={`pulse2-${pulseKey}-${spline.id}`}
                  path={spline.pathData}
                  dur="3.2s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>

              {/* Terminal Port Rings */}
              <circle
                cx={spline.x1}
                cy={spline.y1}
                r="4.5"
                fill="#05070D"
                stroke={spline.color}
                strokeWidth="2"
              />
              <circle
                cx={spline.x2}
                cy={spline.y2}
                r="4.5"
                fill="#05070D"
                stroke={spline.color}
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>

      {/* Draggable Workflow Quote Node Cards */}
      <div className="relative w-full h-full z-20">
        {nodes.map((node) => {
          const isDragging = activeDragId === node.id;

          return (
            <div
              key={node.id}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: "min(300px, 28vw)",
              }}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
                isDragging ? "z-30 scale-[1.03]" : "z-20 hover:scale-[1.01]"
              }`}
            >
              {/* Glassmorphic Node Card Container */}
              <div
                className={`relative rounded-xl border bg-black/85 backdrop-blur-md p-4 transition-all duration-300 ${
                  isDragging
                    ? "border-accent shadow-[0_12px_40px_rgba(59,130,246,0.35)]"
                    : "border-muted/35 hover:border-muted/70 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                }`}
              >
                {/* Left Connector Pin Handle */}
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-[#05070D] transition-transform duration-200 hover:scale-125"
                  style={{ borderColor: node.color }}
                />

                {/* Right Connector Pin Handle */}
                <div
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-[#05070D] transition-transform duration-200 hover:scale-125"
                  style={{ borderColor: node.color }}
                />

                {/* Card Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-muted/20 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="font-semibold tracking-wider text-foreground">
                      {node.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted text-[10px] tracking-widest">
                    <Cpu className="w-3 h-3 text-silver" />
                    <span>{node.role}</span>
                  </div>
                </div>

                {/* Card Body: Quote Text */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-snug tracking-tight font-sans">
                    &ldquo;{node.quote.text}&rdquo;
                  </p>

                  {/* Card Footer: Metadata & Source Tag */}
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-silver">
                    <span
                      className="px-2 py-0.5 rounded border border-muted/30 bg-muted/10 font-semibold tracking-wider"
                      style={{ color: node.color }}
                    >
                      {node.quote.source.toUpperCase()}
                    </span>
                    <span className="text-muted/60 text-[10px]">
                      ID #{node.quote.id.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Technical Status Bar */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-muted/70 z-20 pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-accent" />
          <span>DRAG ANY NODE TO RE-ROUTE NEURAL PATHS</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>{"[TOPOLOGY: 5 NODES // 5 ACTIVE SYNAPSES]"}</span>
          <span>{"[DYNAMIC PER-LOAD RE-SEEDING]"}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteNodeGraph;
