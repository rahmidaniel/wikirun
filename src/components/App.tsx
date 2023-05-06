import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import React, {useState} from "react";
import {Article, ArticleContext} from "../utils/ArticleContext";
import {AppState} from "../utils/AppStateEnum";
import MainContent from "./MainContent/MainContent";

function App() {
    // Setting up the game context for provider
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [startArticle, setStartArticle] = useState<Article | null>(null);
    const [endArticle, setEndArticle] = useState<Article | null>(null);

    const [appState, setAppState] = useState<AppState>(AppState.MENU);

    // Changes state to AppState.ENDED if condition is met
    const updateArticle = (newArticle: Article)=>{
        // If the end article is reached, switch app state
        if(newArticle?.link === endArticle?.link && appState != AppState.ENDED) setAppState(AppState.ENDED);

        setCurrentArticle(newArticle);
        //console.log("updateArticle called with: ",newArticle);
        setArticleList([...articleList, newArticle]);
    }

    // Changes state to AppState.STARTED, also used as Restart
    const startGame = (start: Article, end: Article)=>{
        setStartArticle(start);
        updateArticle(start);
        setEndArticle(end);

        setAppState(AppState.STARTED);
    }

    function reset() {
        setArticleList([]); // empty list
        setCurrentArticle(null);
        setStartArticle(null);
        setEndArticle(null);

        setAppState(AppState.MENU);
    }

    return (
        <ArticleContext.Provider value={{appState, currentArticle, articleList, updateArticle, startGame, startArticle, endArticle, reset}}>
            <div className="app">
                <Navbar/>
                <button onClick={()=>updateArticle(endArticle!)}>test</button>
                <div className="flex flex-grow">
                    <Sidebar/>
                    <MainContent/>
                </div>
            </div>
        </ArticleContext.Provider>
    );
}

export default App
