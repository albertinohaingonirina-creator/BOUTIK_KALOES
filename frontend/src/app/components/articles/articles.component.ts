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
  isDetailModalOpen: boolean = false;
  selectedArticleDetail: any = null;

  categories: string[] = ['TOUT', 'Sacs', 'Chapeaux', 'Paniers', 'Pochettes', 'Ceintures', 'Mobilier'];

  articleForm: any = {
    id_article: null,
    ugs: '',
    nom: '',
    categorie: 'Sacs',
    prix_vente: 0,
    alerte_stock: 5,
    emplacement: '',
    photo: ''
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
      emplacement: '',
      photo: ''
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
      emplacement: art.EMPLACEMENT || '',
      photo: art.PHOTO || ''
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openDetailModal(art: any): void {
    this.selectedArticleDetail = art;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.selectedArticleDetail = null;
    this.isDetailModalOpen = false;
  }

  getStoreStock(art: any, storeType: string): number {
    if (!art || !art.STOCKS || !Array.isArray(art.STOCKS)) return 0;
    const stockEntry = art.STOCKS.find((s: any) => 
      s.magasin?.type === storeType || 
      (s.magasin?.nom && s.magasin.nom.toUpperCase().includes(storeType))
    );
    return stockEntry ? stockEntry.quantite : 0;
  }

  getQrCodeUrl(art: any): string {
    if (!art) return '';
    const payload = JSON.stringify({
      id: art.ID_ARTICLE,
      ugs: art.UGS,
      nom: art.NOM,
      prix: art.PRIX_VENTE,
      emp: art.EMPLACEMENT || 'DEP-A-01'
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}&color=28-19-14`;
  }

  printQrLabel(art: any): void {
    if (!art) return;
    const printWindow = window.open('', '_blank', 'width=420,height=520');
    if (!printWindow) return;

    const qrUrl = this.getQrCodeUrl(art);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Étiquette Atelier - ${art.NOM}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 24px;
              color: #1C130E;
            }
            .brand {
              font-size: 14px;
              letter-spacing: 3px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .ugs {
              font-family: monospace;
              font-size: 13px;
              color: #7A8288;
              margin-bottom: 14px;
            }
            .qr-img {
              width: 170px;
              height: 170px;
              margin-bottom: 12px;
            }
            .price {
              font-size: 18px;
              font-weight: 700;
              color: #B86538;
              margin-bottom: 4px;
            }
            .location {
              font-size: 11px;
              color: #7A8288;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="brand">KALOÈS MADAGASCAR</div>
          <div class="title">${art.NOM}</div>
          <div class="ugs">SKU : ${art.UGS}</div>
          <img src="${qrUrl}" class="qr-img" />
          <div class="price">${Number(art.PRIX_VENTE).toLocaleString()} Ar</div>
          <div class="location">${art.EMPLACEMENT || 'DEP-A-01'}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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