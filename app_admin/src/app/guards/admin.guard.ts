import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import {
  AuthenticationService
} from '../services/authentication.service';

export const adminGuard: CanActivateFn = () => {

  const authentication = inject(AuthenticationService);
  const router = inject(Router);

  if (!authentication.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!authentication.hasRole('admin')) {
    return router.createUrlTree(['/']);
  }

  return true;
};