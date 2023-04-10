import {useWikiSearch} from "../utils/wikipediaApi";
import {useState} from "react";
import {Autocomplete, FormControl, FormLabel} from "@mui/joy";
import {Article} from "../utils/ArticleContext";

const ArticleInput = (prop: {label: string, onSelect: (selected: Article)=>void}) => {
    const [query, setQuery] = useState('');
    const [value, setValue] = useState('');
    const matches = useWikiSearch(query);

    return(
        <div className="form-control">
            <div className="input-group">
                <label className="label">
                    <span className="label-text">{prop.label}</span>
                </label>
                <select className="select select-bordered">
                    <option disabled selected>Search..</option>
                    <option>T-shirts</option>
                    <option>Mugs</option>
                </select>
                <button className="btn">Go</button>
            </div>
        </div>
            // <FormControl>
            //     <FormLabel>{prop.label}</FormLabel>
            //      {/*todo: daisy ui style dropdown again*/}
            //     <Autocomplete
            //         placeholder="Select an article..."
            //         value={value}
            //         onChange={(event, newValue) => {
            //             prop.onSelect(newValue);
            //             console.log(newValue);
            //             setValue(newValue.title);
            //         }}
            //         isOptionEqualToValue={(option, value) => option.title === value.title}
            //         inputValue={query}
            //         onInputChange={(event, newInput) => {setQuery(newInput);}}
            //         getOptionLabel={option => option.title}
            //         options={matches}
            //         sx={{ width: 300 }}
            //     />
            // </FormControl>
    );
}

export default ArticleInput;