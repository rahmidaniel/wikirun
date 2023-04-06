
import {useTimer, TimerSettings} from "../utils/useTimer";

const Timer = ({autoStart, offset} : TimerSettings) => {
    const {
        start,
        pause,
        reset,
        timeString
    } = useTimer({autoStart: autoStart, offset: offset});

    function onSubmitSrch(e: MouseEvent) {
        e.preventDefault();
        // start game
    }

    return(
        <div className="my-timer flex flex-col justify-evenly items-center">
            <div className="">
                <button className="btn-success btn-wide btn-circle mx-4" onClick={start}>Start</button>
                <button className="btn-error" onClick={pause}>Stop</button>
            </div>
            <div>
                <p>{timeString()}</p>
            </div>

        </div>
    );
};

export default Timer;