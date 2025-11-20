import { Module } from '@nestjs/common';

import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { AlgorithmService } from '../algorithm/algorithm.service';
import { DBService } from '../db/db.service';
import { LinksService } from '../links/links.service';
import { GameGateway } from '../socket/game.gateway';

@Module({
  controllers: [LobbyController],
  providers: [LobbyService, DBService, AlgorithmService, LinksService, GameGateway],
})
export class LobbyModule {}
