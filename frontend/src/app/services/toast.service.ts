import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string): void {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = 3500;
    const newToast: Toast = { id, message, title, type, duration };
    this.toasts.update((list: Toast[]) => [...list, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, title?: string): void {
    this.show(message, 'success', title || 'Confirmation');
  }

  error(message: string, title?: string): void {
    this.show(message, 'error', title || 'Erreur');
  }

  warning(message: string, title?: string): void {
    this.show(message, 'warning', title || 'Attention');
  }

  info(message: string, title?: string): void {
    this.show(message, 'info', title || 'Information');
  }

  remove(id: string): void {
    this.toasts.update((list: Toast[]) => list.filter((t: Toast) => t.id !== id));
  }
}