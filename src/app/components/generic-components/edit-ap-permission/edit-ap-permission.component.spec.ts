import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApPermissionComponent } from './edit-ap-permission.component';

describe('EditApPermissionComponent', () => {
  let component: EditApPermissionComponent;
  let fixture: ComponentFixture<EditApPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditApPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditApPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
