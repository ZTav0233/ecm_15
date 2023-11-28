import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { GrowlService } from '../../../services/growl.service';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { CoreService } from '../../../services/core.service';
import { AdminService } from "../../../services/admin.service";
import { Role } from "../../../models/user/role.model";
import { RoleInfo } from "../../../models/user/role.model";
import { consoleTestResultHandler } from "tslint/lib/test";
import { saveAs } from 'file-saver';
import * as _ from "lodash";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-rolemanagement',
  templateUrl: './rolemanagement.component.html',
  styleUrls: ['./rolemanagement.component.css']
})
export class RolemanagementComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dataTable!: Table;
  public roleData: any = { roles: { model: {} } };
  public roleTreeData: any = { roles: { model: {} } };
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  userIcon = 'fa fa-fw ui-icon-person';
  private subscriptions: any[] = [];
  public showEditRole = false;
  public editMode = false;
  public editRole = new Role();
  public options: any[] = [];
  suggestionsResults: any[];
  granteesSuggestion: any[];
  public busy: boolean;
  public activeTab = 0;
  public tmpRoleTree: any[] = [];
  deactRoles: any[];
  deactRolesTemp: any[];
  public roleInfo = new RoleInfo();
  deactQuery: any;
  public searchQueary = {
    userName: undefined,
    mail: undefined,
    title:
      undefined,
    phone: undefined,
    orgCode: undefined,
    empNo: undefined,
    userType: undefined,
    filter: ''
  };
  public editRoleWithOrg = false;
  showInfoDialog=false;
  constructor(private userService: UserService, private coreService: CoreService, private growlService: GrowlService, private as: AdminService,
    private breadcrumbService: BreadcrumbService, private confirmationService: ConfirmationService) {
    this.roleData.roles = {
      selectCriterions: [
        { label: 'Email', value: 'EMAIL' },
        { label: 'Name', value: 'NAME' },
        { label: 'Designation', value: 'TITLE' },
        { label: 'Phone', value: 'PHONE' },
        { label: 'Org Code', value: 'ORGCODE' },
        { label: 'Koc No', value: 'KOCNO' }],
      result: undefined, model: { selectedCriterion: 'NAME' }
    };
    this.options = [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }];
    this.roleData.roles.type = [
      { label: 'Directorate', value: 3 },
      { label: 'Group', value: 2 },
      { label: 'Role', value: 1 }
    ];
    this.roleData.roles.selectedOrgCodeType = true;
    this.deactRoles = [];
    this.roleData.roles.roleSearchOption = [{ label: 'Role', value: 'Role' }, { label: 'User', value: 'User' }];
    this.roleData.roles.model.roleSearchType = 'Role';
  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Role Management' }
    ]);
    this.getInactiveRoles();
    this.getOrgRole();
    this.getRoles();
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  assignInactiveRoles(data) {
    this.deactRoles = [];
    data.map(d => {
      d.typeText = this.coreService.getTypeString(d.type);
      // this.deactRoles.push({label:d.name, value:d});
      this.deactRoles.push(d);
    });
    this.deactRolesTemp = this.deactRoles;

  }

  getInactiveRoles() {
    this.deactQuery = undefined;
    this.userService.getInactiveRoles().subscribe(data => this.assignInactiveRoles(data));
  }

  activateRole(deactrole) {
    const message = 'Are you sure that you want to perform this action?';
    if (deactrole.type < 3) {
      this.infoRole(deactrole, () => {
        if (this.roleInfo.type == '1') {
          if (this.roleInfo.pDirStatus === 'INACTIVE' && this.roleInfo.pRoleStatus === 'INACTIVE') {
            const msg = "To perform this action please activate parent Directorate - [" + this.roleInfo.directorate + "] and group - [" + this.roleInfo.parentRole + "]";
            this.showActivateConfirmation(deactrole, msg, false);
          } else if (this.roleInfo.pDirStatus === 'INACTIVE') {
            const msg = "To perform this action please activate parent Directorate - [" + this.roleInfo.directorate + "]";
            this.showActivateConfirmation(deactrole, msg, false);
          } else if (this.roleInfo.pRoleStatus === 'INACTIVE') {
            const msg = "To perform this action please activate parent Group - [" + this.roleInfo.parentRole + "]";
            this.showActivateConfirmation(deactrole, msg, false);
          } else {
            this.showActivateConfirmation(deactrole, message, true);
          }
        } else if (this.roleInfo.type == '2') {
          if (this.roleInfo.pDirStatus === 'INACTIVE') {
            const msg = "To perform this action please activate parent Directorate - [" + this.roleInfo.parentRole + "]";
            this.showActivateConfirmation(deactrole, msg, false);
          } else {
            this.showActivateConfirmation(deactrole, message, true);
          }
        }

      });
    } else {
      this.showActivateConfirmation(deactrole, message, true);
    }
  }

  showActivateConfirmation(deactrole, msg, disableAccept) {
    this.confirmationService.confirm({
      header: disableAccept ? 'Confirm Activation?' : 'Inactive Parent',
      message: msg,
      key: disableAccept ? 'confirmKey' : 'confirmKeyWarning',
      acceptVisible: disableAccept,
      rejectVisible: true,
      accept: () => {
        this.confirmAcivateUser(deactrole);
      }
    });
  }

  confirmAcivateUser(deactrole) {
    this.userService.activateRole(deactrole.id).subscribe(data => {
      if (data === 'OK') {
        this.getInactiveRoles();
        this.getOrgRole();
        this.getRoles();
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Activated Successfully'
        });
      } else {
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Error', detail: 'Error In Activating'
        });
      }
    })

  }

  getRoles() {
    this.roleData.roles.model.query = undefined;
    this.roleData.roles.model.userSearchText = undefined;
    this.busy = true;
    this.userService.getRolesByType(1, 0).subscribe(res => {
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
      /*      this.roleData.roles.parentRoleList = [];
            this.roleData.roles.roles.map((R,I)=>{
              if(R.type != 1){
                this.roleData.roles.parentRoleList.push({label:R.name,value:R.id});
              }
            });*/
    }, err => {
      this.busy = false;
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  expandNode(event) {
    this.getRoleMembers(event.node);
  }

  infoRole(data, cb?) {
    if (data.id) {
      let role = _.find(this.deactRoles, function (r) {
        return r.id === data.id;
      });
      this.userService.getRoleInfoById(role.id).subscribe(val => {
        this.roleInfo = val;
        if (cb) {
          cb();
        }
      });
    }
  }

  getRoleMembers(node) {
    this.busy = true;
    this.userService.getRoleMembers(node.data.id).subscribe(res => {
      this.busy = false;
      node.children = [];
      res.map(r => {
        node.children.push({
          label: r.name,
          data: r,
          expandedIcon: this.userIcon,
          collapsedIcon: this.userIcon,
          leaf: true,
          expanded: false,
          selectable: false
        });
      });
      node.expanded = true;
    }, err => {
      this.busy = false;
    });
  }

  getRoleMembersForTooltip(role) {
    /*    if (!role.members && role.type === '1') {
          let RoleNameString = '';
          let roleId;
          if (role.headRoleId) {
            roleId = role.headRoleId
          } else if (role.id) {
            roleId = role.id
          } else if (role.EmpNo) {
            roleId = role.EmpNo
          }
          const subscription = this.userService.getRoleMembers(roleId).subscribe((res: any) => {
            for (const RName of res) {
              if (RName.name !== undefined) {
                RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
              }
            }
            role.members = RoleNameString.slice(1);

          }, err => {

          });
          this.addToSubscriptions(subscription);
        }
        else {*/
    return;
    //}
  }

  existsInList(user) {
    let exists = false;
    if (this.activeTab === 0) {
      if (this.roleData.roles.selectedRole) {
        this.roleData.roles.selectedRole.children.map(c => {
          if (user.EmpNo === c.data.empNo) {
            user.disabled = true;
            exists = true;
          }
        });
      } else {
        exists = true;
      }
    } else {
      if (this.roleTreeData.roles.selectedRole) {
        this.roleTreeData.roles.selectedRole.children.map(c => {
          if (user.EmpNo === c.data.empNo) {
            user.disabled = true;
            exists = true;
          }
        });
      } else {
        exists = true;
      }
    }
    return exists;
  }

  getRoleMembersStr(role) {
    if (!role.members) {
      let RoleNameString = '';
      this.busy = true;
      this.userService.getRoleMembers(role.id).subscribe(res => {
        this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + ',' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        this.busy = false;
      });
    }
  }

  addToList(user) {
    this.userService.getUserRoles(user.userName).subscribe(data => this.assignRoles(data, user));
  }

  assignRoles(data, user) {
    let temp = '';
    data.roles.map(d => {
      temp += d.name + '<br/>';
    });
    if (temp === '') {
      // temp='No roles found';
      this.confirmAdd(user);

    } else {
      this.confirmationService.confirm({
        message: temp,
        key: 'confirmKeyAddRole',
        accept: () => {
          //Actual logic to perform a confirmation
          this.confirmAdd(user);
        }
      });
    }
  }

  confirmAdd(user) {
    if (!this.existsInList(user)) {
      this.busy = true;
      this.userService.addUserToRole(user.EmpNo,
        this.activeTab === 0 ? this.roleData.roles.selectedRole.data.id : this.roleTreeData.roles.selectedRole.data.id).subscribe(res => {
          this.busy = false;
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'User Added Successfully'
          });
          this.getRoleMembers(this.activeTab === 0 ? this.roleData.roles.selectedRole : this.roleTreeData.roles.selectedRole);
        }, err => {
          this.busy = false;
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Error', detail: 'Error In Adding The User'
          });
        });
    }
  }

  addMember(event) {
    console.log(event);
    if (event.leaf) {
      return
    }
    if (this.activeTab === 0) {
      this.roleData.roles.selectedRole = event;
    } else {
      this.roleTreeData.roles.selectedRole = event;
    }
    this.getRoleMembers(event);
  }

  removeMember(event) {
    let patentRole;
    if (this.activeTab === 1) {
      patentRole = event.parent.data.name
    } else {
      patentRole = event.parent.data.headRoleName
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove ' + event.data.name + ' from ' + patentRole + '?',
      key: 'removeRoleUserConfirmation',
      accept: () => {
        this.busy = true;
        this.userService.removeUserFromRole(event.data.empNo, event.data.roleId).subscribe(res => {
          this.busy = false;
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'Member Removed Successfully'
          });
          this.getRoleMembers(event.parent);
        }, err => {
          this.busy = false;
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Error', detail: 'Error In Removing The Member'
          });
        });
      }
    });
  }

  searchUsersList() {
    // const subscription = this.userService.searchUsersList('USER', this.roleData.roles.model.searchText,
    //   this.roleData.roles.model.selectedCriterion,'')
    //   .subscribe(res => {
    //     this.roleData.roles.result = res;
    //     this.roleData.roles.model.searchText = '';
    //   }, err => {
    //
    //   });
    // this.addToSubscriptions(subscription);
    let formValid = true;
    this.searchQueary.userType = 'USER';
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
      this.busy = true;
      this.userService.searchEcmUsers(this.searchQueary).subscribe(data => {
        this.busy = false;
        if (data && data.length === 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'No Result', detail: 'No Results Found'
          });
        }
        this.roleData.roles.result = data;
      }, err => {
        this.busy = false;
      });
    }
  }

  searchRoleTree() {
    this.roleTreeData.roles.roleTree = this.roleTreeData.roles.tempRoleTree.filter(e => {
      if (e.data.headRoleName) {
         e.data.headRoleName.toUpperCase().indexOf(this.roleTreeData.roles.model.query.toUpperCase()) !== -1
      }
    });
  }

  searchRole() {
    this.roleData.roles.roleTree = this.roleData.roles.oRoleTree.filter(e => {
      if (e.data.name && e.data.orgCode) {
         e.data.name.toUpperCase().indexOf(this.roleData.roles.model.query.toUpperCase()) !== -1
          || e.data.orgCode.toUpperCase().indexOf(this.roleData.roles.model.query.toUpperCase()) !== -1
      }
    });
  }

  searchRoleTypeChanged(event) {
    if (event && event.value === 'Role') {
      this.roleData.roles.model.userSearchText = undefined;
      this.roleData.roles.searchSuggestions = [];
      this.getRoles();
    }
  }

  searchDeactRole() {
    this.deactRoles = this.deactRolesTemp.filter(e => {
      if (e.name && e.type) {
         e.name.toUpperCase().indexOf(this.deactQuery.toUpperCase()) !== -1
          || e.type.toUpperCase().indexOf(this.deactQuery.toUpperCase()) !== -1
      }
    });
  }


  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  orgCodeTypeChanged(event) {
    if (!this.editMode) {
      this.editRole.orgCode = undefined;
    }
  }

  typeChanged(event) {
    this.editRole = Object.assign({}, new Role());
    this.editRole.type = event.value;
    this.roleData.roles.parentRoleList = [];
    this.roleData.roles.parentDirList = [];
    if (event.value > 1) {
      const subscription = this.userService.getRolesByType(event.value + 1, 0).subscribe(res => {
        res.map((R, I) => {
          this.roleData.roles.parentRoleList.push({ label: R.name, value: R.id });
        });
      });
    } else {
      const subscription = this.userService.getRolesByType(3, 0).subscribe(res => {
        res.map((R, I) => {
          this.roleData.roles.parentDirList.push({ label: R.name, value: R.id });
        });
      });
    }
  }

  onDirChange(event) {
    this.roleData.roles.parentRoleList = [];
    const subscription = this.userService.getRolesByType(2, this.editRole.directorate).subscribe(res => {
      res.map((R, I) => {
        this.roleData.roles.parentRoleList.push({ label: R.name, value: R.id });
      });
    });
  }

  prepareAddRole() {
    this.showEditRole = true;
    this.roleData.roles.selectedOrgCodeType = true;
  }

  populateParentRoles(event, cb?) {
    if (event.orgCode) {
      this.editRoleWithOrg = true;
    } else {
      this.editRoleWithOrg = false;
    }
    this.roleData.roles.parentRoleList = [];
    this.roleData.roles.parentDirList = [];
    const type = event.type;
    const typeId = +type;
    if (typeId < 3) {
      let parentDir = 0;
      if (typeId === 1) {
        parentDir = event.directorate;
      }
      this.busy = true;
      this.userService.getRolesByType(typeId + 1, parentDir).subscribe(res => {
        this.busy = false;
        if (res && res.length > 0) {
          res.map((R, I) => {
            this.roleData.roles.parentRoleList.push({ label: R.name, value: R.id });
            if (res.length === I + 1) {
              if (typeId === 1) {
                this.populateParentDir(() => {
                  cb();
                });
              } else {
                cb();
              }
            }
          });
        } else {
          this.roleData.roles.parentRoleList = [];
          if (typeId === 1) {
            this.populateParentDir(() => {
              cb();
            });
          }
        }
      }, err => {
        this.busy = false;
      });
    } else {
      cb();
    }
  }

  populateParentDir(cb?) {
    this.busy = true;
    this.userService.getRolesByType(3, 0).subscribe(res => {
      this.busy = false;
      if (res && res.length > 0) {
        res.map((R, I) => {
          this.roleData.roles.parentDirList.push({ label: R.name, value: R.id });
          if (res.length === I + 1) {
            cb();
          }
        });
      }
    }, err => {
      this.busy = false;
    });
  }

  editRoleItem(event) {
    this.populateParentRoles(event, () => {
      this.editRole = Object.assign({}, event);
      this.editMode = true;
      this.showEditRole = true;
    });
  }

  editTreeRoleItem(event) {
    const subscription = this.userService.getRoleById(event.id, '').subscribe(data => {
      this.populateParentRoles(data, () => {
        this.editRole = Object.assign({}, data);
        this.editMode = true;
        this.showEditRole = true;
      });
    });

    // this.roleData.roles.roles.map((r,index)=>{
    //   if(r.id===event.id){
    //     this.populateParentRoles(r,()=>{
    //       this.editRole = Object.assign({},r);
    //       this.editMode = true;
    //       this.showEditRole = true;
    //     });
    //   }
    // });
  }

  saveRole() {
    /* if (!this.editMode) {
      this.editRole.type = 1;
    }*/
    delete this.editRole['typeText'];
    this.busy = true;
    this.userService.saveRole(this.editRole).subscribe(res => {
      this.busy = false;
      if (res === 'OK') {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: this.editMode ? 'Saved Successfully' : 'Added Successfully'
        });
        this.closeModel();
        this.getRoles();
        if (this.activeTab === 0) {
          this.getOrgRole();
        } else if (this.activeTab === 2) {
          this.getInactiveRoles();
        }
      } else if (res === 'Exists') {
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Already Exist', detail: 'Name Already Exist'
        });
      }
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Operation Failed'
      });
    });
  }

  closeModel() {
    this.showEditRole = false;
    this.editRole = Object.assign({}, new Role());
    this.editMode = false;
    this.editRoleWithOrg = false;
    this.roleData.roles.parentRoleList = [];
    this.roleData.roles.parentDirList = [];
  }

  search(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResults = [];
      for (const orgunit of data) {
        this.suggestionsResults.push(orgunit.orgCode);
      }
    }, err => {
      this.busy = false;
    });
  }

  deactivateRole(event) {
    const subscription = this.userService.getSubRolesListForAdmin(event.id).subscribe((res: any) => {
      if (res && (res.length === 0 || event.type === 1)) {
        this.confirmationService.confirm({
          header: 'Confirm Deactivation?',
          message: 'Are you sure that you want to perform this action?',
          key: 'confirmKey',
          acceptVisible: true,
          rejectVisible: true,
          accept: () => {
            this.confirmDeactivateRole(event);
          }
        });
      } else {
        this.confirmationService.confirm({
          header: 'Confirm Deactivation?',
          message: 'Please deactivate the child node to perform this action.',
          key: 'confirmKey',
          rejectVisible: false
        });
      }
    }, err => {

    });
  }

  confirmDeactivateRole(event) {
    this.busy = true;
    this.userService.deactivateRole(event.id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deactivated Successfully'
      });
      this.getInactiveRoles();
      this.getOrgRole();
      this.getRoles();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Failed To Deactivate'
      });
    });
  }

  deleteRole(deactrole) {
    this.confirmationService.confirm({
      header: 'Confirm Deletion?',
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmKey',
      acceptVisible: true,
      rejectVisible: true,
      accept: () => {
        this.confirmDeleteRole(deactrole);
      }
    });
  }

  confirmDeleteRole(deactrole) {
    this.busy = true;
    this.userService.deleteRole(deactrole.id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deleted Successfully'
      });
      this.getInactiveRoles();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Failed To Delete'
      });
    });
  }

  getGranteesSuggestion(event) {
    this.busy = true;
    this.as.searchLDAPGroups(event.query).subscribe(res => {
      this.busy = false;
      this.granteesSuggestion = [];
      res.map((group, index) => {
        this.granteesSuggestion.push(group.name);
      });
    }, err => {
      this.busy = false;
    });
  }

  tabChange(event) {
    this.activeTab = event.index;
    /* if(event.index === 1){
      this.getRoles();
    } else if(event.index === 2){
      this.getInactiveRoles();
    } else {
      this.getOrgRole();
    } */
    if (this.roleData.roles.selectedRole) {
      this.roleData.roles.selectedRole = undefined;
    }
    if (this.roleTreeData.roles.selectedRole) {
      this.roleTreeData.roles.selectedRole = undefined;
    }
    this.roleData.roles.result = [];
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
  }

  getOrgRole() {
    this.roleTreeData.roles.model.query = undefined;
    this.busy = true;
    this.userService.getTopRolesListForAdmin().subscribe(res => {
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
      this.roleTreeData.roles.tempRoleTree = Object.assign([], this.tmpRoleTree);
    }, err => {
      this.busy = false;
    });
  }

  getSubOrgRoles(parent) {
    if (parent.data.type === '1') {
      this.getRoleMembers(parent);
    } else {
      this.busy = true;
      this.userService.getSubRolesListForAdmin(parent.data.id).subscribe((res: any) => {
        this.busy = false;
        parent.children = [];
        res.map(d => {
          parent.children.push({
            label: d.headRoleName,
            data: d,
            expandedIcon: this.roleTreeExpandedIcon,
            collapsedIcon: this.roleTreeCollapsedIcon,
            leaf: false,
            selectable: !!d.orgCode
          });
        });
      }, err => {
        this.busy = false;
      });
    }
  }

  searchUsers(event) {
    const searchQuery: any = {
      userType: 'USER',
      filter: '',
      userName: ''
    };
    if (event.query.length > 2) {
      searchQuery.userName = event.query;
      this.busy = true;
      this.userService.searchEcmUsers(searchQuery).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'No Result', detail: 'No Results Found'
          });
        }
        this.roleData.roles.searchSuggestions = data;
      }, err => {
        this.busy = false;
      });
    } else if (event.query.length === 0) {
      this.roleData.roles.searchSuggestions = [];
      this.getRoles();
    } else {
      this.roleData.roles.searchSuggestions = [];
    }
  }

  searchCleared(event) {
    this.roleData.roles.searchSuggestions = [];
    this.getRoles();
  }

  usersSelected(event) {
    this.getRolesByMember(event.userName, 1, event.EmpNo);
  }

  getRolesByMember(userid, type, empNo) {
    this.busy = true;
    this.userService.getRolesByMember(userid, type, empNo).subscribe(res => {
      this.busy = false;
      const response = res;
      //this.roleData.roles.roles = res;
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
      //this.roleData.roles.oRoleTree = Object.assign([], tmpRoles);
    }, err => {
      this.busy = false;
    });
  }

  exportToExcel() {
    this.busy = true;
    this.userService.exportRoles().subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'ECM_Roles '+this.coreService.getDateTimeForExport()+'.xlsx';
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    localStorage.setItem('split-pane', null);
    this.editRoleWithOrg = false;
  }
}
