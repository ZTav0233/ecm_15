import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmExcludeUsersComponent } from './ecm-exclude-users.component';

describe('EcmExcludeUsersComponent', () => {
  let component: EcmExcludeUsersComponent;
  let fixture: ComponentFixture<EcmExcludeUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmExcludeUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmExcludeUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
