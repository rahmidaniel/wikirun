import {useEffect, useRef, useState} from "react";
import requestWikiArticle from "./utils/Helper";


const WikiArticle = () => {
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

            // Deprecated: this was achieved with CSS a[href*=':']
            // Filtering out wikipedia Portals and such
            // if(!name.includes(':')){
            //     setArticleName(name);
            // }
            setArticleName(name);
        }
    };

    const scrollToTop = () => {
        wikiRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    requestWikiArticle(articleName).then(response => setHtml(response)).then(scrollToTop).then(() => setIsLoading(false));

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
            {isLoading ? (<h1>Loading Article...</h1>) :
                (<div ref={wikiRef} className="mw-parser-output" dangerouslySetInnerHTML={{ __html: html }}/>)}
        </>
    );
};
export default WikiArticle;