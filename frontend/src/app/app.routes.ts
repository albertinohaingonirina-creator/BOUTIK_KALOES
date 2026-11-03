import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransfertComponent } from './components/transfert/transfert.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { InventaireComponent } from './components/inventaire/inventaire.component';
import { LoyverseComponent } from './components/loyverse/loyverse.component';
import { PosComponent } from './components/pos/pos.component';
import { AuthComponent } from './components/auth/auth.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { ClientsComponent } from './components/clients/clients.component';
import { ProfilComponent } from './components/profil/profil.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'caisse', component: PosComponent },
      { path: 'articles', component: ArticlesComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'transfert', component: TransfertComponent },
      { path: 'loyverse', component: LoyverseComponent },
      { path: 'inventaire', component: InventaireComponent },
      { path: 'utilisateurs', component: UtilisateursComponent },
      { path: 'profil', component: ProfilComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];