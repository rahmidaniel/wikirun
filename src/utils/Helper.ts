// Wikipedia API call
import axios from "axios";

const requestWikiArticle = async (pageName: string) => {
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
    return response.data.parse.text['*'];
}

export const themeIsDark = () => {
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return storedTheme === 'dark' || (!storedTheme && systemTheme);
}

export default requestWikiArticle;