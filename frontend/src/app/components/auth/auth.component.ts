import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  email: string = '';
  motDePasse: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitEmail(): void {
    if (!this.email || !this.motDePasse) {
      this.errorMessage = 'Veuillez renseigner votre adresse e-mail et votre mot de passe.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.loginPassword(this.email, this.motDePasse).subscribe({
      next: () => {
        this.isLoading = false;
        const user = this.apiService.getCurrentUser();
        if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/caisse']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Identifiants ou mot de passe incorrects.';
      }
    });
  }
}