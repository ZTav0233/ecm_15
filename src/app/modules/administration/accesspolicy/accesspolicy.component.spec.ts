import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AccesspolicyComponent} from './accesspolicy.component';

describe('AccesspolicyComponent', () => {
  let component: AccesspolicyComponent;
  let fixture: ComponentFixture<AccesspolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccesspolicyComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
