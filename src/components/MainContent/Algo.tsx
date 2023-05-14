import React, {useState} from "react";
import ArticleCombobox from "../Sidebar/ArticleCombobox";
import GraphViewer from "./GraphViewer";
import {Graph, GraphNode} from "../../Types/GraphTypes";
import {Article} from "../../Types/Article";
import {fetchLinks} from "../../api/links/fetchLinks";

type SearchAlgorithm = {
    startNode: string,
    endNode: string,
    loadEdges(title: string): Promise<string[]>
    run(): Promise<string[] | null>
}

const bfs_run = async function(this: SearchAlgorithm) {
    const {startNode, endNode, loadEdges} = this;

    // Keep track of the nodes visited during the searchHook
    const visited = new Set<string>();

    // Create a queue to store the nodes to be explored
    const queue: string[][] = [[startNode]];

    // Search until the queue is empty or goal is found
    while (queue.length > 0) {
        // Dequeue the next node to explore
        const path = queue.shift()!;
        console.log(path);
        const current = path[path.length - 1];
        console.log(current)
        // Check if we have found the goal
        if (current === endNode) return path;

        // Skip this node if we have already visited it
        if (visited.has(current)) continue;

        // Mark the current node as visited
        visited.add(current);

        // Get the links from the current article
        const links = await loadEdges(current);
        // Enqueue the neighboring nodes to explore
        for (const neighbor of links) {
            // Only add the neighbor if we haven't visited it yet
            if (!visited.has(neighbor)) {
                visited.add(neighbor); // NEWLINE
                queue.push([...path, neighbor]);
            }
        }
    }

    // Return null if we couldn't find a path
    return null;
}

const bi_bfs_run = async function(startTitle: string, targetTitle: string, maxDepth: number, stopSignal: boolean, updateGraph: (value: (((prevState: Graph) => Graph) | Graph)) => void){
    const startGraphNode: GraphNode = {title: startTitle, depth: 0};
    const endGraphNode: GraphNode = {title: targetTitle, depth: 0};

    const graph: Graph = { nodes: [], links: [] };

    // Create a set to keep track of visited nodes from the start node
    const startVisited = new Set<string>();
    // Create a queue to keep track of the current path from the start node
    const startQueue: [GraphNode, GraphNode[]][] = [[startGraphNode, [startGraphNode]]];
    let startDepth = 0;

    // Create a set to keep track of visited nodes from the end node
    const endVisited = new Set<string>();
    // Create a queue to keep track of the current path from the end node
    const endQueue: [GraphNode, GraphNode[]][] = [[endGraphNode, [endGraphNode]]];
    let endDepth = 0;

    // Create an object to keep track of nodes visited from both ends
    const visited: {[title: string]: [GraphNode[], GraphNode[]]} = {[startTitle]: [[startGraphNode], []], [targetTitle]: [[], [endGraphNode]]};

    const interval = setInterval(() => updateGraph(graph), 2000);

    // Loop until there are no more nodes to explore
    while ((startQueue.length > 0 || endQueue.length > 0) && !stopSignal && (endDepth <= maxDepth && startDepth <= maxDepth)) {
        // Explore from the start node
        if (startQueue.length > 0 && startQueue.length <= endQueue.length) {
            const [current, path] = startQueue.shift()!;
            const depth = current.depth;
            graph.nodes.push(current);

            if (depth >= maxDepth) continue;

            // If we reach the end node, return the path
            if (current.title === targetTitle || endVisited.has(current.title)) {
                //return [...path, ...visited[current.title][1].reverse().slice(1)];
                break;
            }
            // Otherwise, mark the node as visited and explore its neighbors
            if (!startVisited.has(current.title)) {
                startVisited.add(current.title);
                const neighbors = await fetchLinks(current.title);
                for (const neighbor of neighbors) {
                    if (!startVisited.has(neighbor)) {
                        startVisited.add(neighbor);
                        const newNode = {title: neighbor, depth: depth + 1};
                        startQueue.push([newNode, [...path, newNode]]);
                        visited[neighbor] = [[...path, newNode], visited[neighbor]?.[1] || []];
                        graph.nodes.push(newNode);
                        graph.links.push({ source: current, target: newNode });
                    }
                }
            }
        } else if(endQueue.length > 0) {
            const [current, path] = endQueue.shift()!;
            const depth = current.depth;
            graph.nodes.push(current);

            if (depth >= maxDepth) continue;

            // If we reach the start node, return the path
            if (current.title === startTitle || startVisited.has(current.title)) {
                //return [...visited[current.title][0].slice(0, -1).reverse(), ...path];
                //return [];
                break;
            }
            // Otherwise, mark the node as visited and explore its neighbors
            if (!endVisited.has(current.title)) {
                endVisited.add(current.title);
                const neighbors = await fetchLinks(current.title, true);
                for (const neighbor of neighbors) {
                    if (!endVisited.has(neighbor)) {
                        const newNode = {title: neighbor, depth: depth + 1};
                        endQueue.push([newNode, [...path, newNode]]);
                        visited[neighbor] = [visited[neighbor]?.[0] || [], [...path, newNode]];
                        graph.nodes.push(newNode);
                        graph.links.push({ source: current, target: newNode });
                    }
                }
            }
        }
    }

    // Quiting graph re-rendering
    clearInterval(interval);

    // If we didn't find a path, return null
    return null;
}

async function buildGraph(startTitle: string, targetTitle: string, maxDepth: number, stopSignal: boolean, updateGraph: (value: (((prevState: Graph) => Graph) | Graph)) => void) {
    const graph: Graph = { nodes: [], links: [] };

    const visited = new Set<string>();
    const queue: GraphNode[] = [{title: startTitle, depth: 0}];

    while (queue.length > 0 && !stopSignal) {
        const currentNode = queue.shift()!;
        const depth = currentNode.depth;

        visited.add(currentNode.title);
        graph.nodes.push(currentNode);

        // Don't explore deeper
        if (depth >= maxDepth) continue;

        // Request links from current node
        const links = await fetchLinks(currentNode.title);

        // Add unvisited links to the queue
        for (const link of links) {
            if(stopSignal) return; // Extra break

            if (!visited.has(link)) {
                visited.add(link);
                const newNode: GraphNode = {title: link, depth: depth+1};
                queue.push(newNode);
                graph.nodes.push(newNode);
                graph.links.push({ source: currentNode, target: newNode });
            }
        }
        updateGraph(graph);
    }
}

const Algo = () => {
    const [matches, setMatches] = useState<string[]>([]);

    const [stopSignal, setStopSignal] = useState(true);

    const [graph, setGraph] = useState<Graph>({links: [], nodes: []})
    const handleSelect = (selected: Article) => {
        fetchLinks(selected.title).then((result)=> setMatches(result));
    }
    bi_bfs_run("Flax", "Egypt", 2, stopSignal, setGraph);

    return(
        <div className="flex flex-col justify-evenly w-full">
            <div className="mx-auto">
                <ArticleCombobox label={"Links"} onSelect={handleSelect}/>
                <button className="btn btn-error" onClick={()=>setStopSignal(true)}>STOP</button>
                <button className="btn btn-success" onClick={()=>setStopSignal(false)}>GO</button>
            </div>
            <div className="h-4/5 w-11/12 mx-auto border-black border-2" >
                <GraphViewer  graph={graph}/>
            </div>
        </div>
    )
}

export default Algo;