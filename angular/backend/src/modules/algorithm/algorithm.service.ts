import { Injectable, Logger } from '@nestjs/common';

import { Article } from '@common';

import { LinksService } from '../links/links.service';

export interface PathResult {
  articles: string[];
  length: number;
  executionTime: number;
}

@Injectable()
export class AlgorithmService {
  private readonly logger = new Logger(AlgorithmService.name);
  private readonly runningAlgorithms = new Map<string, Promise<PathResult>>();

  constructor(private readonly linksService: LinksService) {}

  startPathFinding(lobbyCode: string, startArticle: Article, endArticle: Article): Promise<PathResult> {
    this.logger.log(`Starting path finding for lobby ${lobbyCode}: ${startArticle.title} -> ${endArticle.title}`);

    const promise = this.findOptimalPath(startArticle, endArticle);
    this.runningAlgorithms.set(lobbyCode, promise);

    return promise;
  }

  async getResult(lobbyCode: string): Promise<PathResult | undefined> {
    const promise = this.runningAlgorithms.get(lobbyCode);
    if (!promise) {
      return undefined;
    }

    try {
      const result = await promise;
      this.runningAlgorithms.delete(lobbyCode);
      return result;
    } catch (error) {
      this.logger.error(`Algorithm failed for lobby ${lobbyCode}:`, error);
      this.runningAlgorithms.delete(lobbyCode);
      return undefined;
    }
  }

  cancelPathFinding(lobbyCode: string): void {
    this.runningAlgorithms.delete(lobbyCode);
    this.logger.log(`Cancelled path finding for lobby ${lobbyCode}`);
  }

  private async findOptimalPath(start: Article, end: Article): Promise<PathResult> {
    const startTime = Date.now();

    // TODO: Implement bidirectional BFS
    // This is a placeholder structure

    const result: PathResult = {
      articles: [start.title, '...intermediate articles...', end.title],
      length: 3,
      executionTime: Date.now() - startTime,
    };

    this.logger.log(`Path finding complete: ${result.length} articles in ${result.executionTime}ms`);

    return result;

    // Real implementation would:
    // 1. Start BFS from both start and end
    // 2. Use this.linksService.fetchLinks() to get neighbors
    // 3. Track visited nodes from each direction
    // 4. Stop when paths meet
    // 5. Reconstruct the path
  }

  private async getNeighbors(articleTitle: string): Promise<string[]> {
    const response = await this.linksService.fetchLinks(articleTitle, false);
    return response.links;
  }

  private async getReverseNeighbors(articleTitle: string): Promise<string[]> {
    const response = await this.linksService.fetchLinks(articleTitle, true);
    return response.links;
  }
}
