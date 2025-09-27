import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import React, {useState} from "react";
import {ArticleContext} from "./utils/ArticleContext";
import {AppState} from "./Types/AppStateEnum";
import MainContent from "./components/MainContent/MainContent";
import {Article} from "./Types/Article";
import Graph, {MultiGraph} from "graphology";
import {baseColor, baseSize, calculateChildNodeSize} from "./utils/graph/graphDefaults";
import {bidirectionalBFS} from "./utils/graph/algorithms/bidirectionalBFS";
import chroma from "chroma-js";

function App() {
    // Setting up the game context for provider
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [startArticle, setStartArticle] = useState<Article | null>(null);
    const [endArticle, setEndArticle] = useState<Article | null>(null);

    const [appState, setAppState] = useState<AppState>(AppState.MENU);
    const [graph] = useState<Graph>(new Graph({multi: true, allowSelfLoops: true}));
    const [algoDone, setAlgoDone] = useState(false);

    // Changes state to AppState.ENDED if condition is met
    const updateArticle = (newArticle: Article)=>{
        // If the end article is reached, switch app state
        if(newArticle?.link === endArticle?.link && appState != AppState.ENDED) setAppState(AppState.ENDED);

        setCurrentArticle(newArticle);
        // console.log("updateArticle called with: ",newArticle);
        setArticleList([...articleList, newArticle]);

        graph.mergeNode(newArticle.title,{reverse: false, depth: articleList.length-1, loaded: false, label: newArticle.title, size: baseSize, color: baseColor, x: 2000 * articleList.length, y: 0})
        if(currentArticle)
            graph.mergeEdge(currentArticle.title, newArticle.title, {
                color: baseColor,
                size: 5,
                zIndex: 50
            });
    }

    const handleAlgo = async (source: string, target: string) => {
        const path = await bidirectionalBFS(graph, source, target);

        if (path) {
            graph.mergeNode(path[0], {
                reverse: false,
                depth: 0,
                loaded: false,
                label: path[0],
                size: baseSize,
                color: chroma("brown").hex("rgba"),
                x: 0,
                y: 0
            })
            for (let i = 1; i < path.length; i++) {
                graph.mergeNode(path[i], {
                    reverse: false,
                    depth: i,
                    loaded: false,
                    label: path[i],
                    size: baseSize,
                    color: baseColor,
                    x: 1000 * i,
                    y: 0
                })
                graph.mergeEdge(path[i - 1], path[i], {color: chroma("brown").hex("rgba"), size: 5, type: "arrow", zIndex: 60})
            }
        }
    }

    // Changes state to AppState.STARTED, also used as Restart
    const startGame = (start: Article, end: Article)=>{
        setStartArticle(start);
        updateArticle(start);
        setEndArticle(end);

        setAlgoDone(false);
        handleAlgo(start.title, end.title).then(()=>setAlgoDone(true))

        setAppState(AppState.STARTED);
    }

    function reset() {
        setArticleList([]); // empty list
        setCurrentArticle(null);
        setStartArticle(null);
        setEndArticle(null);

        graph.clear();
        setAlgoDone(false);

        setAppState(AppState.MENU);
    }

    return (
        <ArticleContext.Provider value={{appState, algoDone, currentArticle, articleList, updateArticle, startGame, startArticle, endArticle, reset, graph}}>
            <div className="app">
                <Navbar/>
                <button className="btn rounded-btn btn-error" onClick={()=>updateArticle(endArticle!)}>Cheat</button>
                <div className="flex flex-grow">
                    <Sidebar/>
                    <MainContent/>
                </div>
            </div>
        </ArticleContext.Provider>
    );
}

export default App
