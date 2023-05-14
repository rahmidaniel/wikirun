import React, {useContext, useEffect, useRef, useState} from "react";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import Sigma from "sigma";
import AbstractGraph from "graphology-types";
import {handleHover} from "../../utils/graph/handleHover";
import {handleDragNDrop} from "../../utils/graph/handleDragNDrop";
import {ArticleContext} from "../../utils/ArticleContext";
import {ForceAtlas2LayoutParameters} from "graphology-layout-forceatlas2";

const SigmaViewer = () => {
    const {articleList, graph} = useContext(ArticleContext);

    const containerRef = useRef<HTMLDivElement>(null);
    const [sigma, setSigma] = useState<Sigma<AbstractGraph> | null>(null);

    // const [graph] = useState<Graph>(new Graph());
    const [fa2Params, setFa2Params] = useState<ForceAtlas2LayoutParameters>({settings: { adjustSizes: true, outboundAttractionDistribution: true, gravity: 5, slowDown: 10}});
    // TODO: set up state for settings, and a dev panel to edit values, should also
    const [layout, setLayout] = useState<FA2LayoutSupervisor | null>(null)

    // TODO: Add a tool field and hook it up to this
    // useEffect(()=>{
    //
    // },[articleList])
    // TODO: link this to ingame current nodes, mark paths and nodes with special color

    // Sigma and layout
    useEffect(() => {
        let instance: Sigma | null = null;
        let layoutInstance: FA2LayoutSupervisor | null = null;

        if (containerRef.current !== null && graph.order != 0) {

            layoutInstance = new FA2LayoutSupervisor(graph, fa2Params);
            instance = new Sigma(graph, containerRef.current, { allowInvalidContainer: true });

            layoutInstance.start();
            if (sigma) instance.getCamera().setState(sigma.getCamera().getState());
        }

        setLayout(layoutInstance)
        setSigma(instance);

        // Avoiding memory leaks and freeing resources
        return () => {
            instance?.removeAllListeners();
            layout?.kill();
            instance?.kill();
            setLayout(null);
            setSigma(null);
        };
    }, [containerRef, graph, setSigma, setLayout]);

    // Interaction
    useEffect(()=>{
        // Only run if both neither are null
        if(!sigma || !layout) return;

        handleHover(sigma, graph);
        handleDragNDrop(sigma, graph, layout);
    });

    return(
        <div className="flex flex-col justify-evenly w-full">
            <div className="h-4/5 w-11/12 mx-auto border-black border-2" >
                <div ref={containerRef} className="w-full h-full"/>
            </div>
        </div>
    )
}

export default SigmaViewer;