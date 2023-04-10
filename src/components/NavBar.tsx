import {useEffect, useState} from "react";
import { themeIsDark } from '../utils/themeUtils'
import { themeChange } from 'theme-change'
import theme from "tailwindcss/defaultTheme";
import {MoonIcon, SunIcon} from "@heroicons/react/20/solid";
const NavBar = () => {
    const [isDark, setDark] = useState(themeIsDark);

    useEffect(()=>{
        themeChange(false)
    }, [])

    const toggle = () => {
        setDark(!isDark);
        // todo: this should work the other way around, no idea
        localStorage.setItem('theme', isDark ? "light" : "dark");
    }

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    return(
        <div className="my-navbar">
            <div className="flex-1">
                <a className="btn btn-ghost normal-case text-xl" href="">Wikipedia Speedrun a babiromnak</a>
            </div>
            <label className="swap swap-rotate">
                <input type="checkbox" data-toggle-theme="dark,light" data-act-class="ACTIVECLASS" onChange={toggle}/>
                <SunIcon className={`swap-off fill-current w-10 h-10`}/>
                <MoonIcon className={`swap-on fill-current w-10 h-10`}/>
            </label>
        </div>
    )
}

export default NavBar;