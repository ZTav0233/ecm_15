import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmUsersComponent } from './ecm-users.component';

describe('EcmUsersComponent', () => {
  let component: EcmUsersComponent;
  let fixture: ComponentFixture<EcmUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
