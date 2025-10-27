import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Article, ArticleResult, LinksResponse, LobbyResponse } from '@common';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createLobby(): Observable<LobbyResponse> {
    return this.http.post<LobbyResponse>(`${this.baseUrl}/lobby`, {});
  }

  joinLobby(code: string): Observable<LobbyResponse> {
    return this.http.post<LobbyResponse>(`${this.baseUrl}/lobby/${code}/join`, {});
  }

  /**
   * Fetch an article by its title
   * @param pageTitle - The title of the Wikipedia page
   * @returns Observable of Article
   */
  getArticle(pageTitle: string): Observable<ArticleResult> {
    const params = new HttpParams().set('pageTitle', pageTitle);
    return this.http.get<ArticleResult>(`${this.baseUrl}/article`, { params });
  }

  /**
   * Fetch links from a Wikipedia page
   * @param pageTitle - The title of the Wikipedia page
   * @param reverse - Whether to fetch backlinks (pages linking to this page)
   * @param continueValue - Optional continuation token for pagination
   * @returns Observable of LinksResponse
   */
  getLinks(pageTitle: string, reverse: boolean, continueValue?: string | null): Observable<LinksResponse> {
    let params = new HttpParams().set('pageTitle', pageTitle).set('reverse', String(reverse));

    if (continueValue) {
      params = params.set('continueValue', continueValue);
    }

    return this.http.get<LinksResponse>(`${this.baseUrl}/links`, { params });
  }

  /**
   * Search for articles by query string
   * @param query - The search query
   * @returns Observable of an Article array
   */
  searchArticles(query: string): Observable<Article[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Article[]>(`${this.baseUrl}/search`, { params });
  }
}
