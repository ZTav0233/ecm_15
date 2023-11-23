import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccesspolicyComponent } from './manage-accesspolicy.component';

describe('ManageAccesspolicyComponent', () => {
  let component: ManageAccesspolicyComponent;
  let fixture: ComponentFixture<ManageAccesspolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAccesspolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAccesspolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
