import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulancePage } from './ambulance.page';

describe('AmbulancePage', () => {
  let component: AmbulancePage;
  let fixture: ComponentFixture<AmbulancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbulancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
