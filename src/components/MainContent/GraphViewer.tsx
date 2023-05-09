import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import {Graph, GraphLink, GraphNode} from "../../utils/GraphTypes";

cytoscape.use(dagre);

const defaults = {
    name: 'dagre',
    rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
    ranker: 'tight-tree', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
    fit: true, // whether to fit to viewport
};

interface CytoscapeGraphProps {
    graph: Graph;
    layoutOptions?: cytoscape.LayoutOptions;
    style?: React.CSSProperties;
}

const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({ graph, layoutOptions, style }) => {
    const cyRef = useRef<cytoscape.Core | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cyRef.current) return;

        const cy = cyRef.current;

        cy.elements().remove();

        const nodes: cytoscape.ElementDefinition[] = graph.nodes.map((node: GraphNode) => ({data: {id: node.title},}));

        cy.add(nodes);

        const edges: cytoscape.ElementDefinition[] = graph.links.map((link: GraphLink) => ({
            data: {
                id: `${link.source.title}-${link.target.title}`,
                source: link.source.title,
                target: link.target.title
            },
        }));

        cy.add(edges);

        cy.layout(defaults).run();
    }, [graph, layoutOptions]);

    useEffect(() => {
        cyRef.current = cytoscape({
            container: containerRef.current!,
            boxSelectionEnabled: false,
            wheelSensitivity: 0.1,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        label: 'data(id)',
                        'font-size': '10px',
                        width: 'mapData(size, 1, 100, 10, 40)',
                        height: 'mapData(size, 1, 100, 10, 40)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'line-color': '#d06363',
                        'target-arrow-color': '#940606',
                        width: 0.5,
                    },
                },
            ],
        });

        return () => { cyRef.current?.destroy() };
    }, []);

    return <div ref={containerRef} className="w-full h-full"/>;
};

export default CytoscapeGraph;
