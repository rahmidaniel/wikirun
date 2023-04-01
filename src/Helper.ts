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

export default requestWikiArticle;