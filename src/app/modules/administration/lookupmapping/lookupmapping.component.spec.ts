import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LookupmappingComponent} from './lookupmapping.component';

describe('LookupmappingComponent', () => {
  let component: LookupmappingComponent;
  let fixture: ComponentFixture<LookupmappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LookupmappingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupmappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
