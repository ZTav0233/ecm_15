import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmAdminLogsComponent } from './ecm-admin-logs.component';

describe('EcmAdminLogsComponent', () => {
  let component: EcmAdminLogsComponent;
  let fixture: ComponentFixture<EcmAdminLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmAdminLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmAdminLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
