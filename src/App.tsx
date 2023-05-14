import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import React, {useState} from "react";
import {ArticleContext} from "./utils/ArticleContext";
import {AppState} from "./Types/AppStateEnum";
import MainContent from "./components/MainContent/MainContent";
import {Article} from "./Types/Article";
import Graph from "graphology";
import {baseColor, baseSize} from "./utils/graph/graphDefaults";

function App() {
    // Setting up the game context for provider
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [startArticle, setStartArticle] = useState<Article | null>(null);
    const [endArticle, setEndArticle] = useState<Article | null>(null);

    const [appState, setAppState] = useState<AppState>(AppState.MENU);
    const [graph, setGraph] = useState<Graph>(new Graph());

    // Changes state to AppState.ENDED if condition is met
    const updateArticle = (newArticle: Article)=>{
        // If the end article is reached, switch app state
        if(newArticle?.link === endArticle?.link && appState != AppState.ENDED) setAppState(AppState.ENDED);

        setCurrentArticle(newArticle);
        //console.log("updateArticle called with: ",newArticle);
        setArticleList([...articleList, newArticle]);

        // TODO: This should be handled with an event
        graph.addNode(newArticle.title,{reverse: false, depth: articleList.length-1, loaded: false, label: newArticle.title, size: baseSize, color: baseColor, x: 2000 * articleList.length, y: 0})
        if(currentArticle)
            graph.addEdge(currentArticle.title, newArticle.title, {
                color: baseColor,
                size: 5,
                zIndex: 50
            });
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

        graph.clear();

        setAppState(AppState.MENU);
    }

    return (
        <ArticleContext.Provider value={{appState, currentArticle, articleList, updateArticle, startGame, startArticle, endArticle, reset, graph}}>
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
