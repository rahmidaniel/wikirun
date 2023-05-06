import React, {useState} from "react";
import axios from "axios";
import {Article} from "../../utils/ArticleContext";
import ArticleCombobox from "../Sidebar/ArticleCombobox";

interface Link {
    ns: number;
    title: string;
}

type Page = {
    links: Page[];
} & Link;


interface QueryResult {
    pages: { [key: number]: Page };
}

export const requestLinks = async (pageName: string): Promise<Link[]> => {
    let matches: Link[] = [];

    await axios.get('https://en.wikipedia.org/w/api.php?', {
        params: {
            action: "query",
            prop: "links",
            format: "json",
            origin: "*",
            titles: decodeURIComponent(pageName),
            pllimit: "500",
            plnamespace: "0"
        },
    }).then((res) => {
        let pages = (res.data.query as QueryResult).pages;
        // @ts-ignore
        matches = pages[Object.keys(pages)[0]].links;

    }).catch((error) => {
        if(!axios.isCancel(error)) console.log(`Error in query: ${pageName}`, error);
    });

    return matches;
}

const Algo = () => {
    const [matches, setMatches] = useState<Link[]>([]);

    const handleSelect = (selected: Article) => {
        requestLinks(selected.link).then((result)=> setMatches(result) );
        console.log(matches)
    }

    return(
      <div className="mx-auto flex flex-col">
          <ArticleCombobox label={"Links"} onSelect={handleSelect}/>
          <table className="table table-zebra table-compact">
              <thead>
              <tr>
                  <th className="pl-2">Title</th>
              </tr>
              </thead>
              <tbody>
              {/* Filling the table with article list + times */}
              {matches.map((item, index) => (
                  <tr key={index}>
                      <td className="pl-2">{item.title}</td>
                  </tr>
              ))}
              </tbody>
          </table>
      </div>
    )
}

export default Algo;