import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-reports-role-tree',
  templateUrl: './reports-role-tree.component.html'
})
export class ReportsRoleTreeComponent {
  @Input() public data: any;
  @Input() public roleTreeSelection = undefined;
  @Output() expandNode = new EventEmitter();
  /*@Output() getRoleMembers = new EventEmitter();*/
  @Output() selectNode = new EventEmitter();

  mExpandNode(item) {
    this.expandNode.emit(item);
  }

  mSelectNode(item) {
    this.selectNode.emit(item);
  }

/*
  mGetRoleMembers(item) {
    if (item.empNo) {
      return;
    }
    this.getRoleMembers.emit(item);
  }
*/

}


