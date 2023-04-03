
// Gives you a continuously updating timestamp.
// Note this triggers a render on every frame.
import {useRef, useState} from "react";

export interface TimerSettings{
    offset?: number,
    autoStart?: boolean;
}

export interface TimerResult {
    timer: number,
    isActive: boolean,
    isPaused: boolean,
    start: () => void,
    pause: () => void,
    reset: (settings?: TimerSettings) => void,
    timeString: () => string;
}

export const useTimer = (settings?: TimerSettings) => {
    const [timer, setTimer] = useState(settings?.offset ? settings.offset : 0)
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const n: number | null = 0;
    const countRef = useRef(n)

    const start = () => {
        if(isActive && !isPaused) return;

        setIsActive(true)
        setIsPaused(false)
        if(countRef) countRef.current = setInterval(() => {
            setTimer((timer) => timer + 10)
        }, 10)
    }



    const pause = () => {
        clearInterval(countRef.current)
        setIsPaused(true)
    }

    const reset = (settings?: TimerSettings) => {
        clearInterval(countRef.current)
        setIsPaused(false)
        settings?.autoStart ? setIsActive(true) : setIsActive(false)
        settings?.offset ? setTimer(settings.offset) : setTimer(0);
    }

    const timeString = (): string => {
        const date = new Date(timer);
        return [date.getMinutes(), date.getSeconds(), date.getMilliseconds().toString().slice(0,-1)].map(e => e.toString().padStart(2,'0')).join(':')
    }

    return { start, pause, reset, timeString }
}