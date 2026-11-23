import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from '../notification/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      let authReq = req;
      if (token && !req.headers.has('Authorization')) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      return next(authReq);
    }),
    catchError((error: unknown) => {
      const status =
        error instanceof HttpErrorResponse
          ? error.status
          : typeof error === 'object' && error !== null && 'status' in error
            ? Number((error as { status: unknown }).status)
            : undefined;

      // Missing exercise images return 404 by design; do not toast on those.
      const isImageLookup = req.url.endsWith('/image') && req.method === 'GET';
      if (isImageLookup && status === 404) {
        return throwError(() => error);
      }

      if (status === 401) {
        notificationService.showError(
          'Brak autoryzacji (401). Zaloguj się kontem administratora, aby kontynuować.',
          {
            label: 'Zaloguj się',
            callback: () => {
              router.navigate(['/login']);
            },
          },
          8000,
        );
      } else if (status === 403) {
        notificationService.showError(
          'Brak uprawnień (403). Tylko administrator może zarządzać katalogiem ćwiczeń.',
          {
            label: 'Zaloguj się',
            callback: () => {
              router.navigate(['/login']);
            },
          },
          8000,
        );
      } else if (status === 0) {
        notificationService.showError(
          'Błąd sieci lub CORS (status 0). Sprawdź połączenie z Fitness.Catalog.Api.',
          undefined,
          8000,
        );
      }

      return throwError(() => error);
    }),
  );
};
