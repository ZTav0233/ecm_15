import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TeamsharedDocsComponent} from './teamshared-docs.component';

describe('TeamsharedDocsComponent', () => {
  let component: TeamsharedDocsComponent;
  let fixture: ComponentFixture<TeamsharedDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsharedDocsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsharedDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
