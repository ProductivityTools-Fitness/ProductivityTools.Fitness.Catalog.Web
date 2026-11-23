import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CatalogExercise,
  SaveCatalogExerciseRequest,
  UploadImageResponse,
} from './models/catalog-exercise';

export interface CatalogSearchFilters {
  name?: string;
  bodyPart?: string;
  equipment?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/exercises`;

  searchExercises(filters: CatalogSearchFilters = {}): Observable<CatalogExercise[]> {
    let params = new HttpParams().set('limit', filters.limit ?? 50);
    if (filters.name?.trim()) {
      params = params.set('name', filters.name.trim());
    }
    if (filters.bodyPart?.trim()) {
      params = params.set('bodyPart', filters.bodyPart.trim());
    }
    if (filters.equipment?.trim()) {
      params = params.set('equipment', filters.equipment.trim());
    }
    return this.http.get<CatalogExercise[]>(`${this.baseUrl}/search`, { params });
  }

  getByExerciseId(exerciseId: string): Observable<CatalogExercise> {
    return this.http.get<CatalogExercise>(
      `${this.baseUrl}/by-exercise-id/${encodeURIComponent(exerciseId)}`,
    );
  }

  createExercise(payload: SaveCatalogExerciseRequest): Observable<CatalogExercise> {
    return this.http.post<CatalogExercise>(`${this.baseUrl}/add`, payload);
  }

  updateExercise(
    exerciseId: string,
    payload: SaveCatalogExerciseRequest,
  ): Observable<CatalogExercise> {
    return this.http.put<CatalogExercise>(
      `${this.baseUrl}/by-exercise-id/${encodeURIComponent(exerciseId)}`,
      payload,
    );
  }

  uploadImage(exerciseId: string, file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<UploadImageResponse>(
      `${this.baseUrl}/${encodeURIComponent(exerciseId)}/image`,
      formData,
    );
  }

  fetchImageBlob(exerciseId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${encodeURIComponent(exerciseId)}/image`, {
      responseType: 'blob',
    });
  }
}
