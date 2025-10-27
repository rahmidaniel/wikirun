import { Module } from '@nestjs/common';

import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { DBService } from '../db/db.service';
import { GameGateway } from '../socket/game.gateway';

@Module({
  controllers: [LobbyController],
  providers: [LobbyService, DBService, GameGateway],
})
export class LobbyModule {}
