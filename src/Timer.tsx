
import {useTimer, TimerSettings} from "./utils/useTimer";

const Timer = ({autoStart, offset} : TimerSettings) => {
    const {
        start,
        pause,
        reset,
        timeString
    } = useTimer({autoStart: autoStart, offset: offset});


    return(
        <div className="my-timer flex flex-col justify-evenly items-center">
            <div className="">
                <button className="btn-success btn-wide btn-circle mx-4" onClick={start}>Start</button>
                <button className="btn-error" onClick={pause}>Stop</button>
            </div>
            <div>
                <p>{timeString()}</p>
            </div>
            <div>
                {/*<span className="countdown font-mono text-2xl">*/}
                {/*    <span style={*/}
                {/*        // @ts-ignore;*/}
                {/*        {"--value":toDate().getHours()}}>*/}
                {/*    </span>h*/}
                {/*    <span style={*/}
                {/*      // @ts-ignore;*/}
                {/*      {"--value":toDate().getMinutes()}}>*/}

                {/*    </span>m*/}
                {/*    <span style={*/}
                {/*      // @ts-ignore;*/}
                {/*      {"--value":toDate().getSeconds()}}>*/}
                {/*    </span>s*/}
                {/*    <span style={*/}
                {/*        // @ts-ignore;*/}
                {/*        {"--value":toDate().getMilliseconds()}}>*/}
                {/*  </span>ms*/}
                {/*</span>*/}
            </div>

            <div className="form-control">
                <div className="input-group">
                    <input type="text" placeholder="Search…" className="input input-bordered" />
                    <button className="btn btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Timer;