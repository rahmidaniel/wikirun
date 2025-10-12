import { Link } from './link.interface';

type PageReverse = { pageid: number; linkshere: Link[] } & Link;

export interface LinksResultReverse {
  continue?: {
    lhcontinue: string;
    continue: string;
  };
  query: {
    pages: PageReverse[];
  };
}
