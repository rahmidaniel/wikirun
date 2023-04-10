// Wikipedia API call
import axios from "axios";
import {useEffect, useState} from "react";
import {Article} from "../components/App";

export type articleResult = {
    html: string
} & Article;

const useWikiArticle = async (pageName: string): Promise<articleResult> => {
    //todo this doesn't seem right async wise
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
export default useWikiArticle;

export const useWikiSearch = (query: string): Article[] => {
    const [matches, setMatches] = useState<Article[]>([]);

    useEffect( ()=>{
        const controller = new AbortController();

        if(query === "") return ()=>controller.abort();

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
                    result.push({title: res.data[1][i], link: res.data[3][i]})
                }
                setMatches(result);
            }).catch((error) => console.log(error)); //todo: gives error on query " ;;;,? " or similar characters

        return ()=>controller.abort();
    }, [query])

    return matches;
}