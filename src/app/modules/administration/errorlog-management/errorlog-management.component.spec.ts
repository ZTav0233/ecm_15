import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ErrorlogManagementComponent} from './errorlog-management.component';

describe('ErrorlogManagementComponent', () => {
  let component: ErrorlogManagementComponent;
  let fixture: ComponentFixture<ErrorlogManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorlogManagementComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorlogManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
