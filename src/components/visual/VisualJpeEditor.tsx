"use client";
import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useVisualStore } from "@/stores/useVisualStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { ConditionNode } from "./ConditionNode";
import {
  Share2, Save, Play, Trash2,
  Layout, Zap
} from "lucide-react";
import { T } from "../robust/jpe-theme";
import { JpeButton } from "../jpe-design-system";

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode
};

const VisualJpeEditorContent: React.FC = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    generateJpe, addNode, autoLayout, parseJpeToNodes 
  } = useVisualStore();
  const { updateFile, currentProject: _currentProject } = useProjectStore();
  const { activeTabId, tabs } = useEditorStore();
  const { setViewport, getViewport } = useReactFlow();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeFileId = activeTab?.fileId;

  // Task 3.3: Initial Sync on File Load
  React.useEffect(() => {
    if (activeFileId) {
      const file = _currentProject?.files.find(f => f.id === activeFileId);
      if (file?.content) {
        parseJpeToNodes(file.content);
      }
    }
  }, [activeFileId, _currentProject, parseJpeToNodes]);

  // Task 3.4: Gamepad Navigation
  React.useEffect(() => {
    const initGamepad = async () => {
      const { gamepad } = await import('@/services/input/GamepadService');
      let focusedNodeIndex = -1;

      const handleDpad = (index: number) => {
        if (nodes.length === 0) return;
        
        if (index === 13 || index === 15) { // Down or Right
          focusedNodeIndex = (focusedNodeIndex + 1) % nodes.length;
        } else if (index === 12 || index === 14) { // Up or Left
          focusedNodeIndex = (focusedNodeIndex - 1 + nodes.length) % nodes.length;
        }

        const node = nodes[focusedNodeIndex];
        const { zoom } = getViewport();
        setViewport({ 
          x: -node.position.x * zoom + 400, 
          y: -node.position.y * zoom + 300, 
          zoom 
        }, { duration: 400 });
      };

      const handleAxis = (data: any) => {
        const { value, axisIndex } = data;
        const { x, y, zoom } = getViewport();
        const sensitivity = 20;

        if (axisIndex === 0) setViewport({ x: x - value * sensitivity, y, zoom });
        if (axisIndex === 1) setViewport({ x, y: y - value * sensitivity, zoom });
        if (axisIndex === 3) setViewport({ x, y, zoom: Math.max(0.1, Math.min(2, zoom - value * 0.05)) });
      };

      gamepad.on('axis_move_0', (d: any) => handleAxis({ ...d, axisIndex: 0 }));
      gamepad.on('axis_move_1', (d: any) => handleAxis({ ...d, axisIndex: 1 }));
      gamepad.on('axis_move_3', (d: any) => handleAxis({ ...d, axisIndex: 3 }));
      gamepad.on('button_down_12', () => handleDpad(12));
      gamepad.on('button_down_13', () => handleDpad(13));
      gamepad.on('button_down_14', () => handleDpad(14));
      gamepad.on('button_down_15', () => handleDpad(15));
      
      gamepad.on('button_down_0', () => {
         if (focusedNodeIndex >= 0) {
            const node = nodes[focusedNodeIndex];
            onNodesChange([{ id: node.id, type: 'select', selected: true } as any]);
         }
      });
    };

    initGamepad();
  }, [nodes, getViewport, setViewport, onNodesChange]);

  const handleSync = () => {
    if (!activeFileId) return;
    const code = generateJpe();
    updateFile(activeFileId, { content: code });
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/jpe-node-type') as any;
    if (!type) return;

    addNode(type, { x: event.clientX - 400, y: event.clientY - 200 }, {
      label: type === 'trigger' ? 'New Event' : 'New Action',
      subType: type === 'trigger' ? 'sims.spawn' : undefined,
      value: type === 'action' ? 'sim.energy = 100' : undefined
    });
  };

  return (
    <div className="flex flex-col h-full bg-bgDeep text-textPrimary overflow-hidden font-sans border border-border/50 rounded-xl m-4 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_#030712_100%)]" />
      
      <header className="h-14 border-b border-border bg-bgSurface/80 backdrop-blur-xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
            <Share2 className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase italic">Spectral Logic Graph</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] text-emerald font-bold tracking-tighter uppercase">Industrial Flow Sync Enabled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <JpeButton variant="primary" size="sm" icon={Save} onClick={handleSync} className="px-4">
              Push Code to Editor
           </JpeButton>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-64 border-r border-border bg-bgSurface/40 backdrop-blur-md p-4 flex flex-col gap-6">
           <section className="space-y-4">
             <h3 className="text-[9px] font-bold text-textTertiary tracking-widest flex items-center gap-2 uppercase">
                <Layout className="w-3 h-3" /> Node Library
             </h3>
             <div className="grid grid-cols-1 gap-3">
                <DraggableNode type="trigger" label="Trigger Block" icon={Zap} color={T.amber} desc="Event entry points" />
                <DraggableNode type="condition" label="Branch Block" icon={Layout} color={T.violetBright} desc="IF/ELSE conditions" />
                <DraggableNode type="action" label="Action Block" icon={Play} color={T.cyan} desc="Assignments & Logs" />
             </div>
           </section>
        </aside>

        <main className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: T.cyan, strokeWidth: 2, filter: 'url(#glow-edge)', opacity: 0.8 },
              animated: true
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={T.border} />
            <Controls className="!bg-bgSurface !border-border !fill-white" />
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <filter id="glow-edge">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
            </svg>
            <Panel position="top-right">
               <div className="flex flex-col gap-2 p-1.5 rounded-lg bg-bgSurface/80 border border-borderSubtle backdrop-blur-md shadow-xl">
                  <JpeButton variant="ghost" size="xs" icon={Layout} title="Auto-Layout (Dagre)" onClick={() => autoLayout('TB')} />
                  <JpeButton variant="danger" size="xs" icon={Trash2} title="Delete Selection" />
               </div>
            </Panel>
          </ReactFlow>
        </main>
      </div>

      <footer className="h-8 border-t border-border bg-bgSurface/80 backdrop-blur-xl flex items-center justify-between px-6 text-[9px] font-mono text-textTertiary">
         <div className="flex items-center gap-4">
            <span className="text-emerald">NODES: {nodes.length}</span>
            <span className="text-cyan">EDGES: {edges.length}</span>
         </div>
      </footer>
    </div>
  );
};

export const VisualJpeEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <VisualJpeEditorContent />
    </ReactFlowProvider>
  );
};

const DraggableNode: React.FC<{ type: string, label: string, icon: any, color: string, desc: string }> = ({ type, label, icon: Icon, color, desc }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/jpe-node-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div draggable onDragStart={onDragStart} className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-black/20 text-left group transition-all hover:border-white/20 hover:bg-white/5 cursor-grab">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30`, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-textPrimary group-hover:text-white transition-colors uppercase tracking-wider">{label}</div>
        <div className="text-[9px] text-textTertiary line-clamp-1">{desc}</div>
      </div>
    </div>
  );
};
