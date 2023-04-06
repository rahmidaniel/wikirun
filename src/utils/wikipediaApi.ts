// Wikipedia API call
import axios from "axios";
import {useEffect, useState} from "react";

// todo: seems like a duplicate of 'articleInfo'
interface articleResult {
    title: string,
    articleUri: string,
    html: string
}

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
    return {title: response.data.parse.title, articleUri: pageName , html: response.data.parse.text['*']};
}
export default useWikiArticle;


export interface searchPair {
    title: string,
    link: string,
}

//todo: dont need query
interface searchResult{
    query: string,
    // Key is the title, value is the link
    matches: searchPair[],
}

export const useWikiSearch = (query: string): searchResult => {
    const [matches, setMatches] = useState<searchPair[]>([]);

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
                signal: controller.signal
            }).then((res) => {
                //console.log(res.data)
                let result: searchPair[] = [];
                // Mapping the titles to the links
                for (let i = 0; i < res.data[1].length; i++) {
                    result.push({title: res.data[1][i], link: res.data[3][i]})
                }

                // const result = res.data[1].map(function(row: Array<string>) {
                //     if (!Array.isArray(row)) {
                //         return null; // or handle the error in some other way
                //     }
                //     return row.reduce(function(result: Record<string, string>, field, index) {
                //         result[res.data[3][index]] = field;
                //         return result;
                //     }, {});
                // }).filter((row: Record<string, string> | null) => row !== null);
                setMatches(result);
            })

        return ()=>controller.abort();
    }, [query])

    return { query, matches };
}