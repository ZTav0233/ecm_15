import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmOrgUnitManagementComponent } from './ecm-org-unit-management.component';

describe('EcmOrgUnitManagementComponent', () => {
  let component: EcmOrgUnitManagementComponent;
  let fixture: ComponentFixture<EcmOrgUnitManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmOrgUnitManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmOrgUnitManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
