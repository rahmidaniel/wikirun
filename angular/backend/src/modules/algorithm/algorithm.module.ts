import { Module } from '@nestjs/common';

import { AlgorithmService } from './algorithm.service';
import { LinksService } from '../links/links.service';

@Module({
  providers: [AlgorithmService, LinksService],
})
export class AlgorithmModule {}
