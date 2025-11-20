import { Component, effect, ElementRef, inject, signal, viewChild, ViewEncapsulation } from '@angular/core';

import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ArticleViewerComponent {
  protected readonly gameStateService = inject(GameStateService);
  private readonly articleRef = viewChild<ElementRef<HTMLDivElement>>('articleRef');

  isLoading = signal(false);

  scrollToTop(): void {
    this.articleRef()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  private handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.target instanceof HTMLAnchorElement && !this.isLoading()) {
      // substring(6) : /wiki/Article => Article
      this.gameStateService.updateArticle({ title: event.target.title, link: event.target.pathname.substring(6) });

      this.isLoading.set(true);
    }
  };

  constructor() {
    effect((onCleanup) => {
      const html = this.gameStateService.currentArticleResult();
      const wikiRef = this.articleRef();

      if (!html || !wikiRef) {
        return;
      }

      setTimeout(() => {
        if (!wikiRef) {
          return;
        }

        wikiRef.nativeElement.querySelector('#References')?.parentElement?.remove();
        wikiRef.nativeElement
          .querySelectorAll('.reference, .reflist, .plainlinks, .portalbox, .noprint')
          .forEach((element) => {
            element.remove();
          });

        const links = wikiRef.nativeElement.querySelectorAll('a');
        links?.forEach((link) => {
          link.addEventListener('click', this.handleClick);
        });

        this.isLoading.set(false);
        this.scrollToTop();

        onCleanup(() => {
          links?.forEach((link) => {
            link.removeEventListener('click', this.handleClick);
          });
        });
      }, 0);
    });
  }
}
