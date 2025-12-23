import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'canada-summary',
    pathMatch: 'full',
  },
  {
    path: 'canada-summary',
    loadComponent: () => import('./pages/canada-summary/canada-summary.page').then(m => m.CanadaSummaryPage)
  },
  {
    path: 'details/:city',
    loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage)
  },
  {
    path: 'ontario',
    loadComponent: () => import('./pages/ontario/ontario.page').then(m => m.OntarioPage)
  }
];