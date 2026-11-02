import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface VenteLoyverse {
  article: string;
  ugs: string;
  categorie: string;
  articlesVendus: number;
  ventesBrutes: number;
  remboursements: number;
  reductions: number;
  ventesNettes: number;
  isGifting: boolean;
}

@Component({
  standalone: true,
imports: [CommonModule, FormsModule],
  selector: 'app-loyverse',
  templateUrl: './loyverse.component.html'
})
export class LoyverseComponent implements OnInit {
  lignesVentes: VenteLoyverse[] = [];
  filteredLignes: VenteLoyverse[] = [];
  searchTerm: string = '';
  activeTab: 'TOUT' | 'VENTES' | 'GIFTING' = 'TOUT';

  totalVentesNettes: number = 0;
  totalArticlesVendus: number = 0;
  totalGiftingPieces: number = 0;
  totalRemboursements: number = 0;

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.chargerDonneesInitiales();
  }

  chargerDonneesInitiales(): void {
    this.lignesVentes = [
      {
        article: 'Anakao (Café/L)',
        ugs: '10175',
        categorie: 'Sacs',
        articlesVendus: 18,
        ventesBrutes: 21600000,
        remboursements: 0,
        reductions: 1620000,
        ventesNettes: 19980000,
        isGifting: false
      },
      {
        article: 'Anakao (Café/M)',
        ugs: '10370',
        categorie: 'Sacs',
        articlesVendus: 10,
        ventesBrutes: 9800000,
        remboursements: 0,
        reductions: 1862000,
        ventesNettes: 7938000,
        isGifting: false
      },
      {
        article: 'Tsiky (Citron/M)',
        ugs: '10401',
        categorie: 'Sacs',
        articlesVendus: 9,
        ventesBrutes: 8820000,
        remboursements: 0,
        reductions: 833000,
        ventesNettes: 7987000,
        isGifting: false
      },
      {
        article: 'Pauline (Noir/M)',
        ugs: '10398',
        categorie: 'Sacs',
        articlesVendus: 4,
        ventesBrutes: 3920000,
        remboursements: 0,
        reductions: 3920000,
        ventesNettes: 0,
        isGifting: true
      },
      {
        article: 'Andao (Naturel/M)',
        ugs: '10397',
        categorie: 'Sacs',
        articlesVendus: 11,
        ventesBrutes: 10780000,
        remboursements: 0,
        reductions: 882000,
        ventesNettes: 9898000,
        isGifting: false
      }
    ];

    this.recalculerMetriques();
    this.appliquerFiltres();
  }

  recalculerMetriques(): void {
    this.totalVentesNettes = this.lignesVentes
      .filter(l => !l.isGifting)
      .reduce((sum, l) => sum + (l.ventesNettes || 0), 0);

    this.totalArticlesVendus = this.lignesVentes
      .filter(l => !l.isGifting)
      .reduce((sum, l) => sum + (l.articlesVendus || 0), 0);

    this.totalGiftingPieces = this.lignesVentes
      .filter(l => l.isGifting)
      .reduce((sum, l) => sum + (l.articlesVendus || 0), 0);

    this.totalRemboursements = this.lignesVentes
      .reduce((sum, l) => sum + (l.remboursements || 0), 0);
  }

  appliquerFiltres(): void {
    let result = [...this.lignesVentes];

    if (this.activeTab === 'VENTES') {
      result = result.filter(l => !l.isGifting);
    } else if (this.activeTab === 'GIFTING') {
      result = result.filter(l => l.isGifting);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l =>
        l.article.toLowerCase().includes(term) ||
        l.ugs.toLowerCase().includes(term) ||
        l.categorie.toLowerCase().includes(term)
      );
    }

    this.filteredLignes = result;
  }

  changerTab(tab: 'TOUT' | 'VENTES' | 'GIFTING'): void {
    this.activeTab = tab;
    this.appliquerFiltres();
  }

  handleCSVUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const nouvellesLignes: VenteLoyverse[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',');
          if (cols.length >= 9) {
            const articleNom = cols[0].replace(/"/g, '').trim();
            const ugs = cols[1].replace(/"/g, '').trim();
            const categorie = cols[2].replace(/"/g, '').trim();
            const articlesVendus = parseFloat(cols[3]) || 0;
            const ventesBrutes = parseFloat(cols[4]) || 0;
            const remboursements = parseFloat(cols[6]) || 0;
            const reductions = parseFloat(cols[7]) || 0;
            const ventesNettes = parseFloat(cols[8]) || 0;

            const isGifting = reductions >= ventesBrutes && ventesBrutes > 0;

            nouvellesLignes.push({
              article: articleNom,
              ugs: ugs,
              categorie: categorie,
              articlesVendus: articlesVendus,
              ventesBrutes: ventesBrutes,
              remboursements: remboursements,
              reductions: reductions,
              ventesNettes: ventesNettes,
              isGifting: isGifting
            });
          }
        }

        if (nouvellesLignes.length > 0) {
          this.lignesVentes = nouvellesLignes;
          this.recalculerMetriques();
          this.appliquerFiltres();
          this.successMessage = `Import Loyverse validé : ${nouvellesLignes.length} lignes traitées avec succès.`;
        } else {
          this.errorMessage = 'Format du fichier CSV Loyverse invalide.';
        }
      } catch (err) {
        this.errorMessage = 'Erreur lors de la lecture du fichier CSV Loyverse.';
      } finally {
        this.isLoading = false;
      }
    };

    reader.readAsText(file);
  }

  synchroniserStocksBoutique(): void {
    if (this.lignesVentes.length === 0) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      typeMvt: 'VENTE',
      idArticle: this.lignesVentes[0].ugs,
      qte: this.totalArticlesVendus,
      srcMagasin: 'MAG-02',
      destMagasin: '',
      refPiece: 'SYNC-LOYVERSE-' + new Date().toISOString().substring(0, 10),
      utilisateur: 'SYNC_AUTO'
    };

    this.apiService.addMouvement(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Déstockage Boutique synchronisé dans Google Sheets.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la synchronisation avec Google Apps Script.';
      }
    });
  }
}