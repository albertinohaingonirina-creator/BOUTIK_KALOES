import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmData } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent implements OnInit {
  isOpen: boolean = false;
  data: ConfirmData = { titre: '', message: '' };
  private resolver: ((val: boolean) => void) | null = null;

  constructor(
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.confirmService.confirmState$.subscribe(({ data, resolve }) => {
      this.data = data;
      this.resolver = resolve;
      this.isOpen = true;
      this.cdr.markForCheck();
    });
  }

  confirm(): void {
    if (this.resolver) this.resolver(true);
    this.close();
  }

  cancel(): void {
    if (this.resolver) this.resolver(false);
    this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.resolver = null;
    this.cdr.markForCheck();
  }
}