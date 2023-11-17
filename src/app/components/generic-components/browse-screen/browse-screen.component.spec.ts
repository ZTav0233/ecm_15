import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseScreenComponent } from './browse-screen.component';

describe('BrowseScreenComponent', () => {
  let component: BrowseScreenComponent;
  let fixture: ComponentFixture<BrowseScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
