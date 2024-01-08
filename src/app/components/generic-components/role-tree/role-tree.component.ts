import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../services/data.Service';

@Component({
  selector: 'app-role-tree',
  templateUrl: './role-tree.component.html'
})
export class RoleTreeComponent implements OnDestroy, OnInit {
  @Input() public data: any;
  @Input() public showAddToToBtn = true;
  @Input() public showAddToCCBtn = true;
  @Input() public fromMemo;
  @Input() public showAddChildBtn = false;
  @Input() public showRemoveItemBtn = false;
  @Input() public editRole;
  @Input() public actionType: string;
  @Input() public activeTab: string;
  @Input() public noLeaves = false;
  @Output() nodeSelect = new EventEmitter();
  @Output() nodeUnselect = new EventEmitter();
  @Output() expandNode = new EventEmitter();
  @Output() getRoleMembers = new EventEmitter();
  @Output() addToToList = new EventEmitter();
  @Output() addToCCList = new EventEmitter();
  @Output() addToThruList = new EventEmitter();
  @Output() addToRevList = new EventEmitter();
  @Output() addToFromList = new EventEmitter();
  @Output() addToList = new EventEmitter();
  @Output() removeItem = new EventEmitter();
  @Output() existsInList = new EventEmitter();
  @Output() addChildren = new EventEmitter();
  @Output() selectNode = new EventEmitter();
  @Output() showEditRole = new EventEmitter();
  @Output() showDeleteRole = new EventEmitter();
  constructor(public dataService: DataService) {

  }
  ngOnInit() {
    console.log(this.fromMemo);
    
  }
  ngOnChanges() {
    this.dataService.memoTypeState$.subscribe(res => {
      // console.log(res);
      // console.log('ngOnChanges');
      if (res == 'Letter') {
        this.showAddToToBtn = false;
        this.showAddToCCBtn = false;
      }else{
        this.showAddToToBtn = true;
        this.showAddToCCBtn = true;
      }
    })
  }
  mExpandNode(item) {
    this.expandNode.emit(item);
  }

  mSelectNode(item) {
    this.selectNode.emit(item);
  }

  mGetRoleMembers(item) {
    if (item.empNo) {
      return;
    }
    this.getRoleMembers.emit(item);
  }

  mAddToToList(item) {
    this.addToToList.emit(item);
  }

  mAddToCCList(item) {
    this.addToCCList.emit(item);
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
  mAddToList(item) {
    this.addToList.emit(item);
  }

  mExistsInList(item) {
    this.existsInList.emit(item);
  }

  mRemoveItem(item) {
    this.removeItem.emit(item);
  }

  mAddChildren(item) {
    this.addChildren.emit(item);
  }
  editRoleitem(item) {
    this.showEditRole.emit(item);
  }
  deleteRole(item) {
    this.showDeleteRole.emit(item);
  }
  ngOnDestroy() {
    this.data = null;
    this.showAddToToBtn = true;
    this.showAddToCCBtn = true;
    this.showAddChildBtn = false;
    this.showRemoveItemBtn = false;
    this.editRole = null;
    this.actionType = '';
    this.activeTab = '';
    this.noLeaves = false;
    this.nodeSelect = null;
    this.nodeUnselect = null;
    this.expandNode = null;
    this.getRoleMembers = null;
    this.addToToList = null;
    this.addToCCList = null;
    this.addToList = null;
    this.removeItem = null;
    this.existsInList = null;
    this.addChildren = null;
    this.selectNode = null;
    this.showEditRole = null;
    this.showDeleteRole = null;
  }
}


