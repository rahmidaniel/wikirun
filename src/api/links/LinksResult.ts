import {Link} from "./Link";

type Page = {
    pageid: number
    links: Link[]
} & Link;

export type LinksResult = {
    continue?: {
        plcontinue: string,
        continue: string
    }
    query: {
        pages: Page[]
    }
}