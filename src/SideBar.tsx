import {AcademicCapIcon, ClockIcon} from "@heroicons/react/24/solid";
import {createContext, useState} from "react";

const StartArticleContext = createContext('');

const SideBar = () => {
    const [startArticle, setStartArticle] = useState('');
    const [endArticle, setEndArticle] = useState('');

    return(
        <StartArticleContext.Provider value={startArticle}>
            <div className="top-0 left-0 h-screen w-1/4 overflow-y-auto
                        flex flex-col
                        bg-gray-900 text-white shadow-lg" >
                <AcademicCapIcon className="sidebar-icons"/>
                {/*todo: form here to submit start end*/}
                <ClockIcon className="sidebar-icons"/>
            </div>
        </StartArticleContext.Provider>
    );
};
export default SideBar;