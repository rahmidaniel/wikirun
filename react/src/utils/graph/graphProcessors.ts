import Graph from "graphology";
import {Attributes} from "graphology-types";
import {fetchLinks} from "../../api/links/fetchLinks";
import chroma from "chroma-js";
import {calculateChildNodeSize} from "./graphDefaults";
import {calculateEdgeColor, getColorLinear} from "./colorHelpers";

/**
 * Creates child nodes and edges for the given parent node in graph. Uses circular node placement.
 * @param links - List of keys to add as nodes.
 * @param graph - Target graph.
 * @param nodeKey - Key of the parent node.
 * @param inheritedAttributes - Attributes of parent node for, children will inherit parts.
 * @param groupColor - *optional* - string color for node children.
 */
function updateGraph(links: string[], graph: Graph<Attributes, Attributes, Attributes>, nodeKey: string, inheritedAttributes: Attributes, groupColor?: string) {
    // Assign new color for node group
    if(groupColor === undefined) groupColor = getColorLinear(inheritedAttributes.color, chroma.random().hex("rgba"));

    // Calculate the angle between each child node

    // Define the radius of the circle based on the number of links
    // const radius = baseSize * Math.log2(links.length);
    const childRadius = calculateChildNodeSize(inheritedAttributes.size);

    const angle = (2 * Math.PI) / links.length;
    const radius = childRadius / Math.sin(angle);

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const childX = inheritedAttributes.x + (radius + childRadius) * Math.cos(i * angle);
        const childY = inheritedAttributes.y + (radius + childRadius) * Math.sin(i * angle);

        // Adding the node
        if (!graph.hasNode(link)) {
            graph.addNode(link, {
                reverse: inheritedAttributes.reverse,
                depth: inheritedAttributes.depth + 1, // Increment depth
                size: calculateChildNodeSize(inheritedAttributes.size),
                label: link,
                color: groupColor,
                x: childX, y: childY
            });
        }

        // Adding the edge
        if (!graph.hasEdge(nodeKey, link)) {
            graph.addEdge(nodeKey, link, {
                color: calculateEdgeColor(inheritedAttributes.color, groupColor),
                type: 'arrow'
            });
        }
    }
}

export async function loadNeighbors(nodeKey: string, graph: Graph<Attributes, Attributes, Attributes>) {
    // Only run if neighbors were not loaded (Attributes -> loaded: boolean)
    if (graph.getNodeAttribute(nodeKey, 'loaded')) return;

    // Copy parent node attributes for inheritance
    // To avoid parent attribute modifications
    const inheritedAttributes: Attributes = {...graph.getNodeAttributes(nodeKey)};

    // Mark node as loaded
    graph.setNodeAttribute(nodeKey, 'loaded', true);

    // Add loading label and make it semi transparent
    graph.setNodeAttribute(nodeKey, 'label', nodeKey + " [LOADING...]");
    graph.updateNodeAttribute(nodeKey, 'color', (color)=> chroma(color).alpha(0.4).hex("rgba"));

    // Processes links in batches as they arrive from fetch. Same color for the whole fetch.
    const groupColor = getColorLinear(inheritedAttributes.color, chroma.random().hex("rgba"));
    const handleBatch = (linkBatch: string[]) => {
        updateGraph(linkBatch, graph, nodeKey, inheritedAttributes, groupColor);
    }

    // Wait for neighbors to load
    // Should reverse if its from the target
    // Return value is ignored because of batch processing
    await fetchLinks(nodeKey, inheritedAttributes.reverse, handleBatch);

    // graph.setNodeAttribute(nodeKey, 'loaded', true);

    // Turn it back from loading state
    graph.setNodeAttribute(nodeKey, 'label', nodeKey);
    graph.updateNodeAttribute(nodeKey, 'color', (color)=> chroma(color).alpha(1).hex("rgba"));
}