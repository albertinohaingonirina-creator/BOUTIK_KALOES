import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditing: boolean = false;

  customerForm: any = {
    id: null,
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    remarque: ''
  };

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.apiService.getCustomersList().subscribe({
      next: (data: any[]) => {
        this.customers = data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur de chargement des clients.');
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter((c: any) =>
      (c.nom && c.nom.toLowerCase().includes(term)) ||
      (c.telephone && c.telephone.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.remarque && c.remarque.toLowerCase().includes(term))
    );
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.customerForm = { id: null, nom: '', telephone: '', email: '', adresse: '', ville: '', remarque: '' };
    this.isModalOpen = true;
  }

  openEditModal(c: any): void {
    this.isEditing = true;
    this.customerForm = {
      id: c.id,
      nom: c.nom,
      telephone: c.telephone || '',
      email: c.email || '',
      adresse: c.adresse || '',
      ville: c.ville || '',
      remarque: c.remarque || ''
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveCustomer(): void {
    if (!this.customerForm.nom.trim()) return;

    this.isLoading = true;
    this.apiService.saveCustomer(this.customerForm).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeModal();
        this.toastService.success('Fiche client enregistrée.');
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur de sauvegarde.');
      }
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    const confirmed = await this.confirmService.ask({
      titre: 'Supprimer ce client ?',
      message: 'Cette action retirera le client du répertoire CRM. Confirmez-vous la suppression ?',
      type: 'danger',
      boutonTexte: 'Supprimer'
    });

    if (!confirmed) return;

    this.isLoading = true;
    this.apiService.deleteCustomer(id).subscribe({
      next: () => {
        this.loadCustomers();
        this.toastService.success('Client supprimé avec succès.');
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Impossible de supprimer ce client.');
      }
    });
  }

  handleCSV(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const clientsToImport: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',');
          if (cols.length >= 2) {
            const nom = cols[1] ? cols[1].replace(/"/g, '').trim() : '';
            if (nom) {
              clientsToImport.push({
                nom: nom,
                email: cols[2] ? cols[2].replace(/"/g, '').trim() : null,
                telephone: cols[3] ? cols[3].replace(/"/g, '').trim() : null,
                adresse: cols[4] ? cols[4].replace(/"/g, '').trim() : null,
                ville: cols[5] ? cols[5].replace(/"/g, '').trim() : null,
                remarque: cols[11] ? cols[11].replace(/"/g, '').trim() : null
              });
            }
          }
        }

        if (clientsToImport.length > 0) {
          this.apiService.importCustomers(clientsToImport).subscribe({
            next: (res: any) => {
              this.loadCustomers();
              this.toastService.success(`${res.count} clients importés depuis Loyverse.`);
            },
            error: () => {
              this.isLoading = false;
              this.toastService.error('Erreur lors de l importation.');
            }
          });
        }
      } catch {
        this.isLoading = false;
        this.toastService.error('Erreur de lecture du fichier CSV.');
      }
    };

    reader.readAsText(file);
  }
}