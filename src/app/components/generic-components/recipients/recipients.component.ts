import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from "../../../services/user.service";
import { CoreService } from "../../../services/core.service";
import { GrowlService } from "../../../services/growl.service";
@Component({
  selector: 'app-recipients',
  templateUrl: './recipients.component.html',
})
export class RecipientsComponent implements OnDestroy {
  @Input() public recipientsData: any;
  @Input() public documentsData: any;
  @Input() public currentScreen: any;
  @Input() public actionType: any;
  @Output() prepareStepItems = new EventEmitter();
  @Output() searchRoleList = new EventEmitter();
  @Output() toccFieldOnFocus = new EventEmitter();
  private roleTreeSelection: any;
  @Input() public searchType: any;
  public filteredRoles: any[];
  private subscriptions: Subscription[] = [];
  roleTreeExpandedIcon = 'ui-icon-people-outline';
  roleTreeCollapsedIcon = 'ui-icon-people';
  public dynamicCriteria: any[] = [];
  public criteria: any[];
  public userSearchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: undefined
  };
  public roleSearchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: undefined
  };
  public selectedType = 'USER';
  public roleSearchquery;
  public distList = { 'id': 1, 'empNo': 1002, 'name': 'Distribution List', lists: [] };
  public globalList = { 'id': 1, 'empNo': 1002, 'name': 'Global List', lists: [] };
  public defaultList = { 'id': -1, 'empNo': 1002, 'name': 'Default List' };
  private tmpRoleTree = [];
  public busy: boolean;
  public dragItem: any;
  public searchResult: any;
  selectedIndexAccordion = 0;
  showRoleTree = false;
  public roleTreeData: any = { roles: { model: {} } };
  constructor(private userService: UserService, private coreService: CoreService, private growlService: GrowlService) {
    this.criteria = [{ label: 'Name', value: 'userName' }, { label: 'Email', value: 'mail' }, { label: 'Designation', value: 'title' },
    { label: 'Phone', value: 'phone' }, { label: 'Org Code', value: 'orgCode' }, { label: 'KOC No', value: 'empNo' }];
    //this.addNewCriterion();
  }
  ngOnInit() {
    if (this.currentScreen === 'addUser') {
      this.getUserLists();
      let obj = { index: 0 };
      this.onTabOpen(obj);
      this.getOrgRole(true);
    }
  }
  keyDown(e) {
   // if ((this.documentsData.existing.model.actionType === 'Signature' || this.documentsData.existing.model.actionType === 'Initial') && this.recipientsData.toList.length === 1) {
      e.preventDefault();
    //}
  }

  assignDragItem(data) {
    if (this.documentsData.existing.model.actionType === 'Signature' || this.documentsData.existing.model.actionType === 'Initial') {
      this.dragItem = null;
    }
    else {
      this.dragItem = data;
    }


  }
  assignDragEnd() {
    this.dragItem = null;
  }
  assignDropItem(e, type) {
    if (this.dragItem) {
      let Index = this.findIndex(this.dragItem, type);
      if (type === "to") {
        this.dragItem.actionType = 'TO';
        this.recipientsData.toList = [...this.recipientsData.toList, this.dragItem];
        this.recipientsData.ccList = this.recipientsData.ccList.filter((val, i) => i != Index);
      }
      else {
        this.dragItem.actionType = 'CC';
        this.recipientsData.ccList = [...this.recipientsData.ccList, this.dragItem];
        this.recipientsData.toList = this.recipientsData.toList.filter((val, i) => i != Index);
      }
      this.dragItem = null;
      this.prepareStepItems.emit();
    }

  }
  findIndex(item, type) {
    let index = -1;
    let list = this.recipientsData.ccList;
    if (type === "cc") {
      list = this.recipientsData.toList;
    }
    for (let i = 0; i < list.length; i++) {
      if (item.id === list[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  getSubOrgRoles(parent) {
    this.busy = true;
    this.userService.getSubRolesList(parent.data.id).subscribe((res: any) => {
      this.busy = false;
      parent.children = [];
      res.map(d => {
        parent.children.push({
          label: d.headRoleName,
          data: d,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false
        });
      });
    }, err => {
      this.busy = false;
     });
  }
  getRoleMembersForTree(role) {
    if (role.id > 0 && (!role.members && role.members !== '')) {
      let RoleNameString = '';
      // this.busy = true;
      this.userService.getRoleMembers(role.id).subscribe(res => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  expandNode(event) {
    this.getSubOrgRoles(event.node);
  }

  addToToList(role) {
    if (!this.existsInList(role)) {
      role.userType = 'ROLE';
      role.actionType = 'TO';
      if (role.appRole === 'USER' || role.userType === 'USER') {
        role.name = role.fulName;
        role.userType = 'USER';
      }
      if (role.appRole === 'ROLE' || role.userType === 'ROLE') {
        //role.name = role.headRoleName;
        role.userType = 'ROLE';
        role.userName = role.adGroup;
      }
      role.disabled = true;
      this.recipientsData.toList.push(role);
      this.prepareStepItems.emit();
    }
  }

  addToCCList(role) {
    if (!this.existsInList(role)) {
      role.userType = 'ROLE';
      role.actionType = 'CC';
      if (role.appRole === 'USER' || role.userType === 'USER') {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.appRole === 'ROLE' || role.userType === 'ROLE') {
        role.userType = 'ROLE';
        //role.name = role.headRoleName;
        role.userName = role.adGroup;
      }
      role.disabled = true;
      this.recipientsData.ccList.push(role);
      this.prepareStepItems.emit();
    }

  }
  addToToListFromList(role) {
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'TO';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'TO';
        role.name = role.fulName;
      }
      role.disabled = true;
      this.recipientsData.toList.push(role);
      this.prepareStepItems.emit();
    }

  }

  addToCCListFromList(role) {
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'CC';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'CC';
        role.name = role.fulName;
      }
      role.disabled = true;
      this.recipientsData.ccList.push(role);
      this.prepareStepItems.emit();
    }

  }

  existsInListUserList(role) {
    return false;
  }

  searchUsersList() {
    let isSignInit;
    if (this.actionType === 'Signature') {
      isSignInit = 'esign';
    }
    else if (this.actionType === 'Initial') {
      isSignInit = 'initial'
    }
    else {
      isSignInit = this.actionType;
    }
    this.busy = true;
    this.userService.searchUsersList('ROLE', this.recipientsData.roles.model.searchText,
      this.recipientsData.roles.model.selectedCriterion, isSignInit).subscribe((res: any) => {
        this.busy = false;
        this.recipientsData.roles.result = res;
        this.recipientsData.roles.model.searchText = '';
      }, err => {
        this.busy = false;
      });
  }

  getRoleMembers(role, type) {
    if (role.id > 0 && (!role.members && role.members !== '') && (type === 'roleList' || ((type === 'fav' || type === 'defaultList') && role.appRole === 'ROLE'))) {
      let RoleNameString = '';
      let roleId;
      if (role.headRoleId) {
        roleId = role.headRoleId
      } else if (role.id) {
        roleId = role.id
      }
      // this.busy = true;
      this.userService.getRoleMembers(roleId).subscribe((res: any) => {
        // this.busy = false;
        for (const RName of res) {
          if (!!RName.name) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  getListUsers(event, type) {
    let list;
    if (event.value && event.value[0]) {
      list = event.value[0];
    }
    if (!list) {
      list = event;
    }
    if (list.lists || list.users) {
      if (type === 'sublist') {
        this.recipientsData.list.selectedSublist = list;
      } else {
        this.recipientsData.list.selectedUserList = list;
        this.recipientsData.list.selectedSublist = undefined;
      }
      return;
    }

    this.busy = true;
    this.userService.getListUsers(list.id).subscribe((res: any) => {
      this.busy = false;
      list.users = res;
      if (type === 'sublist') {
        this.recipientsData.list.selectedSublist = list;
      } else {
        this.recipientsData.list.selectedUserList = list;
        this.recipientsData.list.selectedSublist = undefined;
      }
    }, err => {
      this.busy = false;
    });
  }

  searchUsers() {
    let isSignInit;
    if (this.actionType === 'Signature') {
      isSignInit = 'esign';
    }
    else if (this.actionType === 'Initial') {
      isSignInit = 'initial'
    }
    else {
      isSignInit = this.actionType;
    }
    let searchQueary = {
      'userName': undefined, 'title': undefined, 'mail': undefined,
      'empNo': undefined, 'orgCode': undefined, 'phone': undefined,
      'userType': this.selectedType, 'filter': isSignInit
    };
    if (this.selectedType === 'USER') {
      searchQueary = Object.assign({}, this.userSearchQueary);
    } else {
      searchQueary = Object.assign({}, this.roleSearchQueary);
    }
    searchQueary.userType = this.selectedType;
    searchQueary.filter = isSignInit;

    let formValid = true;
    if ((searchQueary.userName !== undefined && searchQueary.userName !== '' && searchQueary.userName !== null) ||
      (searchQueary.title !== undefined && searchQueary.title !== '' && searchQueary.title !== null) ||
      (searchQueary.mail !== undefined && searchQueary.mail !== '' && searchQueary.mail !== null) ||
      (searchQueary.empNo !== undefined && searchQueary.empNo !== '' && searchQueary.empNo !== null) ||
      (searchQueary.orgCode !== undefined && searchQueary.orgCode !== '' && searchQueary.orgCode !== null) ||
      (searchQueary.phone !== undefined && searchQueary.phone !== '' && searchQueary.phone !== null)) {
    } else {
      formValid = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Warning', detail: 'Fill Any One Field To Search'
      });
    }
    if (formValid) {
      if (searchQueary.userName === "") {
        delete searchQueary.userName;
      }
      if (searchQueary.orgCode === "") {
        delete searchQueary.orgCode;
      }
      this.busy = true;
      this.userService.searchEcmUsers(searchQueary).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'No Result', detail: 'No Results Found'
          });
        }
        if (this.selectedType === 'ROLE') {
          this.recipientsData.roles.result = data;
        } else {
          this.recipientsData.search.result = data;
        }
      }, err => {
        this.busy = false;
      });
    }
  }

  searchRoles(event, types) {
    if (event.query) {
      if (this.currentScreen !== 'addUser') {
        this.selectedType = this.searchType;
      }
      if (!((this.documentsData.existing.model.actionType === 'Signature' || this.documentsData.existing.model.actionType === 'Initial')
        && this.recipientsData.toList.length === 1)) {
        let totalsearch = this.recipientsData.search.result;
        if (this.selectedType === 'ROLE') {
          totalsearch = this.recipientsData.roles.result;
        }
        let totallist = this.recipientsData.toList.concat(this.recipientsData.ccList);
        totalsearch.map(e => {
          if (!e.fulName) {
            e.fulName = e.name;
          }
          if (e.fulName) {
            e.name = e.fulName;
          }
          if (e.headRoleName) {
            e.name = e.headRoleName;
          }
          if (e.EmpNo) {
            e.id = e.EmpNo;
          }
        });
        let temp = [...totalsearch];
        totallist.map((prop, k) => {
          if (totallist.map(opt => opt.id).indexOf(prop.id) !== -1) {
            temp.splice(temp.map(opt => opt.id).indexOf(prop.id), 1);
          }
        });
        this.filteredRoles = temp.filter(
          list => list.fulName.toLowerCase().startsWith(event.query.toLowerCase()));
      }
      //console.log(this.filteredRoles);
    }
    else {
      if ((this.documentsData.existing.model.actionType === 'Signature' || this.documentsData.existing.model.actionType === 'Initial')
        && this.recipientsData.toList.length === 1) {
        this.filteredRoles = [];
        return;
      }
      this.filteredRoles = this.recipientsData.search.result.concat(this.recipientsData.roles.result)
        .filter(r => r.name.indexOf(event.query) !== -1
          && !this.existsInList(r));
    }
  }

  selectSuggestion(role, type) {
    let exist = false;
    if (type === 'to') {
      role.userType = 'ROLE';
      role.actionType = 'TO';
      if (role.appRole === 'USER' || role.userType === 'USER') {
        role.name = role.fulName;
        role.userType = 'USER';
      }
      if (role.appRole === 'ROLE' || role.userType === 'ROLE') {
        //role.name = role.headRoleName;
        role.userType = 'ROLE';
        role.userName = role.adGroup;
      }
      role.disabled = true;
      this.recipientsData.toList.map(d => {
        if (d.id === role.id) {
          exist = true;
        }
      });
      if (!exist) {
        this.recipientsData.toList.push(role);
      }
      this.prepareStepItems.emit();
    } else {
      role.userType = 'ROLE';
      role.actionType = 'CC';
      if (role.appRole === 'USER' || role.userType === 'USER') {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.appRole === 'ROLE' || role.userType === 'ROLE') {
        role.userType = 'ROLE';
        //role.name = role.headRoleName;
        role.userName = role.adGroup;
      }
      role.disabled = true;
      this.recipientsData.ccList.map(d => {
        if (d.id === role.id) {
          exist = true;
        }
      });
      if (!exist) {
        this.recipientsData.ccList.push(role);
      }
      this.prepareStepItems.emit();
    }

  }

  existsInList(role) {
    let exists = false;
    if (role.fulName) {
      role.name = role.fulName;
    }
    if (role.headRoleName) {
      role.name = role.headRoleName;
    }

    if ((this.documentsData.existing.model.actionType === 'Signature' || this.documentsData.existing.model.actionType === 'Initial')
      && this.recipientsData.toList.length === 1) {
      role.disabled = true;
      if (role.name === this.recipientsData.toList[0].name && this.recipientsData.toList[0].id === role.id) {
        return true;
      } else {
        return false;
      }
    }
    if (role.EmpNo) {
      role.id = role.EmpNo;
    }
    this.recipientsData.toList.concat(this.recipientsData.ccList).map(r => {
      if (r.name === role.name && r.id === role.id) {
        exists = true;
      }
    });
    role.disabled = exists;
    return exists;
  }

  onRecipientRemoved() {
    setTimeout(() => {
      this.prepareStepItems.emit();
    }, 2000);
  }

  getListUsersForTooltip(list) {
    if (list.id > 0 && (!list.members && list.members !== '') && (!list.appRole || list.appRole === 'ROLE')) {
      let RoleNameString = '';
      // this.busy = true;
      const subscription = this.userService.getListUsers(list.id).subscribe((res: any) => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.appRole === 'ROLE') {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>people</i>' + ' ' + RName.fulName;
          }
          if (RName.appRole === 'USER') {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.fulName;
          }
        }
        list.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  /*addNewCriterion() {
    const criterionArr = [];
    this.criteria.map((criterion) => {
      if ((!criterion.selected)) {
        criterionArr.push({
          label: criterion.label, value: criterion.value
        })
      }
    });
    if (!criterionArr[criterionArr.length - 1]) {
      return;
    }
    this.dynamicCriteria.push({options: criterionArr, selectedOption: criterionArr[0].value, searchText: undefined});
    this.criteria.map((cr, k) => {
      if (cr.value === criterionArr[0].value) {
        cr.selected = true;
      }
    });
    this.updateCriteriaOptions();
  }


  updateCriteriaOptions() {
    this.dynamicCriteria.map((dynamicCrite, i) => {
      dynamicCrite.options.map((option, j) => {
        this.criteria.map((cr, k) => {
          if (!cr.selected) {
            if (dynamicCrite.options.map(opt => opt.value).indexOf(cr.value) === -1) {
              dynamicCrite.options.push({
                label: cr.label, value: cr.value
              });
            }
          } else if (cr.value !== dynamicCrite.selectedOption) {
              if (dynamicCrite.options.map(opt => opt.value).indexOf(cr.value) !== -1) {
                dynamicCrite.options.splice(dynamicCrite.options.map(opt => opt.value).indexOf(cr.value), 1);
              }
          }
        });
      });
    });
  }

  criteriaChanged(index) {
    this.dynamicCriteria[index].searchText = undefined;
    this.setSelection();
    this.updateCriteriaOptions();
  }

  setSelection() {
    this.criteria.map((cr, k) => {
      if (this.dynamicCriteria.map(Criterion => Criterion.selectedOption).indexOf(cr.value) === -1) {
        cr.selected = false;
      } else {
        cr.selected = true;
      }
    });
  }

  removeCriteria(index) {
    this.dynamicCriteria.splice(index, 1);
    this.setSelection();
    this.updateCriteriaOptions();
  }*/

  tabChange(event) {
    if (event.index === 1) {
      this.criteria = [{ label: 'Name', value: 'userName' }, { label: 'Org Code', value: 'orgCode' }];
      this.selectedType = 'ROLE';
      if (this.recipientsData.roles.roleTree.length === 0) {
        this.getOrgRole(true);
      }
    } else if (event.index === 2) {
      if (this.recipientsData.list.userList.length === 0) {
        this.getUserLists();
      }
    } else if (event.index === 0) {
      this.criteria = [{ label: 'Name', value: 'userName' }, { label: 'Email', value: 'mail' }, { label: 'Designation', value: 'title' },
      { label: 'Phone', value: 'phone' }, { label: 'Org Code', value: 'orgCode' }, { label: 'KOC No', value: 'empNo' }];
      this.selectedType = 'USER';
    }
    /*this.dynamicCriteria = [];
    this.addNewCriterion();*/
  }

  getOrgRole(init) {
    this.recipientsData.roles.roleTree = [];
    this.busy = true;
    //const subscription = this.us.getTopRolesList().subscribe(res => {
    //added on 21032019 for showing role list
    this.userService.getRolesByTypeForUI(1, 0).subscribe(res => {
      this.busy = false;
      /*res.map((head) => {
        this.tmpRoleTree.push({
          label: head.name,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false
        });
      });*/
      //this.getSubOrgRoles(this.tmpRoleTree[0], init);
      this.recipientsData.roles.roleTree = res;//this.tmpRoleTree;
      this.recipientsData.roles.roleTree2 = res;//this.tmpRoleTree;
    }, err => {
      this.busy = false;
    });
  }

  //favourite 0, default -1, dist=1, rest>1 will be in dist
  getUserLists() {
    this.busy = true;
    this.userService.getUserLists(true).subscribe(res => {
      this.busy = false;
      const remainings = [];
      res.map((l, i) => {
        if (l.id > 1 && l.isGlobal === 'N') {
          this.distList.lists.push(l);
        } else if (l.id > 1 && l.isGlobal === 'Y') {
          this.globalList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.recipientsData.list.userList = remainings;
      this.recipientsData.list.userList.push(this.defaultList);
      this.recipientsData.list.userList.push(this.distList);
      this.recipientsData.list.userList.push(this.globalList);
    }, err => {
      this.busy = false;
    });
  }

  // searchRL(roleSearchquery){
  //   //this.searchRoleList.emit(roleSearchquery);
  //   this.recipientsData.roles.roleTree = this.recipientsData.roles.roleTree2.filter(e => {
  //     if (e.data.name) {
  //       return e.data.name.toUpperCase().indexOf(this.recipientsData.search.roleSearchquery.toUpperCase()) !== -1
  //     }
  //   });
  // }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
  searchRL(roleSearchquery) {
    this.recipientsData.roles.roleTree = this.recipientsData.roles.roleTree2.filter(e => {
      if (e.data.name) {
         e.data.name.toUpperCase().indexOf(this.recipientsData.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
    this.recipientsData.list.selectedUserList.lists = this.recipientsData.list.selectedUserList.lists2.filter(e => {
      if (e.name) {
         e.name.toUpperCase().indexOf(this.recipientsData.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
  }
  searchDL(dlSearchquery) {
    this.recipientsData.list.selectedUserList.lists = this.recipientsData.list.selectedUserList.lists2.filter(e => {
      if (e.name) {
         e.name.toUpperCase().indexOf(this.recipientsData.search.dlSearchquery.toUpperCase()) !== -1
      }
    });
  }
  searchDFL(defSearchquery) {
    this.recipientsData.list.selectedUserList.lists = this.recipientsData.list.selectedUserList.lists2.filter(e => {
      let searchField = e.fulName ? e.fulName : e.name;
      return searchField.toUpperCase().indexOf(this.recipientsData.search.defSearchquery.toUpperCase()) !== -1
        || (e.mail && e.mail.toUpperCase().indexOf(this.recipientsData.search.defSearchquery.toUpperCase()) !== -1)
    });
  }

  searchFL(favSearchquery) {
    this.recipientsData.list.selectedUserList.users = this.recipientsData.list.selectedUserList.users2.filter(e => {
      let searchField = e.fulName ? e.fulName : e.name;
      return searchField.toUpperCase().indexOf(this.recipientsData.search.favSearchquery.toUpperCase()) !== -1
        || (e.mail && e.mail.toUpperCase().indexOf(this.recipientsData.search.favSearchquery.toUpperCase()) !== -1)
    });
  }

  onTabOpen(e) {
    this.recipientsData.search.defSearchquery = '';
    this.recipientsData.search.favSearchquery = '';
    this.recipientsData.search.dlSearchquery = '';
    this.recipientsData.search.roleSearchquery = '';
    let tabName = '';
    this.selectedIndexAccordion = e.index;
    let temparray = [];
    // if (this.selectedIndexAccordion === 0 || this.selectedIndexAccordion === 1 || this.selectedIndexAccordion === 2 ||
    //   this.selectedIndexAccordion === 3) {
      if (this.selectedIndexAccordion === 0) {
        tabName = 'Default List';
        this.busy = true;
        this.userService.getListUsers(-1).subscribe((res: any) => {
          this.busy = false;
          this.recipientsData.list.selectedUserList.lists = res;
          this.recipientsData.list.selectedUserList.lists2 = res;
        }, err => {
          this.busy = false;
        });
      }
      else if (this.selectedIndexAccordion === 1) {
        tabName = 'Favorites';
        // this.busy = true;
        this.userService.getListUsers(0).subscribe((res: any) => {
          // this.busy = false;
          this.recipientsData.list.selectedUserList.users = res;
          this.recipientsData.list.selectedUserList.users2 = res;
        }, err => {
          //this.busy = false;
        });
      }
      else if (this.selectedIndexAccordion === 2) {
        tabName = 'Distribution List';
        if (this.recipientsData.list.userList.length > 0) {
          this.recipientsData.list.userList.map(d => {
            if (d.name === tabName) {
              this.recipientsData.list.selectedUserList.lists = d.lists;
              this.recipientsData.list.selectedUserList.lists2 = d.lists;
            }
          });
        }
        else {
          this.recipientsData.list.selectedUserList.lists2 = [];
          this.recipientsData.list.selectedUserList.lists = [];
        }
      }
      else if (this.selectedIndexAccordion === 3) {
        tabName = 'Global List';
        if (this.recipientsData.list.userList.length > 0) {
          this.recipientsData.list.userList.map(d => {
            if (d.name === tabName) {
              this.recipientsData.list.selectedUserList.lists = d.lists;
              this.recipientsData.list.selectedUserList.lists2 = d.lists;
            }
          });
        }
        else {
          this.recipientsData.list.selectedUserList.lists2 = [];
          this.recipientsData.list.selectedUserList.lists = [];
        }
       // this.getOrgRole(true);
      }

      // if (this.selectedIndexAccordion === 1) {
      //
      // }
      // else if (this.selectedIndexAccordion === 0) {
      //
      // }
      // else {
      //
      // }


   // }
   //  if (this.selectedIndexAccordion === 5) {
   //    this.selectedType = 'ROLE';
   //  }
   //  else if (this.selectedIndexAccordion === 6) {
   //    this.selectedType = 'USER';
   //  }
  }
  getRoleMembersIfRole(role){
    if (role.id > 0 && (!role.members && role.members !== '') && ((role.appRole === 'ROLE' || role.userType === 'ROLE'))) {
      let RoleNameString = '';
      // this.busy = true;
      this.userService.getRoleMembers(role.id).subscribe(res => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }

  }

  addListUsersToToList(list, isDefaultOrFav?) {
    if (!isDefaultOrFav) {
      if (!list.userName) {
        if (list.users) {
          list.users.map(l => {
            if (!this.existsInList(l)) {
              if (l.appRole === 'ROLE') {
                l.userType = 'ROLE';
              } else if (l.appRole === 'USER') {
                l.userType = 'USER';
              }
              l.actionType = 'TO';
              l.disabled = true;
              this.recipientsData.toList.push(l);
            }
          });
          this.prepareStepItems.emit();
        } else {
          this.busy = true;
          const subscription = this.userService.getListUsers(list.id).subscribe((users: any) => {
            this.busy = false;
            users.map(l => {
              if (!this.existsInList(l)) {
                if (l.appRole === 'ROLE') {
                  l.userType = 'ROLE';
                } else if (l.appRole === 'USER') {
                  l.userType = 'USER';
                }
                l.actionType = 'TO';
                l.disabled = true;
                this.recipientsData.toList.push(l);
              }
            });
            list.users = users;
            this.prepareStepItems.emit();
          }, err => {
            this.busy = false;
          });
        }
      }
      else {
        if (!this.existsInList(list)) {
          if (list.appRole === 'ROLE') {
            list.userType = 'ROLE';
          } else if (list.appRole === 'USER') {
            list.userType = 'USER';
          }
          list.actionType = 'TO';
          list.disabled = true;
          this.recipientsData.toList.push(list);
          this.prepareStepItems.emit();
        }
      }
    }
    else {
      if (!this.existsInList(list)) {
        if (list.appRole === 'ROLE') {
          list.userType = 'ROLE';
        } else if (list.appRole === 'USER') {
          list.userType = 'USER';
        }
        list.actionType = 'TO';
        list.disabled = true;
        this.recipientsData.toList.push(list);
        this.prepareStepItems.emit();
      }
    }

  }

  addListUsersToCCList(list, isDefaultOrFav?) {
    if (!isDefaultOrFav) {
      if (!list.userName) {
        if (list.users) {
          list.users.map(l => {
            if (!this.existsInList(l)) {
              if (l.appRole === 'ROLE') {
                l.userType = 'ROLE';
              } else if (l.appRole === 'USER') {
                l.userType = 'USER';
              }
              l.actionType = 'CC';
              l.disabled = true;
              this.recipientsData.ccList.push(l);
            }
          });
          this.prepareStepItems.emit();
        } else {
          this.busy = true;
          this.userService.getListUsers(list.id).subscribe((users: any) => {
            this.busy = false;
            users.map(l => {
              if (!this.existsInList(l)) {
                if (l.appRole === 'ROLE') {
                  l.userType = 'ROLE';
                } else if (l.appRole === 'USER') {
                  l.userType = 'USER';
                }
                l.actionType = 'CC';
                l.disabled = true;
                this.recipientsData.ccList.push(l);
              }
            });
            list.users = users;
            this.prepareStepItems.emit();
          }, err => {
            this.busy = false;
          });
        }
      }
      else {
        if (!this.existsInList(list)) {
          if (list.appRole === 'ROLE') {
            list.userType = 'ROLE';
          } else if (list.appRole === 'USER') {
            list.userType = 'USER';
          }
          list.actionType = 'CC';
          list.disabled = true;
          this.recipientsData.ccList.push(list);
          this.prepareStepItems.emit();
        }
      }
    }
    else {
      if (!this.existsInList(list)) {
        if (list.appRole === 'ROLE') {
          list.userType = 'ROLE';
        } else if (list.appRole === 'USER') {
          list.userType = 'USER';
        }
        list.actionType = 'CC';
        list.disabled = true;
        this.recipientsData.ccList.push(list);
        this.prepareStepItems.emit();
      }
    }

  }
  showRoleTreeModel() {
    this.showRoleTree = true;
    this.getOrgRoleTree();
  }
  getOrgRoleTree() {
    this.busy = true;
    const subscription = this.userService.getTopRolesList().subscribe(res => {
      this.busy = false;
      const response = res;
      this.tmpRoleTree = [];
      res.map((head) => {
        this.tmpRoleTree.push({
          label: head.headRoleName,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false,
          selectable: head.orgCode ? true : false
        });
      });
      this.roleTreeData.roles.roleTree = this.tmpRoleTree;
    }, err => {
      this.busy = false;
    });
  }

  toCcFieldOnFocus(event) {
    this.toccFieldOnFocus.emit();
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    localStorage.setItem('split-pane', null);
  }

}
