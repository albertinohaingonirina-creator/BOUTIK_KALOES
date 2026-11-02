import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransfertComponent } from './components/transfert/transfert.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { InventaireComponent } from './components/inventaire/inventaire.component';
import { LoyverseComponent } from './components/loyverse/loyverse.component';
import { PosComponent } from './components/pos/pos.component';
import { AuthComponent } from './components/auth/auth.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { ClientsComponent } from './components/clients/clients.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'caisse', component: PosComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'transfert', component: TransfertComponent },
  { path: 'loyverse', component: LoyverseComponent },
  { path: 'inventaire', component: InventaireComponent },
  { path: 'utilisateurs', component: UtilisateursComponent },
  { path: '**', redirectTo: 'login' }
];