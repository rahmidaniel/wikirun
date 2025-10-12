import { Controller, Get, Query } from '@nestjs/common';

import { Article } from '@common/models';

import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  searchArticles(@Query('query') query: string): Promise<Article[]> {
    return this.searchService.searchArticle(query);
  }
}
