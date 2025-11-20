import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Article, ArticleResult, LinksResponse, LobbyResponse } from '@common';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  createLobby(): Observable<LobbyResponse> {
    return this.http.post<LobbyResponse>(`${this.baseUrl}/lobby`, {});
  }

  joinLobby(code: string): Observable<LobbyResponse> {
    return this.http.post<LobbyResponse>(`${this.baseUrl}/lobby/${code}/join`, {});
  }

  getArticle(pageTitle: string): Observable<ArticleResult> {
    const params = new HttpParams().set('pageTitle', pageTitle);
    return this.http.get<ArticleResult>(`${this.baseUrl}/article`, { params });
  }

  getLinks(pageTitle: string, reverse: boolean, continueValue?: string | null): Observable<LinksResponse> {
    let params = new HttpParams().set('pageTitle', pageTitle).set('reverse', String(reverse));

    if (continueValue) {
      params = params.set('continueValue', continueValue);
    }

    return this.http.get<LinksResponse>(`${this.baseUrl}/links`, { params });
  }

  searchArticles(query: string): Observable<Article[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Article[]>(`${this.baseUrl}/search`, { params });
  }
}
