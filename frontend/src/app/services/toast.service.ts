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

  show(message: any, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string): void {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = 4000;
    
    let text = '';
    if (typeof message === 'string') {
      text = message;
    } else if (message?.message) {
      text = message.message;
    } else if (message?.error) {
      text = typeof message.error === 'string' ? message.error : (message.error?.message || JSON.stringify(message.error));
    } else {
      text = JSON.stringify(message);
    }

    if (!text || text.trim() === '') {
      text = type === 'success' ? 'Opération effectuée avec succès.' : 'Notification reçue.';
    }

    const defaultTitle = type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : type === 'warning' ? 'Avertissement' : 'Maison Kaloès';
    const newToast: Toast = { id, message: text, title: title || defaultTitle, type, duration };
    this.toasts.update(list => [...list, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: any, title?: string): void {
    this.show(message, 'success', title);
  }

  error(message: any, title?: string): void {
    this.show(message, 'error', title);
  }

  warning(message: any, title?: string): void {
    this.show(message, 'warning', title);
  }

  info(message: any, title?: string): void {
    this.show(message, 'info', title);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}