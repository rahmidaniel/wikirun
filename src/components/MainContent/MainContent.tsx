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

    // Dictionary like storage for state specific JSX components
    const components = {
        [AppState.MENU]: algoTest,
        [AppState.STARTED]: wiki,
        [AppState.ENDED]:  <>{algoTest}<EndModal/></>
    };

    return(components[prop.appState]);
};
export default MainContent;