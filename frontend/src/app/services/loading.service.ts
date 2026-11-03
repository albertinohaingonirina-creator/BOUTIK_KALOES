import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public progress$ = new BehaviorSubject<number>(0);
  private progressInterval: any = null;

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      queueMicrotask(() => {
        this.isLoading$.next(true);
        this.startProgress();
      });
    }
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.completeProgress();
    }
  }

  private startProgress(): void {
    this.progress$.next(15);
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      const current = this.progress$.value;
      if (current < 85) {
        this.progress$.next(current + Math.floor(Math.random() * 10) + 5);
      }
    }, 150);
  }

  private completeProgress(): void {
    clearInterval(this.progressInterval);
    this.progress$.next(100);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.progress$.next(0);
    }, 250);
  }
}