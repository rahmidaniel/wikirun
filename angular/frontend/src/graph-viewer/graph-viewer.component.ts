import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, effect, ElementRef, inject, signal, untracked, viewChild } from '@angular/core';

import { Player, TimedArticle } from '@common/models';

import chroma from 'chroma-js';
import Graph from 'graphology';
import { ForceAtlas2Settings } from 'graphology-layout-forceatlas2';
import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
import AbstractGraph from 'graphology-types';
import Sigma from 'sigma';

import { ApiService } from '../shared/services/api.service';
import { GameStateService } from '../shared/services/game-state.service';
import { LobbyService } from '../shared/services/lobby.service';
import { baseColor, baseSize } from '../shared/utils/graph/graphDefaults';
import { handleClick } from '../shared/utils/graph/handleClick';
import { handleDragNDrop } from '../shared/utils/graph/handleDragNDrop';

@Component({
  selector: 'app-graph-viewer',
  imports: [NgTemplateOutlet, DatePipe],
  templateUrl: './graph-viewer.component.html',
})
export class GraphViewerComponent {
  private readonly apiService = inject(ApiService);
  readonly gameStateService = inject(GameStateService);
  readonly lobbyService = inject(LobbyService);
  readonly graph = new Graph({ multi: true, allowSelfLoops: true });

  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('containerRef');
  private renderer = signal<Sigma<AbstractGraph> | null>(null);
  private layout = signal<FA2LayoutSupervisor | null>(null);
  private graphUpdateTrigger = signal(0);

  simRunning = signal(true);
  fa2Settings = signal<ForceAtlas2Settings>({
    adjustSizes: true,
    outboundAttractionDistribution: true,
    gravity: 1,
    slowDown: 20,
  });
  currentSettings = signal<ForceAtlas2Settings>(this.fa2Settings());

  constructor() {
    effect(() => {
      const playerHistories = this.gameStateService.playerArticleHistories();
      const optimalPath = this.gameStateService.optimalPath();
      const players = this.lobbyService.players();

      if (playerHistories.size === 0 && !optimalPath?.articles) {
        return;
      }

      this.updateGraph(playerHistories, players, optimalPath!.articles);
      this.graphUpdateTrigger.update((v) => v + 1);
    });

    effect((onCleanup) => {
      const _updateTrigger = this.graphUpdateTrigger();
      const settings = this.fa2Settings();

      const container = this.containerRef();

      if (!container || this.graph.order === 0) {
        return;
      }

      let rendererInstance: Sigma | null = null;
      let layoutInstance: FA2LayoutSupervisor | null = null;
      try {
        layoutInstance = new FA2LayoutSupervisor(this.graph, { settings });
        rendererInstance = new Sigma(this.graph, container.nativeElement, { allowInvalidContainer: true });

        layoutInstance.start();
        if (!untracked(() => this.simRunning())) {
          layoutInstance.stop();
        }

        const oldRenderer = untracked(() => this.renderer());
        if (oldRenderer) {
          rendererInstance.getCamera().setState(oldRenderer.getCamera().getState());
        }

        untracked(() => {
          this.layout.set(layoutInstance);
          this.renderer.set(rendererInstance as any);
        });
      } catch (error) {
        console.error('Error creating graph renderer/layout:', error);
      }

      onCleanup(() => {
        rendererInstance?.removeAllListeners();
        layoutInstance?.kill();
        rendererInstance?.kill();

        untracked(() => {
          this.layout.set(null);
          this.renderer.set(null);
        });
      });
    });

    effect(() => {
      const layout = this.layout();
      const simRunning = this.simRunning();

      if (!layout) {
        return;
      }

      if (simRunning && !layout.isRunning()) {
        layout.start();
      } else if (!simRunning) {
        layout.stop();
      }
    });

    effect(() => {
      const renderer = this.renderer();
      const layout = this.layout();
      const graph = this.graph;

      if (!renderer || !layout) {
        return;
      }

      handleDragNDrop(renderer, graph, layout, () => this.simRunning());
      handleClick(this.apiService.getLinks.bind(this.apiService), renderer, graph);
    });
  }

  toggleSimRunning() {
    this.simRunning.update((v) => !v);
  }

  handleFA2ParamChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    this.currentSettings.update((settings) => ({ ...settings, [name]: type === 'checkbox' ? checked : Number(value) }));
  };

  private updateGraph(
    playerHistories: Map<string, TimedArticle[]>,
    players: Player[],
    optimalPathArticles: string[]
  ): void {
    const yOffset = 1000;
    const xOffset = 2000;

    const startArticle = this.gameStateService.startArticle()!;
    const endArticle = this.gameStateService.endArticle()!;

    [...playerHistories.entries()].forEach(([playerId, history], playerIndex) => {
      const player = players.find((p) => p.id === playerId)!;
      const playerFinished = history.at(-1)?.title === endArticle.title;

      for (let i = 0; i < history.length; i++) {
        const article = history[i];

        let x: number;
        if (article.title === startArticle.title) {
          x = 0;
        } else if (article.title === endArticle.title && playerFinished) {
          x = xOffset * (optimalPathArticles.length - 1);
        } else {
          x = xOffset * i;
        }

        this.graph.mergeNode(article.title, {
          reverse: false,
          depth: i,
          loaded: false,
          label: article.title,
          size: baseSize,
          color: chroma(player.color).hex('rgba'),
          x,
          y: yOffset * (playerIndex + 1),
        });
        if (i > 0) {
          this.graph.mergeEdge(history[i - 1].title, article.title, {
            color: chroma(player.color).alpha(0.8).hex('rgba'),
            type: 'arrow',
            size: 5,
            zIndex: 50,
          });
        }
      }
    });

    for (let i = 0; i < optimalPathArticles.length; i++) {
      const articleTitle = optimalPathArticles[i];

      this.graph.mergeNode(articleTitle, {
        reverse: false,
        depth: i,
        loaded: false,
        label: articleTitle,
        size: baseSize,
        color: baseColor,
        x: xOffset * i,
        y: 0,
      });
      if (i > 0) {
        this.graph.mergeEdge(optimalPathArticles[i - 1], articleTitle, {
          color: chroma(baseColor).alpha(0.8).hex('rgba'),
          size: 5,
          type: 'arrow',
          zIndex: 60,
        });
      }
    }
  }
}
