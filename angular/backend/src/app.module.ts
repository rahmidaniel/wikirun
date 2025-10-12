import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ArticleModule } from './modules/article/article.module';
import { LinksModule } from './modules/links/links.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    ArticleModule,
    SearchModule,
    LinksModule,
  ],
})
export class AppModule {}
