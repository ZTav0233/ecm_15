import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, SelectItem, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user/user.model';
import { GrowlService } from '../../../services/growl.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { DelegateModel } from '../../../models/user/delegate.model';
import * as global from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { Recipients } from '../../../models/user/recipients.model';
import * as _ from "lodash";
import { MemoService } from '../../../services/memo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-memoref',
  templateUrl: './memoref.component.html',
  styleUrls: ['./memoref.component.css']
})
export class MemoRefComponent implements OnInit, OnDestroy {
  criteria: SelectItem[];
  selectedcriteria: string;
  searchStarted: boolean;
  userDelegation = new DelegateModel();
  colHeaders: any[];
  colHeaderUsers: any[];
  roleDelegation = new DelegateModel();
  delegatedRoles: any[] = [];
  delegatedUsers: any;
  searchText: any;
  user: any;
  userSelected: any[] = [];
  roles: any[];
  selectedRole: string;
  selectedRoleOrg: string;
  isUnlimited = false;
  toDate: any = undefined;
  fromDate: any = undefined;
  delegateId: any = undefined;
  editEnabled = false;
  delegationId: any;
  delegatedOn: any;
  delName: any;
  minTo: Date;
  today: Date;
  private subscription: Subscription[] = [];
  public SelectedUserList = [];
  emptyMessage: any;
  selectedRoleMembers: any[] = [];
  currentObjId: any;
  public refTemplate = {
    id: undefined,
    roleId: undefined,
    orgCode: undefined,
    part1Type: undefined,
    part1: '-',
    part2Type: undefined,
    part2: '-',
    part3Type: undefined,
    part3: '-',
    part4Type: undefined,
    part4: '-',
    part5Type: undefined,
    part5: '-',
    creator: undefined,
    modifier: undefined,
    uidCounter: undefined
  };

  refPartTypes: { name: string; code: string; }[];
  tempToday: any;
  public expandedItems = [];
  public selectedRows = [];
  isFromDateSelected = false;
  isCurrentRoleInactive = false;
  isPart1Disable = false;
  isPart2Disable = false;
  isPart3Disable = false;
  isPart4Disable = false;
  isPart5Disable = false;
  isUID = false;

  busy: boolean;
  role: any
  constructor(
    private toastr: ToastrService,
    private us: UserService,
    private ms: MemoService,
    private confirmationService: ConfirmationService,
    private growlService: GrowlService,
    private breadcrumbService: BreadcrumbService,
    private coreService: CoreService) {
    this.userSelected = [];
    this.refPartTypes = [{ name: '-', code: '-' }, { name: 'Text', code: 'Text' }, { name: 'UniqueId', code: 'UniqueId' }, { name: 'YYYY', code: 'YYYY' }, { name: 'YY', code: 'YY' }];
  }

  ngOnInit() {
    this.today = new Date();
    this.tempToday = this.coreService.getFormattedDateString(this.today, this.coreService.dateTimeFormats.DDMMYYYY, null);
    this.user = this.us.getCurrentUser();
    this.emptyMessage = global.no_del;
    this.roles = [];
    for (const role of this.user.roles) {
      this.roles.push({ label: role.name, value: role.id });
    }
    this.busy = true;

    this.us.logIn(global.username, 'def').subscribe(loginData => {
      this.busy = false;
      this.us.setCurrentUser(loginData);
      this.user = loginData;
      if (this.user.roles.length > 0) {
        const allRoleDelegations = [];
        let finalIndex = 0;
        this.user.roles.map((role, index) => {
          this.busy = true;
          this.us.getRoleDelegation(role.id).subscribe(val => {
            this.busy = false;
            val.map((d, i) => {
              if (d.fromDate !== undefined) {
                d.fromDate = this.coreService.getFormattedDateString(d.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
              }
              if (d.toDate !== undefined) {
                d.toDate = this.coreService.getFormattedDateString(d.toDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
              }
              this.showRoleMembers(d);
              allRoleDelegations.push(d);
            });
            this.delegatedRoles = Object.assign([], allRoleDelegations);
            if (this.user.roles.length === finalIndex + 1) {
              this.selectedRows.push();
              this.selectedRole = this.user.roles[0].id;
              if (this.user.roles[0].status === 'INACTIVE') {
                this.isCurrentRoleInactive = true;
              }
              this.onSelectionChange({ value: this.selectedRole });
            }
            finalIndex++;
          }, err => {
            this.busy = false;
          });
          //this.onSelectionChange({value: role.id});
        });
      }
    }, err => {
      this.busy = false;
    });
  }
  changeRole(role: any) {
    this.role = role;
    this.selectedRole = role
  }

  clearResult() {
    this.searchStarted = false;
    this.editEnabled = false;
    this.isUID = false;
    this.currentObjId = undefined;
    setTimeout(() => {
      this.cancel();
    }, 1000);
  }

  confirm(data) {
    console.log("confirm remove template - " + data.id + ',' + data.template);
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove' + ' ' + data.template + ' ' + 'from Delegation?',
      key: 'removeRefKey',
      accept: () => {
        //Actual logic to perform a confirmation
        this.removeRefTemplate(data.id);
      },
      reject: () => {
        this.busy = false;
      }
    });
  }

  removeRefTemplate(templateId) {
    console.log("removeRefTemplate :: " + templateId);
    if (templateId > 0) {
      this.busy = true;
      this.ms.removeMemoRefSettings(templateId).subscribe(data => {
        this.busy = false;
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Removed Successfully'
        // });
        this.toastr.info('Removed Successfully', 'Success');
        this.onChangeSuccess();
      }, err => {
        this.busy = false;
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failed', detail: 'Remove Failed'
        // });
        this.toastr.error('Remove Failed', 'Failed');
      });
    }
  }

  saveMemoRefTemplate() {
    let formValid = true;
    let idVal = 0;
    console.log("SaveMemoRefTemplate :: currentObjId = " + this.currentObjId);
    if (this.currentObjId !== undefined)
      idVal = this.currentObjId;
    console.log("SaveMemoRefTemplate :: ID = " + idVal);
    if ((this.refTemplate.part1 !== undefined && this.refTemplate.part1 !== '' && this.refTemplate.part1 !== null) ||
      (this.refTemplate.part2 !== undefined && this.refTemplate.part2 !== '' && this.refTemplate.part2 !== null) ||
      (this.refTemplate.part3 !== undefined && this.refTemplate.part3 !== '' && this.refTemplate.part3 !== null) ||
      (this.refTemplate.part4 !== undefined && this.refTemplate.part4 !== '' && this.refTemplate.part4 !== null) ||
      (this.refTemplate.part5 !== undefined && this.refTemplate.part5 !== '' && this.refTemplate.part5 !== null)) {
      /*(this.refTemplate.part1Type !== undefined && this.refTemplate.part1Type !== null && this.refTemplate.part1Type.name !== 'select') ||
        (this.refTemplate.part2Type !== undefined && this.refTemplate.part2Type !== null && this.refTemplate.part2Type.name !== 'select') ||
        (this.refTemplate.part3Type !== undefined && this.refTemplate.part3Type !== null && this.refTemplate.part3Type.name !== 'select') ||
        (this.refTemplate.part4Type !== undefined && this.refTemplate.part4Type !== null && this.refTemplate.part4Type.name !== 'select') ||
        (this.refTemplate.part5Type !== undefined && this.refTemplate.part5Type !== null && this.refTemplate.part5Type.name !== 'select') */
    } else {
      formValid = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Warning', detail: 'Fill Any One Field To Save'
      // });
      this.toastr.error('Fill Any One Field To Save', 'Warning');
    }

    this.refTemplate = {
      id: idVal,
      roleId: this.selectedRole,
      orgCode: undefined,
      part1Type: this.refTemplate.part1Type ? this.refTemplate.part1Type.name : '-',
      part1: this.refTemplate.part1,
      part2Type: this.refTemplate.part2Type ? this.refTemplate.part2Type.name : '-',
      part2: this.refTemplate.part2,
      part3Type: this.refTemplate.part3Type ? this.refTemplate.part3Type.name : '-',
      part3: this.refTemplate.part3,
      part4Type: this.refTemplate.part4Type ? this.refTemplate.part4Type.name : '-',
      part4: this.refTemplate.part4,
      part5Type: this.refTemplate.part5Type ? this.refTemplate.part5Type.name : '-',
      part5: this.refTemplate.part5,
      creator: this.user.fulname,
      modifier: this.user.fulname,
      uidCounter: this.refTemplate.uidCounter ? this.refTemplate.uidCounter : 0
    };

    if (formValid) {
      this.busy = true;
      this.ms.saveMemoRefSettings(this.refTemplate).subscribe(data => {
        this.busy = false;
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Saved Successfully'
        // });
        this.toastr.info('Saved Successfully', 'Success');
        this.onChangeSuccess();
      }, err => {
        this.busy = false;
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failed', detail: 'Save Failed'
        // });
        this.toastr.info('Save Failed', 'Failed');
      });
    }
  }

  selectUser(user) {
    if (!this.editEnabled) {
      this.userSelected = [{ 'fulName': user.fulName }];
      this.delegateId = user.EmpNo;
    }
  }

  unSelected(event) {
    this.delegateId = undefined;
  }

  onChangeSuccess() {
    this.editEnabled = false;
    const allRoleDelegations = [];
    let finalIndex = 0;
    this.user.roles.map((role, index) => {
      this.busy = true;
      this.us.getRoleDelegation(role.id).subscribe(val => {
        this.busy = false;
        val.map((d, i) => {
          if (d.fromDate !== undefined) {
            d.fromDate = this.coreService.getFormattedDateString(d.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
          }
          if (d.toDate !== undefined) {
            d.toDate = this.coreService.getFormattedDateString(d.toDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
          }
          this.showRoleMembers(d);
          allRoleDelegations.push(d);
        });
        this.delegatedRoles = Object.assign([], allRoleDelegations);
        if (this.user.roles.length === finalIndex + 1) {
          this.selectedRows.push();
          this.selectedRole = this.user.roles[0].id;
          if (this.user.roles[0].status === 'INACTIVE') {
            this.isCurrentRoleInactive = true;
          }
          this.onSelectionChange({ value: this.selectedRole });
        }
        finalIndex++;
      }, err => {
        this.busy = false;
      });
    });
    this.userSelected = [];
  }

  cancel() {
    this.editEnabled = false;
    this.refTemplate = {
      id: undefined,
      roleId: undefined,
      orgCode: undefined,
      part1Type: undefined,
      part1: '-',
      part2Type: undefined,
      part2: '-',
      part3Type: undefined,
      part3: '-',
      part4Type: undefined,
      part4: '-',
      part5Type: undefined,
      part5: '-',
      creator: undefined,
      modifier: undefined,
      uidCounter: undefined
    }
  }

  addUserRoleFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add Delegate Failed'
    // });
    this.toastr.info('Add Delegate Failed', 'Failure');
  }

  onExpanded(ev: any) {
    console.log(ev);
    ev.expanded = !ev.expanded
  }

  editRefTemplate(data, rowExp?) {
    this.editEnabled = true;
    this.isUnlimited = false;
    this.currentObjId = data.id;
    console.log("editRefTemplate :: currentObjId = " + this.currentObjId);
    this.refTemplate = {
      id: data.id, roleId: data.roleId, orgCode: data.orgcode,
      part1Type: { name: data.part1Type, code: data.part1Type }, part1: data.part1,
      part2Type: { name: data.part2Type, code: data.part2Type }, part2: data.part2,
      part3Type: { name: data.part3Type, code: data.part3Type }, part3: data.part3,
      part4Type: { name: data.part4Type, code: data.part4Type }, part4: data.part4,
      part5Type: { name: data.part5Type, code: data.part5Type }, part5: data.part5,
      creator: data.creator, modifier: data.modifier, uidCounter: data.uidCounter
    };
    this.checkUIDFieldAvailable();
  }

  clearSubscriptions() {
    this.subscription.map(s => {
      s.unsubscribe();
    });
  }

  getRoleMembers(role) {
    if (!role.members) {
      let RoleNameString = '';
      this.busy = true;
      this.us.getRoleMembersForSettings(role.value).subscribe((res: any) => {
        this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        this.busy = false;
      });
    }
  }

  showRoleMembers(data, isOP?) {
    this.cancel();
    if (this.checkCurrentRoleActive(data.userId)) {
      this.isCurrentRoleInactive = true;
    }
    else {
      this.isCurrentRoleInactive = false;
    }
    if (!isOP) {
      this.selectedRole = data.userId;
    }
    if (!data.members) {
      this.busy = true;
      this.ms.getMemoRefSettingsByRole(data.userId).subscribe((res: any) => {
        this.busy = false;
        res.map(d => {
          d.template = d.part1;
          if (d.part2 != null)
            d.template += '/' + d.part2;
          if (d.part3 != null)
            d.template += '/' + d.part3;
          if (d.part4 != null)
            d.template += '/' + d.part4;
          if (d.part5 != null)
            d.template += '/' + d.part5;
        });
        data.members = res;
      }, err => {
        this.busy = false;
      });
    }
  }

  checkCurrentRoleActive(role) {
    // this.user.roles.map(d=>{
    //   if(d.id===7){
    //     d.status='INACTIVE';
    //   }
    // });
    let temp = false;
    this.user.roles.map(d => {
      if (d.id === role) {
        if (d.status === 'INACTIVE') {
          temp = true;
        }
      }
    });
    return temp;
  }

  onSelectionChange(event) {
    this.role = event.value;
    if (this.checkCurrentRoleActive(event.value)) {
      this.isCurrentRoleInactive = true;
    }
    else {
      this.isCurrentRoleInactive = false;
    }
    this.expandedItems = [];
    this.selectedRows = [];
    //console.log(this.delegatedRoles);
    var item = _.find(this.delegatedRoles, function (role) {
      return role.userId === event.value;
    });
    if (item) {
      this.expandedItems.push(item);
      this.selectedRows.push(item);
    }
  }

  onPartTypeChange(event, partNum) {
    let typeObjVal = event.value;
    let typeVal = typeObjVal.name;
    console.log("onPartTypeChange :: " + typeVal);
    if (typeVal === "UniqueId" || typeVal === "YYYY" || typeVal === "YY" || (typeVal === "-")) {
      switch (partNum) {
        case 'part1':
          this.refTemplate.part1 = (typeVal === "UniqueId") ? '#UID#' : (typeVal === "YYYY") ? '#YYYY#' : (typeVal === "YY") ? '#YY#' : '-';
          this.isPart1Disable = true;
          break;
        case 'part2':
          this.refTemplate.part2 = (typeVal === "UniqueId") ? '#UID#' : (typeVal === "YYYY") ? '#YYYY#' : (typeVal === "YY") ? '#YY#' : '-';
          this.isPart2Disable = true;
          break;
        case 'part3':
          this.refTemplate.part3 = (typeVal === "UniqueId") ? '#UID#' : (typeVal === "YYYY") ? '#YYYY#' : (typeVal === "YY") ? '#YY#' : '-';
          this.isPart3Disable = true;
          break;
        case 'part4':
          this.refTemplate.part4 = (typeVal === "UniqueId") ? '#UID#' : (typeVal === "YYYY") ? '#YYYY#' : (typeVal === "YY") ? '#YY#' : '-';
          this.isPart4Disable = true;
          break;
        case 'part5':
          this.refTemplate.part5 = (typeVal === "UniqueId") ? '#UID#' : (typeVal === "YYYY") ? '#YYYY#' : (typeVal === "YY") ? '#YY#' : '-';
          this.isPart5Disable = true;
          break;
      }
      this.checkUIDFieldAvailable();
    }
    else {
      this.enableInputbyPartType(partNum);
      this.checkUIDFieldAvailable();
    }
  }

  checkUIDFieldAvailable() {

    if (this.refTemplate.part1 === "#UID#" || this.refTemplate.part2 === "#UID#" || this.refTemplate.part3 === "#UID#" ||
      this.refTemplate.part4 === "#UID#" || this.refTemplate.part5 === "#UID#")
      this.isUID = true;
    else
      this.isUID = false;
  }

  disableInputbyPartType(partNum) {
    switch (partNum) {
      case 'part1':
        this.isPart1Disable = true;
        break;
      case 'part2':
        this.isPart2Disable = true;
        break;
      case 'part3':
        this.isPart3Disable = true;
        break;
      case 'part4':
        this.isPart4Disable = true;
        break;
      case 'part5':
        this.isPart5Disable = true;
        break;
    }
  }

  enableInputbyPartType(partNum) {
    switch (partNum) {
      case 'part1':
        this.isPart1Disable = false;
        this.refTemplate.part1 = '';
        break;
      case 'part2':
        this.isPart2Disable = false;
        this.refTemplate.part2 = '';
        break;
      case 'part3':
        this.isPart3Disable = false;
        this.refTemplate.part3 = '';
        break;
      case 'part4':
        this.isPart4Disable = false;
        this.refTemplate.part4 = '';
        break;
      case 'part5':
        this.isPart5Disable = false;
        this.refTemplate.part5 = '';
        break;
    }
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      // this[k] = null;
      delete this[k];
    })
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.delegatedRoles = [];
    this.delegatedUsers = [];
    this.SelectedUserList = [];
    this.userDelegation = undefined;
    this.roleDelegation = undefined;
    this.roles = [];
    this.criteria = [];
    this.user = undefined;
    this.selectedRoleMembers = [];
    this.destroyKeys();
    this.isCurrentRoleInactive = false;
  }
}
