import { Injectable, Logger } from '@nestjs/common';

import { Article, LinksResult, LinksResultReverse, PathResult } from '@common';

import { LinksService } from '../links/links.service';

@Injectable()
export class AlgorithmService {
  private readonly logger = new Logger(AlgorithmService.name);
  private readonly runningAlgorithms = new Map<string, Promise<PathResult>>();

  constructor(private readonly linksService: LinksService) {}

  startPathFinding(lobbyCode: string, startArticle: Article, endArticle: Article): Promise<PathResult> {
    this.logger.log(`Starting path finding for lobby ${lobbyCode}: ${startArticle.title} -> ${endArticle.title}`);

    const pathResult = this.findOptimalPath(startArticle, endArticle);
    this.runningAlgorithms.set(lobbyCode, pathResult);

    return pathResult;
  }

  async getResult(lobbyCode: string): Promise<PathResult | undefined> {
    let result: PathResult | undefined = undefined;
    const promise = this.runningAlgorithms.get(lobbyCode);
    if (!promise) {
      return undefined;
    }

    try {
      result = await promise;
    } catch (error) {
      this.logger.error(`Algorithm failed for lobby ${lobbyCode}:`, error);
    }

    this.runningAlgorithms.delete(lobbyCode);
    return result;
  }

  private async findOptimalPath(start: Article, end: Article): Promise<PathResult> {
    const startTime = Date.now();

    const articles = (await this.bidirectionalBFS(start.title, end.title)) ?? [];
    const result: PathResult = {
      articles,
      length: articles.length,
      time: Date.now() - startTime,
    };

    this.logger.log(`Path finding complete: ${result.length} articles in ${result.time}ms`);

    return result;
  }

  // Based on https://github.com/graphology/graphology/blob/master/src/shortest-path/unweighted.js
  private async bidirectionalBFS(source: string, target: string): Promise<string[] | null> {
    const startVisited = new Map<string, string | null>();
    const endVisited = new Map<string, string | null>();

    startVisited.set(source, null);
    endVisited.set(target, null);

    let startQueue: string[] = [source];
    let endQueue: string[] = [target];
    let tempQueue: string[];

    let found: string | null = null;

    outer: while (startQueue.length && endQueue.length) {
      if (startQueue.length <= endQueue.length) {
        tempQueue = startQueue;
        startQueue = [];

        for (const parentNode of tempQueue) {
          let continueValue: string | null = null;
          let hasMoreLinks = true;

          while (hasMoreLinks) {
            // eslint-disable-next-line no-await-in-loop
            const response = (await this.linksService.fetchLinksRaw(parentNode, false, continueValue)) as LinksResult;

            const batch = response.query?.pages?.[0]?.links?.map((page) => page.title) || [];
            continueValue = response.continue?.plcontinue ?? null;
            hasMoreLinks = !!continueValue;

            for (const neighbor of batch) {
              if (!startVisited.has(neighbor)) {
                startQueue.push(neighbor);
                startVisited.set(neighbor, parentNode);
              }

              if (endVisited.has(neighbor)) {
                found = neighbor;
                break outer;
              }
            }

            if (found) {
              break outer;
            }
          }
        }
      } else {
        tempQueue = endQueue;
        endQueue = [];

        for (const parentNode of tempQueue) {
          let continueValue: string | null = null;
          let hasMoreLinks = true;

          while (hasMoreLinks) {
            // eslint-disable-next-line no-await-in-loop
            const response = (await this.linksService.fetchLinksRaw(
              parentNode,
              true,
              continueValue
            )) as LinksResultReverse;

            const batch = response.query?.pages?.[0]?.linkshere?.map((page) => page.title) || [];
            continueValue = response.continue?.lhcontinue ?? null;
            hasMoreLinks = !!continueValue;

            for (const neighbor of batch) {
              if (!endVisited.has(neighbor)) {
                endQueue.push(neighbor);
                endVisited.set(neighbor, parentNode);
              }

              if (startVisited.has(neighbor)) {
                found = neighbor;
                break outer;
              }
            }

            if (found) {
              break outer;
            }
          }
        }
      }
    }

    // In case the loop ends (unlikely)
    if (!found) {
      return null;
    }

    const path: string[] = [];

    // Rebuilding the path, starting from the last found entry
    let pathIterator: string | null = found;

    // Build the start of the path
    while (pathIterator) {
      path.unshift(pathIterator);
      pathIterator = startVisited.get(pathIterator) as string | null;
    }

    // Get the last element of the end visited as a starting point
    pathIterator = endVisited.get(path[path.length - 1])!;

    // Build the end of the path
    while (pathIterator) {
      path.push(pathIterator);
      pathIterator = endVisited.get(pathIterator) as string | null;
    }

    return path.length ? path : null;
  }
}
