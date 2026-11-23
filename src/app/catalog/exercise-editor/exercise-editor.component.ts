import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../catalog.service';
import {
  CANONICAL_BODY_PARTS,
  CANONICAL_EQUIPMENTS,
  CANONICAL_MUSCLES,
  CatalogExercise,
  SaveCatalogExerciseRequest,
} from '../models/catalog-exercise';
import { CatalogImageComponent } from '../catalog-image/catalog-image.component';
import { NotificationService } from '../../notification/notification.service';

const MAX_GIF_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-exercise-editor',
  imports: [FormsModule, RouterLink, CatalogImageComponent],
  templateUrl: './exercise-editor.component.html',
  styleUrl: './exercise-editor.component.css',
})
export class ExerciseEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly notificationService = inject(NotificationService);

  readonly equipmentOptions = CANONICAL_EQUIPMENTS;
  readonly bodyPartOptions = CANONICAL_BODY_PARTS;
  readonly muscleOptions = CANONICAL_MUSCLES;

  isCreateMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  hasImage = signal<boolean>(false);
  imageFileName = signal<string | null>(null);
  imageRefreshKey = signal<number>(0);

  // Form fields
  exerciseId = '';
  name = '';
  primaryEquipment = '';
  extraEquipmentsText = '';
  primaryBodyPart = '';
  extraBodyPartsText = '';
  primaryMuscle = '';
  extraTargetMusclesText = '';
  secondaryMusclesText = '';
  instructionsText = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('exerciseId');
      if (!id) {
        this.isCreateMode.set(true);
        this.resetForm();
      } else {
        this.isCreateMode.set(false);
        this.loadExercise(id);
      }
    });
  }

  loadExercise(exerciseId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getByExerciseId(exerciseId).subscribe({
      next: (exercise) => {
        this.populateForm(exercise);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading exercise:', err);
        this.errorMessage.set(`Nie udało się pobrać ćwiczenia "${exerciseId}".`);
        this.isLoading.set(false);
      },
    });
  }

  onNameChange(newName: string): void {
    this.name = newName;
    if (this.isCreateMode() && !this.exerciseId.trim()) {
      // Only auto-suggest if user hasn't typed a custom exerciseId yet.
    }
  }

  suggestExerciseId(): void {
    const slug = this.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (slug) {
      this.exerciseId = `fp_${slug}`;
    }
  }

  save(): void {
    const trimmedName = this.name.trim();
    const trimmedId = this.exerciseId.trim();

    if (!trimmedName) {
      this.notificationService.showWarning('Nazwa ćwiczenia jest wymagana.');
      return;
    }
    if (this.isCreateMode() && !trimmedId) {
      this.notificationService.showWarning('Podaj Exercise ID (np. fp_barbell_curl).');
      return;
    }

    const payload = this.buildPayload(trimmedId, trimmedName);
    this.isSaving.set(true);

    const request$ = this.isCreateMode()
      ? this.catalogService.createExercise(payload)
      : this.catalogService.updateExercise(trimmedId, payload);

    request$.subscribe({
      next: (saved) => {
        this.isSaving.set(false);
        this.populateForm(saved);
        if (this.isCreateMode()) {
          this.notificationService.showSuccess(`Utworzono ćwiczenie "${saved.name}".`);
          this.router.navigate(['/exercises', saved.exerciseId]);
        } else {
          this.notificationService.showSuccess(`Zapisano zmiany w "${saved.name}".`);
        }
      },
      error: (err) => {
        console.error('Error saving exercise:', err);
        this.isSaving.set(false);
        this.notificationService.showError('Nie udało się zapisać ćwiczenia.');
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.isCreateMode() || !this.exerciseId) {
      return;
    }

    if (file.size > MAX_GIF_BYTES) {
      this.notificationService.showWarning('Plik przekracza maksymalny rozmiar 8 MB.');
      return;
    }

    this.isUploadingImage.set(true);
    this.catalogService.uploadImage(this.exerciseId, file).subscribe({
      next: (res) => {
        this.hasImage.set(true);
        this.imageFileName.set(res.fileName);
        this.imageRefreshKey.update((k) => k + 1);
        this.isUploadingImage.set(false);
        this.notificationService.showSuccess(`Zaktualizowano animację (${res.fileName}).`);
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        this.isUploadingImage.set(false);
        this.notificationService.showError('Nie udało się wgrać animacji.');
      },
    });
  }

  private populateForm(exercise: CatalogExercise): void {
    this.exerciseId = exercise.exerciseId;
    this.name = exercise.name ?? '';
    this.primaryEquipment = exercise.primaryEquipment ?? exercise.equipments?.[0] ?? '';
    this.extraEquipmentsText = this.formatExtras(exercise.equipments, this.primaryEquipment);
    this.primaryBodyPart = exercise.primaryBodyPart ?? exercise.bodyParts?.[0] ?? '';
    this.extraBodyPartsText = this.formatExtras(exercise.bodyParts, this.primaryBodyPart);
    this.primaryMuscle = exercise.primaryMuscle ?? exercise.targetMuscles?.[0] ?? '';
    this.extraTargetMusclesText = this.formatExtras(exercise.targetMuscles, this.primaryMuscle);
    this.secondaryMusclesText = (exercise.secondaryMuscles ?? []).join(', ');
    this.instructionsText = (exercise.instructions ?? []).join('\n');
    this.hasImage.set(Boolean(exercise.hasImage));
    this.imageFileName.set(exercise.imageFileName ?? null);
  }

  private resetForm(): void {
    this.exerciseId = '';
    this.name = '';
    this.primaryEquipment = '';
    this.extraEquipmentsText = '';
    this.primaryBodyPart = '';
    this.extraBodyPartsText = '';
    this.primaryMuscle = '';
    this.extraTargetMusclesText = '';
    this.secondaryMusclesText = '';
    this.instructionsText = '';
    this.hasImage.set(false);
    this.imageFileName.set(null);
    this.errorMessage.set(null);
  }

  private buildPayload(exerciseId: string, name: string): SaveCatalogExerciseRequest {
    const primaryEquipment = this.normalize(this.primaryEquipment);
    const primaryBodyPart = this.normalize(this.primaryBodyPart);
    const primaryMuscle = this.normalize(this.primaryMuscle);

    return {
      exerciseId,
      name,
      primaryEquipment,
      equipments: this.combinePrimaryAndExtras(primaryEquipment, this.extraEquipmentsText),
      primaryBodyPart,
      bodyParts: this.combinePrimaryAndExtras(primaryBodyPart, this.extraBodyPartsText),
      primaryMuscle,
      targetMuscles: this.combinePrimaryAndExtras(primaryMuscle, this.extraTargetMusclesText),
      secondaryMuscles: this.parseCommaList(this.secondaryMusclesText),
      instructions: this.instructionsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    };
  }

  private formatExtras(list: string[] | null | undefined, primary: string): string {
    if (!list || list.length === 0) return '';
    const primaryLower = primary.trim().toLowerCase();
    return list.filter((item) => item.trim().toLowerCase() !== primaryLower).join(', ');
  }

  private combinePrimaryAndExtras(primary: string | null, extrasText: string): string[] {
    const result: string[] = [];
    const seen = new Set<string>();
    const add = (val: string | null) => {
      if (!val) return;
      const key = val.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(val);
      }
    };
    add(primary);
    for (const item of this.parseCommaList(extrasText)) {
      add(item);
    }
    return result;
  }

  private parseCommaList(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private normalize(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
