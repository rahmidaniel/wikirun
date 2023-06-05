import axios from "axios";
import {articleResult} from "./articleResult";

export const fetchArticle = async (pageName: string): Promise<articleResult> => {
    const response = await axios.get('https://en.wikipedia.org/w/api.php?', {
        params: {
            action: "parse",
            format: "json",
            page: decodeURIComponent(pageName),
            disableeditsection: true,
            disabletoc: true,
            useskin: "modern",
            redirects: true,
            origin: "*"
        }
    });
    //console.log(response.data);
    return {title: response.data.parse.title, link: pageName, html: response.data.parse.text['*']};
}