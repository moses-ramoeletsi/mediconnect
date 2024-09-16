import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceRequestsPage } from './ambulance-requests.page';

describe('AmbulanceRequestsPage', () => {
  let component: AmbulanceRequestsPage;
  let fixture: ComponentFixture<AmbulanceRequestsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbulanceRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
