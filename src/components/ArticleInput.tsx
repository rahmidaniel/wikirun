import {searchPair, useWikiSearch} from "../utils/wikipediaApi";
import {useContext, useState} from "react";
import {Autocomplete, FormControl, FormLabel} from "@mui/joy";
import {ArticleContext} from "./App";

const ArticleInput = (prop: {label: string}) => {
    const articleContext = useContext(ArticleContext);

    const [query, setQuery] = useState('');
    const [link, setLink] = useState<searchPair | null>();

    const { matches } = useWikiSearch(query);

    return(
            <FormControl>
                <FormLabel>{prop.label}</FormLabel>
                <Autocomplete
                    placeholder="Select an article..."
                    value={link}
                    onChange={(event, newValue) => {setLink(newValue);}}
                    isOptionEqualToValue={(option, value) => option.title === value.title}
                    inputValue={query}
                    onInputChange={(event, newInput) => {setQuery(newInput);}}
                    getOptionLabel={option => option.title}
                    options={matches}
                    sx={{ width: 300 }}
                />
            </FormControl>
    );
}

export default ArticleInput;