import {createContext} from "react";

export interface Article{
    title: string,
    link: string,
}

export interface ArticleContextProp {
    currentArticle: Article | null,
    articleList: Article[],
    updateArticle: (newArticle: Article) => void
}

export const ArticleContext = createContext<ArticleContextProp>({
    currentArticle: null,
    articleList: [],
    updateArticle: () => {},
});