import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthInformationPage } from './health-information.page';

describe('HealthInformationPage', () => {
  let component: HealthInformationPage;
  let fixture: ComponentFixture<HealthInformationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
