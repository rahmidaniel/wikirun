import Sigma from "sigma";
import AbstractGraph from "graphology-types";
import Graph from "graphology";
import {loadNeighbors} from "./graphProcessors";

export const handleClick = (renderer: Sigma<AbstractGraph>, graph: Graph) => {
    // TODO: switched to add listener, might need to do this with others
    renderer.addListener("doubleClickNode", (e) => {
        loadNeighbors(e.node, graph);
    });
}