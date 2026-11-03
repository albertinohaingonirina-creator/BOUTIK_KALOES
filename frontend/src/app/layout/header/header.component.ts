import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ApiService } from '../../services/api.service';

export interface StockAlert {
  id: string;
  model: string;
  type: string;
  stock: number;
  ugs: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  layoutService = inject(LayoutService);
  apiService = inject(ApiService);
  private router = inject(Router);

  searchQuery: string = '';
  isStoreDropdownOpen: boolean = false;
  isNotificationsOpen: boolean = false;

  stockAlerts: StockAlert[] = [];
  readAlertUgs = new Set<string>();

  constructor() {
    effect(() => {
      const storeId = this.layoutService.selectedStoreId();
      if (storeId) {
        this.checkStockAlerts(storeId);
      }
    });
  }

  ngOnInit(): void {
    const userStoreId = this.currentUser?.magasinId;
    if (userStoreId) {
      this.checkStockAlerts(userStoreId);
    } else {
      this.loadDefaultAlerts();
    }
  }

  checkStockAlerts(magasinId: string): void {
    this.apiService.getPosCatalog(magasinId).subscribe({
      next: (categories: any[]) => {
        const alerts: StockAlert[] = [];
        (categories || []).forEach(cat => {
          (cat.produits || []).forEach((prod: any) => {
            (prod.variantes || []).forEach((v: any) => {
              const stockObj = v.stocks?.find((s: any) => s.magasinId === magasinId) || v.stocks?.[0];
              const qte = stockObj ? Number(stockObj.quantite) : 0;
              const seuil = Number(v.seuilAlerte) || 5;
              if (qte <= seuil) {
                alerts.push({
                  id: v.id,
                  model: `${prod.nom} (${v.couleur || ''}/${v.taille || ''})`,
                  type: qte <= 0 ? 'Rupture' : 'Stock faible',
                  stock: qte,
                  ugs: v.ugs
                });
              }
            });
          });
        });
        this.stockAlerts = alerts.filter(a => !this.readAlertUgs.has(a.ugs));
      },
      error: () => {}
    });
  }

  private loadDefaultAlerts(): void {
    this.apiService.getArticles().subscribe({
      next: (res: any) => {
        const list = res.data || [];
        const alerts: StockAlert[] = [];
        list.forEach((art: any) => {
          const stockTotal = Array.isArray(art.STOCKS)
            ? art.STOCKS.reduce((sum: number, s: any) => sum + Number(s.quantite || 0), 0)
            : 0;
          const seuil = Number(art.ALERTE_STOCK) || 5;
          if (stockTotal <= seuil) {
            alerts.push({
              id: art.ID_ARTICLE,
              model: art.NOM,
              type: stockTotal <= 0 ? 'Rupture' : 'Stock faible',
              stock: stockTotal,
              ugs: art.UGS
            });
          }
        });
        this.stockAlerts = alerts.filter(a => !this.readAlertUgs.has(a.ugs));
      },
      error: () => {}
    });
  }

  get unreadAlertsCount(): number {
    return this.stockAlerts.length;
  }

  get currentUser(): any {
    return this.apiService.getCurrentUser();
  }

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.layoutService.toggleMobileDrawer();
    } else {
      this.layoutService.toggleSidebar();
    }
  }

  selectStore(s: any): void {
    this.layoutService.setStore(s);
    this.isStoreDropdownOpen = false;
  }

  toggleStoreDropdown(): void {
    this.isStoreDropdownOpen = !this.isStoreDropdownOpen;
    this.isNotificationsOpen = false;
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isStoreDropdownOpen = false;
  }

  onSearchSubmit(): void {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/articles'], { queryParams: { q: this.searchQuery.trim() } });
    this.searchQuery = '';
  }

  readAndNavigate(alert: StockAlert): void {
    this.readAlertUgs.add(alert.ugs);
    this.stockAlerts = this.stockAlerts.filter(a => a.ugs !== alert.ugs);
    this.isNotificationsOpen = false;
    this.layoutService.closeMobileDrawer();
    this.router.navigate(['/articles'], { queryParams: { q: alert.ugs } });
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}