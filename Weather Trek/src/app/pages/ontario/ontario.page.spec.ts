import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OntarioPage } from './ontario.page';

describe('OntarioPage', () => {
  let component: OntarioPage;
  let fixture: ComponentFixture<OntarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OntarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
