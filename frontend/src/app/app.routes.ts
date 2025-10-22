import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/is-authenticated';
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/routes/auth-routes'),
    canMatch: [NotAuthenticatedGuard],
  },

  {
    path: '',
    loadChildren: () => import('./notes/routes/notes-routes'),
  },
];
