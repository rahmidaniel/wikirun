import { Injectable } from '@nestjs/common';

import { LinksResponse, LinksResult, LinksResultReverse } from '@common/models';

import { wikiFetch } from '../../utils/wiki-fetch.function';

@Injectable()
export class LinksService {
  async fetchLinks(pageTitle: string, reverse = false, continueValue: string | null = null): Promise<LinksResponse> {
    const result: LinksResponse = { links: [], continueValue: null };

    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      origin: '*',
      redirects: 'true',
      titles: decodeURIComponent(pageTitle),
      ...(reverse
        ? { prop: 'linkshere', lhlimit: 'max', lhnamespace: '0' }
        : { prop: 'links', pllimit: 'max', plnamespace: '0' }),
      ...(continueValue ? { [reverse ? 'lhcontinue' : 'plcontinue']: continueValue } : {}),
    });

    try {
      const response = await wikiFetch<LinksResultReverse | LinksResult>(params);

      if (reverse) {
        const queryResult = response as LinksResultReverse;
        result.links.push(...queryResult.query.pages[0].linkshere.map((page) => page.title));
        result.continueValue = queryResult.continue !== undefined ? queryResult.continue.lhcontinue : null;
      } else {
        const queryResult = response as LinksResult;
        result.links.push(...queryResult.query.pages[0].links.map((page) => page.title));
        result.continueValue = queryResult.continue !== undefined ? queryResult.continue.plcontinue : null;
      }
    } catch (error) {
      console.error('Error in query:', pageTitle, error);
    }

    return result;
  }
}
