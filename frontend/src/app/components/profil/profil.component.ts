import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html'
})
export class ProfilComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading: boolean = false;
  isSavingProfile: boolean = false;
  isSavingPassword: boolean = false;

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  profile: any = {
    id: '',
    nom: '',
    email: '',
    telephone: '',
    avatar: null,
    role: '',
    magasin: null
  };

  passwordForm = {
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: ''
  };

  ngOnInit(): void {
    if (!this.apiService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.apiService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          this.profile = {
            id: user.id,
            nom: user.nom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            avatar: user.avatar || null,
            role: user.role || 'CAISSIER',
            magasin: user.magasin || null
          };
        }
        this.isLoading = false;
      },
      error: () => {
        const local = this.apiService.getCurrentUser();
        if (local) {
          this.profile = {
            ...this.profile,
            ...local
          };
        }
        this.isLoading = false;
      }
    });
  }

  onAvatarChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (!this.profile.nom || !this.profile.email) {
      this.toastService.error('Veuillez renseigner votre nom complet et votre adresse e-mail.');
      return;
    }

    this.isSavingProfile = true;
    this.apiService.updateProfile({
      nom: this.profile.nom,
      email: this.profile.email,
      telephone: this.profile.telephone,
      avatar: this.profile.avatar
    }).subscribe({
      next: (res: any) => {
        this.isSavingProfile = false;
        if (res.user) {
          this.profile = { ...this.profile, ...res.user };
        }
        this.toastService.success('Vos informations personnelles ont été mises à jour avec succès.', 'Profil Enregistré');
      },
      error: (err: any) => {
        this.isSavingProfile = false;
        this.toastService.error(err.error?.error || 'Erreur lors de la mise à jour du profil.', 'Erreur');
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.ancienMotDePasse || !this.passwordForm.nouveauMotDePasse) {
      this.toastService.error('Veuillez saisir votre ancien et votre nouveau mot de passe.');
      return;
    }

    if (this.passwordForm.nouveauMotDePasse !== this.passwordForm.confirmationMotDePasse) {
      this.toastService.error('La confirmation du mot de passe ne correspond pas au nouveau mot de passe.');
      return;
    }

    if (this.passwordForm.nouveauMotDePasse.length < 6) {
      this.toastService.error('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    this.isSavingPassword = true;
    this.apiService.changePassword({
      ancienMotDePasse: this.passwordForm.ancienMotDePasse,
      nouveauMotDePasse: this.passwordForm.nouveauMotDePasse
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordForm = {
          ancienMotDePasse: '',
          nouveauMotDePasse: '',
          confirmationMotDePasse: ''
        };
        this.toastService.success('Votre mot de passe a été modifié avec succès.', 'Sécurité Renforcée');
      },
      error: (err: any) => {
        this.isSavingPassword = false;
        this.toastService.error(err.error?.error || 'Échec de la modification du mot de passe.', 'Erreur');
      }
    });
  }
}
