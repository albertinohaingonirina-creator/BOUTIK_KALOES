import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  layoutService = inject(LayoutService);
  apiService = inject(ApiService);
  private router = inject(Router);

  searchQuery: string = '';
  isStoreDropdownOpen: boolean = false;
  isNotificationsOpen: boolean = false;

  stockAlerts = [
    { model: 'Anakao Thé / Taille L', type: 'Rupture imminente', stock: 1, ugs: '10175' },
    { model: 'Tsiky Naturel / Taille M', type: 'Stock critique', stock: 2, ugs: '10182' },
    { model: 'Pochette Andao Café', type: 'Rupture imminente', stock: 0, ugs: '10190' }
  ];

  get currentUser(): any {
    return this.apiService.getCurrentUser();
  }

  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.layoutService.toggleMobileDrawer();
    } else {
      this.layoutService.toggleSidebar();
    }
  }

  selectStore(nom: string): void {
    this.layoutService.setStore(nom);
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
    this.router.navigate(['/articles'], { queryParams: { q: this.searchQuery } });
    this.searchQuery = '';
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}
