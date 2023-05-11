import ArticleCombobox from "./ArticleCombobox";
import {useContext, useEffect, useState} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {Article} from "../../Types/Article";

// inspired by https://reacthustle.com/blog/how-to-implement-a-react-autocomplete-input-using-daisyui

const StartMenu = () => {
    const [startArticle, setStartArticle] = useState<Article | null>(null);
    const [endArticle, setEndArticle] = useState<Article | null>(null);
    const [isReady, setIsReady] = useState(false);
    const {startGame} = useContext(ArticleContext);

    const handleStart = ()=>{
        if(startArticle && endArticle)
            startGame(startArticle, endArticle);
    };

    useEffect(()=>{
        if(startArticle && endArticle)
            setIsReady(startArticle.title !== endArticle.title);
    }, [startArticle, endArticle]);

    return(
        <div className="flex-col mx-auto">
            <ArticleCombobox label={"Starting Article"} onSelect={setStartArticle}/>
            <ArticleCombobox label={"Ending Article"} onSelect={setEndArticle}/>
            <button
                onClick={handleStart}
                className={`btn btn-success w-1/2 mt-4 rounded-2xl ${!isReady ? 'btn-disabled' : ''}`}>
                Start
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 p-0.5">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
            </button>
        </div>
    )
}

export default StartMenu;