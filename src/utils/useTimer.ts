import {useEffect, useState} from "react";

export interface TimerResult {
    time: number,
    state: TimerState,
    start: () => void,
    pause: () => void,
    reset: () => void,
    timeString: () => string;
}

export enum TimerState {
    PAUSED,
    ON,
    OFF
}

export const useTimer = (): TimerResult => {
    const [time, setTime] = useState(0)
    const [state, setState] = useState(TimerState.ON)

    // Switched from useRef to useEffect
    useEffect(()=>{
        let interval: NodeJS.Timer | undefined;

        switch (state) {
            case TimerState.ON:
                interval = setInterval(() => {
                    setTime((time) => time + 10)
                }, 10)
                break;
            case TimerState.PAUSED:
                clearInterval(interval);
                break;
            case TimerState.OFF:
                clearInterval(interval);
                setTime(0)
                break;
        }

        // Cleanup interval on dismount
        return () => clearInterval(interval);
    }, [state])

    const start = () => { setState(TimerState.ON) }
    const pause = () => { setState(TimerState.PAUSED) }
    const reset = () => { setState(TimerState.OFF) }

    const timeString = (): string => {
        const date = new Date(time);
        const timeStrings = [date.getMinutes(), date.getSeconds(), date.getMilliseconds().toString().slice(0,-1)].map(e => e.toString().padStart(2,'0'));
        return timeStrings[0] + ":" + timeStrings[1] + "." + timeStrings[2];
    }

    return { time, state, start, pause, reset, timeString }
}