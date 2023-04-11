// Wikipedia API call
import axios from "axios";
import {useEffect, useState} from "react";
import {Article} from "./ArticleContext";

export type articleResult = {
    html: string
} & Article;

export const requestWikiArticle = async (pageName: string): Promise<articleResult> => {
    const response = await axios.get('https://en.wikipedia.org/w/api.php?', {
            params: {
                action: "parse",
                format: "json",
                page: pageName,
                disableeditsection: true,
                disabletoc: true,
                redirects: true,
                origin: "*"
            }
        });
    //console.log(response.data);
    return {title: response.data.parse.title, link: pageName , html: response.data.parse.text['*']};
}

export const useWikiSearch = (query: string): Article[] => {
    const [matches, setMatches] = useState<Article[]>([]);

    useEffect( ()=>{
        const controller = new AbortController();
        if(query.length === 0) return ()=>controller.abort();

        axios.get('https://en.wikipedia.org/w/api.php?', {
                params: {
                    action: "opensearch",
                    origin: "*",
                    search: query.trim(),
                    limit: "5",
                    namespace: "0",
                    redirects: "resolve",
                },
                signal: controller.signal,
            }).then((res) => {
                let result: Article[] = [];
                // Mapping the titles to the links
                for (let i = 0; i < res.data[1].length; i++) {
                    // https://en.wikipedia.org/wiki/ASD => 30 chars not needed from the start
                    result.push({title: res.data[1][i], link: res.data[3][i].substring(30)})
                }
                setMatches(result);
            }).catch((error) => {
                if(!axios.isCancel(error)) console.log(`Error in query: ${query}`, error);
            });

        return ()=>controller.abort();
    }, [query])

    return matches;
}