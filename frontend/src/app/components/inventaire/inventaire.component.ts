import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
 standalone: true,
imports: [CommonModule, FormsModule],
  selector: 'app-inventaire',
  templateUrl: './inventaire.component.html'
})
export class InventaireComponent implements OnInit {
  magasins: any[] = [];
  selectedMagasin: string = 'MAG-02';
  frequence: string = 'MENSUEL';
  dateInventaire: string = new Date().toISOString().substring(0, 10);
  
  lignesInventaire: any[] = [];
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInitData();
  }

  loadInitData(): void {
    this.isLoading = true;
    this.apiService.getMagasins().subscribe({
      next: (res: any) => {
        this.magasins = res.data || [];
        this.loadArticlesForInventaire();
      }
    });
  }

  loadArticlesForInventaire(): void {
    this.apiService.getArticles().subscribe({
      next: (res: any) => {
        const articles: any[] = res.data || [];
        this.lignesInventaire = articles.map((a: any) => ({
          id_article: a.ID_ARTICLE,
          nom: a.NOM,
          ugs: a.UGS,
          emplacement: a.EMPLACEMENT || 'DEP-A-01',
          prix: a.PRIX_VENTE || 0,
          theorique: Math.floor(Math.random() * 20) + 5,
          reel: Math.floor(Math.random() * 20) + 5
        }));
        this.isLoading = false;
      }
    });
  }

  getEcart(ligne: any): number {
    return (ligne.reel || 0) - (ligne.theorique || 0);
  }

  getEcartValeur(ligne: any): number {
    return this.getEcart(ligne) * (ligne.prix || 0);
  }

  validerInventaire(): void {
    this.isLoading = true;
    const payload = {
      magasin: this.selectedMagasin,
      frequence: this.frequence,
      date: this.dateInventaire,
      lignes: this.lignesInventaire.map((l: any) => ({
        id_article: l.id_article,
        theorique: l.theorique,
        reel: l.reel,
        ecart: this.getEcart(l),
        valeur_ecart: this.getEcartValeur(l)
      }))
    };

    this.apiService.saveInventaire(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Session d inventaire clôturée et synchronisée avec la base Google Sheets';
        setTimeout(() => this.successMessage = '', 5000);
      }
    });
  }
}