import {createContext} from "react";
import {AppState} from "../Types/AppStateEnum";
import {Article} from "../Types/Article";
import Graph from "graphology";

export interface ArticleContextProp {
    appState: AppState,
    algoDone: boolean,
    currentArticle: Article | null,
    articleList: Article[],
    updateArticle: (newArticle: Article) => void,
    startArticle: Article | null,
    endArticle: Article | null,
    startGame: (start: Article, end: Article)=> void,
    reset: ()=> void,

    graph: Graph
}

export const ArticleContext = createContext<ArticleContextProp>({
    appState: AppState.MENU,
    algoDone: false,
    endArticle: null, startArticle: null, currentArticle: null,
    articleList: [],
    updateArticle: () => {},
    startGame(start: Article, end: Article): void {},
    reset(): void{},
    graph: new Graph()
});