import Sigma from "sigma";
import AbstractGraph from "graphology-types";
import Graph from "graphology";
import {EdgeDisplayData, NodeDisplayData} from "sigma/types";
import chroma from "chroma-js";

export const handleHover = (renderer: Sigma<AbstractGraph>, graph: Graph) => {
    interface State {
        hoveredNode?: string;
        // State derived from hovered node:
        hoveredNeighbors?: Set<string>;
    }

    let state: State = {};

    function setHoveredNode(node?: string) {
        if (node) {
            state.hoveredNode = node;
            state.hoveredNeighbors = new Set(graph.neighbors(node));
        } else {
            state.hoveredNode = undefined;
            state.hoveredNeighbors = undefined;
        }

        // Refresh rendering:
        renderer.refresh();
    }


    // Bind graph interactions:
    renderer.on("enterNode", ({node}) => {
        setHoveredNode(node);
    });
    renderer.on("leaveNode", () => {
        setHoveredNode(undefined);
    });

    // Render nodes accordingly to the internal state:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed
    renderer.setSetting("nodeReducer", (node, data) => {
        const res: Partial<NodeDisplayData> = {...data};
        if (state.hoveredNode === undefined) return res;

        if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
            res.label = "";
            res.color = chroma(res.color!).desaturate(0.1).css();
        } else {
            res.zIndex = 10;
        }

        return res;
    });

    // Render edges accordingly to the internal state:
    // 1. If a node is hovered, the edge is hidden if it is not connected to the
    //    node
    // 2. If there is a query, the edge is only visible if it connects two
    //    suggestions
    renderer.setSetting("edgeReducer", (edge, data) => {
        const res: Partial<EdgeDisplayData> = {...data};

        if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
            res.hidden = true;
        }

        return res;
    });
}