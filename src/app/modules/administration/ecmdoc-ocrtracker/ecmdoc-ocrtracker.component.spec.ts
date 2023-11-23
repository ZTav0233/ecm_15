import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdocOcrtrackerComponent } from './ecmdoc-ocrtracker.component';

describe('EcmdocOcrtrackerComponent', () => {
  let component: EcmdocOcrtrackerComponent;
  let fixture: ComponentFixture<EcmdocOcrtrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdocOcrtrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdocOcrtrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
