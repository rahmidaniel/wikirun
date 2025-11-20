import { Injectable } from '@nestjs/common';

import { Article } from '@common/models';

import { wikiFetch } from '../../utils/wiki-fetch.function';

@Injectable()
export class SearchService {
  async searchArticle(query: string): Promise<Article[]> {
    const params = new URLSearchParams({
      action: 'opensearch',
      origin: '*',
      search: query?.trim(),
      limit: '5',
      namespace: '0',
      redirects: 'resolve',
    });
    const data = await wikiFetch<(string | string[])[]>(params);

    const articles: Article[] = [];

    for (let i = 0; i < data[1]?.length; i++) {
      // https://en.wikipedia.org/wiki/ASD => 30 chars not needed from the start
      articles.push({ title: data[1][i], link: data[3][i].substring(30) });
    }

    return articles;
  }
}
