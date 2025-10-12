import { Controller, Get, Query } from '@nestjs/common';

import { ArticleResult } from '@common/models';

import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getArticleByTitle(@Query('pageTitle') pageTitle: string): Promise<ArticleResult> {
    return this.articleService.fetchArticle(pageTitle);
  }
}
