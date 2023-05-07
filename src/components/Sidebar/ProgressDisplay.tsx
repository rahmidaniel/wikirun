import {useTimer} from "../../utils/useTimer";
import {useContext, useMemo, useRef, useState} from "react";
import {Article, ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../utils/AppStateEnum";

type TimedArticle = {
    time: string
} & Article

const ProgressDisplay = () => {
    const prop = useContext(ArticleContext);
    const [timetable, setTimetable]= useState<TimedArticle[]>([]);
    const tableRef = useRef<HTMLDivElement>(null);

    const {
        pause,
        timeString
    } = useTimer();

    // Adding new articles to timetable when the context updates
    // switched to memo, effect ran twice but dep only changed once, could be strict mode
    const visibleTable = useMemo(()=>{
        if(prop.appState === AppState.ENDED) pause(); // Timer paused if game ended

        if(!prop.currentArticle) return [];

        const timestamp: TimedArticle = {time: timeString(), title: prop.currentArticle.title, link: prop.currentArticle.link};
        setTimetable((prevState) => [...prevState, timestamp]);
        tableRef.current?.scrollTo(0, tableRef.current.scrollHeight);

        return [...timetable, timestamp];
    },[prop.updateArticle])

    return(
        <>
            <h4 className="flex mx-2 flex-wrap">{prop.startArticle?.title + "->" + prop.endArticle?.title}</h4>
            <div className="flex flex-col">
                <div className="overflow-y-auto h-4/6 max-h-96 mx-2 w-full overflow-x-visible" ref={tableRef} style={{ scrollBehavior: "smooth" }}>
                    <table className="table table-zebra table-compact border border-base-100 p-2">
                        <thead>
                        <tr>
                            <th className="pl-2">Title</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Filling the table with article list + times */}
                        {visibleTable.map((item, index) => (
                            <tr key={index}>
                                <td className="pl-2">{item.title}</td>
                                <td>{item.time}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="rounded-2xl bg-base-300 m-2 p-2">
                    <h1 className="text-2xl text-green-600 my-auto">{timeString()}</h1>
                </div>

                {/* New game button */}
                {prop.appState === AppState.ENDED && <button
                    onClick={()=>prop.reset()}
                    className="btn btn-success w-1/2 mt-4 mx-auto rounded-2xl">
                    New Game
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 p-0.5">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                </button>}
            </div>
        </>
    );
};

export default ProgressDisplay;