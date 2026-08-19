"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { getRandomQuoteSet, Quote } from "@/lib/quotes";
import { RefreshCw, Layers, Cpu, Move, Sparkles } from "lucide-react";

interface NodeData {
  id: string;
  nodeType: "input" | "synapse" | "inference" | "synthesis";
  tag: string;
  role: string;
  quote: Quote;
  x: number; // in percentage of container width (0 to 100)
  y: number; // in percentage of container height (0 to 100)
  color: string;
}

interface Connection {
  fromId: string;
  toId: string;
  color: string;
}

interface SplineConnection {
  id: string;
  fromId: string;
  toId: string;
  color: string;
  pathData: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const DEFAULT_CONNECTIONS: Connection[] = [
  { fromId: "node-0", toId: "node-3", color: "#818CF8" }, // PROMPT_01 -> INFERENCE_04
  { fromId: "node-0", toId: "node-2", color: "#C084FC" }, // PROMPT_01 -> SYNAPSE_03
  { fromId: "node-1", toId: "node-2", color: "#38BDF8" }, // CONTEXT_02 -> SYNAPSE_03
  { fromId: "node-3", toId: "node-4", color: "#F472B6" }, // INFERENCE_04 -> SYNTHESIS_05
  { fromId: "node-2", toId: "node-4", color: "#A78BFA" }, // SYNAPSE_03 -> SYNTHESIS_05
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
    defaultX: 5,
    defaultY: 10,
  },
  {
    nodeType: "input",
    tag: "CONTEXT_02",
    role: "SEMANTIC CONTEXT",
    color: "#38BDF8",
    defaultX: 5,
    defaultY: 56,
  },
  {
    nodeType: "synapse",
    tag: "SYNAPSE_03",
    role: "NEURAL ATTENTION",
    color: "#A78BFA",
    defaultX: 37,
    defaultY: 56,
  },
  {
    nodeType: "inference",
    tag: "INFERENCE_04",
    role: "NEURAL DECODER",
    color: "#C084FC",
    defaultX: 37,
    defaultY: 10,
  },
  {
    nodeType: "synthesis",
    tag: "SYNTHESIS_05",
    role: "MANIFESTED OUTPUT",
    color: "#F472B6",
    defaultX: 69,
    defaultY: 33,
  },
];

function generateInitialNodes(): NodeData[] {
  const randomQuotes = getRandomQuoteSet(5);
  return NODE_PRESETS.map((preset, idx) => ({
    id: `node-${idx}`,
    nodeType: preset.nodeType,
    tag: preset.tag,
    role: preset.role,
    color: preset.color,
    quote: randomQuotes[idx] || {
      id: idx + 1,
      text: "Thinking in probabilities...",
      source: "Unknown",
    },
    x: preset.defaultX,
    y: preset.defaultY,
  }));
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const QuoteNodeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>(() => generateInitialNodes());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 650,
  });
  const [connections, setConnections] = useState<SplineConnection[]>([]);

  const dragStartPos = useRef<{
    clientX: number;
    clientY: number;
    nodeX: number;
    nodeY: number;
  }>({
    clientX: 0,
    clientY: 0,
    nodeX: 0,
    nodeY: 0,
  });

  // Calculate pixel-perfect spline paths connecting socket pins
  const updateConnections = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;

    setContainerSize({
      width: containerRect.width,
      height: containerRect.height,
    });

    const calculated: SplineConnection[] = [];

    for (let i = 0; i < DEFAULT_CONNECTIONS.length; i++) {
      const conn = DEFAULT_CONNECTIONS[i];
      const fromEl = nodeRefs.current.get(conn.fromId);
      const toEl = nodeRefs.current.get(conn.toId);

      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Right pin of fromNode (exact center of output socket)
      const x1 = fromRect.right - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;

      // Left pin of toNode (exact center of input socket)
      const x2 = toRect.left - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      // Smooth cubic Bezier curvature calculation
      const dx = x2 - x1;
      const curvature = Math.max(Math.abs(dx) * 0.45, 45);

      const c1x = x1 + (dx >= 0 ? curvature : curvature * 0.7);
      const c1y = y1;
      const c2x = x2 - (dx >= 0 ? curvature : curvature * 0.7);
      const c2y = y2;

      const pathData = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

      calculated.push({
        id: `conn-${conn.fromId}-${conn.toId}-${i}`,
        fromId: conn.fromId,
        toId: conn.toId,
        color: conn.color,
        pathData,
        x1,
        y1,
        x2,
        y2,
      });
    }

    setConnections(calculated);
  }, []);

  // Synchronously compute connections before browser paint
  useIsomorphicLayoutEffect(() => {
    updateConnections();
  }, [nodes, updateConnections]);

  // Keep connections locked onto pins during window resize or content shifts
  useEffect(() => {
    const handleResize = () => {
      updateConnections();
    };

    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => {
      updateConnections();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    nodeRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [updateConnections]);

  // Re-seed quotes randomly while preserving node positions
  const shuffleQuotes = useCallback(() => {
    setIsShuffling(true);
    const currentIds = nodes.map((n) => n.quote.id);
    const newQuotes = getRandomQuoteSet(nodes.length, currentIds);

    setNodes((prevNodes) =>
      prevNodes.map((node, idx) => ({
        ...node,
        quote: newQuotes[idx] || node.quote,
      }))
    );
    setPulseKey((k) => k + 1);

    setTimeout(() => {
      setIsShuffling(false);
    }, 450);
  }, [nodes]);

  // Pointer drag interaction handlers with pointer capture
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: string
  ) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    dragStartPos.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
    setActiveDragId(id);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer capture isn't supported on device
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDragId || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    if (container.width === 0 || container.height === 0) return;

    const deltaX =
      ((e.clientX - dragStartPos.current.clientX) / container.width) * 100;
    const deltaY =
      ((e.clientY - dragStartPos.current.clientY) / container.height) * 100;

    const newX = Math.max(1, Math.min(76, dragStartPos.current.nodeX + deltaX));
    const newY = Math.max(2, Math.min(76, dragStartPos.current.nodeY + deltaY));

    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeDragId ? { ...n, x: newX, y: newY } : n
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if pointer capture wasn't held
      }
      setActiveDragId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-[85vh] max-h-[850px] min-h-[580px] rounded-xl border border-muted/25 bg-[#05070D]/90 backdrop-blur-xl overflow-hidden select-none shadow-2xl touch-none"
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
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-40 pointer-events-none">
        <div className="flex items-center gap-3 bg-black/70 border border-muted/30 px-3.5 py-1.5 rounded-md backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-foreground font-semibold">
            NODE GRAPH PRO // SYNAPSE GRAPH
          </span>
          <span className="text-muted/60 text-xs">{"//"}</span>
          <span className="text-xs font-mono text-silver">v2.4 ACTIVE</span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={shuffleQuotes}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-background/80 hover:bg-foreground hover:text-background border border-muted/30 text-xs font-mono tracking-wider text-silver transition-all duration-200 group shadow-sm active:scale-95 cursor-pointer"
            title="Randomize connected quotes"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                isShuffling ? "animate-spin text-accent" : "group-hover:rotate-180"
              }`}
            />
            <span>{isShuffling ? "SHUFFLING..." : "SHUFFLE QUOTES"}</span>
          </button>
        </div>
      </div>

      {/* SVG Connecting Synapse Strings (Pixel-exact coordinate space) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
      >
        <defs>
          <filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {connections.map((conn) => (
          <g key={conn.id}>
            {/* Outer soft ambient glow path */}
            <path
              d={conn.pathData}
              fill="none"
              stroke={conn.color}
              strokeWidth="6"
              strokeOpacity="0.18"
              strokeLinecap="round"
            />

            {/* Main crisp connection wire */}
            <path
              d={conn.pathData}
              fill="none"
              stroke={conn.color}
              strokeWidth="2.2"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />

            {/* Primary glowing signal pulse traveling along path */}
            <circle r="4" fill="#FFFFFF" filter="url(#glow-blur)">
              <animateMotion
                key={`pulse-${pulseKey}-${conn.id}`}
                path={conn.pathData}
                dur="2.8s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>

            {/* Secondary colored pulse trailing */}
            <circle r="2.5" fill={conn.color}>
              <animateMotion
                key={`pulse2-${pulseKey}-${conn.id}`}
                path={conn.pathData}
                dur="2.8s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* Draggable Workflow Quote Node Cards */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {nodes.map((node) => {
          const isDragging = activeDragId === node.id;
          const hasIncoming = node.nodeType !== "input";
          const hasOutgoing = node.nodeType !== "synthesis";

          return (
            <div
              key={node.id}
              ref={(el) => {
                if (el) {
                  nodeRefs.current.set(node.id, el);
                } else {
                  nodeRefs.current.delete(node.id);
                }
              }}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: "min(300px, 28vw)",
                minWidth: "220px",
              }}
              className={`pointer-events-auto absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
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
                {/* Left Connector Pin (Input Port Socket) */}
                {hasIncoming && (
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#05070D] flex items-center justify-center pointer-events-none z-10 transition-transform duration-200 group-hover:scale-110 shadow-sm"
                    style={{ borderColor: node.color }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                  </div>
                )}

                {/* Right Connector Pin (Output Port Socket) */}
                {hasOutgoing && (
                  <div
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#05070D] flex items-center justify-center pointer-events-none z-10 transition-transform duration-200 group-hover:scale-110 shadow-sm"
                    style={{ borderColor: node.color }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                  </div>
                )}

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
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-snug tracking-tight font-sans transition-opacity duration-300">
                    &ldquo;{node.quote.text}&rdquo;
                  </p>

                  {/* Card Footer: Metadata & Source Tag */}
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-silver">
                    <span
                      className="px-2 py-0.5 rounded border border-muted/30 bg-muted/10 font-semibold tracking-wider transition-colors duration-300"
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
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent/80" />
            <span>[TOPOLOGY: 5 NODES // 5 ACTIVE SYNAPSES]</span>
          </span>
          <span>{"[DYNAMIC PER-LOAD RE-SEEDING]"}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteNodeGraph;

