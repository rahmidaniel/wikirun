import React, {useContext} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../utils/AppStateEnum";
import WikiArticle from "./WikiArticle";
import EndModal from "./EndModal";
import Algo from "./Algo";

const MainContent = () => {
    const prop = useContext(ArticleContext);

    const wiki = <WikiArticle/>;
    const algoTest= <Algo/>;

    // Dictionary like storage for state specific JSX components
    const components = {
        [AppState.MENU]: algoTest,
        [AppState.STARTED]: wiki,
        [AppState.ENDED]:  <>{wiki}<EndModal/></>
    };

    return(components[prop.appState]);
};
export default MainContent;