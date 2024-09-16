import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewAppointmentsPage } from './view-appointments.page';

describe('ViewAppointmentsPage', () => {
  let component: ViewAppointmentsPage;
  let fixture: ComponentFixture<ViewAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
