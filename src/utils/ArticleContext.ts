import {createContext} from "react";
import {AppState} from "./AppStateEnum";

export interface Article{
    title: string,
    link: string,
}

export interface ArticleContextProp {
    appState: AppState,
    currentArticle: Article | null,
    articleList: Article[],
    updateArticle: (newArticle: Article) => void,
    startArticle: Article | null,
    endArticle: Article | null,
    startGame: (start: Article, end: Article)=> void,
    reset: ()=> void,
}

export const ArticleContext = createContext<ArticleContextProp>({
    appState: AppState.MENU,
    endArticle: null, startArticle: null, currentArticle: null,
    articleList: [],
    updateArticle: () => {},
    startGame(start: Article, end: Article): void {},
    reset(): void{}
});