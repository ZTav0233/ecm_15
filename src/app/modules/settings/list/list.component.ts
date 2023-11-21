import { Component, OnInit, OnChanges, OnDestroy, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { User } from '../../../models/user/user.model';
import { UserList } from '../../../models/user/user-list.model';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { GrowlService } from '../../../services/growl.service';
import * as $ from 'jquery';
import { CoreService } from "../../../services/core.service";
import * as _ from "lodash";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  public user: User;
  private subscriptions: Subscription[] = [];
  public userList: any;
  public distList = { 'id': 1, 'empNo': 1002, 'name': 'Distribution List', lists: [] };
  public defaultList = { 'id': -1, 'empNo': 1002, 'name': 'Default List' };
  public listMembers: any[];
  public listUsers: any[] = [];
  public selectedParentList: any;
  public showingUsers = false;
  public criteria: any[];
  public searchStarted: boolean;
  public searchText: any;
  public listName: any;
  public SelectedUserList = [];
  public startAddUser = false;
  public userLists: any;
  public newDistList = true;
  public selectedIndex: any;
  public selectedList = '';
  public updateList = new UserList();
  public searchTypes = [
    { label: 'User', value: 'USER', icon: 'fa fa-fw fa-cc-paypal' },
    { label: 'Role', value: 'ROLE', icon: 'fa fa-fw fa-cc-visa' }
  ];
  public selectedType = 'USER';
  public showRoleTree = false;
  public showRoleList = false;
  roleTreeExpandedIcon = 'ui-icon-people-outline';
  roleTreeCollapsedIcon = 'ui-icon-people';
  public roleData: any = { roles: { model: {} } };
  public dynamicCriteria: any[] = [];
  private tmpRoleTree: any[];
  isSaveDisabled = true;
  userOrRole: any;
  private listUsersTemp: any[] = [];
  private listDistTemp: any[] = [];
  isFavSelected: boolean;
  public searchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: ''
  };
  public busy: boolean;
  isBtnDisabled = true;
  isFilterEnabled = false;
  @ViewChild('dt') dataTableComponentRef: any;
  tempArray: any;
  isAddOperation;
  searchTextList:any;
  constructor(private userService: UserService, private breadcrumbService: BreadcrumbService, private growlService: GrowlService,
    private confirmationService: ConfirmationService, private coreService: CoreService, private router: Router) {
    this.roleData.roles = { model: {} };
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
    this.getUserLists();
    this.criteria = [{ label: 'Name', value: 'userName' }, { label: 'Email', value: 'mail' }, {
      label: 'Designation',
      value: 'title'
    },
    { label: 'Phone', value: 'phone' }, { label: 'Org Code', value: 'orgCode' }, { label: 'KOC No', value: 'empNo' }];
  }

  filterItems(e) {
    if (e.filters && e.filters.fulName && e.filters.fulName.value.length > 0) {
      this.isFilterEnabled = true;
    }
    else {
      this.isFilterEnabled = false;
    }
  }

  getUserLists() {
    this.distList.lists = [];
    this.userList = [];
    this.distList.lists.push({ id: '', empNo: undefined, name: "Add New List" });
    this.busy = true;
    this.userService.getUserLists(false).subscribe(data => {
      this.busy = false;
      const remainings = [];
      data.map((l, i) => {
        l.name = l.name.replace("''", "'");
        if (l.id > 1) {
          this.distList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.userList = remainings;
      this.userList.push(this.defaultList);
      this.userList.push(this.distList);
      this.listDistTemp=this.distList.lists;
    }, Error => {
      this.busy = false;
    });
  }

  getUserListAfterSave(action?) {
    this.distList.lists = [];
    this.busy = true;
    this.userService.getUserLists(false).subscribe(data => {
      this.busy = false;
      const remainings = [];
      data.map((l, i) => {
        l.name = l.name.replace("''", "'");
        if (l.id > 1) {
          this.distList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.distList.lists.unshift({ id: '', empNo: undefined, name: "Add New List" });
      this.userList.map((l, i) => {
        if (l.id === 1) {
          this.userList.splice(i, 1);
        }
      });
      this.userList.push(this.distList);
      this.listDistTemp=this.distList.lists;
      if (!(action === 'delete')) {
        this.userList.map((d, i) => {
          if (d.lists) {
            d.lists.map((m, i) => {
              if (m.name === this.listName) {
                this.selectedIndex = i;
                this.selectedParentList = m.id;
              }
            })
          }
        });
      }
    }, Error => {
      this.busy = false;
    });
  }

  showListMembers(event, listid, i) {
    // if(!this.isBtnDisabled ){
    //   alert('proceed without saving?');
    // }
    // else{
    this.isFilterEnabled = false;
    this.isBtnDisabled = true;
    if (listid === 0) {
      $('.ui-accordion-content').hide();
      this.listName = undefined;
      this.newDistList = false;
    } else {
      $('.ui-accordion-content').show();
    }
    this.clearResult();
    if (listid !== -1) {
      if (this.selectedParentList === listid) {
        this.showingUsers = !this.showingUsers;
        this.isFavSelected = !this.isFavSelected;
      } else {
        this.showingUsers = true;
        this.isFavSelected = true;
      }
    } else if (listid === -1) {
      this.showingUsers = false;
      this.isFavSelected = false;
    }
    this.selectedParentList = listid;
    this.listUsers = [];
    this.busy = true;
    this.userService.getListUsers(listid).subscribe(data => {
      this.busy = false;
      this.listMembers = data;
      for (const user of this.listMembers) {
        this.listUsers.push({ 'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': user.appRole });
      }
      this.listUsersTemp=this.listUsers;
    }, Error => {
      this.busy = false;
    });
    // }
    this.onSearchTypeChanged();
  }

  showSubList(event, listid, i) {
    this.isFilterEnabled = false;
    this.selectedIndex = undefined;
    $('.ui-accordion-content').show();
    this.searchStarted = false;
    this.listName = '';
    this.listUsers = [];
    if (this.selectedParentList === listid || !this.newDistList) {
      //this.showingUsers = !this.showingUsers;
      this.busy = true;
      this.userService.getUserLists(false).subscribe(ldata => {
        this.busy = false;
        this.assignUserList(ldata);
      }, Error => {
        this.busy = false;
      });
    } else {
      //this.showingUsers = false;
    }
    this.showingUsers = false;
    this.selectedParentList = listid;
    this.newDistList = true;
    this.isSaveDisabled = true;
    this.isFavSelected = false;
    this.onSearchTypeChanged();
  }

  changeListName(e) {
    if (e.length > 0) {
      this.isBtnDisabled = false;
      this.isSaveDisabled = false;
    }
    else {
      this.isBtnDisabled = true;
      this.isSaveDisabled = true;
    }
  }

  assignUserList(data) {
    this.userLists = data;
    this.userLists.push(this.distList);
  }

  clearItems(e) {
    this.isFilterEnabled = false;
    this.listName = undefined;
    this.listUsers = [];
    this.newDistList = true;
    this.selectedIndex = undefined;
    if (e === 0) {
      this.isFavSelected = false;
      this.showingUsers = false;
    }
    //this.SelectedUserList=[];
    if (this.selectedParentList === 0) {
      this.isSaveDisabled = false;
      this.getUserLists();
      this.isFavSelected = false;
    }
    this.searchStarted = false;
  }

  resetFav(listid) {
    this.isBtnDisabled = true;
    this.listUsers = [];
    this.busy = true;
    this.userService.getListUsers(listid).subscribe(data => {
      this.busy = false;
      this.listMembers = data;
      for (const user of this.listMembers) {
        this.listUsers.push({ 'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': user.appRole });
      }
    }, Error => {
      this.busy = false;
    });
    this.isFilterEnabled=false;
    this.searchStarted = false;

  }

  searchUserAndRole(filterText) {
    if (filterText === 'removeFilter') {
      this.userOrRole = '';
      this.listUsers = this.listUsersTemp
    }
    else {
      this.listUsers = this.listUsersTemp.filter(e =>
        e.fulName.toUpperCase().indexOf(this.userOrRole.toUpperCase()) !== -1
      );
    }
  }

  showUsers(event, listId: any, name, index) {
    this.isBtnDisabled = true;
    event.stopPropagation();
    if (name !== 'Add New List') {
      this.listUsers = [];
      this.startAddUser = false;
      this.selectedParentList = listId;
      this.newDistList = false;
      this.listName = name;

      this.busy = true;
      this.userService.getListUsers(listId).subscribe(data => {
        this.busy = false;
        // this.SelectedUserList = data;
        for (const user of data) {
          this.listUsers.push({ 'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': user.appRole });
        }
      }, Error => {
        this.busy = false;
      });
      this.listUsersTemp = this.listUsers;
      // this.updateAvailableUsers();
    }
    else {
      this.newDistList = true;
      this.listUsers = [];
      this.listName = '';
      setTimeout(() => {
        var input = <HTMLInputElement>document.getElementById("listNameId") as HTMLInputElement;
        input.select();
      }, 600);
    }
    this.isSaveDisabled = true;
    this.SelectedUserList = [];
    this.selectedList = listId;
    this.selectedIndex = index;
    this.showingUsers = true;
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
      if (this.searchQueary.userName === "") {
        delete this.searchQueary.userName;
      }
      if (this.searchQueary.orgCode === "") {
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
      }, Error => {
        this.busy = false;
      });
    }
  }

  clearResult() {
    this.searchStarted = false;
    this.searchText = '';
  }

  selectUser(user) {
    //this.searchUserAndRole('removeFilterAfterAdd');
    const exist = this.userExist(user);
    let temp = [...this.listUsers];
    if (!exist) {
      if (this.selectedType === 'USER') {
        temp.push({ 'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': 'USER' });
      } else if (this.selectedType === 'ROLE') {
        if (user.name) {
          temp.push({ 'EmpNo': user.id, 'fulName': user.name, 'appRole': 'ROLE' });
        } else if (user.headRoleName) {
          temp.push({ 'EmpNo': user.id, 'fulName': user.headRoleName, 'appRole': 'ROLE' });
        }
      }
      this.listUsers = temp;
      this.isBtnDisabled = false;
    }
    else {
      //this.isBtnDisabled=true;
      let err = "User already exist in list";
      if (this.selectedType === 'ROLE') {
        err = "Role already exist in list";
      }
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: err
      });
    }
    user.disabled = true;
    this.isSaveDisabled = false;
    this.listUsersTemp = this.listUsers;
  }

  userExist(user) {
    for (const User of this.listUsers) {
      if (user.fulName === User.fulName || user.name === User.fulName || user.headRoleName === User.fulName) {
        return true;
      }
    }
    return false;
  }

  save() {
    let self = this;
    let record;
    if (self.selectedParentList) {
      let originalRecordsToCompare = _.cloneDeep(this.distList.lists);
      if (self.selectedParentList) {
        originalRecordsToCompare = _.filter(originalRecordsToCompare, function (record) {
          return record.id !== self.selectedParentList;
        });
      }
      record = _.find(originalRecordsToCompare, function (r) {
        return r.name.trim().toLowerCase() === self.listName.trim().toLowerCase();
      });
    }
    if (record && this.newDistList) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'List Name Already Exists.'
      });
    } else {
      this.searchUserAndRole('removeFilter');
      if (this.selectedParentList === 0) {
        this.updateList.name = 'Favourites';
      } else {
        if (this.listName && this.listName.trim().length <= 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Failure', detail: 'Invalid List Name.'
          });
          return;
        }
        this.updateList.name = this.listName;
      }
      this.updateList.empNo = this.user.EmpNo;
      if (this.newDistList) {
        this.updateList.id = 0;
      } else {
        this.updateList.id = this.selectedParentList;
      }
      this.listUsers.map((user) => {
        delete user.members;
        delete user.isExisting;
      });
      this.updateList.users = this.listUsers;
      if (this.updateList.name && this.updateList.name !== "" && this.updateList.name !== " ") {
        this.busy = true;
        this.userService.updateUserLists(this.updateList).subscribe(res => {
          this.busy = false;
          this.updateSuccess(res)
        }, Error => {
          this.busy = false;
          this.failed(Error)
        });
        // this.selectedIndex = undefined;
      } else {
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Name Required', detail: 'List name is required to save the list'
        });
      }
    }
  }

  updateSuccess(data) {
    if (this.dataTableComponentRef) {
      this.dataTableComponentRef.reset();
    }
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'List Updated Successfully'
    });
    // this.listName = '';
    this.searchText = '';
    this.searchStarted = false;
    // this.listUsers = [];
    //this.showingUsers = false;
    this.showRoleTree = false;
    //this.showRoleList = false;
    this.getUserListAfterSave();
    this.isSaveDisabled = true;
    if (this.selectedParentList === 0) {
      this.isFavSelected = false;
    }
    this.isBtnDisabled = true;
    this.newDistList = false;
    this.isFilterEnabled=false;
    this.onSearchTypeChanged();
  }

  failed(error) {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Save List Failed'
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  confirmRemoveLink(event, list, empno) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete ' + '<html><span class="ui-column-title">' + list.name + '</span><html>' + '?',
      key: 'confirmKey',
      accept: () => {
        this.removeDlList(list.id, empno);
        this.selectedIndex = undefined;
      }
    });
  }

  removeDlList(listId, empno) {
    this.busy = true;
    this.userService.removeDistList(listId, empno, 'N').subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'List Deleted Successfully'
      });
      this.listName = '';
      this.searchText = '';
      this.searchStarted = false;
      this.listUsers = [];
      this.showingUsers = false;
      this.getUserListAfterSave('delete');
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed To Delete List'
      });
    });
  }

  confirmRemoveDL(event, member, empno) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete ' + '<html><span class="ui-column-title">' + member.fulName + '</span><html>' + '?',
      key: 'confirmKey',
      accept: () => {
        this.removeDL(member.appRole,member.EmpNo, empno);
        this.selectedIndex = undefined;
      }
    });
  }

  removeDL(appRole,listEmpNo, empno) {
    this.busy = true;
    this.userService.removeDefaultList(appRole,listEmpNo, empno).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'List Updated Successfully'
      });
      this.getDefaultListUser();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed To Delete List'
      });
    });
  }

  getDefaultListUser() {
    this.busy = true;
    this.userService.getListUsers(-1).subscribe(data => {
      this.busy = false;
      this.listMembers = data;
      this.listUsers = [];
      for (const user of this.listMembers) {
        this.listUsers.push({ 'EmpNo': user.EmpNo, 'fulName': user.fulName, 'appRole': user.appRole });
      }
    }, Error => {
      this.busy = false;
    });
  }

  onSearchTypeChanged() {
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
  }

  showRoleTreeModel() {
    this.showRoleTree = true;
    this.getOrgRole();
  }

  showRoleListModel() {
    this.getRoles();
    this.showRoleList = true;
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

  searchRoleList() {
    this.roleData.roles.roleTree = this.roleData.roles.oRoleTree.filter(e => {
      if (e.data.name && e.data.orgCode) {
         e.data.name.toUpperCase().indexOf(this.roleData.roles.model.query2.toUpperCase()) !== -1
          || e.data.orgCode.toUpperCase().indexOf(this.roleData.roles.model.query2.toUpperCase()) !== -1
      }
    });
  }

  searchRole() {
    this.roleData.roles.roleTree = this.roleData.roles.oRoleTree.filter(e =>
      e.data.name.toUpperCase().indexOf(this.roleData.roles.model.query.toUpperCase()) !== -1
    );
  }

  closeRoleList(e) {
    this.roleData.roles.model.query2 = undefined;
    if (!this.isAddOperation) {
      this.listUsers = this.tempArray;
    }
  }

  openRoleList() {
    this.tempArray = [...this.listUsers];
    this.tempArray.map(d => {
      d.isExisting = true;
    });
    this.isAddOperation = undefined;
  }

  expandNode(event) {
    this.getSubOrgRoles(event.node);
  }

  getOrgRole() {
    this.busy = true;
    this.userService.getRolesByType(1, 0).subscribe(res => {
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
      this.roleData.roles.oRoleTree = this.tmpRoleTree
    }, err => {
      this.busy = false;
    });
  }

  getSubOrgRoles(parent) {
    this.busy = true;
    this.userService.getSubRolesList(parent.data.id).subscribe((res: any) => {
      this.busy = false;
      parent.children = [];
      res.map(d => {
        parent.children.push({
          label: d.headRoleName, data: d,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false
        });
      });
    }, err => {
      this.busy = false;
    });
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
      this.userService.getRoleMembers(roleId).subscribe((res: any) => {
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
      });
    }
  }

  getRoleDLMembers(role, type) {
    if (role.EmpNo > 0 && (!role.members && role.members !== '') && (type === 'roleList' || ((type === 'fav' || type === 'defaultList') && role.appRole === 'ROLE'))) {
      let RoleNameString = '';
      this.userService.getRoleMembers(role.EmpNo).subscribe(res => {
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
      });
    }
  }

  stopPro(event) {
    event.stopPropagation();
  }

  onRemove(event) {
    this.confirmationService.confirm({
      header: 'Confirm Deletion?',
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmKey',
      acceptVisible: true,
      rejectVisible: true,
      accept: () => {
        this.confirmOnRemove(event);
        if (event.appRole === 'ROLE') {
          let role = _.find(this.roleData.roles.roleTree, function (o) { return o.label === event.fulName; });
          role ? role.data.disabled = false : null;
        } else if (event.appRole === 'USER') {
          let user = _.find(this.SelectedUserList, function (o) { return o.EmpNo === event.EmpNo; });
          user ? user.disabled = false : null;
        }
      }
    });
  }

  confirmOnRemove(event) {
    let selected = [];
    selected.push(event);
    let temp = [...this.listUsers];
    this.listUsers.map((e) => {
      if (selected.map(l => l.EmpNo).indexOf(e.EmpNo) !== -1) {
        temp.splice(temp.map(l => l.EmpNo).indexOf(e.EmpNo), 1);
      }
    });
    this.listUsers = temp;
    this.listUsersTemp = this.listUsers;
    this.isSaveDisabled = false;
    if (event.appRole === 'USER') {
      this.SelectedUserList.map((user) => {
        if (user.fulName === event.fulName) {
          // user.disabled = true;
        }
      });
    } else if (event.appRole === 'ROLE') {
      this.SelectedUserList.map((user) => {
        if (user.name === event.fulName) {
          // user.disabled = true;
        }
      });
    }
    if (this.selectedParentList === 0) {
      this.isSaveDisabled = false;
    }
    else if (this.listUsers.length === 0) {
      this.isSaveDisabled = true;
    }
    this.isBtnDisabled = false;
    if (this.dataTableComponentRef && this.dataTableComponentRef.dataToRender.length === 1) {
      this.dataTableComponentRef.reset();
    }
  }

  listItemRemoved(event) {
    this.isSaveDisabled = false;
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      // this[k] = null;
      delete this[k];
    })
  }

  searchDLList(searchtext) {
    this.listUsers= this.listUsersTemp.filter(e => {
      return e.fulName.toUpperCase().indexOf(searchtext.toUpperCase()) !== -1
        || (e.fulName.toUpperCase().indexOf(searchtext.toUpperCase()) !== -1)
    });
  }
  searchDistList(searchtext) {
    this.distList.lists = this.listDistTemp.filter(e => {
      return e.name.toUpperCase().indexOf(searchtext.toUpperCase()) !== -1
        || (e.name.toUpperCase().indexOf(searchtext.toUpperCase()) !== -1)
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.subscriptions = [];
    this.user = undefined;
    this.userList = [];
    this.distList = undefined;
    this.defaultList = undefined;
    this.listMembers = [];
    this.listUsers = [];
    this.selectedParentList = undefined;
    this.showingUsers = false;
    this.criteria = [];
    this.searchStarted = false;
    this.searchText = undefined;
    this.listName = undefined;
    this.SelectedUserList = [];
    this.startAddUser = false;
    this.userLists = undefined;
    this.newDistList = undefined;
    this.selectedIndex = undefined;
    this.selectedList = undefined;
    this.updateList = undefined;
    this.destroyKeys();
    this.isFilterEnabled = false;
  }
}
