import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlgorithmModule } from './modules/algorithm/algorithm.module';
import { ArticleModule } from './modules/article/article.module';
import { LinksModule } from './modules/links/links.module';
import { LobbyModule } from './modules/lobby/lobby.module';
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
    LobbyModule,
    AlgorithmModule,
  ],
})
export class AppModule {}
