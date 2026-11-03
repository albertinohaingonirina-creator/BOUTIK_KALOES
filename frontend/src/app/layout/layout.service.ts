import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isCollapsed = signal<boolean>(false);
  isMobileOpen = signal<boolean>(false);
  selectedStore = signal<string>('Boutique Showroom');
  stores = [
    { id: '1', nom: 'Boutique Showroom', type: 'BOUTIQUE', code: 'SHOWROOM' },
    { id: '2', nom: 'Dépôt Principal', type: 'DEPOT', code: 'DEPOT' },
    { id: '3', nom: 'Revendeur Analakely', type: 'REVENDEUR', code: 'REVENDEUR' }
  ];

  toggleSidebar(): void {
    this.isCollapsed.update(val => !val);
  }

  toggleMobileDrawer(): void {
    this.isMobileOpen.update(val => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileOpen.set(false);
  }

  setStore(storeNom: string): void {
    this.selectedStore.set(storeNom);
  }
}
