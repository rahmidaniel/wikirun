import {createContext} from "react";

export interface Article{
    title: string,
    link: string,
}

export interface ArticleContextProp {
    currentArticle: Article | null,
    articleList: Article[],
    updateArticle: (newArticle: Article) => void,
    startArticle: Article | null,
    endArticle: Article | null,
    startGame: (start: Article, end: Article)=> void
}

export const ArticleContext = createContext<ArticleContextProp>({
    endArticle: null, startArticle: null, currentArticle: null,
    articleList: [],
    updateArticle: () => {},
    startGame(start: Article, end: Article): void {}
});