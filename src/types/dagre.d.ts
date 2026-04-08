declare module 'dagre' {
  export namespace graphlib {
    class Graph {
      constructor(opt?: { directed?: boolean; multigraph?: boolean; compound?: boolean });
      setGraph(label: any): Graph;
      setDefaultEdgeLabel(callback: () => any): Graph;
      setNode(id: string, label: any): Graph;
      setEdge(source: string, target: string, label?: any): Graph;
      node(id: string): { x: number; y: number; width: number; height: number; [key: string]: any };
      edge(source: string, target: string): any;
      nodes(): string[];
      edges(): { v: string; w: string }[];
    }
  }
  export function layout(graph: graphlib.Graph): void;
  const dagre: {
    graphlib: typeof graphlib;
    layout: typeof layout;
  };
  export default dagre;
}
