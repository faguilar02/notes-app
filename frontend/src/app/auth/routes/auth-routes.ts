import { Routes } from '@angular/router';
import { Login } from '../pages/login/login';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

export default authRoutes;
