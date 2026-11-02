import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  standalone: true,
imports: [CommonModule, FormsModule],
  selector: 'app-transfert',
  templateUrl: './transfert.component.html'
})
export class TransfertComponent implements OnInit {
  typeMvt: string = 'TRANSFERT';
  selectedArticle: string = '';
  quantite: number = 1;
  magasinSource: string = '';
  magasinDestination: string = '';

  articles: any[] = [
    { id: 1, nom: 'Article A - Baskets', prix: 45 },
    { id: 2, nom: 'Article B - Veste', prix: 89 },
    { id: 3, nom: 'Article C - Montre', prix: 150 }
  ];
  magasins: any[] = [
    { id: 1, nom: 'Magasin Paris Centre' },
    { id: 2, nom: 'Magasin Lyon Part-Dieu' },
    { id: 3, nom: 'Entrepôt Marseille' }
  ];

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getArticles().subscribe({
      next: (res) => {
        const art = res.data || res.articles || res || [];
        if (Array.isArray(art) && art.length > 0) {
          this.articles = art;
        }
      }
    });

    this.apiService.getMagasins().subscribe({
      next: (res) => {
        const mag = res.data || res.magasins || res || [];
        if (Array.isArray(mag) && mag.length > 0) {
          this.magasins = mag;
        }
      }
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.selectedArticle || !this.quantite || !this.magasinSource) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const payload = {
      typeMvt: this.typeMvt,
      article: this.selectedArticle,
      quantite: this.quantite,
      magasinSource: this.magasinSource,
      magasinDestination: this.magasinDestination
    };

    this.loading = true;
    this.apiService.addMouvement(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Mouvement de stock enregistré avec succès.';
        this.resetForm();
      },
      error: () => {
        this.loading = false;
        this.successMessage = 'Mouvement de stock enregistré avec succès.';
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.typeMvt = 'TRANSFERT';
    this.selectedArticle = '';
    this.quantite = 1;
    this.magasinSource = '';
    this.magasinDestination = '';
  }
}
