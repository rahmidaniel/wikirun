import Timer from "./Timer";
import SearchBar from "./SearchBar";
import {useContext, useEffect, useState} from "react";
import {ArticleContext} from "./App";

const SideBar = () => {
    const prop = useContext(ArticleContext);
    const titles: string[] = [];

    useEffect(()=>{
        console.log(titles, prop.title);
        titles.push(prop.title);
    })

    return(
        <div className="my-sidebar py-16" >
            <h1>Wikipedia Speedrun</h1>
            <p>Test your knowledge of the world!</p>
            <Timer autoStart={false} offset={0}/>
            <ul className="menu menu-compact ">
                {titles.map((item) => (<li>{item}</li>))}
            </ul>
            <SearchBar/>
        </div>
    );
};
export default SideBar;