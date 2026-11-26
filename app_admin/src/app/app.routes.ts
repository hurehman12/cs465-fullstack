import { Routes } from '@angular/router';
import { ResortAnalyticsComponent } from './resort-analytics/resort-analytics.component';
import { adminGuard } from './guards/admin.guard';

import {
  AddTripComponent
} from './add-trip/add-trip.component';

import {
  EditTripComponent
} from './edit-trip/edit-trip.component';

import {
  TripListingComponent
} from './trip-listing/trip-listing.component';

import {
  LoginComponent
} from './login/login.component';

export const routes: Routes = [
  {
    path: 'resort-analytics',
    component: ResortAnalyticsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'add-trip',
    component: AddTripComponent
  },
  {
    path: 'edit-trip',
    component: EditTripComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: TripListingComponent,
    pathMatch: 'full'
  }
];
