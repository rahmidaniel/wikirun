import SideBar from "./SideBar";
import WikiArticle from "./WikiArticle";
import NavBar from "./NavBar";
import React, {useState} from "react";
import {Article, ArticleContext} from "../utils/ArticleContext";

function App() {
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [startArticle, setStartArticle] = useState<Article | null>(null);
    const [endArticle, setEndArticle] = useState<Article | null>(null);

    const updateArticle = (newArticle: Article)=>{
        setCurrentArticle(newArticle);
        console.log("updateArticle called with: ",newArticle);
        setArticleList([...articleList, newArticle]);
    }

    const startGame = (start: Article, end: Article)=>{
        setStartArticle(start);
        updateArticle(start);
        setEndArticle(end);
    }

    return (
        <ArticleContext.Provider value={{currentArticle, articleList, updateArticle, startGame, startArticle, endArticle}}>
            <div className="app">
                <NavBar/>
                <div className="flex flex-grow">
                    <SideBar/>
                    <WikiArticle/>
                </div>
            </div>
        </ArticleContext.Provider>
    );
}

export default App
