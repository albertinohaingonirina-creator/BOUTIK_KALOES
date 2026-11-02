import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmData {
  titre: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  boutonTexte?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new Subject<{ data: ConfirmData; resolve: (val: boolean) => void }>();
  public confirmState$ = this.confirmSubject.asObservable();

  ask(data: ConfirmData): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ data, resolve });
    });
  }
}