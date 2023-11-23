import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmReportUserComponent } from './ecm-report-user.component';

describe('EcmReportUserComponent', () => {
  let component: EcmReportUserComponent;
  let fixture: ComponentFixture<EcmReportUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmReportUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmReportUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
