import SideBar from "./SideBar";
import WikiArticle from "./WikiArticle";
import NavBar from "./NavBar";
import React, {useState} from "react";
import {Article, ArticleContext} from "../utils/ArticleContext";

function App() {
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const updateArticle = (newArticle: Article)=>{
        setCurrentArticle(newArticle);
        setArticleList([...articleList, newArticle]);
    }

    return (
        <ArticleContext.Provider value={{currentArticle, articleList, updateArticle}}>
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
