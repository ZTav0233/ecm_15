import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../services/data.Service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html'
})
export class RoleListComponent implements OnDestroy, OnInit {
  @Input() public items: any;
  @Input() public actionType: string;
  @Input() public showFromBtn = true;
  @Input() public showReviewerBtn = true;
  @Input() public showThruBtn = true;
  @Input() public showToBtn = true;
  @Input() public showCcBtn = true;
  @Input() public fromMemo;
  @Output() addToToList = new EventEmitter();
  @Output() addToCCList = new EventEmitter();
  @Output() existsInList = new EventEmitter();
  @Output() getRoleMembers = new EventEmitter();
  @Output() addToThruList = new EventEmitter();
  @Output() addToRevList = new EventEmitter();
  @Output() addToFromList = new EventEmitter();
  constructor(public dataService: DataService) {

  }
  ngOnInit() {
    // console.log(this.fromMemo)
  }
  ngOnChanges() {
    this.dataService.memoTypeState$.subscribe(res => {
      if (res == 'Letter') {
        this.showToBtn = false;
        this.showCcBtn = false;
      }else{
        this.showToBtn = true;
        this.showCcBtn = true;
      }
    })
  }
  mAddToToList(item) {
    this.addToToList.emit(item);
  }

  mAddToCCList(item) {
    this.addToCCList.emit(item);
  }

  mGetItemMembers(item) {
    this.getRoleMembers.emit(item);
  }

  mExistsInList(list) {
    this.existsInList.emit(list);
  }
  mAddToThruList(item) {
    this.addToThruList.emit(item);
  }
  mAddToRevList(item) {
    this.addToRevList.emit(item);
  }
  mAddToFromList(item) {
    this.addToFromList.emit(item);
  }

  ngOnDestroy() {
    this.items = null;
    this.actionType = null;
    this.addToToList = null;
    this.addToCCList = null;
    this.existsInList = null;
    this.getRoleMembers = null;
    this.addToThruList = null;
    this.addToRevList = null;
    this.addToFromList = null;
  }
}

