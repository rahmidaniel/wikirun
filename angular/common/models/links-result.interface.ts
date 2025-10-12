import { Link } from './link.interface';

type Page = { pageid: number; links: Link[] } & Link;

export interface LinksResult {
  continue?: {
    plcontinue: string;
    continue: string;
  };
  query: {
    pages: Page[];
  };
}
