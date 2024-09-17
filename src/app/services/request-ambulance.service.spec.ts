import { TestBed } from '@angular/core/testing';

import { RequestAmbulanceService } from './request-ambulance.service';

describe('RequestAmbulanceService', () => {
  let service: RequestAmbulanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestAmbulanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
