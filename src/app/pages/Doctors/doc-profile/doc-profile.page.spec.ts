import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocProfilePage } from './doc-profile.page';

describe('DocProfilePage', () => {
  let component: DocProfilePage;
  let fixture: ComponentFixture<DocProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DocProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
