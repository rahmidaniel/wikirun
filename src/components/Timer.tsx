
import {useTimer, TimerSettings} from "../utils/useTimer";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Article, ArticleContext} from "../utils/ArticleContext";

type TimedArticle = {
    time: string
} & Article

const Timer = ({autoStart, offset} : TimerSettings) => {
    const {currentArticle, updateArticle} = useContext(ArticleContext);
    const [timetable, setTimetable]= useState<TimedArticle[]>([]);
    const tableRef = useRef<HTMLDivElement>(null);

    const {
        start,
        pause,
        reset,
        timeString
    } = useTimer({autoStart: autoStart, offset: offset});

    // Adding new articles to timetable when the context updates
    // switched to memo, effect ran twice but dep only changed once, could be strict mode
    const visibleTable = useMemo(()=>{
        if(!currentArticle) return [];

        const timestamp: TimedArticle = {time: timeString(), title: currentArticle.title, link: currentArticle.link};
        setTimetable((prevState) => [...prevState, timestamp]);
        tableRef.current?.scrollTo(0, tableRef.current.scrollHeight);

        return [...timetable, timestamp];
    },[updateArticle])

    return(
        <div className="my-timer flex flex-col">
            <div className="overflow-y-auto h-4/6 mx-2 w-full" ref={tableRef} style={{ scrollBehavior: "smooth" }}>
                <table className="table table-zebra table-compact">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Filling the table with article list + times */}
                    {visibleTable.map((item, index) => (
                        <tr key={index}>
                            <td>{item.title}</td>
                            <td>{item.time}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="rounded-2xl bg-base-300 m-2 p-2">
                <h1 className="text-2xl text-green-600 my-auto">{timeString()}</h1>
            </div>
        </div>
    );
};

export default Timer;