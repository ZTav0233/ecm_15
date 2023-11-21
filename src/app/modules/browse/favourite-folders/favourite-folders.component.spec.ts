import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FavouriteFoldersComponent} from './favourite-folders.component';

describe('FavouritesComponent', () => {
  let component: FavouriteFoldersComponent;
  let fixture: ComponentFixture<FavouriteFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FavouriteFoldersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavouriteFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
