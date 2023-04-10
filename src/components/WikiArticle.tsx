import {useContext, useEffect, useRef, useState} from "react";
import useWikiArticle from "../utils/wikipediaApi";
import {CircularProgress} from "@mui/joy";
import {ArticleContext} from "../utils/ArticleContext";

const WikiArticle = () => {
    const {currentArticle, updateArticle} = useContext(ArticleContext);

    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loadedArticleName, setLoadedArticleName] = useState('');

    const wikiRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        wikiRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    // not sure if needed

    // Loads current article
    useEffect( ()=>{
        if(currentArticle && currentArticle.title !== loadedArticleName)
            useWikiArticle(currentArticle.link)
                .then(response =>{
                    setHtml(response.html);
                    setLoadedArticleName(response.title);

                    setIsLoading(false);
                })
    }, [currentArticle]);

    // Cleans article and adds listeners
    useEffect( () => {
        if(!wikiRef.current){
            setIsLoading(true);
            return;
        }

        const handleClick = (event: MouseEvent) => {
            event.preventDefault();
            if(event.target instanceof HTMLAnchorElement){
                // substring(6) : /wiki/Article => Article
                console.log(event.target.textContent);
                updateArticle({title: event.target.title, link: event.target.pathname.substring(6)});
            }
        };

        // References, Portals and other wikipedia elements
        wikiRef.current.querySelector('#References')?.parentElement?.remove(); // todo: remove parent too
        wikiRef.current.querySelectorAll('.reference, .reflist, .plainlinks, .portalbox, .noprint').forEach((element) => element.remove());

        // Attaching event listeners to all links
        const links = wikiRef.current.querySelectorAll('a');
        links?.forEach(link => {
            link.addEventListener('click', handleClick)
        });

        scrollToTop();
        setIsLoading(false);

        // Removing listeners on dismount
        return () => {
            links?.forEach(link => {
                link.removeEventListener('click', handleClick)
            });
        };

    }, [updateArticle, html]);


    return (
        <>
            {isLoading ?
                (<CircularProgress color="primary" />)
                :
                (<div ref={wikiRef} className="mw-parser-output" dangerouslySetInnerHTML={{ __html: html }}/>)}
        </>
    );
};
export default WikiArticle;