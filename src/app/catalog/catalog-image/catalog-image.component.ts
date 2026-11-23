import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CatalogService } from '../catalog.service';

/**
 * Loads an exercise animation via HttpClient (so the Firebase Bearer token is attached
 * automatically by authInterceptor) and displays it using an Object URL.
 *
 * Uses IntersectionObserver so off-screen cards in the catalog grid are not fetched until
 * scrolled near the viewport.
 */
@Component({
  selector: 'app-catalog-image',
  standalone: true,
  template: `
    @if (objectUrl()) {
      <img [src]="objectUrl()" [alt]="alt()" class="catalog-img" />
    } @else {
      <div class="placeholder">
        <span class="placeholder-icon">🏋️</span>
        <span class="placeholder-text">{{ isLoading() ? 'Ładowanie...' : 'Brak podglądu' }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .catalog-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
      }
      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        color: #94a3b8;
        font-size: 0.82rem;
      }
      .placeholder-icon {
        font-size: 1.8rem;
      }
    `,
  ],
})
export class CatalogImageComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly exerciseId = input.required<string>();
  readonly alt = input<string>('');
  readonly hasImage = input<boolean>(true);
  readonly refreshKey = input<number>(0);

  readonly objectUrl = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  private readonly isVisible = signal<boolean>(false);
  private currentObjectUrl: string | null = null;

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.isVisible.set(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.isVisible.set(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' },
      );

      observer.observe(this.elementRef.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    effect((onCleanup) => {
      const id = this.exerciseId();
      const shouldLoad = this.hasImage();
      const visible = this.isVisible();
      // Track refreshKey so uploading a new GIF reloads the blob.
      this.refreshKey();

      this.revokeCurrentUrl();
      this.objectUrl.set(null);

      if (!id || !shouldLoad || !visible) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      const sub = this.catalogService.fetchImageBlob(id).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.objectUrl.set(url);
          this.isLoading.set(false);
        },
        error: () => {
          this.objectUrl.set(null);
          this.isLoading.set(false);
        },
      });

      onCleanup(() => {
        sub.unsubscribe();
        this.revokeCurrentUrl();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.revokeCurrentUrl();
    });
  }

  private revokeCurrentUrl(): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }
}
