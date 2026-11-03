import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: [`
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(60px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes toastProgress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    .kaloes-luxury-toast {
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .toast-progress-bar {
      animation: toastProgress 4s linear forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  get toasts(): Toast[] {
    return this.toastService.toasts();
  }

  close(id: string): void {
    this.toastService.remove(id);
  }
}