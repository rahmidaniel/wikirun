import { Injectable } from '@nestjs/common';

import { ArticleResult } from '@common/models';

import { wikiFetch } from '../../utils/wiki-fetch.function';

@Injectable()
export class ArticleService {
  async fetchArticle(pageTitle: string): Promise<ArticleResult> {
    const params = new URLSearchParams({
      action: 'parse',
      format: 'json',
      page: decodeURIComponent(pageTitle),
      disableeditsection: 'true',
      disabletoc: 'true',
      useskin: 'modern',
      redirects: 'true',
      origin: '*',
    });
    const data = await wikiFetch<{ parse: { title: string; text: { '*': string } } }>(params);
    // todo check keepalive option later for crawling links

    return { title: data.parse.title, link: pageTitle, html: data.parse.text['*'] };
  }
}
