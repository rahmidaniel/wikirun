import {ReLinksResult} from "./ReLinksResult";
import {LinksResult} from "./LinksResult";
import axios from "axios";

/**
 * Calls the Wikipedia API to fetch links for a given page.
 * @param pageTitle - The name of the page to fetch links for.
 * @param reverse - If `true`, loads links that lead to a page. If `false`, loads links on a page. The default is `false`.
 @returns A Promise that resolves to an array of link titles.
 */
export const fetchLinks = async (pageTitle: string, reverse: boolean = false): Promise<string[]> => {
    let matches: string[] = [];
    let moreLinks = true;

    // Response from api defines continuation point
    let continueValue: string | null = null;

    while (moreLinks) {
        await axios.get('https://en.wikipedia.org/w/api.php?', {
            params: {
                action: "query",
                format: "json",
                formatversion: "2",
                origin: "*",
                disableeditsection: true,
                disabletoc: true,
                redirects: true,
                titles: decodeURIComponent(pageTitle),
                // Defines the data we need => LINKS (can limit the number of links 1 to 500 or "max")
                ...(reverse ?
                    {prop: "linkshere", lhlimit: "10", lhnamespace: "0"} :
                    {prop: "links", pllimit: "10", plnamespace: "0"}),
                // Continuation point needs to be set
                ...(continueValue ? { [ reverse ? "lhcontinue" : "plcontinue"]: continueValue} : {}),
            }
        }).then((response) => {
            if(reverse) {
                const queryResult = (response.data as (ReLinksResult));
                // Adding fetched data to the list of matches
                matches.push(...queryResult.query.pages[0].linkshere.map(page => page.title));
                // Setting continuation point if further calls are needed
                continueValue = queryResult.continue !== undefined ? queryResult.continue.lhcontinue : null;

            } else { // Same as above, but different response needs different types
                const queryResult = (response.data as (LinksResult));
                matches.push(...queryResult.query.pages[0].links.map(page => page.title));
                continueValue = queryResult.continue !== undefined ? queryResult.continue.plcontinue : null;
            }
            // Check if there are any more links to fetch
            moreLinks = !!continueValue;
        }).catch((error) => {
            if (!axios.isCancel(error)) console.log(`Error in query: ${pageTitle}`, error);

            // Loop has to be broken to avoid infinite fetch cycle
            moreLinks = false;
        });
    }

    return matches;
}