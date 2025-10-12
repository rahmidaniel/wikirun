import { Component, contentChild, effect, ElementRef, inject, signal, untracked } from '@angular/core';

import { AppState } from '@common/models';

import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-article-viewer',
  imports: [],
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.css',
})
export class ArticleViewerComponent {
  protected readonly gameStateService = inject(GameStateService);
  private readonly articleRef = contentChild<ElementRef<HTMLDivElement>>('articleRef');

  isLoading = signal(false);

  scrollToTop(): void {
    this.articleRef()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  private handleClick = (event: MouseEvent) => {
    event.preventDefault();
    if (event.target instanceof HTMLAnchorElement) {
      // substring(6) : /wiki/Article => Article
      this.isLoading.set(true);
      this.gameStateService.updateArticle({ title: event.target.title, link: event.target.pathname.substring(6) });
    }
  };

  constructor() {
    effect((onCleanup) => {
      const html = this.gameStateService.currentArticleResult();
      if (!html || !this.articleRef()) {
        console.error(
          `DEBUG: Article [${html?.title}] ref is ${this.articleRef()?.nativeElement ? 'defined' : 'undefined'}`
        );
        return;
      }
      this.isLoading.set(true);
      const wikiRef = this.articleRef()!;
      // References, Portals and other wikipedia elements
      wikiRef.nativeElement.querySelector('#References')?.parentElement?.remove(); // todo: remove parent too
      wikiRef.nativeElement
        .querySelectorAll('.reference, .reflist, .plainlinks, .portalbox, .noprint')
        .forEach((element) => {
          element.remove();
        });

      // Attaching event listeners to all links
      const links = wikiRef.nativeElement.querySelectorAll('a');
      links?.forEach((link) => {
        link.addEventListener('click', this.handleClick);
      });

      this.scrollToTop();
      this.isLoading.set(false);

      // Should stay blurred if ended
      if (untracked(this.gameStateService.state) === AppState.ENDED) {
        this.isLoading.set(true);
      }

      // Removing listeners on dismount
      onCleanup(() => {
        links?.forEach((link) => {
          link.removeEventListener('click', this.handleClick);
        });
      });
    });
  }
}
