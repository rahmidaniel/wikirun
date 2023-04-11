import {useWikiSearch} from "../utils/wikipediaApi";
import {useState} from "react";
import {Article} from "../utils/ArticleContext";
import {Combobox} from "@headlessui/react";

const ArticleInput = (prop: {label: string, onSelect: (selected: Article)=>void}) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Article>({link: "", title: ""});
    const matches = useWikiSearch(query);

    return(
        <Combobox value={selected}
                  onChange={(value)=> {
                      setSelected(value);
                      if(value.title !== "") prop.onSelect(value);
                  }}>
            <Combobox.Input onChange={(event) => setQuery(event.target.value)}
                            displayValue={(article: Article) => article.title}/>
            <Combobox.Options>
                {matches.map((article, index) => (
                    <Combobox.Option key={index} value={article}>
                        {article.title}
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </Combobox>
    );
}

export default ArticleInput;