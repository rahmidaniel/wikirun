export interface GraphNode {
    title: string;
    depth: number;
}

export interface GraphLink {
    source: GraphNode;
    target: GraphNode;
}

export type Graph = {
    nodes: GraphNode[];
    links: GraphLink[];
};