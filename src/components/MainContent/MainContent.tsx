import React, {useContext} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../Types/AppStateEnum";
import WikiArticle from "./WikiArticle";
import EndModal from "./EndModal";
import SigmaViewer from "./Graph/GraphViewer";

const MainContent = () => {
    const prop = useContext(ArticleContext);

    const wiki = <WikiArticle/>;
    const algoTest= <SigmaViewer/>;
    const welcome =
            <div className="hero h-full w-full bg-base-200">
                <div className="hero-content">
                    <div className="w-full">
                        <h1 className="text-5xl font-bold">Test your knowledge!</h1>
                        <p className="py-6">The rules of the game are simple. The fastest time wins!</p>
                        <li>Choose a starting and a goal article.</li>
                        <li>Press the start button to begin the game.</li>
                        <p className="py-6">You will be presented with articles, if you click on a <a className="inline link-accent">link</a>, it will open that article.</p>
                        <p className="font-bold">Get to the goal article, as fast as you can.</p>
                    </div>
                </div>
            </div>
    // Dictionary like storage for state specific JSX components
    const components = {
        [AppState.MENU]: welcome,
        [AppState.STARTED]: wiki,
        [AppState.ENDED]:  <>{algoTest}<EndModal/></>
    };

    return(components[prop.appState]);
};
export default MainContent;