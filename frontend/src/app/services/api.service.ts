import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  private catalogCache$: Observable<any> | null = null;
  private customersCache$: Observable<any[]> | null = null;
  private discountsCache$: Observable<any> | null = null;
  private storesCache$: Observable<any> | null = null;
  private usersCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) {}

  private getStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  }

  loginPassword(email: string, motDePasse: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, motDePasse }).pipe(
      tap((res) => {
        if (res.token) {
          this.setStorageItem('kaloes_token', res.token);
          this.setStorageItem('kaloes_user', JSON.stringify(res.user));
          this.clearAllCaches();
        }
      })
    );
  }

  logout(): void {
    this.removeStorageItem('kaloes_token');
    this.removeStorageItem('kaloes_user');
    this.clearAllCaches();
  }

  getCurrentUser(): any {
    const userStr = this.getStorageItem('kaloes_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getStorageItem('kaloes_token');
  }

  clearAllCaches(): void {
    this.catalogCache$ = null;
    this.customersCache$ = null;
    this.discountsCache$ = null;
    this.storesCache$ = null;
    this.usersCache$ = null;
  }

  getPosCatalog(magasinId?: string): Observable<any> {
    const url = magasinId 
      ? `${this.apiUrl}/pos/catalog?magasinId=${magasinId}` 
      : `${this.apiUrl}/pos/catalog`;
    if (!this.catalogCache$ || magasinId) {
      const req = this.http.get<any>(url).pipe(shareReplay(1));
      if (!magasinId) this.catalogCache$ = req;
      return req;
    }
    return this.catalogCache$;
  }

  getDiscounts(): Observable<any> {
    if (!this.discountsCache$) {
      this.discountsCache$ = this.http.get<any>(`${this.apiUrl}/pos/discounts`).pipe(shareReplay(1));
    }
    return this.discountsCache$;
  }

  getCustomers(): Observable<any> {
    return this.getCustomersList();
  }

  getCustomersList(): Observable<any[]> {
    if (!this.customersCache$) {
      this.customersCache$ = this.http.get<any[]>(`${this.apiUrl}/customers`).pipe(shareReplay(1));
    }
    return this.customersCache$;
  }

  saveCustomer(customer: any): Observable<any> {
    const req = customer.id
      ? this.http.put<any>(`${this.apiUrl}/customers/${customer.id}`, customer)
      : this.http.post<any>(`${this.apiUrl}/customers`, customer);

    return req.pipe(
      tap(() => {
        this.customersCache$ = null;
      })
    );
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/customers/${id}`).pipe(
      tap(() => {
        this.customersCache$ = null;
      })
    );
  }

  importCustomers(customers: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customers/import`, { customers }).pipe(
      tap(() => {
        this.customersCache$ = null;
      })
    );
  }

  checkout(orderPayload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pos/checkout`, orderPayload).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  getTickets(magasinId?: string): Observable<any> {
    const url = magasinId 
      ? `${this.apiUrl}/pos/tickets?magasinId=${magasinId}` 
      : `${this.apiUrl}/pos/tickets`;
    return this.http.get<any>(url);
  }

  getArticles(): Observable<any> {
    return this.getPosCatalog().pipe(
      map((categories: any[]) => {
        const flatArticles: any[] = [];
        categories.forEach(cat => {
          (cat.produits || []).forEach((prod: any) => {
            (prod.variantes || []).forEach((v: any) => {
              flatArticles.push({
                ID_ARTICLE: v.id,
                UGS: v.ugs,
                NOM: `${prod.nom} (${v.couleur}/${v.taille})`,
                CATEGORIE: cat.nom,
                PRIX_VENTE: v.prixVente,
                ALERTE_STOCK: v.seuilAlerte,
                EMPLACEMENT: 'Dépôt Principal'
              });
            });
          });
        });
        return { data: flatArticles };
      })
    );
  }

  addArticle(article: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pos/articles`, article).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  updateArticle(article: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pos/articles/${article.id_article}`, article).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  importArticles(articles: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pos/articles/import`, { articles }).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  getMagasins(): Observable<any> {
    if (!this.storesCache$) {
      this.storesCache$ = this.http.get<any>(`${this.apiUrl}/pos/stores`).pipe(shareReplay(1));
    }
    return this.storesCache$;
  }

  addMouvement(mouvementData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pos/movements`, mouvementData).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  saveInventaire(inventaireData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pos/inventory`, inventaireData).pipe(
      tap(() => {
        this.catalogCache$ = null;
      })
    );
  }

  getUsers(): Observable<any> {
    if (!this.usersCache$) {
      this.usersCache$ = this.http.get<any>(`${this.apiUrl}/users`).pipe(shareReplay(1));
    }
    return this.usersCache$;
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, userData).pipe(
      tap(() => {
        this.usersCache$ = null;
      })
    );
  }

  updateUser(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userData.id}`, userData).pipe(
      tap(() => {
        this.usersCache$ = null;
      })
    );
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`);
  }
}