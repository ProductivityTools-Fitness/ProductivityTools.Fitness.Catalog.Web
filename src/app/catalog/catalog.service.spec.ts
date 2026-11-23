import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { environment } from '../../environments/environment';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('searches exercises with filters', () => {
    service
      .searchExercises({ name: 'bench', equipment: 'barbell', bodyPart: 'chest', limit: 100 })
      .subscribe((res) => {
        expect(res).toEqual([]);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/exercises/search` &&
        r.params.get('name') === 'bench' &&
        r.params.get('equipment') === 'barbell' &&
        r.params.get('bodyPart') === 'chest' &&
        r.params.get('limit') === '100',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('updates an exercise by exerciseId via PUT', () => {
    const payload = {
      exerciseId: 'fp_bench_press',
      name: 'bench press',
      primaryEquipment: 'barbell',
      equipments: ['barbell'],
      primaryBodyPart: 'chest',
      bodyParts: ['chest'],
      primaryMuscle: 'pectorals',
      targetMuscles: ['pectorals'],
      secondaryMuscles: ['triceps'],
      instructions: ['Press the bar up.'],
    };

    service.updateExercise('fp_bench_press', payload).subscribe((res) => {
      expect(res.primaryEquipment).toBe('barbell');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/exercises/by-exercise-id/fp_bench_press`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, imageFileName: null, hasImage: false });
  });
});
