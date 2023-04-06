import ArticleInput from "./ArticleInput";

// inspired by https://reacthustle.com/blog/how-to-implement-a-react-autocomplete-input-using-daisyui

const SearchBar = () => {
    return(
        <div className="flex-col mx-auto">
            <ArticleInput label={"Starting Article"}/>
            <ArticleInput label={"Ending Article"}/>
        </div>
    )
}

export default SearchBar;