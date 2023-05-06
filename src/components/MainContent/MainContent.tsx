import React, {useContext} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../utils/AppStateEnum";
import WikiArticle from "./WikiArticle";
import EndModal from "./EndModal";

const MainContent = () => {
    const prop = useContext(ArticleContext);

    // Dictionary like storage for state specific JSX components
    const components = {
        [AppState.MENU]: <p className="m-auto">[should show rules and guide]</p>,
        [AppState.STARTED]: <WikiArticle/>,
        [AppState.ENDED]:  <EndModal/>
    };

    return(components[prop.appState]);
};
export default MainContent;