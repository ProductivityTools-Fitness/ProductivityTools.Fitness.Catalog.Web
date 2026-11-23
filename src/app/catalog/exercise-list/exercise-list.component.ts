import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../catalog.service';
import {
  CANONICAL_BODY_PARTS,
  CANONICAL_EQUIPMENTS,
  CatalogExercise,
} from '../models/catalog-exercise';
import { CatalogImageComponent } from '../catalog-image/catalog-image.component';

@Component({
  selector: 'app-exercise-list',
  imports: [FormsModule, RouterLink, CatalogImageComponent],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css',
})
export class ExerciseListComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);

  readonly equipmentOptions = CANONICAL_EQUIPMENTS;
  readonly bodyPartOptions = CANONICAL_BODY_PARTS;
  readonly limitOptions = [50, 100, 200];

  searchName = signal<string>('');
  selectedEquipment = signal<string>('');
  selectedBodyPart = signal<string>('');
  limit = signal<number>(50);

  exercises = signal<CatalogExercise[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  readonly hasActiveFilters = computed<boolean>(() =>
    Boolean(
      this.searchName().trim() ||
        this.selectedEquipment().trim() ||
        this.selectedBodyPart().trim(),
    ),
  );

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService
      .searchExercises({
        name: this.searchName(),
        equipment: this.selectedEquipment(),
        bodyPart: this.selectedBodyPart(),
        limit: this.limit(),
      })
      .subscribe({
        next: (results) => {
          this.exercises.set(results ?? []);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading catalog exercises:', err);
          this.errorMessage.set('Nie udało się pobrać listy ćwiczeń z katalogu.');
          this.isLoading.set(false);
        },
      });
  }

  clearFilters(): void {
    this.searchName.set('');
    this.selectedEquipment.set('');
    this.selectedBodyPart.set('');
    this.search();
  }
}
