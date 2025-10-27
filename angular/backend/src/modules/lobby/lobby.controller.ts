import { Controller, Param, Post, HttpException, HttpStatus } from '@nestjs/common';

import type { LobbyResponse } from '@common/models';

import { LobbyService } from './lobby.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly service: LobbyService) {}

  @Post()
  createLobby(): LobbyResponse {
    return this.service.create();
  }

  @Post(':code/join')
  joinLobby(@Param('code') code: string): LobbyResponse {
    const lobby = this.service.join(code);
    if (!lobby) {
      throw new HttpException(
        'Failed to join lobby. Lobby may not exist or game already started.',
        HttpStatus.BAD_REQUEST
      );
    }
    return lobby;
  }
}
