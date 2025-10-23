import { Routes } from '@angular/router';
import { HomePage } from '../pages/home-page/home-page';

export const notesRoutes: Routes = [
  {
    path: 'notes',
    component: HomePage,
  },
  {
    path: '',
    redirectTo: 'notes',
    pathMatch: 'full',
  },
];
export default notesRoutes;
