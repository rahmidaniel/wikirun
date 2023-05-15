import {fetchLinks} from "../../../api/links/fetchLinks";
import Graph from "graphology";

// Based on https://github.com/graphology/graphology/blob/master/src/shortest-path/unweighted.js
export const bidirectionalBFS = async (graph: Graph, source: string, target: string)=>{
    const startVisited = new Map<string, string | null>();
    const endVisited = new Map<string, string | null>();

    // Marking start and endpoints with null, to signal end of path
    startVisited.set(source, null);
    endVisited.set(target, null);

    // Fringes
    let startQueue: string[] = [source];
    let endQueue: string[] = [target];
    let tempQueue: string[];

    let found: string | null = null;

    outer: while (startQueue.length && endQueue.length) {
        if (startQueue.length <= endQueue.length) {
            // Grab the current queue
            tempQueue = startQueue;
            // Empty the queue since we are using the tempQueue now
            startQueue = [];

            for (let i = 0; i < tempQueue.length; i++) {
                const parentNode = tempQueue[i];
                const neighbors = await fetchLinks(parentNode);

                for (const neighbor of neighbors) {

                    // if we haven't visited it yet, add it to visited
                    if (!(startVisited.has(neighbor))) {
                        startQueue.push(neighbor);
                        // set its predecessor to the node
                        startVisited.set(neighbor, parentNode)
                    }

                    // if it's in the end visited we return
                    if (endVisited.has(neighbor)) {
                        // Path is found! send the last entry
                        found = neighbor;
                        break outer;
                    }
                }
            }
        } else {
            tempQueue = endQueue;
            endQueue = [];

            for (let i = 0; i < tempQueue.length; i++) {
                const parentNode = tempQueue[i];
                const neighbors = await fetchLinks(parentNode, true);

                for (const neighbor of neighbors) {
                    // if we haven't visited it yet, add it to visited
                    if (!(endVisited.has(neighbor))) {
                        endQueue.push(neighbor);
                        endVisited.set(neighbor, parentNode);
                    }

                    // if it's in the end visited we return
                    if (startVisited.has(neighbor)) {
                        // Path is found! send the last entry
                        found = neighbor;
                        break outer;
                    }
                }
            }
        }
    }

    // In case the loop ends (highly unlikely, its wikipedia)
    if (!found) return null;

    let path: string[] = [];

    // Rebuilding the path, starting from the last found entry
    let pathIterator: string | null = found;

    // Build the start of the path
    while (pathIterator) {
        path.unshift(pathIterator);
        pathIterator = startVisited.get(pathIterator)  as string | null;
    }

    // Get the last element of the end visited as a starting point
    pathIterator = endVisited.get(path[path.length - 1])!;

    // Build the end of the path
    while (pathIterator) {
        path.push(pathIterator);
        pathIterator = startVisited.get(pathIterator)  as string | null;
    }

    return path.length ? path : null;
}