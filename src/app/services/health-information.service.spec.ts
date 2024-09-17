import { TestBed } from '@angular/core/testing';

import { HealthInformationService } from './health-information.service';

describe('HealthInformationService', () => {
  let service: HealthInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HealthInformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
