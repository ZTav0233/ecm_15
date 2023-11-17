import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnDestroy{
  @Input() public items: any;
  @Input() public field: string;
  @Input() public clickable: boolean;
  @Input() public actionType: string;
  @Input() public showToBtn = true;
  @Input() public showCcBtn = true;
  @Input() public showFromBtn = true;
  @Input() public showReviewerBtn = true;
  @Input() public showThruBtn = true;
  @Input() public showAddBtn = true;
  @Input() public showSelectBtn = false;
  @Input() public showTooltip = true;
  @Input() public iconClass = "fa ui-icon-people";
  @Input() public isRowSelectable = false;
  @Input() public isNoFoundMessage = false;
  @Input() public isNoAlternateRows = false;
  @Input() public isUserRoleNotList = false;
  @Input() public tooltipPosition = 'right';
  @Output() addToToList = new EventEmitter();

  @Output() addSelectToList = new EventEmitter();
  @Output() addToCCList = new EventEmitter();
  @Output() addToList = new EventEmitter();
  @Output() getRoleMembers = new EventEmitter();
  @Output() getListMembers = new EventEmitter();
  @Output() existsInList = new EventEmitter();

  mAddToToList(item) {
    this.addToToList.emit(item);
  }

  mAddToCCList(item) {
    this.addToCCList.emit(item);
  }


  mAddToList(item) {
    this.addToList.emit(item);
  }

  mGetItemMembers(item) {
    this.getRoleMembers.emit(item);
  }

  mGetListMembers(item) {
    this.getListMembers.emit(item);
  }

  mExistsInList(list) {
    this.existsInList.emit(list);
  }

  mSelectToList(item) {
    this.addSelectToList.emit(item);
  }

  ngOnDestroy(){
    this.items = null;
    this.field = null;
    this.clickable = null;
    this.actionType = null;
    this.showToBtn = true;
    this.showCcBtn = true;
    this.showThruBtn = true;
    this.showReviewerBtn = true;
    this.showFromBtn = true;
    this.showAddBtn = true;
    this.showSelectBtn = false;
    this.showTooltip = true;
    this.iconClass = null;
    this.isRowSelectable = false;
    this.isNoFoundMessage = false;
    this.isNoAlternateRows = false;
    this.isUserRoleNotList = false;
    this.tooltipPosition = 'right';
    this.addToToList = null;
    this.addSelectToList = null;
    this.addToCCList = null;
    this.addToList = null;
    this.getRoleMembers = null;
    this.getListMembers = null;
    this.existsInList = null;
  }
}


