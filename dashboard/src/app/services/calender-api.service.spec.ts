import { TestBed } from '@angular/core/testing';

import { CalenderApiService } from './calender-api.service';

describe('CalenderApiService', () => {
  let service: CalenderApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalenderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
