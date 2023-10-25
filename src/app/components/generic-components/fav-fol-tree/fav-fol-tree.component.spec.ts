import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavFolTreeComponent } from './fav-fol-tree.component';

describe('FavFolTreeComponent', () => {
  let component: FavFolTreeComponent;
  let fixture: ComponentFixture<FavFolTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavFolTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavFolTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
