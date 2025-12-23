import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanadaSummaryPage } from './canada-summary.page';

describe('CanadaSummaryPage', () => {
  let component: CanadaSummaryPage;
  let fixture: ComponentFixture<CanadaSummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CanadaSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
