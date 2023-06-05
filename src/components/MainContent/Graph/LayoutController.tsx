import React, {useContext, useState} from "react";
import {ForceAtlas2Settings} from "graphology-layout-forceatlas2";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import {ArticleContext} from "../../../utils/ArticleContext";

interface LayoutControllerParams {
    layout: FA2LayoutSupervisor | null;
    simRunning: boolean;
    setSimRunning: (simRunning: boolean) => void;
    fa2Settings: ForceAtlas2Settings;
    onSettingsChange: (settings: ForceAtlas2Settings) => void;
}

const LayoutController = (prop: LayoutControllerParams) => {
    const {layout, fa2Settings, onSettingsChange, simRunning, setSimRunning} = prop;
    const {algoDone} = useContext(ArticleContext);

    if(!layout || !algoDone){
        return (
            <div className="flex w-full flex-col mt-2 w-full h-40 rounded-box bg-base-200">
                <label className="btn btn-ghost animate-pulse m-auto">Waiting for algorithm...</label>
            </div>
        )
    }
    // Cannot change settings directly (layout has constant setting on initialization)
    const [currentSettings, setCurrentSettings] = useState<ForceAtlas2Settings>(fa2Settings);

    const handleFA2ParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        onSettingsChange({
            ...fa2Settings,
            [name]: type === 'checkbox' ? checked : Number(value),
        });
    };

    // /**
    //  * Function returning sane layout settings for the given graph.
    //  *
    //  * @param  {Graph|number} graph - Target graph or graph order.
    //  * @return {object}
    //  */
    // function inferSettings(graph) {
    //   var order = typeof graph === 'number' ? graph : graph.order;
    //
    //   return {
    //     barnesHutOptimize: order > 2000,
    //     strongGravityMode: true,
    //     gravity: 0.05,
    //     scalingRatio: 10,
    //     slowDown: 1 + Math.log(order)
    //   };
    // }

    return(
        <div className="flex w-full flex-col mt-2">
            <div className="form-control w-full">
                <label className="label bg-base-300 rounded-btn cursor-pointer">
                    <span className="label-text text-xl">Simulation</span>
                    <label className="swap bg-base-300">
                        <input type="checkbox" checked={simRunning} onChange={()=>setSimRunning(!simRunning)}/>
                        <div className="swap-on btn btn-success rounded-btn">ON</div>
                        <div className="swap-off btn btn-error rounded-btn">OFF</div>
                    </label>
                </label>
            </div>
            <form className="form-control rounded-box bg-base-200 px-4 pb-4 mt-2"
                  onSubmit={()=>onSettingsChange(currentSettings)}
                  onReset={()=>setCurrentSettings(fa2Settings)}>
                <label className="label transition-opacity duration-500 ease-in-out delay-300">
                                <span className="label-text tooltip" data-tip="Distribute repulsion between connected nodes. Default true.">
                                    Repulsion distribution
                                </span>
                    <input type="checkbox" name="outboundAttractionDistribution" checked={fa2Settings.outboundAttractionDistribution} onChange={handleFA2ParamChange} className="checkbox checkbox-primary" />
                </label>
                <label className="label transition-opacity duration-500 ease-in-out delay-500">
                    <span className="label-text" data-tip="Strength of the layout’s gravity. Default 5">
                        Gravity
                    </span>
                    <input type="number" name="gravity" value={fa2Settings.gravity} onChange={handleFA2ParamChange} className="input input-sm"/>
                </label>
                <label className="label">
                    <span className="label-text" data-tip="'Slowed' time multiplier. Default 10">
                        Slow Down
                    </span>
                    <input type="number" name="slowDown" value={fa2Settings.slowDown} onChange={handleFA2ParamChange} className="input input-sm"/>
                </label>

                <button type="reset" className="btn btn-error">Reset</button>
            </form>
        </div>
    )
}

export default LayoutController;