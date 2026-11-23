import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'exercises',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./catalog/exercise-list/exercise-list.component').then(
        (m) => m.ExerciseListComponent,
      ),
  },
  {
    path: 'exercises/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./catalog/exercise-editor/exercise-editor.component').then(
        (m) => m.ExerciseEditorComponent,
      ),
  },
  {
    path: 'exercises/:exerciseId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./catalog/exercise-editor/exercise-editor.component').then(
        (m) => m.ExerciseEditorComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '', redirectTo: '/exercises', pathMatch: 'full' },
  { path: '**', redirectTo: '/exercises' },
];
