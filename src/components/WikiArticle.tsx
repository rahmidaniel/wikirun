import {useContext, useEffect, useRef, useState} from "react";
import useWikiArticle from "../utils/wikipediaApi";
import {ArticleContext} from "./App";
import {CircularProgress} from "@mui/joy";

export interface articleInfo {
    title: string,
    articleUri: string,
    onClick: () => void;
}

const WikiArticle = () => {
    const prop = useContext(ArticleContext);

    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [articleName, setArticleName] = useState('CMYK_color_model');

    const wikiRef = useRef<HTMLDivElement>(null);

    // Redirecting wiki links, calling api
    const handleClick = (event: MouseEvent) => {
        event.preventDefault();

        if(event.target instanceof HTMLAnchorElement){
            // substring(6) : /wiki/Article => Article
            const name = event.target.pathname.substring(6);
            setArticleName(name);

            // External onClick
            prop.onHandle();
        }
    };

    const scrollToTop = () => {
        wikiRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useWikiArticle(articleName)
        .then(response =>{
            setHtml(response.html);
            prop.articleUri = (response.articleUri);
            prop.title = (response.title);
        })
        .then(scrollToTop)
        .then(() => setIsLoading(false));

    useEffect( () => {
        setIsLoading(true);
            //.then(()=> scrollToTop());

        // Null check
        if(!wikiRef.current){
            setIsLoading(true);
            return;
        }

        // References, Portals and other wikipedia elements
        wikiRef.current.querySelector('#References')?.parentElement?.remove(); // todo: remove parent too
        wikiRef.current.querySelectorAll('.reference, .reflist, .plainlinks, .portalbox, .noprint').forEach((element) => element.remove());

        // Attaching event listeners to all links
        const links = wikiRef.current.querySelectorAll('a');
        links?.forEach(link => {
            link.addEventListener('click', handleClick)
        });

        // // Loading done
        setIsLoading(false);

        // Removing listeners
        return () => {
            links?.forEach(link => {
                link.removeEventListener('click', handleClick)
            });
        };

    }, [html]);


    return (
        <>
            {isLoading ? (<CircularProgress color="primary" />) :
                (<div ref={wikiRef} className="mw-parser-output" dangerouslySetInnerHTML={{ __html: html }}/>)}
        </>
    );
};
export default WikiArticle;