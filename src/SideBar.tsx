import {createContext, useState} from "react";
import Timer from "./Timer";

const StartArticleContext = createContext('');

const SideBar = () => {
    const [startArticle, setStartArticle] = useState('');
    const [endArticle, setEndArticle] = useState('');

    const time = new Date();
    time.setSeconds(time.getSeconds() + 600);

    return(
        <StartArticleContext.Provider value={startArticle}>
            <div className="my-sidebar" >
                <h1>Wikipedia Speedrun</h1>
                <p>Test your knowledge of the world!</p>
                <Timer autoStart={false} offset={0}/>
            </div>
        </StartArticleContext.Provider>
    );
};
export default SideBar;