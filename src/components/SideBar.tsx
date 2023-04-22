import Timer from "./Timer";
import SearchBar from "./SearchBar";
import {useContext} from "react";
import {ArticleContext} from "../utils/ArticleContext";

const SideBar = () => {
    const prop = useContext(ArticleContext);

    return(
        <div className="my-sidebar py-16" >
            <h1>Wikipedia Spe</h1>
            <p>Test your knowledge of the world!</p>
            {prop.currentArticle ? <Timer autoStart={true} offset={0}/> : <SearchBar/>}
        </div>
    );
};
export default SideBar;