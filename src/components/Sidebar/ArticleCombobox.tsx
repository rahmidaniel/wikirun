import {useWikiSearch} from "../../api/searchHook/useWikiSearch";
import {Fragment, useState} from "react";
import {Combobox, Transition} from "@headlessui/react";
import {Article} from "../../Types/Article";

const ArticleCombobox = (prop: {label: string, onSelect: (selected: Article)=>void}) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Article>({link: "", title: ""});
    const matches = useWikiSearch(query);

    return(
        <div className="w-5/6 mx-auto my-2 text">
            {/*needed 2 divs, dropdown messed with the width*/}
            <div className="dropdown">

                <Combobox value={selected} onChange={(value)=>
                        { setSelected(value); if(value.title !== "") prop.onSelect(value); }
                    }>
                        <Combobox.Input
                            className={`input input-bordered w-full 
                                ${selected.title && selected.title !== "" ? "input-success": "input-warning"}`
                            }
                            onChange={(event) => setQuery(event.target.value)}
                            displayValue={(article: Article) => article.title}/>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options
                            className="menu dropdown-content mx-auto my-0 px-2 shadow-2xl bg-base-200 rounded-box overflow-y-auto">
                            {matches.map((article, index) => (
                                <Combobox.Option key={index} value={article}
                                     className={({ active }) => `rounded-box p-2 ${active ? 'bg-primary' : ''}`}>
                                    {article.title}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Transition>
                </Combobox>
                </div>
            </div>
    );
}

export default ArticleCombobox;