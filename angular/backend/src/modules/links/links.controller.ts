import { Controller, Get, Query } from '@nestjs/common';

import { LinksResponse } from '@common/models';

import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  fetchLinks(
    @Query('pageTitle') pageTitle: string,
    @Query('reverse') reverse: boolean,
    @Query('continueValue') continueValue: string | null = null
  ): Promise<LinksResponse> {
    return this.linksService.fetchLinks(pageTitle, reverse, continueValue);
  }
  // todo need to use loop on frontend to get data
}
