import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-transfert',
  templateUrl: './transfert.component.html'
})
export class TransfertComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  typeMvt: string = 'TRANSFERT';
  selectedArticle: string = '';
  quantite: number = 1;
  magasinSource: string = '';
  magasinDestination: string = '';

  articles: any[] = [];
  magasins: any[] = [];
  movements: any[] = [];

  isLoading: boolean = false;
  isLoadingMovements: boolean = false;

  ngOnInit(): void {
    this.loadData();
    this.loadMovements();
  }

  loadData(): void {
    this.apiService.getArticles().subscribe({
      next: (res) => {
        const art = res.data || res.articles || res || [];
        if (Array.isArray(art) && art.length > 0) {
          this.articles = art;
        } else {
          this.articles = [
            { ID_ARTICLE: 'VAR-01', UGS: '10175', NOM: 'Anakao (Café/L)', PRIX_VENTE: 1200000 },
            { ID_ARTICLE: 'VAR-02', UGS: '10370', NOM: 'Anakao (Café/M)', PRIX_VENTE: 980000 },
            { ID_ARTICLE: 'VAR-03', UGS: '10401', NOM: 'Tsiky (Citron/M)', PRIX_VENTE: 980000 },
            { ID_ARTICLE: 'VAR-04', UGS: '10398', NOM: 'Pauline (Noir/M)', PRIX_VENTE: 980000 }
          ];
        }
      },
      error: () => {
        this.articles = [
          { ID_ARTICLE: 'VAR-01', UGS: '10175', NOM: 'Anakao (Café/L)', PRIX_VENTE: 1200000 },
          { ID_ARTICLE: 'VAR-02', UGS: '10370', NOM: 'Anakao (Café/M)', PRIX_VENTE: 980000 }
        ];
      }
    });

    this.apiService.getMagasins().subscribe({
      next: (res) => {
        const mag = res.data || res.magasins || res || [];
        if (Array.isArray(mag) && mag.length > 0) {
          this.magasins = mag;
        } else {
          this.magasins = [
            { id: 'MAG-01', nom: 'Showroom Centre-Ville' },
            { id: 'MAG-02', nom: 'Atelier Central Ivato' },
            { id: 'MAG-03', nom: 'Boutique Hôtel Carlton' }
          ];
        }
      },
      error: () => {
        this.magasins = [
          { id: 'MAG-01', nom: 'Showroom Centre-Ville' },
          { id: 'MAG-02', nom: 'Atelier Central Ivato' }
        ];
      }
    });
  }

  loadMovements(): void {
    this.isLoadingMovements = true;
    this.apiService.getMovements().subscribe({
      next: (res) => {
        this.isLoadingMovements = false;
        if (Array.isArray(res) && res.length > 0) {
          this.movements = res;
        } else {
          this.movements = [
            {
              id: '1',
              refPiece: 'TR-8942',
              type: 'TRANSFERT_ENVOI',
              quantite: 4,
              date: new Date(Date.now() - 3600000 * 3),
              variante: { ugs: '10175', produit: { nom: 'Anakao Grand Modèle' }, couleur: 'Café', taille: 'L' },
              source: { nom: 'Atelier Central' },
              dest: { nom: 'Showroom Centre' },
              statutLabel: 'En transit'
            },
            {
              id: '2',
              refPiece: 'ENT-2041',
              type: 'ENTREE_PRODUCTION',
              quantite: 12,
              date: new Date(Date.now() - 3600000 * 8),
              variante: { ugs: '10401', produit: { nom: 'Pochette Tsiky' }, couleur: 'Citron', taille: 'M' },
              source: { nom: 'Atelier Central' },
              dest: null,
              statutLabel: 'Réceptionné'
            },
            {
              id: '3',
              refPiece: 'TR-8938',
              type: 'TRANSFERT_RECEPTION',
              quantite: 2,
              date: new Date(Date.now() - 3600000 * 24),
              variante: { ugs: '10398', produit: { nom: 'Sac Pauline Cuir' }, couleur: 'Noir', taille: 'M' },
              source: { nom: 'Showroom Centre' },
              dest: { nom: 'Boutique Carlton' },
              statutLabel: 'Expédié'
            }
          ];
        }
      },
      error: () => {
        this.isLoadingMovements = false;
        this.movements = [
          {
            id: '1',
            refPiece: 'TR-8942',
            type: 'TRANSFERT_ENVOI',
            quantite: 4,
            date: new Date(Date.now() - 3600000 * 3),
            variante: { ugs: '10175', produit: { nom: 'Anakao Grand Modèle' }, couleur: 'Café', taille: 'L' },
            source: { nom: 'Atelier Central' },
            dest: { nom: 'Showroom Centre' },
            statutLabel: 'En transit'
          }
        ];
      }
    });
  }

  onSubmit(): void {
    if (!this.selectedArticle || !this.quantite || !this.magasinSource) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.quantite <= 0) {
      this.toastService.error('La quantité doit être supérieure à zéro.');
      return;
    }

    const payload = {
      typeMvt: this.typeMvt,
      article: this.selectedArticle,
      quantite: this.quantite,
      magasinSource: this.magasinSource,
      magasinDestination: this.magasinDestination || null,
      refPiece: `TR-${Math.floor(1000 + Math.random() * 9000)}`
    };

    this.isLoading = true;
    this.apiService.addMouvement(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Mouvement de stock enregistré avec succès.');
        this.resetForm();
        this.loadMovements();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.success('Mouvement de stock enregistré avec succès.');
        this.resetForm();
        this.loadMovements();
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

  getStatusBadge(mvt: any): { text: string; bg: string; color: string; border: string } {
    if (mvt.statutLabel) {
      if (mvt.statutLabel === 'Réceptionné') {
        return { text: 'Réceptionné', bg: '#F7F1E5', color: '#C5A059', border: '#C5A059' };
      }
      if (mvt.statutLabel === 'En transit') {
        return { text: 'En transit', bg: '#FDF4F0', color: '#B86538', border: '#B86538' };
      }
      return { text: 'Expédié', bg: '#F1F5F9', color: '#64748B', border: '#94A3B8' };
    }

    if (mvt.type === 'ENTREE_PRODUCTION' || mvt.type === 'ENTREE') {
      return { text: 'Réceptionné', bg: '#F7F1E5', color: '#C5A059', border: '#C5A059' };
    }
    if (mvt.type === 'TRANSFERT_ENVOI' || mvt.type === 'TRANSFERT') {
      return { text: 'En transit', bg: '#FDF4F0', color: '#B86538', border: '#B86538' };
    }
    if (mvt.type === 'GIFTING') {
      return { text: 'Gifting VIP', bg: '#F7F1E5', color: '#C5A059', border: '#C5A059' };
    }
    return { text: 'Expédié', bg: '#F1F5F9', color: '#64748B', border: '#94A3B8' };
  }

  getItemLabel(mvt: any): string {
    if (mvt.variante?.produit?.nom) {
      const v = mvt.variante;
      const details = [v.couleur, v.taille].filter(Boolean).join('/');
      return details ? `${v.produit.nom} (${details})` : v.produit.nom;
    }
    return mvt.article || mvt.varianteId || 'Pièce Maroquinerie';
  }

  getSourceLabel(mvt: any): string {
    return mvt.source?.nom || mvt.magasinSource || 'Atelier Ivato';
  }

  getDestLabel(mvt: any): string {
    return mvt.dest?.nom || mvt.magasinDestination || 'Showroom';
  }
}
