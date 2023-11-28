import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "../../../services/core.service";
import { GrowlService } from "../../../services/growl.service";
import { UserService } from "../../../services/user.service";
import { OrgUnit } from "../../../models/admin/org-unit.model";
import { AdminService } from "../../../services/admin.service";
import * as _ from "lodash";
import {delay} from "rxjs-compat/operator/delay";

@Component({
  selector: 'app-ecm-org-unit-management',
  templateUrl: './ecm-org-unit-management.component.html',
  styleUrls: ['./ecm-org-unit-management.component.css']
})
export class EcmOrgUnitManagementComponent implements OnInit, OnDestroy {
  public orgUnitData: any = { orgUnit: { model: {} } };
  public orgTreeData: any = { roles: { model: {} } };
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  private subscriptions: any[] = [];
  public editMode = false;
  public editOrgUnit = new OrgUnit();
  public editOrgUnitCopy = new OrgUnit();
  public orgUnitInfo = new OrgUnit();
  public parentOrgUnitInfo = new OrgUnit();
  public tmpOrgTree: any[] = [];
  public searchQueary = {
    userName: undefined,
    mail: undefined,
    title: undefined,
    phone: undefined,
    orgCode: undefined,
    empNo: undefined,
    userType: undefined,
    filter: ''
  };
  public editRoleWithOrg = false;
  public activeTab = 0;
  public inActiveOrgUnits = [];
  public inActiveOrgUnitsTemp = [];
  public inActiveQuery: any;
  public showOrgUnitInfo = false;
  public disableTypeEdit = false;
  busy: boolean;
  isNameExist=false;
  isOrgCodeExist=false;
  editingNode:any;
  constructor(
    private userService: UserService,
    private coreService: CoreService,
    private growlService: GrowlService,
    private as: AdminService,
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService) {
    this.orgUnitData.orgUnit.type = [
      { label: 'Directorate', value: 'Directorate' },
      { label: 'Group', value: 'Group' },
      { label: 'Team', value: 'Team' }
    ];
  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'OrgUnit Management' }
    ]);
    this.getTopOrgUnit();
    this.getInactiveOrgUnits();
  }

  getRoleMembersForTooltip(role) {
    /*    if (!role.members) {
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
        }*/
  }

  addToList(user) { }

  addMember(event) { }

  removeMember(event) { }

  typeChanged(event) {
    //this.editOrgUnit = Object.assign({}, new OrgUnit());
    this.editOrgUnit.type = event.value;
    this.editOrgUnit.parent = undefined;
    //this.orgUnitData.orgUnit.model = {};
    this.orgUnitData.orgUnit.model.parentRoleList = [];
    let type = '';
    if (event.value.toLowerCase() === 'directorate') {
      this.editOrgUnit.parent = 1; // set 1 in KOC Env
      return;
    } else if (event.value.toLowerCase() === 'group') {
      type = 'Directorate';
    } else if (event.value.toLowerCase() === 'team') {
      type = 'Group';
    }
    const subscription = this.as.getOrgUnitsByTypeAndTypeAndStatus(type, 'ACTIVE').subscribe(res => {
      res.map((R, I) => {
        if (!(this.editMode && this.editOrgUnitCopy && this.editOrgUnitCopy.type === R.type && this.editOrgUnitCopy.id && this.editOrgUnitCopy.id === R.id)) {
          this.orgUnitData.orgUnit.model.parentRoleList.push({ label: R.desc, value: R.id });
        }
      });
    });
  }

  populateParentRoles(event, cb?) {
    let status='ACTIVE';
    if(this.activeTab===1){
      status='ALL';
    }
    if (event.orgCode) {
      this.editRoleWithOrg = true;
    } else {
      this.editRoleWithOrg = false;
    }
    this.orgUnitData.orgUnit.model.parentRoleList = [];
    let type = '';
    if (event.type.toLowerCase() === 'directorate') {
      cb();
    } else if (event.type.toLowerCase() === 'group') {
      type = 'Directorate';
    } else if (event.type.toLowerCase() === 'team') {
      type = 'Group';
    }
    this.busy = true;
    this.as.getOrgUnitsByTypeAndTypeAndStatus(type, status).subscribe(res => {
      this.busy = false;
      res.map((R, I) => {
        this.orgUnitData.orgUnit.model.parentRoleList.push({ label: R.desc, value: R.id });
        if (res.length === I + 1) {
          cb();
        }
      });
    }, err => {
      this.busy = false;
    });
  }

  editOrgUnitItem(event, disableTypeEdit) {
    this.editingNode=event;
    if(event.headEmpNo>0){
      this.disableTypeEdit = disableTypeEdit;
    this.searchUsers({ query: event.headEmpNo }, 'empId',event, bcb => { //'empId' in KOC env
      this.populateParentRoles(event, cb => {
        this.editOrgUnit = Object.assign({}, event);
        this.editMode = true;
        this.editOrgUnitCopy = _.cloneDeep(event);
      });
    });
    }
    else{
         this.growlService.showGrowl({
        severity: 'error',
        summary: 'Invalid', detail: 'Head User Value Is Not Valid'
      });
    }

  }

  saveOrgUnit() {
    this.busy = true;
    console.log(this.editingNode);
     if (this.editingNode && this.editingNode.type === 'Directorate') {
       this.editOrgUnit.parent=1;
     }
     // else{
     //    this.editOrgUnit.parent=this.editOrgUnit.parent.value;
     // }
    this.as.saveOrgUnit(this.editOrgUnit).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Saved Successfully'
      });
      this.closeModel();
      this.getTopOrgUnit();
      this.getInactiveOrgUnits();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Operation Failed'
      });
    });
  }

  closeModel() {
    this.editOrgUnit = Object.assign({}, new OrgUnit());
    this.editOrgUnitCopy = Object.assign({}, new OrgUnit());
    this.editMode = false;
    this.editRoleWithOrg = false;
    this.orgUnitData.orgUnit.model = {};
    this.disableTypeEdit = false;
    this.isOrgCodeExist = false;
    this.isNameExist = false;
  }

  searchUsers(event, criteria,e?, bcb?) {
    const searchQuery: any = {
      userType: 'USER',
      filter: ''
    };
    searchQuery[criteria] = event.query;
    this.busy = true;
    this.userService.searchEcmUsers(searchQuery).subscribe(data => {
      this.busy = false;
      this.orgUnitData.orgUnit.model.searchSuggestions = data;
      if (criteria === 'empId' && data && data.length > 0) {//'empId' in KOC env
        this.orgUnitData.orgUnit.model.userSearchText = data[0];
        this.usersSelected(data[0],e, cb => {
          if (bcb) {
            bcb();
          }
        });
      }
    }, err => {
      this.busy = false;
    });
  }

  usersSelected(event,e?, cb?) {
    this.editOrgUnit.headEmpNo = event.EmpNo;
    this.editOrgUnit.headUserName = event.userName;
    this.orgUnitData.orgUnit.model.UserRoles = [];
    this.busy = true;
    this.userService.getActiveUserRoles(event.userName).subscribe(data => {
      this.busy = false;
      data.roles.map((role) => {
        this.orgUnitData.orgUnit.model.UserRoles.push({ label: role.name, value: role.id });
      });
      if (cb) {
        cb();
      }
      if(e){
     if(e.type === 'Directorate'){
       this.editOrgUnit.headRoleId=this.orgUnitData.orgUnit.model.UserRoles[0].value;
     }
     else{
        this.editOrgUnit.headRoleId= this.orgUnitData.orgUnit.model.UserRoles[0];
        if(this.orgUnitData.orgUnit.model.parentRoleList){
          this.editOrgUnit.parent=this.orgUnitData.orgUnit.model.parentRoleList[0];
        }
     }
      }

    }, err => {
      this.busy = false;
    });

  }

  deleteOrgUnit(event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmKey',
      accept: () => {
        this.confirmDeleteOrgUnit(event);
      }
    });
  }

  confirmDeleteOrgUnit(event) {
    this.busy = true;
    this.as.deleteOrgUnit(event.id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deleted Successfully'
      });
      this.closeModel();
      this.getTopOrgUnit();
      this.getInactiveOrgUnits();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Failed To Delete'
      });
    });
  }

  getTopOrgUnit() {
    this.busy = true;
    this.as.getSubLevelOrgUnits(1).subscribe(res => { //orgid = 1 in KOC env
      this.busy = false;
      const response = res;
      this.tmpOrgTree = [];
      res.map((unit) => {
        this.tmpOrgTree.push({
          label: unit.desc,
          data: unit,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false,
          selectable: false
        });
      });
      this.orgTreeData.roles.roleTree = this.tmpOrgTree;
      this.orgTreeData.roles.tempRoleTree = Object.assign([], this.tmpOrgTree);
    }, err => {
      this.busy = false;
    });
  }

  getSubOrgUnit(parent) {
    this.busy = true;
    this.as.getSubLevelOrgUnits(parent.data.id).subscribe(res => {
      this.busy = false;
      parent.children = [];
      res.map(d => {
        parent.children.push({
          label: d.desc,
          data: d,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          selectable: false
        });
      });
    }, err => {
      this.busy = false;
    });
  }

  getInactiveOrgUnits() {
    this.inActiveQuery = undefined;
    this.as.getInactiveOrgUnits().subscribe(data => this.assignInactiveOrgUnits(data));
  }

  assignInactiveOrgUnits(data) {
    this.inActiveOrgUnits = data;
    this.inActiveOrgUnitsTemp = _.cloneDeep(this.inActiveOrgUnits);
  }

  searchInActiveRole() {
    this.inActiveOrgUnits = this.inActiveOrgUnitsTemp.filter(e => {
      if (e.desc && e.type) {
         e.desc.toUpperCase().indexOf(this.inActiveQuery.toUpperCase()) !== -1
          || e.type.toUpperCase().indexOf(this.inActiveQuery.toUpperCase()) !== -1
      }
    });
  }

  searchOrgUnitTree() {
    this.orgTreeData.roles.roleTree = this.orgTreeData.roles.tempRoleTree.filter(e => {
      if (e.data.desc) {
         e.data.desc.toUpperCase().indexOf(this.orgTreeData.roles.model.query.toUpperCase()) !== -1
      }
    });
  }

  deactivateOrgUnit(event) {
    this.busy = true;
    this.as.getSubLevelOrgUnits(event.id).subscribe((res: any) => {
      this.busy = false;
      if (res && (res.length === 0 || event.type === 'Team')) {
        this.confirmationService.confirm({
          header: 'Confirm Deactivation?',
          message: 'Are you sure that you want to perform this action?',
          key: 'confirmKey',
          acceptVisible: true,
          rejectVisible: true,
          accept: () => {
            this.confirmDeactivateOrgUnit(event);
          }
        });
      } else {
        this.confirmationService.confirm({
          header: 'Confirm Deactivation?',
          message: 'Please deactivate the child node to perform this action. ' +
            'If you continue to perform this action all the child node will be deactivated',
          key: 'confirmKey',
          acceptVisible: true,
          rejectVisible: true,
          accept: () => {
            this.confirmDeactivateAllChildOrgUnit(event);
          }
          //rejectVisible: false
        });
      }
    }, err => {
      this.busy = false;
    });
  }

  confirmDeactivateOrgUnit(event) {
    this.busy = true;
    this.as.deactivateOrgUnit(event.id, 'Self').subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deactivated Successfully'
      });
      this.getTopOrgUnit();
      this.getInactiveOrgUnits();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Failed To Deactivate'
      });
    });
  }

  confirmDeactivateAllChildOrgUnit(event) {
    this.busy = true;
    this.as.deactivateOrgUnit(event.id, 'All').subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Deactivated Successfully'
      });
      this.getTopOrgUnit();
      this.getInactiveOrgUnits();
    }, Error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Failed To Deactivate'
      });
    });
  }

  activateOrgUnit(deactOrgUnit) {
    const message = 'Are you sure that you want to perform this action?';
    if (deactOrgUnit.type.toLowerCase() === 'group' || deactOrgUnit.type.toLowerCase() === 'team') {
      this.getParentOrgUnitInfo(deactOrgUnit, (parentInfo) => {
        if (deactOrgUnit.type.toLowerCase() === 'team') {
          if (parentInfo.status === 'INACTIVE') {
            const msg = "To perform this action please activate parent Group - [" + parentInfo.desc + "]";
            this.showActivateConfirmation(deactOrgUnit, msg, false);
          } else {
            this.showActivateConfirmation(deactOrgUnit, message, true);
          }
        } else if (deactOrgUnit.type.toLowerCase() === 'group') {
          if (parentInfo.status === 'INACTIVE') {
            const msg = "To perform this action please activate parent Directorate - [" + parentInfo.desc + "]";
            this.showActivateConfirmation(deactOrgUnit, msg, false);
          } else {
            this.showActivateConfirmation(deactOrgUnit, message, true);
          }
        }
      });
    } else {
      this.showActivateConfirmation(deactOrgUnit, message, true);
    }
  }

  getParentOrgUnitInfo(unit, cb) {
    this.busy = true;
    this.as.getOrgUnitInfo(unit.parent).subscribe(data => {
      this.busy = false;
      cb(data);
    }, err => {
      this.busy = false;
    });
  }

  getOrgUnitInfo(rowData) {
    this.getParentOrgUnitInfo(rowData, (parent) => {
      this.parentOrgUnitInfo = parent;
      this.orgUnitInfo = rowData;
    });
  }

  showActivateConfirmation(deactOrgUnit, msg, disableAccept) {
    this.confirmationService.confirm({
      header: disableAccept ? 'Confirm Activation?' : 'Inactive Parent',
      message: msg,
      key: disableAccept ? 'confirmKey' : 'confirmKeyWarning',
      acceptVisible: disableAccept,
      rejectVisible: true,
      accept: () => {
        this.confirmAcivateUser(deactOrgUnit);
      }
    });
  }

  confirmAcivateUser(deactOrgUnit) {
    this.as.activateOrgUnit(deactOrgUnit.id).subscribe(data => {
      if (data === 'OK') {
        this.closeModel();
        this.getTopOrgUnit();
        this.getInactiveOrgUnits();
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
    });
  }

  tabChange(event) {
    this.activeTab = event.index;
    //this.isNameExist=false;
    //this.isOrgCodeExist=false;
  }

  exportToExcel() {
    let array = ['name'];
    this.coreService.exportToExcel(this.orgTreeData.roles.roleTree, 'ECM_Users '+this.coreService.getDateTimeForExport()+'.xlsx', array)
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
  completeOrgCode(){
    let enteredValue=this.editOrgUnit.orgCode;
     this.as.validateOrgDetails(enteredValue,'orgcode').subscribe(d=>{
       this.isOrgCodeExist = d === 1;

    });

  }
  completeName(){
    let enteredValue=this.editOrgUnit.desc;
    this.as.validateOrgDetails(enteredValue,'name').subscribe(d=>{
        this.isNameExist = d === 1;
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    localStorage.setItem('split-pane', null);
    this.editOrgUnit = Object.assign({}, new OrgUnit());
    this.editOrgUnitCopy = Object.assign({}, new OrgUnit());
    this.orgUnitInfo = Object.assign({}, new OrgUnit());
    this.parentOrgUnitInfo = new OrgUnit();
    this.editMode = false;
    this.editRoleWithOrg = false;
    this.orgUnitData.orgUnit.model = {};
    this.showOrgUnitInfo = false;
    this.disableTypeEdit = false;
  }
}
