import React, {useState} from "react";
import axios from "axios";
import {Article} from "../../utils/ArticleContext";
import ArticleCombobox from "../Sidebar/ArticleCombobox";
import GraphViewer from "./GraphViewer";
import {Graph, GraphNode} from "../../utils/GraphTypes";

interface Link {
    ns: number // namespace
    title: string
}

type Page = {
    pageid: number
    links: Link[]
} & Link;

type RePage = {
    pageid: number
    linkshere: Link[]
} & Link;

type QueryResult = {
    continue?: {
        plcontinue: string,
        continue: string
    }
    query: {
        pages: Page[]
    }
}

type ReQueryResult = {
    continue?: {
        lhcontinue: string,
        continue: string
    }
    query: {
        pages: RePage[]
    }
}

export const requestLinks = async (pageName: string): Promise<string[]> => {
    let matches: string[] = [];
    let moreLinks = true;

    let continueValue: string | null = null;

    while(moreLinks){
        await axios.get('https://en.wikipedia.org/w/api.php?', {
            params: {
                action: "query",
                prop: "links",
                format: "json",
                formatversion: "2",
                origin: "*",
                titles: decodeURIComponent(pageName),
                pllimit: "10",
                plnamespace: "0",
                //...(continueValue ? {plcontinue: continueValue} : {}) // continue call if needed
            }
        }).then((response) => {
            const queryResult = (response.data as QueryResult);
            //console.log(queryResult)

            matches.push(...queryResult.query.pages[0].links.map(page=>page.title));

            moreLinks = false; // LIMITER ADDED
            if(queryResult.continue !== undefined){
                continueValue = queryResult.continue.plcontinue;
            }
            else {
                moreLinks = false;
            }

        }).catch((error) => {
            if(!axios.isCancel(error)) console.log(`Error in query: ${pageName}`, error);
            moreLinks = false;
        });
    }

    return matches;
}
export const requestReverseLinks = async (pageName: string): Promise<string[]> => {
    let matches: string[] = [];
    let moreLinks = true;

    let continueValue: string | null = null;

    while(moreLinks){
        await axios.get('https://en.wikipedia.org/w/api.php?', {
            params: {
                action: "query",
                prop: "linkshere",
                format: "json",
                formatversion: "2",
                origin: "*",
                titles: decodeURIComponent(pageName),
                lhlimit: "max",
                lhnamespace: "0",
                ...(continueValue ? {lhcontinue: continueValue} : {}) // continue call if needed
            }
        }).then((response) => {
            const queryResult = (response.data as ReQueryResult);

            matches.push(...queryResult.query.pages[0].linkshere.map(page=>page.title));

            if(queryResult.continue !== undefined){
                continueValue = queryResult.continue.lhcontinue;
            }
            else {
                moreLinks = false;
            }

        }).catch((error) => {
            if(!axios.isCancel(error)) console.log(`Error in query: ${pageName}`, error);
        });
    }

    return matches;
}

type SearchAlgorithm = {
    startNode: string,
    endNode: string,
    loadEdges(title: string): Promise<string[]>
    run(): Promise<string[] | null>
}

const bfs_run = async function(this: SearchAlgorithm) {
    const {startNode, endNode, loadEdges} = this;

    // Keep track of the nodes visited during the search
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
        await loadEdges(current).then(links => {
                // Enqueue the neighboring nodes to explore
                for (const neighbor of links) {
                    // Only add the neighbor if we haven't visited it yet
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor); // NEWLINE
                        queue.push([...path, neighbor]);
                    }
                }
            }
        );
    }

    // Return null if we couldn't find a path
    return null;
}

const bi_bfs_run = async function(this: SearchAlgorithm){
    const {startNode, endNode, loadEdges} = this;
    const startGraphNode: GraphNode = {title: startNode, depth: 0};
    const endGraphNode: GraphNode = {title: endNode, depth: 0};

    const graph: Graph = { nodes: [], links: [] };

    // Create a set to keep track of visited nodes from the start node
    const startVisited = new Set<string>();
    // Create a queue to keep track of the current path from the start node
    const startQueue: [GraphNode, GraphNode[]][] = [[startGraphNode, [startGraphNode]]];

    // Create a set to keep track of visited nodes from the end node
    const endVisited = new Set<string>();
    // Create a queue to keep track of the current path from the end node
    const endQueue: [GraphNode, GraphNode[]][] = [[endGraphNode, [endGraphNode]]];

    // Create an object to keep track of nodes visited from both ends
    const visited: {[title: string]: [GraphNode[], GraphNode[]]} = {[startNode]: [[startGraphNode], []], [endNode]: [[], [endGraphNode]]};

    // Loop until there are no more nodes to explore
    while (startQueue.length > 0 || endQueue.length > 0) {
        // Explore from the start node
        if (startQueue.length > 0) {
            const [current, path] = startQueue.shift()!;
            const depth = current.depth;
            // If we reach the end node, return the path
            if (current.title === endNode || endVisited.has(current.title)) {
                return [...path, ...visited[current.title][1].reverse().slice(1)];
            }
            // Otherwise, mark the node as visited and explore its neighbors
            if (!startVisited.has(current.title)) {
                startVisited.add(current.title);
                const neighbors = await requestLinks(current.title);
                for (const neighbor of neighbors) {
                    if (!startVisited.has(neighbor)) {
                        startVisited.add(neighbor);
                        startQueue.push([{title: neighbor, depth: depth}, [...path, neighbor]]);
                        visited[neighbor] = [[...path, neighbor], visited[neighbor]?.[1] || []];
                    }
                }
            }
        }

        // Explore from the end node
        if (endQueue.length > 0) {
            const [current, path] = endQueue.shift()!;
            // If we reach the start node, return the path
            if (current === startNode || startVisited.has(current)) {
                return [...visited[current][0].slice(0, -1).reverse(), ...path];
            }
            // Otherwise, mark the node as visited and explore its neighbors
            if (!endVisited.has(current)) {
                endVisited.add(current);
                const neighbors = await requestReverseLinks(current);
                for (const neighbor of neighbors) {
                    if (!endVisited.has(neighbor)) {
                        endQueue.push([neighbor, [...path, neighbor]]);
                        visited[neighbor] = [visited[neighbor]?.[0] || [], [...path, neighbor]];

                    }
                }
            }
        }
    }

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
        const links = await requestLinks(currentNode.title);

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

    // // Add target node if not already in the graph
    // if (!visited.has(targetTitle)) {
    //     graph.nodes.push({title: targetTitle});
    // }
}

const bfs: SearchAlgorithm = {
    startNode: "Paper",
    endNode: "Flax",
    loadEdges: requestLinks,
    run: bi_bfs_run
}

const Algo = () => {
    const [matches, setMatches] = useState<string[]>([]);

    const [stopSignal, setStopSignal] = useState(true);

    const [g, setG] = useState<Graph>({links: [], nodes: []})
    const handleSelect = (selected: Article) => {
        requestLinks(selected.title).then((result)=> setMatches(result));

        // bfs.run().then(result=> console.log(result));
    }

    buildGraph("Flax", "Egypt", 2, stopSignal, setG).then(console.log);

    return(
        <div className="flex flex-col justify-evenly w-full">
            <div className="mx-auto">
                <ArticleCombobox label={"Links"} onSelect={handleSelect}/>
                <button className="btn btn-error" onClick={()=>setStopSignal(true)}>STOP</button>
                <button className="btn btn-success" onClick={()=>setStopSignal(false)}>GO</button>
            </div>
            <div className="h-4/5 w-11/12 mx-auto border-black border-2" >
                <GraphViewer  graph={g}/>
            </div>
        </div>
    )
}

export default Algo;