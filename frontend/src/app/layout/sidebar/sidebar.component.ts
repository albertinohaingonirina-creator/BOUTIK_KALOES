import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  apiService = inject(ApiService);
  private router = inject(Router);

  get currentUser(): any {
    return this.apiService.getCurrentUser();
  }

  get isCollapsed(): boolean {
    return this.layoutService.isCollapsed();
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }

  navigateAndClose(url: string): void {
    this.router.navigate([url]);
    this.layoutService.closeMobileDrawer();
  }
}
