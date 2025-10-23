import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/is-authenticated';
import { AuthenticatedGuard } from './auth/guards/is-not-authenticated';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/routes/auth-routes'),
    canMatch: [NotAuthenticatedGuard],
  },

  {
    path: '',
    loadChildren: () => import('./notes/routes/notes-routes'),
    canMatch: [AuthenticatedGuard],
  },
];
