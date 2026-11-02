import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  kpis: any = {
    totalArticles: 0,
    totalMagasins: 0,
    totalClients: 0,
    totalCommandes: 0,
    chiffreAffairesMGA: 0
  };
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.isLoading = true;
    (this.apiService as any).http.get(`${(this.apiService as any).apiUrl}/pos/dashboard-kpis`).subscribe({
      next: (data: any) => {
        this.kpis = data || this.kpis;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}