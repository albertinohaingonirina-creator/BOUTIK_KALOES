import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { LoadingService } from './services/loading.service';
import { ToastService } from './services/toast.service';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ToastComponent } from './components/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  public apiService = inject(ApiService);
  public loadingService = inject(LoadingService);
  public toastService = inject(ToastService);
  private router = inject(Router);

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}