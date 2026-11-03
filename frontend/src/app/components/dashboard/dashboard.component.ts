import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LayoutService } from '../../layout/layout.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  public layoutService = inject(LayoutService);

  kpis: any = {
    totalArticles: 48,
    totalMagasins: 3,
    totalClients: 124,
    totalCommandes: 67,
    chiffreAffairesMGA: 148500000,
    ventesJourMGA: 6420000
  };

  isLoading: boolean = false;

  recentTransfers = [
    { ref: 'TRF-2026-042', article: 'Sac Anakao (Café/L)', source: 'Dépôt Principal', destination: 'Boutique Showroom', qte: 5, statut: 'Réceptionné', date: 'Aujourd\'hui 10:30' },
    { ref: 'TRF-2026-041', article: 'Chapeau Tsiky (Thé/M)', source: 'Atelier Confection', destination: 'Dépôt Principal', qte: 12, statut: 'En transit', date: 'Hier 16:45' },
    { ref: 'TRF-2026-040', article: 'Pochette Andao (Naturel)', source: 'Dépôt Principal', destination: 'Revendeur Analakely', qte: 8, statut: 'Expédié', date: '28 Oct' },
    { ref: 'TRF-2026-039', article: 'Ceinture Raphia Tressé', source: 'Dépôt Principal', destination: 'Boutique Showroom', qte: 15, statut: 'Réceptionné', date: '27 Oct' }
  ];

  topModels = [
    { nom: 'Sac Anakao Grand Format', couleur: 'Café / Cuir Pleine Fleur', ventes: 28, stockRestant: 4, seuil: 10, pourcentageStock: 40, ugs: '10175' },
    { nom: 'Chapeau Tsiky Soleil', couleur: 'Thé / Raphia Sauvage', ventes: 22, stockRestant: 6, seuil: 8, pourcentageStock: 75, ugs: '10182' },
    { nom: 'Pochette Andao Soirée', couleur: 'Naturel / Écru & Laiton', ventes: 19, stockRestant: 2, seuil: 5, pourcentageStock: 25, ugs: '10190' },
    { nom: 'Cabas Ravinala Riviera', couleur: 'Noir Ébène / Double Anse', ventes: 14, stockRestant: 9, seuil: 12, pourcentageStock: 80, ugs: '10204' }
  ];

  get currentUser(): any {
    return this.apiService.getCurrentUser();
  }

  ngOnInit(): void {
    if (!this.apiService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadKpis();
  }

  loadKpis(): void {
    this.isLoading = true;
    (this.apiService as any).http.get(`${(this.apiService as any).apiUrl}/pos/dashboard-kpis`).subscribe({
      next: (data: any) => {
        if (data) {
          this.kpis = {
            ...this.kpis,
            ...data,
            ventesJourMGA: data.chiffreAffairesMGA ? Math.round(data.chiffreAffairesMGA * 0.08) : this.kpis.ventesJourMGA
          };
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}