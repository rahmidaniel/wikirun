import { Module } from '@nestjs/common';

import { GameGateway } from './game.gateway';
import { DBService } from '../db/db.service';
import { LobbyService } from '../lobby/lobby.service';

@Module({
  providers: [LobbyService, DBService, GameGateway],
})
export class LobbyModule {}
