import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersFeedbackPage } from './users-feedback.page';

describe('UsersFeedbackPage', () => {
  let component: UsersFeedbackPage;
  let fixture: ComponentFixture<UsersFeedbackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersFeedbackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
