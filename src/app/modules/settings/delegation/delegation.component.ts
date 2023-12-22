import { Component, OnDestroy, OnInit } from '@angular/core';
import {ConfirmationService, SelectItem, TreeNode} from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { GrowlService } from '../../../services/growl.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { DelegateModel } from '../../../models/user/delegate.model';
import * as global from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import * as _ from "lodash";

@Component({
  selector: 'app-delegation',
  templateUrl: './delegation.component.html',
  styleUrls: ['./delegation.component.css']
})
export class DelegationComponent implements OnInit, OnDestroy {
  expanded=false
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
  tempToday: any;
  public expandedItems = [];
  public selectedRows = [];
  isFromDateSelected = false;
  maxFromDate: Date;
  isCurrentRoleInactive = false;
  busy: boolean;

  constructor(
    private us: UserService,
    private confirmationService: ConfirmationService,
    private growlService: GrowlService,
    private breadcrumbService: BreadcrumbService,
    private coreService: CoreService) {
    this.userSelected = [];
  }
  initializeDateFields(){
    this.fromDate=undefined;
    this.toDate=undefined;

  }
  onExpanded(ev:any){
    console.log(ev);
    ev.expanded=!ev.expanded
  }
  removeFromRole(e) {
    e.id = e.del;
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove' + ' ' + e.name + ' ' + 'from Delegation?',
      key: 'removeDelKey',
      accept: () => {
        //Actual logic to perform a confirmation
        this.revokeDelegation(e);
      }
    });
  }

  ngOnInit() {
    this.today = new Date();
    this.tempToday = this.coreService.getFormattedDateString(this.today, this.coreService.dateTimeFormats.DDMMYYYY, null);
    this.user = this.us.getCurrentUser();
    this.emptyMessage = global.no_del;
    this.criteria = [];
    this.roles = [];
    this.selectedcriteria = 'NAME';
    for (const role of this.user.roles) {
      //if(role.name!=='CEO'){
      this.roles.push({ label: role.name, value: role.id });
      //this.roles.push({ label:role.name, value:role.id});
      // }
    }
    this.criteria.push({ label: 'Email', value: 'EMAIL' });
    this.criteria.push({ label: 'Name', value: 'NAME' });
    this.criteria.push({ label: 'Designation', value: 'TITLE' });
    this.criteria.push({ label: 'Phone', value: 'PHONE' });
    this.criteria.push({ label: 'Org Code', value: 'ORGCODE' });
    this.criteria.push({ label: 'Koc No', value: 'KOCNO' });
    this.colHeaderUsers = [
      { field: 'delName', header: 'Name' },
      /*{field: 'delegatedByName', header: 'Delegated By'},*/
      { field: 'fromDate', header: 'Active From' },
      { field: 'toDate', header: 'Expire On' },
    ];
    this.colHeaders = [
      { field: 'delName', header: 'Name' },
      { field: 'delegatedByName', header: 'Delegated By' },
      { field: 'fromDate', header: 'Active From' },
      { field: 'toDate', header: 'Expire On' },
    ];
    this.busy = true;
    this.us.getUserDelegation().subscribe(val => {
      this.busy = false;
      val.map((d, i) => {
        if (d.fromDate !== undefined) {
          d.fromDate = this.coreService.getFormattedDateString(d.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
        }
        if (d.toDate !== undefined) {
          d.toDate = this.coreService.getFormattedDateString(d.toDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
        }
      });
      this.delegatedUsers = val;
    }, err => {
      this.busy = false;
    });
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
            if (this.user.roles.length === finalIndex  + 1) {
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
    this.maxFromDate = new Date("December 31, 2031");
  }

  clearResult() {
    this.searchStarted = false;
    //this.searchText = '';
  }

  checkChange(event) {
    if (event === true) {
      this.isUnlimited = true;
      this.toDate = undefined;
    }
    else {
      this.isUnlimited = false;
    }
    this.maxFromDate = new Date("December 31, 2031");
  }

  confirm(event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove' + ' ' + event.delName + ' ' + 'from Delegation?',
      key: 'removeDelKey',
      accept: () => {
        //Actual logic to perform a confirmation
        this.revokeDelegation(event);
      }
    });
  }

  searchUsers() {
    /*this.searchStarted = true;
    const subscription = this.us.searchUsersList('USER', this.searchText, this.selectedcriteria,'').subscribe(data => {
      this.SelectedUserList = data;
    });
    this.coreService.progress = {busy: subscription, message: '', backdrop: true};
    this.addToSubscriptions(subscription);*/

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
      this.searchStarted = true;
      this.busy = true;
      this.us.searchEcmUsers(this.searchQueary).subscribe(data => {
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

  selectUser(user) {
    if (!this.editEnabled) {
      this.userSelected = [{ 'fulName': user.fulName }];
      this.delegateId = user.EmpNo;
    }
  }

  unSelected(event) {
    this.delegateId = undefined;
  }

  addDelegationUser() {
    let exist = false;
    this.delegatedUsers.map(d => {
      if (d.delegateId === this.delegateId) {
        exist = true;
      }
    });
    if (exist && !this.editEnabled) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'User Already Exist'
      });
      return;
    }
    if (this.isUnlimited === false) {
      if (this.delegateId && this.fromDate && this.toDate) {
        this.userDelegation.id = 0;
        this.userDelegation.delegateId = this.delegateId;
        this.userDelegation.delegatedBy = this.user.EmpNo;
        if (typeof this.fromDate !== 'object') {
          this.userDelegation.fromDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse(this.fromDate));
        }
        else {
          this.userDelegation.fromDate = new Date(this.fromDate);
        }

        if (typeof this.toDate !== 'object') {
          this.userDelegation.toDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse(this.toDate));
        }
        else {
          this.userDelegation.toDate = new Date(this.toDate);
        }
        this.userDelegation.userId = this.user.EmpNo;
        this.userDelegation.userType = 'USER';
        if (this.editEnabled) {
          this.userDelegation.status = 'ACTIVE';
          this.userDelegation.id = this.delegationId;
          this.userDelegation.delName = this.delName;
          this.userDelegation.delegatedOn = this.delegatedOn;
        }
        if (this.userDelegation.delegateId !== this.user.EmpNo) {
          this.busy = true;
          this.us.saveDelegation(this.userDelegation).subscribe(data => {
            this.busy = false;
            this.addUserSuccessfull(data)
          }, error => {
            this.busy = false;
            this.addUserFailed()
          });
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Allowed', detail: 'Cannot Delegate To Self'
          });
        }
      }
      else {
        let message = 'Select User and Active From';
        if (!this.delegateId) {
          message = 'Select User';
        } else if (!this.fromDate) {
          message = 'Select Active From';
        }
        else if (!this.toDate) {
          message = 'Select Expire On';
        }
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Fill Required', detail: message
        });
      }
    } else {
      if (this.delegateId && this.fromDate) {
        this.userDelegation.id = 0;
        this.userDelegation.delegateId = this.delegateId;
        this.userDelegation.delegatedBy = this.user.EmpNo;
        if (typeof this.fromDate !== 'object') {
          this.userDelegation.fromDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse(this.fromDate));
        }
        else {
          this.userDelegation.fromDate = new Date(this.fromDate);
        }

        if (typeof this.toDate !== 'object' && this.toDate) {
          this.userDelegation.toDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse(this.toDate));
        }
        else {
          this.userDelegation.toDate = new Date(this.toDate);
        }
        this.userDelegation.userId = this.user.EmpNo;
        this.userDelegation.userType = 'USER';
        if (this.editEnabled) {
          this.userDelegation.status = 'ACTIVE';
          this.userDelegation.id = this.delegationId;
          this.userDelegation.delName = this.delName;
          this.userDelegation.delegatedOn = this.delegatedOn;
        }
        if (this.userDelegation.delegateId !== this.user.EmpNo) {
          this.busy = true;
          this.us.saveDelegation(this.userDelegation).subscribe(data => {
            this.busy = false;
            this.addUserSuccessfull(data)
          }, error => {
            this.busy = false;
            this.addUserFailed()
          });
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Allowed', detail: 'Cannot Delegate To Self'
          });
        }
      }
      else {
        let message = 'Select User and Active From';
        if (!this.delegateId) {
          message = 'Select User';
        } else if (!this.fromDate) {
          message = 'Select Active From';
        }
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Fill Required', detail: message
        });
      }
    }
  }

  addUserSuccessfull(data) {
    if (data === 'EXISTS') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'User Already Exist'
      });
    }
    else {
      if (this.editEnabled) {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Saved Delegation Successfully'
        });
      }
      else {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Added Delegation Successfully'
        });
      }
    }
    this.editEnabled = false;
    this.busy = true;
    this.us.getUserDelegation().subscribe(val => {
      this.busy = false;
      val.map((d, i) => {
        if (d.fromDate !== undefined) {
          d.fromDate = this.coreService.getFormattedDateString(d.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
        }
        if (d.toDate !== undefined) {
          d.toDate = this.coreService.getFormattedDateString(d.toDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
        }
      });
      this.delegatedUsers = val;
    }, err => {
      this.busy = false;
    });
    // this.fromDate = undefined;
    // this.toDate = '';
    this.userSelected = [];
    this.isUnlimited = false;
    this.delegateId = undefined;
    this.userDelegation.fromDate = '';
    this.searchText = undefined;
    this.SelectedUserList = [];
    this.clearFromDate();
    this.clearExpireDate();
    this.initializeDateFields();
  }

  addUserFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Add Delegation Failed'
    });
  }

  addDelegationRole() {
    this.us.getUserDelegationForSelectedUser(this.delegateId).subscribe(d=>this.checkDelegation(d));

  }
  checkDelegation(d){
    if(d.length<=0){
        if (this.isUnlimited === false) {
      if (this.delegateId && this.fromDate && this.toDate) {
        this.roleDelegation.id = 0;
        this.roleDelegation.delegateId = this.delegateId;
        this.roleDelegation.delegatedBy = this.user.EmpNo;
        this.roleDelegation.fromDate = this.fromDate;
        this.roleDelegation.toDate = this.toDate;
        this.roleDelegation.userId = this.selectedRole;
        this.roleDelegation.userType = 'ROLE';
        if (this.editEnabled) {
          this.roleDelegation.status = 'ACTIVE';
          this.roleDelegation.id = this.delegationId;
          this.roleDelegation.delName = this.delName;
          this.roleDelegation.delegatedOn = this.delegatedOn;
        }
        if (this.roleDelegation.delegateId !== this.user.EmpNo) {
          this.busy = true;
          this.us.saveDelegation(this.roleDelegation).subscribe(data => {
            this.busy = false;
            this.addRoleSuccessfull(data)
          }, error => {
            this.busy = false;
            this.addUserRoleFailed()
          });
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Allowed', detail: 'Cannot Delegate To Self'
          });
        }
      }
      else {
        let message = 'Select User and Active From';
        if (!this.delegateId) {
          message = 'Select User';
        } else if (!this.fromDate) {
          message = 'Select Active From';
        }
        else if (!this.toDate) {
          message = 'Select Expire On';
        }
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Fill Required', detail: message
        });
      }
    }
    else {
      if (this.delegateId && this.fromDate) {
        this.roleDelegation.id = 0;
        this.roleDelegation.delegateId = this.delegateId;
        this.roleDelegation.delegatedBy = this.user.EmpNo;
        this.roleDelegation.fromDate = this.fromDate;
        this.roleDelegation.toDate = this.toDate;
        this.roleDelegation.userId = this.selectedRole;
        this.roleDelegation.userType = 'ROLE';
        if (this.editEnabled) {
          this.roleDelegation.status = 'ACTIVE';
          this.roleDelegation.id = this.delegationId;
          this.roleDelegation.delName = this.delName;
          this.roleDelegation.delegatedOn = this.delegatedOn;
        }
        if (this.roleDelegation.delegateId !== this.user.EmpNo) {
          this.busy = true;
          this.us.saveDelegation(this.roleDelegation).subscribe(data => {
            this.busy = false;
            this.addRoleSuccessfull(data)
          }, error => {
            this.busy = false;
            this.addUserRoleFailed()
          });
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Allowed', detail: 'Cannot Delegate To Self'
          });
        }
      }
      else {
        let message = 'Select User and Active From';
        if (!this.delegateId) {
          message = 'Select User';
        } else if (!this.fromDate) {
          message = 'Select Active From';
        }
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Fill Required', detail: message
        });
      }
    }
    }
    else{
      this.confirmationService.confirm({
      message: 'User can’t be added to the Role due to existing user-to-user delegation, please contact User/ECM Support team to remove user delegation',
      key: 'userDelExistKey',
      accept: () => {
      }
    });
    }
  }

  addRoleSuccessfull(data) {
    if (data === 'EXISTS') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'User Already Exist'
      });
    }
    else {
      if (this.editEnabled) {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Saved Delegation Successfully'
        });
      }
      else {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Added Delegation Successfully'
        });
        //this.onSelectionChange({value: this.selectedRole});
      }
    }
    this.editEnabled = false;
    // const subscription = this.us.getRoleDelegation().subscribe(val => {
    //   val.map((d, i) => {
    //     if (d.fromDate !== undefined) {
    //     }
    //     if (d.toDate !== undefined) {
    //     }
    //   });
    //   this.delegatedRoles = val;
    // });
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
          this.showRoleMembers(d,true);
          allRoleDelegations.push(d);
        });
        this.delegatedRoles = Object.assign([], allRoleDelegations);
        if (this.user.roles.length === finalIndex + 1) {
          //console.log(this.delegatedRoles);
          this.onSelectionChange({ value: this.selectedRole });
        }
         finalIndex++;
      }, err => {
        this.busy = false;
      });
      //this.onSelectionChange({value:role.id});
    });
    // this.fromDate = undefined;
    // this.toDate = '';
    this.userSelected = [];
    this.isUnlimited = false;
    this.delegateId = undefined;
    this.roleDelegation.fromDate = '';
    this.clearFromDate();
    this.clearExpireDate();
    this.initializeDateFields();
  }

  cancel() {
    this.editEnabled = false;
    // this.fromDate = undefined;
    // this.toDate = '';
    this.userSelected = [];
    this.isUnlimited = false;
    this.delegateId = undefined;
    this.userDelegation.fromDate = '';
    this.searchText = undefined;
    this.SelectedUserList = [];
    this.initializeDateFields();
    this.clearExpireDate();
    this.clearFromDate();
  }

  addUserRoleFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Add Delegate Failed'
    });
  }

  revokeDelegation(del) {
    if (del.id === 0) {
      const subscription = this.us.removeUserFromRole(del.empNo, del.roleId).subscribe(res => {
        if (res === 'OK') {
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'Removed Delegation Successfully'
          });
          this.removeDelegationSuccess();
        } else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Failure', detail: 'Failed To Remove Delegation'
          });
        }
      });
    }
    else {
      this.busy = true;
      this.us.revokeDelegation(del.id).subscribe(data => {
        this.busy = false;
        if (data === 'OK') {
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'Removed Delegation Successfully'
          });
          this.removeDelegationSuccess();
          //this.onSelectionChange({value:this.selectedRole});
        } else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Failure', detail: 'Failed To Remove Delegation'
          });
        }
      }, err => {
        this.busy = false;
      });
    }
  }

  removeDelegationSuccess() {
    this.fromDate = undefined;
    this.toDate = '';
    this.userSelected = [];
    this.isUnlimited = false;
    this.delegateId = undefined;
    this.roleDelegation.fromDate = '';
    this.editEnabled = false;
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
            this.showRoleMembers(d,true);
            allRoleDelegations.push(d);
          });
          this.delegatedRoles = Object.assign([], allRoleDelegations);
          if (this.user.roles.length === finalIndex + 1) {
            //console.log(this.delegatedRoles);
            this.onSelectionChange({ value: this.selectedRole });
          }
            finalIndex++;
        }, err => {
          this.busy = false;
        });
        //this.onSelectionChange({value: role.id});
      });
      //this.onSelectionChange({ value: this.selectedRole });
    } else {
      this.busy = true;
      this.us.getUserDelegation().subscribe(val => {
        this.busy = false;
        val.map((d, i) => {
          if (d.fromDate !== undefined) {
            d.fromDate = this.coreService.getFormattedDateString(d.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
          }
          if (d.toDate !== undefined) {
            d.toDate = this.coreService.getFormattedDateString(d.toDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
          }
        });
        this.delegatedUsers = val;
      }, err => {
        this.busy = false;
      });
    }
  }

  editDelegationRole(data, rowExp?) {
    this.editEnabled = true;
    this.isUnlimited = false;
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
    this.searchStarted = false;
    if (!(data.toDate === undefined || data.toDate === "Unlimited" || data.toDate === "")) {
      this.toDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse((data.toDate)));
    }
    else {
      this.toDate = "";
    }
    if (!(data.fromDate === undefined || data.fromDate === "Unlimited" || data.fromDate === "")) {
      this.fromDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse((data.fromDate)));
    } else {
      this.fromDate = "";
    }
    this.userSelected = [{ 'fulName': data.delName }];
    this.delegateId = data.delegateId;
    this.delegationId = rowExp ? data.delId : data.id;
    this.delName = data.delName;
    this.delegatedOn = data.delegatedOn;
    this.changeFrom(this.coreService.formatDateForDelegateFormatMMDDReverse((data.fromDate)));
    //this.selectedRole={roleId:this.user.roles[1].id,status:this.user.roles[1].status};
    this.selectedRole = rowExp ? data.roleId : data.userId;
    //this.onSelectionChange({ value: this.selectedRole });
    if (!this.toDate) {
      this.isUnlimited = true;
    }
    else{

    }
  }

  editDelegationUser(data) {
    this.editEnabled = true;
    this.isUnlimited = false;
    this.searchStarted = false;
    if (!(data.toDate === undefined || data.toDate === "Unlimited" || data.toDate === "")) {
      this.toDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse((data.toDate)));
    }
    else {
      this.toDate = "";
    }
    if (!(data.fromDate === undefined || data.fromDate === "Unlimited" || data.fromDate === "")) {
      this.fromDate = new Date(this.coreService.formatDateForDelegateFormatMMDDReverse((data.fromDate)));
    } else {
      this.fromDate = "";
    }
    this.userSelected = [{ 'fulName': data.delName }];
    this.delegateId = data.delegateId;
    this.delegationId = data.id;
    this.delName = data.delName;
    this.delegatedOn = data.delegatedOn;
    this.changeFrom(this.coreService.formatDateForDelegateFormatMMDDReverse(data.fromDate));
    if (!this.toDate) {
      this.isUnlimited = true;
    }
  }

  changeFrom(event) {
    // let temp= new Date(event);
    // temp.setDate(temp.getDate() + 1);
    // this.minTo = temp;
    this.isFromDateSelected = true;
    if(this.fromDate && this.fromDate<this.today){
       this.minTo = this.today;
    }
    else{
      this.minTo = new Date(event);
    }

  }

  changeTo(event) {
    //this.toDate = this.coreService.getFormattedDateString(event,this.coreService.dateTimeFormats.YYYYMMDD,null);
    this.maxFromDate = new Date(event);
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

  showRoleMembers(data,isOP?) {
    this.cancel();
    if (this.checkCurrentRoleActive(data.userId)) {
      this.isCurrentRoleInactive = true;
    }
    else {
      this.isCurrentRoleInactive = false;
    }
    if(!isOP){
      this.selectedRole = data.userId;
    }
    if (!data.members) {
      this.busy = true;
      this.us.getRoleMembersForSettings(data.userId).subscribe((res: any) => {
        this.busy = false;
        res.map(d => {
          d.delName = d.name;
          d.delegateId = d.empNo;
          d.id = d.delId;
          if (d.fromDate === 'Unlimited') {
            d.fromDate = undefined;
          } else if (d.fromDate === "") {
            d.fromDate = '-';
          } else {
            //d.fromDate = this.coreService.getFormattedDateString(d.fromDate,this.coreService.dateTimeFormats.YYYYMMDD,null);
            d.fromDate = this.coreService.formatDateForDelegateFormat(d.fromDate);
          }
          if (d.toDate === 'Unlimited') {
            d.toDate = undefined;
            d.todate = "-";
          } else {
            //d.toDate = this.coreService.getFormattedDateString(d.toDate,this.coreService.dateTimeFormats.YYYYMMDD,null);
            d.toDate = this.coreService.formatDateForDelegateFormat(d.toDate);
            // d.todate = d.toDate;
          }
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
    if (this.checkCurrentRoleActive(event.value)) {
      this.isCurrentRoleInactive = true;
    }
    else {
      this.isCurrentRoleInactive = false;
    }
    /*this.selectedRoleMembers[event.value] = [];
    const roleMembers = [];
    const subscription = this.us.getRoleMembers(event.value).subscribe((res: any) => {
      for (const RName of res) {
        if (RName.name !== undefined && RName.empNo === this.user.EmpNo) {
          roleMembers.push({name: RName.name, del:RName.delId, disabled:true,roleId:RName.roleId,empNo:RName.empNo});
        } else {
          roleMembers.push({name: RName.name, del:RName.delId, disabled:false,roleId:RName.roleId,empNo:RName.empNo});
        }
      }
      this.selectedRoleMembers[event.value] = Object.assign([], roleMembers);
    }, err => {
    });
    this.coreService.progress = {busy: subscription, message: '', backdrop: true};
    this.addToSubscriptions(subscription);*/
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

  destroyKeys() {
    Object.keys(this).map(k => {
      // this[k] = null;
      delete this[k];
    })
  }

  clearFromDate() {
    this.isFromDateSelected = false;
  }

  clearExpireDate() {
    this.maxFromDate = new Date("December 31, 2031");
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
