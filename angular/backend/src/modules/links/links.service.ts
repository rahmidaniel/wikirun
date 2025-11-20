import { Injectable } from '@nestjs/common';

import { LinksResponse, LinksResult, LinksResultReverse } from '@common/models';

import { wikiFetch } from '../../utils/wiki-fetch.function';

@Injectable()
export class LinksService {
  async fetchLinks(pageTitle: string, reverse = false): Promise<LinksResponse> {
    const result: LinksResponse = { links: [], continueValue: null };
    let moreLinks = true;

    let continueValue: string | null = null;

    while (moreLinks) {
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

        if (!response) {
          break;
        }

        const batch: string[] = [];
        if (reverse) {
          const queryResult = response as LinksResultReverse;
          batch.push(...queryResult.query.pages[0].linkshere.map((page) => page.title));
          continueValue = queryResult.continue !== undefined ? queryResult.continue.lhcontinue : null;
        } else {
          const queryResult = response as LinksResult;
          batch.push(...queryResult.query.pages[0].links.map((page) => page.title));
          continueValue = queryResult.continue !== undefined ? queryResult.continue.plcontinue : null;
        }

        moreLinks = !!continueValue;

        result.links.push(...batch);
      } catch (error) {
        console.error(`Error fetching links for ${pageTitle}:`, error);
        moreLinks = false;
      }
    }

    return result;
  }

  async fetchLinksRaw(
    pageTitle: string,
    reverse = false,
    continueValue: string | null = null
  ): Promise<LinksResult | LinksResultReverse> {
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

    return wikiFetch<LinksResultReverse | LinksResult>(params);
  }
}
