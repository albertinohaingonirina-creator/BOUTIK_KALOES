import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.component.html'
})
export class UtilisateursComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  users: any[] = [];
  magasins: any[] = [];
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditing: boolean = false;

  userForm: any = {
    id: null,
    nom: '',
    email: '',
    motDePasse: '',
    role: 'CAISSIER',
    magasinId: ''
  };

  ngOnInit(): void {
    const currentUser = this.apiService.getCurrentUser();
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MANAGER') {
      this.router.navigate(['/caisse']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.apiService.getUsers().subscribe({
      next: (users: any[]) => {
        this.users = users || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur lors du chargement des utilisateurs.');
      }
    });

    this.apiService.getMagasins().subscribe({
      next: (stores: any[]) => {
        this.magasins = stores || [];
      },
      error: () => {}
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.userForm = { id: null, nom: '', email: '', motDePasse: '', role: 'CAISSIER', magasinId: '' };
    this.isModalOpen = true;
  }

  openEditModal(user: any): void {
    this.isEditing = true;
    this.userForm = { 
      id: user.id, 
      nom: user.nom, 
      email: user.email, 
      motDePasse: '', 
      role: user.role, 
      magasinId: user.magasinId || '' 
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveUser(): void {
    this.isLoading = true;
    const req = this.isEditing 
      ? this.apiService.updateUser(this.userForm)
      : this.apiService.createUser(this.userForm);

    req.subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
        this.toastService.success(this.isEditing ? 'Utilisateur mis à jour.' : 'Utilisateur créé avec succès.');
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur lors de la sauvegarde.');
      }
    });
  }

  getStoreName(storeId: string): string {
    const store = this.magasins.find((m: any) => m.id === storeId || m.ID_MAGASIN === storeId);
    return store ? (store.nom || store.NOM) : 'Non assigné';
  }
}