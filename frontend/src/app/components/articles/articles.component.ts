import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({

  standalone: true,
imports: [CommonModule, FormsModule],
  selector: 'app-articles',
  templateUrl: './articles.component.html'
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  filteredArticles: any[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'TOUT';
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditing: boolean = false;

  categories: string[] = ['TOUT', 'Sacs', 'Chapeaux', 'Paniers', 'Pochettes', 'Ceintures', 'Mobilier'];

  articleForm: any = {
    id_article: null,
    ugs: '',
    nom: '',
    categorie: 'Sacs',
    prix_vente: 0,
    alerte_stock: 5,
    emplacement: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.apiService.getArticles().subscribe({
      next: (res: any) => {
        this.articles = res.data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  setCategoryFilter(category: string): void {
    this.selectedCategory = category;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.articles];

    if (this.selectedCategory !== 'TOUT') {
      result = result.filter(a => a.CATEGORIE === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(a =>
        (a.NOM && a.NOM.toLowerCase().includes(term)) ||
        (a.UGS && a.UGS.toString().toLowerCase().includes(term)) ||
        (a.EMPLACEMENT && a.EMPLACEMENT.toLowerCase().includes(term))
      );
    }

    this.filteredArticles = result;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.articleForm = {
      id_article: null,
      ugs: '',
      nom: '',
      categorie: 'Sacs',
      prix_vente: 0,
      alerte_stock: 5,
      emplacement: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(art: any): void {
    this.isEditing = true;
    this.articleForm = {
      id_article: art.ID_ARTICLE,
      ugs: art.UGS,
      nom: art.NOM,
      categorie: art.CATEGORIE,
      prix_vente: art.PRIX_VENTE,
      alerte_stock: art.ALERTE_STOCK,
      emplacement: art.EMPLACEMENT || ''
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveArticle(): void {
    this.isLoading = true;
    if (this.isEditing) {
      this.apiService.updateArticle(this.articleForm).subscribe({
        next: () => {
          this.loadArticles();
          this.closeModal();
        }
      });
    } else {
      this.apiService.addArticle(this.articleForm).subscribe({
        next: () => {
          this.loadArticles();
          this.closeModal();
        }
      });
    }
  }

  handleCSV(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const payload: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 4) {
          payload.push({
            nom: cols[0]?.replace(/"/g, '').trim(),
            ugs: cols[1]?.replace(/"/g, '').trim(),
            categorie: cols[2]?.replace(/"/g, '').trim() || 'Sacs',
            prix_vente: parseFloat(cols[4]) || 1200000,
            alerte_stock: 5,
            emplacement: 'DEP-A-01'
          });
        }
      }

      if (payload.length > 0) {
        this.isLoading = true;
        this.apiService.importArticles(payload).subscribe({
          next: () => {
            this.loadArticles();
          }
        });
      }
    };
    reader.readAsText(file);
  }
}