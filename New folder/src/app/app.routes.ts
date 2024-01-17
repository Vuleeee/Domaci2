import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DodajComponent } from './dodaj/dodaj.component';
const routeConfig: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page'
  },
  {
    path: 'dodaj',
    component: DodajComponent,
    title: 'Dodaj Jelo'
  }
];

export default routeConfig;
