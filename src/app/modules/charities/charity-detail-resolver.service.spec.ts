import { TestBed, inject } from '@angular/core/testing';

import { CharityDetailResolverService } from './charity-detail-resolver.service';

describe('CharityDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CharityDetailResolverService]
    });
  });

  it('should be created', inject([CharityDetailResolverService], (service: CharityDetailResolverService) => {
    expect(service).toBeTruthy();
  }));
});
