import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DocDetailsModalComponent} from "./doc-details-modal.component";

describe('DetailsModalComponent', () => {
  let component: DocDetailsModalComponent;
  let fixture: ComponentFixture<DocDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocDetailsModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
