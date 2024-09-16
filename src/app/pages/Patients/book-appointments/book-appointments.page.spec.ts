import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookAppointmentsPage } from './book-appointments.page';

describe('BookAppointmentsPage', () => {
  let component: BookAppointmentsPage;
  let fixture: ComponentFixture<BookAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
