import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly authService = inject(AuthService);
  avatarLoadError = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.avatarLoadError.set(false);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
