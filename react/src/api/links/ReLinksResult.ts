import {Link} from "./Link";

type RePage = {
    pageid: number
    linkshere: Link[]
} & Link;

export type ReLinksResult = {
    continue?: {
        lhcontinue: string,
        continue: string
    }
    query: {
        pages: RePage[]
    }
}