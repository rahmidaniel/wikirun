
import {useTimer, TimerSettings} from "../utils/useTimer";
import {useContext} from "react";
import {ArticleContext} from "../utils/ArticleContext";

const Timer = ({autoStart, offset} : TimerSettings) => {
    const prop = useContext(ArticleContext);
    const {
        start,
        pause,
        reset,
        timeString
    } = useTimer({autoStart: autoStart, offset: offset});

    const onSubmitSrch = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // start game
        const startname = 'Flax'
        prop.updateArticle({title: startname, link: startname});
    }

    return(
        <div className="my-timer flex flex-col justify-evenly items-center">
            <div>
                <p>{timeString()}</p>
            </div>
        </div>
    );
};

export default Timer;