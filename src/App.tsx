import SideBar from "./SideBar";
import WikiArticle from "./WikiArticle";
import NavBar from "./NavBar";

function App() {
    return (
        <div className="app">
            <NavBar/>
            <div className="flex flex-grow cont">
                <SideBar/>
                <WikiArticle/>
            </div>
        </div>
    );
}

export default App
