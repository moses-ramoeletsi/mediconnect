import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasichealthInformationPage } from './basic-health-information.page';

describe('BasichealthInformationPage', () => {
  let component: BasichealthInformationPage;
  let fixture: ComponentFixture<BasichealthInformationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasichealthInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
