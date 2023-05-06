import ProgressDisplay from "./ProgressDisplay";
import StartMenu from "./StartMenu";
import {useContext} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../utils/AppStateEnum";

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
            <p>Test your knowledge of the world!</p>
            {components[prop.appState]}
        </div>
    );
};
export default Sidebar;