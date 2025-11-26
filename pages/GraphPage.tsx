import React, { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DataContext } from '../App';
import { generateGraphData } from '../services/dataService';
import { GraphNode, GraphLink } from '../types';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export const GraphPage: React.FC = () => {
  const { records } = useContext(DataContext);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(600, window.innerHeight - 180)
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || records.length === 0) return;

    const { nodes, links } = generateGraphData(records);
    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Defs for patterns (images)
    const defs = svg.append("defs");
    nodes.forEach(node => {
        if (node.img && node.group === 'site') {
            defs.append("pattern")
                .attr("id", `img-${node.id.replace(/\s+/g, '')}`)
                .attr("height", 1)
                .attr("width", 1)
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                .attr("height", 1)
                .attr("width", 1)
                .attr("preserveAspectRatio", "xMidYMid slice")
                .attr("href", node.img);
        }
    });

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    // Color Logic
    const getColor = (group: string) => {
        switch(group) {
            case 'site': return '#b91c1c'; // Red-700
            case 'event': return '#d97706'; // Amber-600
            case 'location': return '#059669'; // Emerald-600
            case 'person': return '#4b5563'; // Gray-600
            default: return '#999';
        }
    };

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Links
    const link = g.append("g")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value) * 1.5);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any
      )
      .on("click", (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      });

    // Node Circles
    node.append("circle")
      .attr("r", (d) => {
          if (d.group === 'site') return 25;
          if (d.group === 'event') return 18;
          return 12;
      })
      .attr("fill", (d) => {
           if (d.group === 'site' && d.img) return `url(#img-${d.id.replace(/\s+/g, '')})`;
           return getColor(d.group);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer hover:stroke-red-300 transition-all shadow-md");

    // Labels
    node.append("text")
      .text(d => d.id.length > 8 ? d.id.substring(0, 8) + '...' : d.id)
      .attr("x", (d) => d.group === 'site' ? 30 : 20)
      .attr("y", 5)
      .style("font-size", (d) => d.group === 'site' ? "14px" : "11px")
      .style("font-family", "'Noto Serif SC', serif")
      .style("font-weight", (d) => d.group === 'site' ? "bold" : "normal")
      .style("fill", "#1f2937")
      .style("pointer-events", "none")
      .style("text-shadow", "2px 2px 2px white, -2px -2px 2px white");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    svg.on("click", () => setSelectedNode(null));

    return () => simulation.stop();
  }, [records, dimensions]);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur p-4 rounded-xl border border-stone-200 shadow-sm max-w-sm">
          <h2 className="text-xl font-bold text-red-900 serif flex items-center gap-2">
              <Network size={20} /> 谱系可视化
          </h2>
          <p className="text-xs text-stone-500 mt-1">
              展示沈阳红色文化遗产的空间分布与人物事件关联。
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-700 mr-1.5"></span>核心遗产地</div>
             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 mr-1.5"></span>历史事件</div>
             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5"></span>行政区划</div>
             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gray-600 mr-1.5"></span>关联人物</div>
          </div>
      </div>

      <div className="relative flex-grow bg-stone-100 rounded-xl shadow-inner border border-stone-200 overflow-hidden" ref={containerRef} style={{ height: '75vh' }}>
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          className="w-full h-full"
        />
        
        {/* Info Panel */}
        {selectedNode && (
          <div className="absolute bottom-6 right-6 w-72 bg-white/95 backdrop-blur shadow-2xl rounded-xl border border-stone-200 p-5 animate-fade-in z-20">
            <div className={`h-1 w-full absolute top-0 left-0 rounded-t-xl ${
                selectedNode.group === 'site' ? 'bg-red-700' : 
                selectedNode.group === 'event' ? 'bg-amber-600' : 'bg-stone-500'
            }`}></div>
            
            <h4 className="text-lg font-bold text-stone-900 mb-1">
              {selectedNode.id}
            </h4>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-3 block">
               {selectedNode.group === 'site' ? 'HERITAGE SITE' : selectedNode.group.toUpperCase()}
            </span>
            
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
               {selectedNode.group === 'site' 
                 ? '该节点为已建档的实体文化遗产保护单位。双击查看详细档案。' 
                 : '该节点为关联的历史要素，反映了遗产地之间的隐性联系。'}
            </p>

            <button 
              onClick={() => setSelectedNode(null)}
              className="w-full py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
            >
              关闭面板
            </button>
          </div>
        )}
      </div>
    </div>
  );
};