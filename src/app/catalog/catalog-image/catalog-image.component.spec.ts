import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CatalogImageComponent } from './catalog-image.component';
import { CatalogService } from '../catalog.service';

describe('CatalogImageComponent', () => {
  it('fetches the exercise image exactly once without re-triggering the effect', () => {
    const fetchImageBlob = vi.fn(() => of(new Blob(['gif-bytes'], { type: 'image/gif' })));
    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-image-url');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    TestBed.configureTestingModule({
      imports: [CatalogImageComponent],
      providers: [{ provide: CatalogService, useValue: { fetchImageBlob } }],
    });

    const fixture = TestBed.createComponent(CatalogImageComponent);
    fixture.componentRef.setInput('exerciseId', 'fp_bench_press');
    fixture.componentRef.setInput('hasImage', true);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fetchImageBlob).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.objectUrl()).toBe('blob:test-image-url');

    fixture.destroy();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:test-image-url');

    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });
});
