"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

interface KnowledgeGraphProps {
  data: {
    nodes: Array<{
      id: string;
      label: string;
      roadmap_id: number;
      roadmap_title: string;
      module_index: number;
      evidence_level: number; // 0-3
      evidence_label: string; // Mapped | Explored | Practiced | Demonstrated
      topics: string[];
      topic_count: number;
      topics_completed: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string; // sequential | cross_roadmap
      label: string;
    }>;
    stats: {
      total_concepts: number;
      demonstrated: number;
      explored: number;
      cross_connections: number;
    };
  };
  username: string;
}

const EVIDENCE_COLORS = {
  0: '#6b7280', // Mapped - gray
  1: '#3b82f6', // Explored - blue
  2: '#f59e0b', // Practiced - amber
  3: '#0f766e', // Demonstrated - teal
};

const EVIDENCE_SIZES = {
  0: 4, // Mapped
  1: 6, // Explored
  2: 8, // Practiced
  3: 14, // Demonstrated
};

export default function KnowledgeGraph({ data, username }: KnowledgeGraphProps) {
  const [hoverNode, setHoverNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 600
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-text-heading">Knowledge Graph</h2>
          <p className="text-sm text-text-muted">Concepts explored across all learning paths</p>
        </div>
        <div className="flex items-center justify-center h-64 bg-sidebar/30 border border-border rounded-lg">
          <p className="text-text-muted">No learning activity yet</p>
        </div>
      </div>
    );
  }

  const { stats, nodes, edges } = data;

  // Assign a distinct muted color per roadmap
  const CLUSTER_COLORS = [
    'rgba(99,102,241,0.55)',   // indigo
    'rgba(16,185,129,0.55)',   // emerald
    'rgba(245,158,11,0.55)',   // amber
    'rgba(236,72,153,0.55)',   // pink
    'rgba(59,130,246,0.55)',   // blue
    'rgba(168,85,247,0.55)',   // purple
    'rgba(239,68,68,0.55)',    // red
    'rgba(20,184,166,0.55)',   // teal
  ];

  // Build roadmap id -> index map for stable color assignment
  const roadmapIds = Array.from(new Set(nodes.map((n: any) => n.roadmap_id)));
  const roadmapColorMap: Record<number, string> = {};
  roadmapIds.forEach((rid: any, i: number) => {
    roadmapColorMap[rid] = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
  });

  // Draw cluster labels at centroid of each roadmap group
  const drawClusters = (ctx: CanvasRenderingContext2D) => {
    const groups: Record<number, { nodes: any[]; title: string }> = {};
    nodes.forEach((n: any) => {
      if (n.x === undefined || n.y === undefined) return;
      if (!groups[n.roadmap_id]) groups[n.roadmap_id] = { nodes: [], title: n.roadmap_title };
      groups[n.roadmap_id].nodes.push(n);
    });

    Object.entries(groups).forEach(([rid, group]) => {
      if (group.nodes.length === 0) return;
      const cx = group.nodes.reduce((s: number, n: any) => s + n.x, 0) / group.nodes.length;
      const cy = group.nodes.reduce((s: number, n: any) => s + n.y, 0) / group.nodes.length;

      const color = roadmapColorMap[Number(rid)] || CLUSTER_COLORS[0];
      const label = group.title.length > 30 ? group.title.slice(0, 28) + '…' : group.title;
      const fontSize = 13;

      ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const padding = 8;
      const bw = textWidth + padding * 2;
      const bh = fontSize + padding;

      // Background pill
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 6);
      ctx.fillStyle = color.replace('0.55', '0.12');
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label text
      ctx.fillStyle = color.replace('0.55', '0.95');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
    });
  };

  // Render node on canvas
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = EVIDENCE_SIZES[node.evidence_level as keyof typeof EVIDENCE_SIZES] || 4;
    const color = EVIDENCE_COLORS[node.evidence_level as keyof typeof EVIDENCE_COLORS] || '#6b7280';
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
  };

  // Render edge on canvas
  const drawEdge = (edge: any, ctx: CanvasRenderingContext2D) => {
    const start = edge.source;
    const end = edge.target;
    
    if (!start || !end || start.x === undefined || end.x === undefined) return;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    if (edge.type === 'cross_roadmap') {
      ctx.strokeStyle = 'rgba(15, 118, 110, 0.4)'; // teal with opacity
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
    } else {
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)'; // gray with opacity
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    }
    
    ctx.stroke();
    // Reset line dash for next renders
    ctx.setLineDash([]);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-text-heading">Knowledge Graph</h2>
        <p className="text-sm text-text-muted">Concepts explored across all learning paths</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-text-primary bg-sidebar/30 p-3 border border-border rounded-lg">
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">Total Concepts</span>
          <span className="font-semibold">{stats.total_concepts}</span>
        </div>
        <div className="w-px h-8 bg-border"></div>
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">Demonstrated</span>
          <span className="font-semibold">{stats.demonstrated}</span>
        </div>
        <div className="w-px h-8 bg-border"></div>
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">Explored</span>
          <span className="font-semibold">{stats.explored}</span>
        </div>
        <div className="w-px h-8 bg-border"></div>
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">Cross-Connections</span>
          <span className="font-semibold">{stats.cross_connections}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVIDENCE_COLORS[0] }}></div>
          Mapped
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVIDENCE_COLORS[1] }}></div>
          Explored
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVIDENCE_COLORS[2] }}></div>
          Practiced
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVIDENCE_COLORS[3] }}></div>
          Demonstrated
        </span>
      </div>

      <div className="relative w-full h-[600px] bg-sidebar/30 border border-border rounded-lg overflow-hidden" ref={containerRef}>
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={{ nodes, links: edges }}
          nodeCanvasObject={drawNode}
          linkCanvasObjectMode={() => 'replace'}
          linkCanvasObject={drawEdge}
          onNodeHover={(node) => setHoverNode(node)}
          cooldownTicks={120}
          cooldownTime={3000}
          d3AlphaDecay={0.05}
          d3VelocityDecay={0.5}
          d3AlphaMin={0.01}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          warmupTicks={80}
          onRenderFramePost={drawClusters}
        />
        
        {hoverNode && (
          <div 
            className="absolute z-10 p-3 bg-background border border-border rounded-lg shadow-lg pointer-events-none"
            style={{ 
              top: '10px', 
              right: '10px',
              maxWidth: '250px'
            }}
          >
            <h4 className="font-semibold text-text-heading text-sm mb-1">{hoverNode.label}</h4>
            <p className="text-xs text-text-muted mb-2">{hoverNode.roadmap_title}</p>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="font-medium text-text-primary">{hoverNode.evidence_label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Topics:</span>
                <span className="font-medium text-text-primary">{hoverNode.topics_completed} / {hoverNode.topic_count}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
