import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AccessPolicyMappingComponent} from './accesspolicy-mapping.component';

describe('AccessPolicyMappingComponent', () => {
  let component: AccessPolicyMappingComponent;
  let fixture: ComponentFixture<AccessPolicyMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccessPolicyMappingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessPolicyMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
