import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Waits for Firebase Auth to initialize and redirects unauthenticated visitors
 * to /login so they do not hit 401 errors on the first load.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = await authService.getIdToken();
  if (token) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
