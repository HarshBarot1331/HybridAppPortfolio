import { TestBed } from '@angular/core/testing';

import { Aqhi } from './aqhi';

describe('Aqhi', () => {
  let service: Aqhi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aqhi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
