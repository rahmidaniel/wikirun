import React, {useContext, useEffect, useRef, useState} from "react";
import Sigma from "sigma";
import AbstractGraph from "graphology-types";
import {handleHover} from "../../../utils/graph/handleHover";
import {handleDragNDrop} from "../../../utils/graph/handleDragNDrop";
import {ArticleContext} from "../../../utils/ArticleContext";
import {ForceAtlas2LayoutParameters, ForceAtlas2Settings} from "graphology-layout-forceatlas2";
import {bidirectionalBFS} from "../../../utils/graph/algorithms/bidirectionalBFS";
import {baseColor, baseSize} from "../../../utils/graph/graphDefaults";
import {handleClick} from "../../../utils/graph/handleClick";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import LayoutController from "./LayoutController";

const SigmaViewer = () => {
    const {articleList, graph} = useContext(ArticleContext);

    const containerRef = useRef<HTMLDivElement>(null);
    const [renderer, setRenderer] = useState<Sigma<AbstractGraph> | null>(null);

    const [layout, setLayout] = useState<FA2LayoutSupervisor | null>(null);
    const [fa2Settings, setFa2Settings] = useState<ForceAtlas2Settings>({ adjustSizes: true, outboundAttractionDistribution: true, gravity: 5, slowDown: 10});
    const [simRunning, setSimRunning] = useState(true);

    // useEffect(()=>{
    //
    // },[articleList])
    // TODO: link this to ingame current nodes, mark paths and nodes with special color

    const [algoDone, setAlgoDone] = useState<boolean | null>(null);
    const handleAlgo = async () => {
        setAlgoDone(false);

        const path = await bidirectionalBFS(graph, "Flax", "Vikings");

        if (path) {
            graph.mergeNode(path[0], {
                reverse: false,
                depth: 0,
                loaded: false,
                label: path[0],
                size: baseSize,
                color: baseColor,
                x: 0,
                y: 0
            })
            for (let i = 1; i < path.length; i++) {
                graph.mergeNode(path[i], {
                    reverse: false,
                    depth: i,
                    loaded: false,
                    label: path[i],
                    size: baseSize,
                    color: baseColor,
                    x: 1000 * i,
                    y: 0
                })
                graph.mergeEdge(path[i - 1], path[i], {color: baseColor, size: 5, type: "arrow"})
            }
        }

        setAlgoDone(true);
    }

    // Sigma and layout creation
    useEffect(() => {
        let rendererInstance: Sigma | null = null;
        let layoutInstance: FA2LayoutSupervisor | null = null;

        if (containerRef.current !== null && graph.order != 0) {

            // Create new instances to handle graph rendering
            layoutInstance = new FA2LayoutSupervisor(graph, {settings: fa2Settings});
            rendererInstance = new Sigma(graph, containerRef.current, { allowInvalidContainer: true });

            layoutInstance.start();
            if(!simRunning) layoutInstance.stop();

            // If there was a renderer before, update the new instance position to the old
            if (renderer) {
                rendererInstance.getCamera().setState(renderer.getCamera().getState());
            }
        }

        setLayout(layoutInstance)
        setRenderer(rendererInstance);

        // Avoiding memory leaks and freeing resources
        return () => {
            rendererInstance?.removeAllListeners();
            layoutInstance?.kill();
            rendererInstance?.kill();
            setLayout(null);
            setRenderer(null);
        };
    }, [containerRef, setRenderer, setLayout, algoDone, fa2Settings]);

    // Simulation Toggle
    useEffect(()=>{
        if(!layout) return;

        if(simRunning && !layout.isRunning()) layout.start();
        else layout.stop();
    }, [simRunning])

    // Interactions
    useEffect(()=>{
        // Only run if neither are null
        if(!renderer || !layout) return;

        //handleHover(renderer, graph);
        handleDragNDrop(renderer, graph, layout);
        handleClick(renderer, graph);

        // renderer.refresh();
    });

    return(
        <div className="flex flex-col justify-evenly w-full">
            <div className="h-4/5 w-11/12 mx-auto border-black border-2" >
                <div ref={containerRef} className="w-full h-full"/>
            </div>
            <div className="form-control w-2/3 mx-auto p-2">
                <button className={`btn btn-primary rounded-btn ${algoDone !== null && !algoDone ? "loading" : "" }`} onClick={handleAlgo}>Run Test Algorithm</button>
                <LayoutController fa2Settings={fa2Settings} onSettingsChange={setFa2Settings} layout={layout} simRunning={simRunning} setSimRunning={setSimRunning}/>
            </div>
        </div>
    )
}

export default SigmaViewer;