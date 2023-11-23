import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EntrytemplateMappingComponent} from './entrytemplate-mapping.component';

describe('EntrytemplateMappingComponent', () => {
  let component: EntrytemplateMappingComponent;
  let fixture: ComponentFixture<EntrytemplateMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EntrytemplateMappingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrytemplateMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
