import Sigma from "sigma";
import AbstractGraph from "graphology-types";
import Graph from "graphology";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import {loadNeighbors} from "./graphProcessors";

export function handleDragNDrop(renderer: Sigma<AbstractGraph>, graph: Graph, layout: FA2LayoutSupervisor) {
    // State for drag'n'drop
    let draggedNode: string | null = null;
    let isDragging = false;

    let layoutStopped = false;

    // On mouse down on a node
    //  - we enable the drag mode
    //  - save in the dragged node in the state
    //  - highlight the node
    //  - disable the camera so its state is not updated
    renderer.on("downNode", (e) => {
        isDragging = true;
        draggedNode = e.node;
        graph.setNodeAttribute(draggedNode, "highlighted", true);

        // // Stop simulation
        if(layout.isRunning()) {
            layout.stop();
            layoutStopped = true;
        }

    });

    // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
    renderer.getMouseCaptor().on("mousemovebody", (e) => {
        if (!isDragging || !draggedNode) return;

        // Get new position of node
        const pos = renderer.viewportToGraph(e);

        graph.setNodeAttribute(draggedNode, "x", pos.x);
        graph.setNodeAttribute(draggedNode, "y", pos.y);

        // Prevent sigma to move camera:
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
    });

    // On mouse up, we reset the autoscale and the dragging mode
    renderer.getMouseCaptor().on("mouseup", () => {
        if (draggedNode) {
            graph.removeNodeAttribute(draggedNode, "highlighted");
            // loadNeighbors(draggedNode, graph)
        }
        isDragging = false;
        draggedNode = null;

        // Only restart if this function stopped it
        if(layoutStopped && !layout.isRunning()) layout.start();
    });

    // Disable the autoscale at the first down interaction
    renderer.getMouseCaptor().on("mousedown", () => {
        if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
    });
}