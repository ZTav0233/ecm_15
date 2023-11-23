import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityToolComponent } from './security-tool.component';

describe('SecurityToolComponent', () => {
  let component: SecurityToolComponent;
  let fixture: ComponentFixture<SecurityToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecurityToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
