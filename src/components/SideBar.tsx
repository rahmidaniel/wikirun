import Timer from "./Timer";
import SearchBar from "./SearchBar";
import {useContext, useEffect, useState} from "react";
import {ArticleContext} from "../utils/ArticleContext";

const SideBar = () => {
    const prop = useContext(ArticleContext);

    return(
        <div className="my-sidebar py-16" >
            <h1>Wikipedia Speedrun</h1>
            <p>Test your knowledge of the world!</p>
            <Timer autoStart={false} offset={0}/>
            <ul className="table table-compact table-zebra">
                {prop.articleList.map((item, index) => (<li key={index}>{item.title}</li>))}
            </ul>
            <SearchBar/>
        </div>
    );
};
export default SideBar;