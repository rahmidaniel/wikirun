import {ReLinksResult} from "./ReLinksResult";
import {LinksResult} from "./LinksResult";
import axios from "axios";

/**
 * Calls the Wikipedia API to fetch links for a given page.
 * @param pageTitle - Name of the page to fetch links for.
 * @param reverse - If `true`, loads links that lead to a page. If `false`, loads links on a page. The **default** is `false`.
 * @param batchCallback - *optional* - calls given function with a partial fetched list. Useful if the page contains a lot of links.
 * @returns A Promise that resolves to an array of string titles.
 */
export const fetchLinks = async (pageTitle: string, reverse: boolean = false, batchCallback?: (partialMatch: string[])=>void): Promise<string[]> => {
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
                redirects: true,
                titles: decodeURIComponent(pageTitle),
                // Defines the data we need => LINKS (can limit the number of links 1 to 500 or "max")
                ...(reverse ?
                    {prop: "linkshere", lhlimit: "max", lhnamespace: "0"} :
                    {prop: "links", pllimit: "max", plnamespace: "0"}),
                // Continuation point needs to be set
                ...(continueValue ? { [ reverse ? "lhcontinue" : "plcontinue"]: continueValue} : {}),
            }
        }).then((response)=> {
            // Container for batching
            const batch: string[] = [];
            if(reverse) {
                const queryResult = (response.data as (ReLinksResult));
                // Adding fetched data to the list of matches
                batch.push(...queryResult.query.pages[0].linkshere.map(page => page.title));
                // Setting continuation point if further calls are needed
                continueValue = queryResult.continue !== undefined ? queryResult.continue.lhcontinue : null;
            } else { // Same as above, but different response needs different types
                const queryResult = (response.data as (LinksResult));
                batch.push(...queryResult.query.pages[0].links.map(page => page.title));
                continueValue = queryResult.continue !== undefined ? queryResult.continue.plcontinue : null;
            }
            // Check if there are any more links to fetch
            moreLinks = !!continueValue;

            // Fire callback function with batch
            batchCallback?.(batch);

            // Add batch to matches
            matches.push(...batch);
        }).catch((error) => {
            if (!axios.isCancel(error)) console.log(`Error in query: ${pageTitle}`, error);

            // Loop has to be broken to avoid infinite fetch cycle
            moreLinks = false;
        });
    }

    return matches;
}