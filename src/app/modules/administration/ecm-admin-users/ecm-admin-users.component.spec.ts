import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmAdminUsersComponent } from './ecm-admin-users.component';

describe('EcmAdminUsersComponent', () => {
  let component: EcmAdminUsersComponent;
  let fixture: ComponentFixture<EcmAdminUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmAdminUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmAdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
