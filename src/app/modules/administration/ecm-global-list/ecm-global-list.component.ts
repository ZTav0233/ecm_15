import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {CoreService} from "../../../services/core.service";
import {Subscription} from "rxjs";
import * as $ from 'jquery';
import {GrowlService} from "../../../services/growl.service";
import {User} from "../../../models/user/user.model";
import {UserList} from "../../../models/user/user-list.model";
import {ConfirmationService} from "primeng/api";
import {BreadcrumbService} from "../../../services/breadcrumb.service";
import * as _ from "lodash";

@Component({
  selector: 'app-ecm-global-list',
  templateUrl: './ecm-global-list.component.html',
  styleUrls: ['./ecm-global-list.component.css']
})
export class EcmGlobalListComponent implements OnInit {
  public userList: any;
  public user: User;
  private subscriptions: Subscription[] = [];
  public selectedParentList: any;
  public showingUsers = false;
  public criteria: any[];
  public searchStarted: boolean;
  public listUsers: any[] = [];
  private listUsersTemp: any;
  public listName: any;
  private newDistList = true;
  public userLists: any;
  public selectedType = 'USER';
  public SelectedUserList = [];
  public searchText: any;
  public selectedIndex: any;
  public startAddUser = false;
  public selectedList = '';
  public showRoleTree = false;
  public showRoleList = false;
  private tmpRoleTree: any[];
  public roleData: any = {roles: {model: {}}};
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  isGlobal = true;
  userOrRole: any;
  isSaveDisabled = true;
  public selectedId;
  public noListSelected=true;
  public searchTypes = [
    {label: 'User', value: 'USER', icon: 'fa fa-fw fa-cc-paypal'},
    {label: 'Role', value: 'ROLE', icon: 'fa fa-fw fa-cc-visa'}
  ];

  public updateList = new UserList();
  public searchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: ''
  };
  public distList = {'id': 1, 'empNo': 1002, 'name': 'ECM-Global List', lists: [], model: {query: ''}};
  public distListForSearch: any;
  public busy: boolean;
  isFilterEnabled=false;
  constructor(private userService: UserService, private coreService: CoreService, private growlService: GrowlService,
              private confirmationService: ConfirmationService, private breadcrumbService: BreadcrumbService) {
    this.user = this.userService.getCurrentUser();
    //this.distListForSearch=[];

  }
   trackByFn(index, item) {
    return index; // or item.id
  }

  ngOnInit() {
    this.getUserLists();
    this.breadcrumbService.setItems([
      {label: 'Admin'},
      {label: 'ECM-Global List'}
    ]);

  }
  searchListName(e){
    if(e.length>0){

    }
  }

  clearItems() {
    this.listName = undefined;
    this.listUsers = [];
    this.newDistList = true;
    this.selectedIndex=undefined;
    this.userOrRole=undefined;
    this.isFilterEnabled=false;
  }

  searchList() {
    this.distList.lists = this.distListForSearch.filter(e =>
      e.name.toUpperCase().indexOf(this.distList.model.query.toUpperCase()) !== -1
    );
  }

  searchUserAndRole(filterText,e?) {
    if(e != undefined && e != null && e.data && e.data.trim().length>0){
      this.isFilterEnabled=true;
    }
    else{
      this.isFilterEnabled=false;
    }

    if(filterText==='removeFilter'){
      this.userOrRole='';
      if(!this.noListSelected) {
        this.listUsers = this.listUsersTemp
      }
    }
    else{
      this.listUsers = this.listUsersTemp.filter(e =>
      e.fulName.toUpperCase().indexOf(this.userOrRole.toUpperCase()) !== -1
    );
    }
    this.SelectedUserList=[];

  }

  getUserLists() {
    this.distList.lists = [];
    this.userList = [];
    this.busy = true;
    this.userService.getUserLists(true).subscribe(data => {
      this.busy = false;
      const remainings = [];
      data.map((l, i) => {
        l.name = l.name.replace("''", "'");
        if (l.id > 1 && l.isGlobal === 'Y') {
          this.distList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.distListForSearch = this.distList.lists;
      this.userList = remainings;
      this.userList.push(this.distList);
    }, err => {
      this.busy = false;
    });
    //if(this.selectedIndex){
    //  this.selectedIndex=this.selectedIndex;
    //}
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  checkChange(event) {
    this.isGlobal = event;
  }

  showSubList(event, listid, i) {
    $('.ui-accordion-content').show();
    this.searchStarted = false;
    this.listName = '';
    this.listUsers = [];
    if (this.selectedParentList === listid || !this.newDistList) {
      this.showingUsers = !this.showingUsers;
      this.busy = true;
      this.userService.getUserLists(true).subscribe(ldata => {
        this.busy = false;
        this.assignUserList(ldata);
      }, err => {
        this.busy = false;
      });
    } else {
      this.showingUsers = true;
    }
    this.selectedParentList = listid;
    this.newDistList = true;
  }

  assignUserList(data) {
    this.userLists = data;
    this.userLists.push(this.distList);
  }

  searchUsers() {
    let formValid = true;

    this.searchQueary.userType = this.selectedType;
    if ((this.searchQueary.userName !== undefined && this.searchQueary.userName !== '' && this.searchQueary.userName !== null) ||
      (this.searchQueary.title !== undefined && this.searchQueary.title !== '' && this.searchQueary.title !== null) ||
      (this.searchQueary.mail !== undefined && this.searchQueary.mail !== '' && this.searchQueary.mail !== null) ||
      (this.searchQueary.empNo !== undefined && this.searchQueary.empNo !== '' && this.searchQueary.empNo !== null) ||
      (this.searchQueary.orgCode !== undefined && this.searchQueary.orgCode !== '' && this.searchQueary.orgCode !== null) ||
      (this.searchQueary.phone !== undefined && this.searchQueary.phone !== '' && this.searchQueary.phone !== null)) {
    } else {
      formValid = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Warning', detail: 'Fill Any One Field To Search'
      });
    }
    if (formValid) {
      this.searchStarted = true;
      if(this.searchQueary.userName===""){
        delete this.searchQueary.userName;
      }
      if(this.searchQueary.orgCode===""){
        delete this.searchQueary.orgCode;
      }
      this.busy = true;
      this.userService.searchEcmUsers(this.searchQueary).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'No Result', detail: 'No Results Found'
          });
        }
        this.SelectedUserList = data;
      }, err => {
        this.busy = false;
      });
    }
  }

  clearResult() {
    this.searchStarted = false;
    this.searchText = '';
  }

  userExist(user) {
    for (const User of this.listUsers) {
      if (user.fulName === User.fulName || user.name === User.fulName || user.headRoleName === User.fulName) {
        return true;
      }
    }
    return false;
  }

  showRoleTreeModel() {
    this.getOrgRole();
    this.showRoleTree = true;
  }

  showRoleListModel() {
    this.getRoles();
    this.showRoleList = true;
  }

  selectUser(user) {
    const exist = this.userExist(user);

    if (!exist) {
      if (this.selectedType === 'USER') {
        this.listUsers.push({'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': 'USER'});
      } else if (this.selectedType === 'ROLE') {
        if (user.name) {
          this.listUsers.push({'EmpNo': user.id, 'fulName': user.name, 'appRole': 'ROLE'});
        } else if (user.headRoleName) {
          this.listUsers.push({'EmpNo': user.id, 'fulName': user.headRoleName, 'appRole': 'ROLE'});
        }
      }
    }
     else{
       this.growlService.showGrowl({
      severity: 'error',
      summary: 'Already Exist', detail: 'User already exist in list'
    });
    }
    user.disabled = true;
    this.isSaveDisabled = false;
  }
  searchRole() {
    this.roleData.roles.roleTree = this.roleData.roles.oRoleTree.filter(e => {
      if (e.data.name && e.data.orgCode) {
         e.data.name.toUpperCase().indexOf(this.roleData.roles.model.query2.toUpperCase()) !== -1
          || e.data.orgCode.toUpperCase().indexOf(this.roleData.roles.model.query2.toUpperCase()) !== -1
      }
    });
  }

  closeModel(){
    this.roleData.roles.model.query2=undefined;
  }

  getOrgRole() {
    this.busy = true;
    this.userService.getRolesByType(1,0).subscribe(res => {
      this.busy = false;
      const response = res;
      this.tmpRoleTree = [];
      res.map((head) => {
        this.tmpRoleTree.push({
          label: head.name,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false
        });
      });
      this.roleData.roles.roleTree = this.tmpRoleTree;
      this.roleData.roles.oRoleTree = Object.assign([], this.tmpRoleTree);
    }, err => {
      this.busy = false;
    });
  }

  confirmRemoveLink(event, list, empno) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete ' + '<html><span class="ui-column-title">' + list.name + '</span><html>' + '?',
      key: 'confirmKey',
      accept: () => {
        this.removeDlList(list.id, empno);
         this.selectedIndex=undefined;
      }
    });
  }

  removeDlList(listId, empno) {
    this.busy = true;
    this.userService.removeDistList(listId, empno,'Y').subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deleted Successfully'
      });
      this.listName = '';
      this.searchText = '';
      this.searchStarted = false;
      this.listUsers = [];
      this.showingUsers = false;
      this.getUserLists();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed To Delete'
      });
    });
  }


  getRoles() {
    this.busy = true;
    this.userService.getRoles().subscribe(res => {
      this.busy = false;
      const response = res;
      this.roleData.roles.roles = res;
      const tmpRoles = [];
      response.map(r => {
        tmpRoles.push({
          label: r.name,
          data: r,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false
        });
      });
      this.roleData.roles.roleTree = tmpRoles;
      this.roleData.roles.oRoleTree = Object.assign([], tmpRoles);
    }, err => {
      this.busy = false;
    });
  }

  showUsers(event, listId: any, name, index, lst) {
    this.selectedId = name;
    event.stopPropagation();
    this.listUsers = [];
    this.startAddUser = false;
    this.showingUsers = true;
    this.selectedParentList = listId;
    this.SelectedUserList = [];
    this.selectedList = listId;
    this.newDistList = false;
    this.selectedIndex = index;
    this.listName = name;
    this.isSaveDisabled = false;
    this.userOrRole=undefined;
    this.busy = true;
    this.userService.getListUsers(listId).subscribe(data => {
      this.busy = false;
      //this.SelectedUserList = data;
      for (const user of data) {
        this.listUsers.push({'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': user.appRole});
      }
    }, err => {
      this.busy = false;
    });
    this.listUsersTemp = this.listUsers;
    if (this.SelectedUserList == null) {
      this.SelectedUserList = [];
    }
  }

  save() {
    let self = this;
    let originalRecordsToCompare = _.cloneDeep(self.distListForSearch);
    if (self.selectedParentList){
      originalRecordsToCompare = _.filter(originalRecordsToCompare, function (record) {
        return record.id!==self.selectedParentList;
      });
    }
    let record = _.find(originalRecordsToCompare, function (r) {
      return r.name.trim().toLowerCase() === self.listName.trim().toLowerCase();
    });
    if (record) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'List Name Already Exists.'
      });
    } else {
      this.searchUserAndRole('removeFilter');
      if (this.selectedParentList === 0) {
        this.updateList.name = 'Favourites';
      } else {
        this.updateList.name = this.listName;
      }
      this.updateList.empNo = this.user.EmpNo;
      if (this.newDistList) {
        this.updateList.id = 0;
      } else {
        this.updateList.id = this.selectedParentList;
      }
      if (this.listUsers) {
        this.listUsers.map((user) => {
          delete user.members;
        });
      }

      this.updateList.users = this.listUsers;
      if (this.isGlobal === true) {
        this.updateList.isGlobal = 'Y';
      }
      else {
        this.updateList.isGlobal = 'N';
      }

      this.busy = true;
      this.userService.updateUserLists(this.updateList).subscribe(res => {
        this.busy = false;
        this.updateSuccess(res)
      }, Error => {
        this.busy = false;
        this.updateSuccess(Error)
      });
      this.distList.model.query = '';
      this.clearItems();
    }
  }

  onSearchTypeChanged(event) {

    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
  }

  updateSuccess(data) {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'List Updated Successfully'
    });
    // this.listName = '';
    // this.searchText = '';
    this.searchStarted = false;
    // this.listUsers = [];
    this.showingUsers = false;
    this.showRoleTree = false;
    this.showRoleList = false;
    this.isGlobal = true;
    this.getUserLists();
    this.isSaveDisabled = true;
    this.userOrRole=undefined;
    //console.log(this.selectedIndex);
  }

  getRoleMembers(role) {
    if (!role.members) {
      let RoleNameString = '';
      let roleId;
      if (role.headRoleId) {
        roleId = role.headRoleId
      } else if (role.id) {
        roleId = role.id
      } else if (role.EmpNo) {
        roleId = role.EmpNo
      }
      //this.busy = true;
      this.userService.getRoleMembers(roleId).subscribe((res: any) => {
       // this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        //this.busy = false;
      });
    }
  }

  changeListName(e) {
    if (e.length > 0) {
      this.isSaveDisabled = false;
    }
    else {
      this.isSaveDisabled = true;
    }
  }

  onRemove(event) {
    this.confirmationService.confirm({
      header:'Confirm Deletion?',
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmKey',
      acceptVisible: true,
      rejectVisible: true,
      accept: () => {
        this.confirmOnRemove(event);
      }
    });
  }

  confirmOnRemove(event){
    this.listUsers.map((d, i) => {
      if (d.EmpNo === event.EmpNo) {
        this.listUsers.splice(i, 1);
      }
    });
    this.isSaveDisabled = false;
    if (event.appRole === 'USER') {
      this.SelectedUserList.map((user) => {
        if (user.fulName === event.fulName) {
          user.disabled = false;
        }
      });
    } else if (event.appRole === 'ROLE') {
      this.SelectedUserList.map((user) => {
        if (user.name === event.fulName) {
          user.disabled = false;
        }
      });
    }
  }


}
