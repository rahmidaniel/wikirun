import { Component, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Article } from '@common';
import { AutoComplete } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { debounceTime, of, switchMap } from 'rxjs';

import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-article-search-box',
  imports: [AutoComplete, FloatLabel, FormsModule],
  host: { class: 'flex-grow' },
  templateUrl: './article-search-box.component.html',
})
export class ArticleSearchBoxComponent {
  private readonly apiService = inject(ApiService);

  readonly label = input<string | undefined>(undefined);
  readonly select = output<Article>();

  currentArticle: Article | undefined;

  query = signal<string>('');

  suggestions = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      switchMap((query) => (query ? this.apiService.searchArticles(query) : of([])))
    ),
    { initialValue: [] }
  );

  onSearch(query: string | undefined) {
    this.query.set(query!);
  }

  onSelect(article: Article) {
    if (article) {
      this.currentArticle = article;
      this.select.emit(article);
      this.query.set('');
    }
  }
}
