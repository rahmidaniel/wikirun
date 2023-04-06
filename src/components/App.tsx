import SideBar from "./SideBar";
import WikiArticle, {articleInfo} from "./WikiArticle";
import NavBar from "./NavBar";
import React, {createContext, useState} from "react";
import {CssVarsProvider} from "@mui/joy/styles";
import defaultTheme from "@mui/joy/styles/defaultTheme";

export const ArticleContext = createContext({
    title: '', setTitle: (title: string)=> {},
    articleUri: '', setArticleUri: (article: string)=> {},
    onHandle: ()=>{}
});

function App() {
    const setTitle = (title: string) => {
        setState({...state, title: title})
    }
    const setArticleUri = (articleUri: string) => {
        setState({...state, articleUri: articleUri})
    }
    // const [title, setTitle] = useState('Flax');
    // const [articleUri, setArticleUri] = useState('Flax');

    //const value = {title, setTitle, articleUri, setArticleUri};

    const onHandle = () => {
        console.log(state.title);
    }

    const initState = {
        title: "Flax",
        setTitle: setTitle,
        articleUri: "Flax",
        setArticleUri: setArticleUri,
        onHandle: onHandle,
    }

    const [state, setState] = useState(initState)



    return (
        <CssVarsProvider theme={defaultTheme}>
            <ArticleContext.Provider value={state}>
                <div className="app">
                    <NavBar/>
                    <div className="flex flex-grow cont">
                        <SideBar/>
                        <WikiArticle/>
                    </div>
                </div>
            </ArticleContext.Provider>
        </CssVarsProvider>
    );
}

export default App
