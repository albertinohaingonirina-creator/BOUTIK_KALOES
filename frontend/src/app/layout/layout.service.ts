import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private apiService = inject(ApiService);
  
  isCollapsed = signal<boolean>(false);
  isMobileOpen = signal<boolean>(false);
  selectedStore = signal<string>('Chargement...');
  selectedStoreId = signal<string>('');
  
  stores: any[] = [];

  constructor() {
    this.loadStores();
  }

  loadStores(): void {
    this.apiService.getMagasins().subscribe({
      next: (res: any[]) => {
        this.stores = res || [];
        const userStoreId = this.apiService.getCurrentUser()?.magasinId;
        
        // Sélectionne le magasin de l'utilisateur, ou le premier de la liste
        const current = this.stores.find(s => s.id === userStoreId) || this.stores[0];
        if (current) {
          this.selectedStore.set(current.nom);
          this.selectedStoreId.set(current.id);
        }
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed.update(val => !val);
  }

  toggleMobileDrawer(): void {
    this.isMobileOpen.update(val => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileOpen.set(false);
  }

  setStore(store: any): void {
    this.selectedStore.set(store.nom);
    this.selectedStoreId.set(store.id);
  }
}