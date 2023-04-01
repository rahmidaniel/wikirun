import {useEffect, useRef, useState} from "react";
import requestWikiArticle from "./Helper";


const WikiArticle = () => {
    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [articleName, setArticleName] = useState('Flax');


    const wikiRef = useRef<HTMLDivElement>(null);

    // Redirecting wiki links, calling api
    const handleClick = (event: MouseEvent) => {
        event.preventDefault();

        if(event.target instanceof HTMLAnchorElement){
            // substring(6) : /wiki/Article => Article
            // const name = event.target.pathname.substring(6);
            // //
            // if(!name.startsWith('File:'))
            setArticleName(event.target.pathname.substring(6));
        }
    };

    const scrollToTop = () => {
        // @ts-ignore
        wikiRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect( () => {
        setIsLoading(true);

        //todo: Cleaning the wiki page (References, Notes, ...)
        requestWikiArticle(articleName).then(response => setHtml(response));
            //.then(()=> scrollToTop());

        // Null check
        if(!wikiRef.current){
            setIsLoading(false);
            return;
        }

        // References
        wikiRef.current.querySelectorAll('.reference').forEach((element) => element.remove());
        wikiRef.current.querySelectorAll('.reflist').forEach((element) => element.remove());
        wikiRef.current.querySelectorAll('.plainlinks').forEach((element) => element.remove());

        // Attaching event listeners to all links
        const links = wikiRef.current.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', handleClick)
        });

        // Loading done
        setIsLoading(false);

        // Removing listeners
        return () => {
            links.forEach(link => {
                link.removeEventListener('click', handleClick)
            });
        };

    }, [html, articleName]);


    return (
        <>
            {isLoading ? (<h1>Loading Article...</h1>) :
                (<div ref={wikiRef} className="mw-parser-output" dangerouslySetInnerHTML={{ __html: html }}/>)}
        </>
    );
};
export default WikiArticle;