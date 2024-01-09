import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MemoRefComponent} from './memoref.component';

describe('DelegationComponent', () => {
  let component: MemoRefComponent;
  let fixture: ComponentFixture<MemoRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MemoRefComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
