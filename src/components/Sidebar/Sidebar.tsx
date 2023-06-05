import ProgressDisplay from "./ProgressDisplay";
import StartMenu from "./StartMenu";
import {useContext} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../Types/AppStateEnum";

const Sidebar = () => {
    const prop = useContext(ArticleContext);

    // Dictionary like storage for state specific JSX components
    const progressDisplay = <ProgressDisplay/>

    const components = {
        [AppState.MENU]: <StartMenu/>,
        [AppState.STARTED]: progressDisplay,
        [AppState.ENDED]:  progressDisplay
    };

    return(
        <div className="my-sidebar py-16" >
            <h1>Wikipedia Speedrun</h1>
            {components[prop.appState]}
        </div>
    );
};
export default Sidebar;