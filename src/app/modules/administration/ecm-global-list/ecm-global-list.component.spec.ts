import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmGlobalListComponent } from './ecm-global-list.component';

describe('EcmGlobalListComponent', () => {
  let component: EcmGlobalListComponent;
  let fixture: ComponentFixture<EcmGlobalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmGlobalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmGlobalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
