import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoreService } from "../../../services/core.service";
import { AccesspolicyComponent } from "../accesspolicy/accesspolicy.component";
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import { ConfirmationService, SelectItem } from "primeng/api";
import { AdminService } from "../../../services/admin.service";
import { GrowlService } from "../../../services/growl.service";
import { AccessPolicyService } from "../../../services/access-policy.service";
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import * as _ from "lodash";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-manage-accesspolicy',
  templateUrl: './manage-accesspolicy.component.html',
  styleUrls: ['./manage-accesspolicy.component.css']
})
export class ManageAccesspolicyComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dataTable!: Table;
  accessPolicies: any[];
  accessPoliciesTemp: any[];
  showPermissionDialogue = false;
  selectedPolicy: any = {};
  colHeaders: any[];
  newPermissions: any[];
  searchUserOrGroup: any;
  viewpolicy = false;
  accessLevelsMap = {
    'Full Control': 998903,
    'Author': 131575,
    'Viewer': 131217,
    'Owner': 933367
  };
  accessLevels: any;
  accessType: any;
  permissionRowStyleMap: { [key: string]: string };
  private subscriptions: any[] = [];
  private orgCodes: any[];
  public pageSize: any = 15;
  public allpolicy: any;
  private tempPermissions: any[];
  private service: (jsonstring: any) => any;
  private disableAddNewPermission = false;
  public user = new User();
  selectedType: string = 'U';
  results: string[];
  isUserSelected = false;
  public selectedAp: any;
  groupList: SelectItem[];
  selectedGroup: any;
  updateMultipleDialog = false;
  selectedAccessType: any;
  selectedAccessLevel: any;
  accessMaskTemp = '';
  mappedAccessPolicy = [];
  searchText: any;
  busy: boolean;
  isButtonSaveDisabled = true;
  constructor(
    private accessPolicyService: AccessPolicyService,
    private coreService: CoreService,
    private adminService: AdminService,
    private growlService: GrowlService,
    private breadcrumbService: BreadcrumbService,
    private us: UserService,
    private confirmationService: ConfirmationService) {
    this.user = this.us.getCurrentUser();
    this.groupList = [];
    this.populateAccessDropdowns();
  }

  populateAccessDropdowns() {
    this.accessLevels = [{ label: 'Full Access', value: 'Full Control' },
    { label: 'Author', value: 'Author' },
    { label: 'Viewer', value: 'Viewer' }, { label: 'Owner', value: 'Owner' }];
    this.accessType = [
      { label: 'ALLOW', value: 'ALLOW' },
      {
        label: 'DENY', value: 'DENY'
      }];
    this.selectedAccessType = this.accessType[0].value;
    this.selectedAccessLevel = this.accessLevels[0].value;
  }

  refresh() {
    //this.getAllPermissions();
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  getGroupResults() {
    if (this.selectedType === 'UG') {
      this.adminService.getLDAPGroups(this.searchUserOrGroup.login, 'USER').subscribe(data => this.assignGroupList(data))
    } else if (this.selectedType === 'GG') {
      this.adminService.getLDAPGroups(this.searchUserOrGroup.name, 'GROUP').subscribe(data => this.assignGroupList(data))
    }
  }

  radioButtonClick(e) {
    this.searchText = undefined;
    this.searchUserOrGroup = '';
    this.selectedType = e;
    this.accessPolicies = [];
    this.accessPoliciesTemp = [];
    this.selectedAp = [];
    this.clearInputFilterForGroups();
    if (e === 'None') {
      this.accessLevels = [];
      this.accessType = [];
    } else {
      this.populateAccessDropdowns();
    }
  }

  assignGroupList(data) {
    if (data.length === 0) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'No Results', detail: 'No Groups Found'
      });
    }
    this.groupList = [];
    data.map(d => {
      this.groupList.push({ label: d.name, value: d.login });
    });
  }

  clearSelection() {
    this.searchUserOrGroup = undefined;
    this.results = [];
    this.clearInputFilterForGroups();
    this.searchText = undefined;
    this.accessPolicies = [];
    this.accessPoliciesTemp = [];
  }

  clearInputFilterForGroups() {
    this.selectedGroup = undefined;
    this.groupList = [];
  }

  searchSelected(e) {
    if (e.name) {
      this.isUserSelected = true;
    }
  }

  // onSearchComplete(){
  //   console.log('complete');
  // }

  search(e) {
    if (this.searchUserOrGroup.length > 2) {
      if (this.selectedType === 'U' || this.selectedType === 'UG') {
        this.busy = true;
        this.adminService.searchLDAPUsers(this.searchUserOrGroup).subscribe(res => {
          this.busy = false;
          this.results = res;
        }, err => {
          this.busy = false;
        });
      } else {
        this.busy = true;
        this.adminService.searchLDAPGroups(this.searchUserOrGroup).subscribe(res => {
          this.busy = false;
          this.results = res;
        }, err => {
          this.busy = false;
        });
      }
    } else {
      this.clearInputFilterForGroups();
    }
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    //this.getAllPermissions();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Manage Access Policy' }
    ]);
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.pageSize = parseInt(d.val, 10);
          } else {
            this.pageSize = 15;
          }
        }
      });
    }
  }

  rowStyleMapFn(row, index): any {
    if (row.action === 'REMOVE') {
      return 'removed-row';
    }
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  getAllPermissions() {
    this.busy = true;
    this.accessPolicyService.getAllAccessPolicies().subscribe(res => {
      this.busy = false;
      res.map(d => {
        d.modifiedDate2 = this.coreService.getTimestampFromDate(d.modifiedDate, null, '/');
      });
      this.accessPolicies = res;
      this.accessPoliciesTemp = res;
      this.colHeaders = [
        { field: 'id', header: 'Id' },
        { field: 'name', header: 'Name' },
        { field: 'orgCode', header: 'Org Code' },
        { field: 'type', header: 'Access Policy Type' },
        { field: 'orgName', header: 'Organization' },
        { field: 'createdBy', header: 'Created By' },
        { field: 'createdDate', header: 'Created Date' },
        { field: 'modifiedBy', header: 'Modified By' },
        { field: 'modifiedDate', header: 'Modified Date', sortField: 'modifiedDate2' },
      ];
    }, err => {
      this.busy = false;
    });
  }

  edit(row) {
    let policy = _.find(this.accessPolicies, function (r) {
      return r.id === row.id;
    });
    if (policy.isNew) {
      let exists = false;
      this.accessPolicies.map(ap => {
        if (!ap.isNew && ap.name === policy.name) {
          exists = true;
        }
      });
      if (exists) {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Policy Name Already Exists'
        });
        return;
      }
    }
    this.selectedPolicy = policy;
    this.newPermissions = [];
    this.selectedPolicy.permissions = [];
    if (policy.objectId) {
      this.busy = true;
      this.accessPolicyService.getAccessPolicyPermissions(policy.objectId, policy.type).subscribe(res => {
        this.busy = false;
        this.tempPermissions = res;
        res.map((r, i) => {
          r.id = i;
          if (r.inheritDepth === -2 || r.inheritDepth === -3) {
            this.selectedPolicy.permissions.push(Object.assign({}, r));
          }
        });
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
        this.showPermissionDialogue = true;
      }, err => {
        this.busy = false;
      });
    } else {
      this.addNewPermission();
      this.showPermissionDialogue = true;
    }
  }

  getOrgCodes(event) {
    this.busy = true;
    this.adminService.searchOrgUnits(event.query).subscribe(res => {
      this.busy = false;
      this.orgCodes = res;
    }, err => {
      this.busy = false;
    });
  }

  onOrgCodeSelect(selectedOrg, policy) {
    policy.orgName = selectedOrg.desc;
  }

  accessTypeChanged(permission) {
    permission.action = 'ADD';
  }
  reset() {
    this.dataTable.reset()
  }
  permissionChanged(permission) {
    permission.action = 'ADD';
    permission.accessMask = this.accessLevelsMap[permission.accessLevel];
  }

  savePermissions(isAfterFilter) {
    const newPermissions = [];
    delete this.selectedPolicy.modifiedDate2;
    const selectedPolicy = Object.assign({}, this.selectedPolicy);
    selectedPolicy.permissions.map((p, i) => {
      if (p.action === 'ADD') {
        const oldP = Object.assign({}, p);
        if (!p.id) {
          p.id = 0;
        }
        oldP.accessLevel = this.tempPermissions[p.id].accessLevel;
        oldP.id = undefined;
        //oldP.accessMask = this.accessLevelsMap[oldP.accessLevel];
        if (isAfterFilter) {
          oldP.accessMask = this.accessMaskTemp
        } else {
          oldP.accessMask = this.tempPermissions[p.id].accessMask;
          //oldP.accessMask =this.accessLevelsMap[oldP.accessLevel];
        }
        oldP.action = 'REMOVE';
        oldP.accessType = this.tempPermissions[p.id].accessType ? this.tempPermissions[p.id].accessType : 'ALLOW';
        selectedPolicy.permissions.splice(i, 1, oldP);
        newPermissions.push(p);
      }
      p.id = undefined;
    });
    if (this.newPermissions && this.newPermissions.length > 0) {
      let temp = [];
      this.newPermissions.map((d, i) => {
        if (!(d.Isexist)) {
          temp.push(d);
        }
      });
      this.newPermissions = [...temp];
    }
    selectedPolicy.permissions = selectedPolicy.permissions.concat(newPermissions);
    if (this.newPermissions) {
      this.newPermissions.map(newPermission => {
        if (newPermission.granteeName) {
          const newPermissionObj: any = {};
          newPermissionObj.accessType = newPermission.accessType;
          newPermissionObj.action = 'ADD';
          newPermissionObj.depthName = '';
          newPermissionObj.inheritDepth = -3;
          newPermissionObj.permissionSource = 'DIRECT';
          newPermissionObj.granteeName = newPermission.granteeName.login;
          newPermissionObj.granteeType = newPermission.granteeType;
          newPermissionObj.accessLevel = newPermission.accessLevel;
          newPermissionObj.accessMask = this.accessLevelsMap[newPermission.accessLevel];
          selectedPolicy.permissions.push(newPermissionObj);
        }
      });
    }
    let service: string;
    let successMsg = 'Permission Added Successfully';
    let errorMsg = 'Error In Adding Permission';
    if (selectedPolicy.isNew) {
      selectedPolicy.orgUnitId = selectedPolicy.orgCode.id;
      selectedPolicy.orgCode = undefined;
      selectedPolicy.isNew = undefined;
      selectedPolicy.createdBy = this.user.fulName;
      service = 'addAccessPolicy';
    } else {
      selectedPolicy.modifiedBy = this.user.fulName;
      service = 'setPermissions';
      successMsg = 'Permission Updated Successfully';
      errorMsg = 'Error In Updating Permission';
    }
    let sendpolicy;
    if (isAfterFilter) {
      service = 'setMultiAccessPolicyPermissions';
      this.selectedAp.map((policies) => {
        delete policies.modifiedDate2;
        policies.permissions = selectedPolicy.permissions;
      });
      sendpolicy = { 'accesspolicies': this.selectedAp };
    } else {
      sendpolicy = selectedPolicy;
    }
    if (sendpolicy.modifiedDate2) {
      delete sendpolicy.modifiedDate2;
    }
    this.showPermissionDialogue = false;
    this.busy = true;
    this.accessPolicyService[service](sendpolicy).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: successMsg
      });
      this.disableAddNewPermission = false;
      this.updateMultipleDialog = false;
      this.refreshPolicyAfterSearch();
    }, err => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: errorMsg
      });
    });
  }

  onGranteeTypeChange(permission) {
    permission.granteeName = undefined;
  }

  rowStyle(data, index): any {
    if (data.isNew) {
      return 'highlight'
    }
  }

  addNewPermission() {
    if (!this.newPermissions) {
      this.newPermissions = [];
    }
    this.newPermissions = [...this.newPermissions, {
      granteeType: 'USER',
      accessLevel: 'Full Control',
      accessType: 'ALLOW'
    }];
  }
  isSaveButtonDisabled(event) {
    this.isButtonSaveDisabled = event;
  }

  getGranteesSuggestion(event) {
    if (event.np.granteeType === 'USER') {
      if (event.event.query.length >= 3) {
        this.busy = true;
        this.adminService.searchLDAPUsers(event.event.query).subscribe(res => {
          this.busy = false;
          event.np.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    } else {
      if (event.event.query.length >= 3) {
        this.busy = true;
        this.adminService.searchLDAPGroups(event.event.query).subscribe(res => {
          this.busy = false;
          event.np.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    }
  }

  removePolicy(policy) {
    this.accessPolicies.map((p, i) => {
      if (p === policy) {
        this.accessPolicies.splice(i, 1);
        this.accessPolicies = [...this.accessPolicies];
        this.disableAddNewPermission = false;
      }
    });
  }

  removePolicyAfterFilter(selectedpolicy) {
    let tempname;
    let msg;
    selectedpolicy.map(d => {
      delete d.modifiedDate2
    });
    selectedpolicy[0].permissions.map(d => {
      tempname = d.granteeName;
    });
    if (this.selectedType === 'U') {
      msg = 'Are you sure that you want to remove this user ' + tempname + ' from selected access policies';
    } else {
      msg = 'Are you sure that you want to remove this group ' + tempname + ' from selected access policies ';
    }
    this.confirmationService.confirm({
      header: 'Remove Confirmation',
      key: 'confirmRemoveAP',
      message: msg,
      accept: () => {
        this.selectedAp.map(d => {
          d.permissions.map(k => {
            k.action = 'REMOVE';
            delete k.id;
          })
        });
        const temparray = { 'accesspolicies': this.selectedAp };
        this.busy = true;
        this.accessPolicyService.setMultiAccessPolicyPermissions(temparray).subscribe(data => {
          this.busy = false;
          this.updateSuccess(data, this.selectedAp)
        }, err => {
          this.busy = false;
          this.updateFailure()
        });
      }
    });
  }

  updateSuccess(res, actionedAp) {
    if (res === 'OK') {
      let msg = '';
      if (this.selectedType === 'UG' || this.selectedType === 'U') {
        msg = 'Removed user from accesspolicy'
      } else if (this.selectedType === 'GG' || this.selectedType === 'G') {
        msg = 'Removed group from accesspolicy'
      }
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: msg
      });
      this.refreshPolicyAfterSearch();
    } else if (res === 'Mapping Exists') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error', detail: 'Mapping Exists Cannot Be Deleted'
      });
    }
  }

  updateFailure() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed to remove accesspolicies'
    });
  }

  addPolicyAfterFilter(policy) {
    this.newPermissions = [];
    this.selectedPolicy.permissions = [];
    if (policy.objectId) {
      this.busy = true;
      this.accessPolicyService.getAccessPolicyPermissions(policy.objectId, policy.type).subscribe(res => {
        this.busy = false;
        this.tempPermissions = res;
        res.map((r, i) => {
          r.id = i;
          if (r.inheritDepth === -2 || r.inheritDepth === -3) {
            this.selectedPolicy.permissions.push(Object.assign({}, r));
          }
        });
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
        this.showPermissionDialogue = true;
      }, err => {
        this.busy = false;
      });
    }
  }


  updatePolicyAfterFilter(row) {
    let policy = _.find(this.accessPolicies, function (r) {
      return r.id === row[0].id;
    });
    // this.selectedPolicy=policy[0];
    this.accessPoliciesTemp[0].permissions.map(d => {
      //if ((d.granteeName.toUpperCase()) === ((this.searchUserOrGroup.login + '@ecm.ibm.local').toUpperCase()) ||
      //  (d.granteeName.toUpperCase()) === ((this.selectedGroup + '@ecm.ibm.local').toUpperCase())) {
      if ((d.granteeName.toUpperCase()) === ((this.selectedGroup + '@KOCKW.com').toUpperCase())) {
        this.selectedPolicy.permissions = [d];
        this.accessMaskTemp = d.accessMask;
      } else if ((d.granteeName.toUpperCase()) === ((this.searchUserOrGroup.login + '@KOCKW.com').toUpperCase())) {
        this.selectedPolicy.permissions = [d];
        this.accessMaskTemp = d.accessMask;
      }
    });
    // this.selectedPolicy.permissions.pop();
    if (policy.isNew) {
      let exists = false;
      this.accessPolicies.map(ap => {
        if (!ap.isNew && ap.name === policy.name) {
          exists = true;
        }
      });
      if (exists) {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Policy Name Already Exists'
        });
        return;
      }
    }

    this.newPermissions = [];
    this.tempPermissions = [];
    if (policy.objectId) {
      this.busy = true;
      this.accessPolicyService.getAccessPolicyPermissions(policy.objectId, policy.type).subscribe(res => {
        this.busy = false;
        res.map((permission) => {
          if (permission.accessType === this.selectedAccessType && permission.accessLevel === this.selectedAccessLevel) {
            this.tempPermissions.push(permission)
          }
        });
        this.updateMultipleDialog = true;
      }, err => {
        this.busy = false;
      });
    } else {
      this.addNewPermission();
      this.updateMultipleDialog = true;
    }
  }

  refreshPolicyAfterSearch() {
    if (this.selectedType === 'None') {
      this.getAllPermissions();
    } else {
      if (this.searchUserOrGroup) {
        if (this.selectedGroup) {
          this.busy = true;
          this.accessPolicyService.getAccessPoliciesByGrantee(this.selectedGroup, this.selectedAccessType, this.selectedAccessLevel).subscribe(data => {
            this.busy = false;
            this.assignAccesspolicyByGrantee(data)
          }, err => {
            this.busy = false;
          });
        } else {
          this.busy = true;
          this.accessPolicyService.getAccessPoliciesByGrantee(this.searchUserOrGroup.login, this.selectedAccessType, this.selectedAccessLevel).subscribe(data => {
            this.busy = false;
            this.assignAccesspolicyByGrantee(data)
          }, err => {
            this.busy = false;
          });
        }
      }
    }
  }

  addPermission(permission) {
    this.selectedPolicy.permissions.map((p, i) => {
      if (p === permission) {
        p.action = 'READ';
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
      }
    });
  }

  removePermission(permission) {
    this.selectedPolicy.permissions.map((p, i) => {
      if (p === permission) {
        p.action = 'REMOVE';
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
      }
    });
  }

  removeNewPermission(permission) {
    this.newPermissions.map((p, i) => {
      if (p === permission) {
        this.newPermissions.splice(i, 1);
        this.newPermissions = [...this.newPermissions];
      }
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  addNewPolicy() {
    if (this.accessPolicies.length >= this.pageSize) {
      this.accessPolicies.map((ap, i) => {
        if (ap.isNew) {
          this.accessPolicies.splice(i - 1, 0, ap);
          this.accessPolicies.splice(i + 1, 1);
        }
      });
      this.accessPolicies.splice(this.pageSize - 1, 0, { isNew: true, id: null, objectId: null });
    } else {
      this.accessPolicies.push({ isNew: true, id: null, objectId: null })
    }
    this.disableAddNewPermission = true;
    this.accessPolicies = [...this.accessPolicies];
  }

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.accessPolicies, 'Access_Policies ' + this.coreService.getDateTimeForExport() + '.xlsx', array)
  }

  viewAccesspolicy(row) {
    let policy = _.find(this.accessPolicies, function (r) {
      return r.id === row.id;
    });
    this.allpolicy = policy;
    this.getMappedAP(policy, () => {
      this.viewpolicy = true;
    })
  }

  getMappedAP(policy, cb?) {
    this.busy = true;
    this.accessPolicyService.getMappedETForAcessPolicy(policy.id).subscribe(res => {
      this.busy = false;
      this.mappedAccessPolicy = res;
      if (cb) {
        cb();
      }
    }, err => {
      this.busy = false;
    });
  }

  confirmDelete(policy) {
    this.confirmationService.confirm({
      header: 'Delete ' + policy.name,
      key: 'confirmRemoveAP',
      message: 'Are you sure that you want to delete?',
      accept: () => {
        this.busy = true;
        this.accessPolicyService.removeAccessPolicy(policy.id).subscribe(res => {
          this.busy = false;
          if (res === 'OK') {
            this.growlService.showGrowl({
              severity: 'info',
              summary: 'Success', detail: 'Access Policy Deleted Successfully'
            });
            this.refresh();
          } else if (res === 'Mapping Exists') {
            this.growlService.showGrowl({
              severity: 'error',
              summary: 'Error', detail: 'Mapping Exists Cannot Be Deleted'
            });
          }
        }, err => {
          this.busy = false;
        });
      }
    });
  }

  filterAP() {
    let subscription;
    if (this.selectedType === 'None') {
      this.getAllPermissions();
    } else {
      if (this.searchUserOrGroup.login) {
        if (this.selectedGroup) {
          this.busy = true;
          this.accessPolicyService.getAccessPoliciesByGrantee(this.selectedGroup, this.selectedAccessType, this.selectedAccessLevel).subscribe(data => {
            this.busy = false;
            this.assignAccesspolicyByGrantee(data)
          }, err => {
            this.busy = false;
          });
        } else {
          this.busy = true;
          this.accessPolicyService.getAccessPoliciesByGrantee(this.searchUserOrGroup.login, this.selectedAccessType, this.selectedAccessLevel).subscribe(data => {
            this.busy = false;
            this.assignAccesspolicyByGrantee(data)
          }, err => {
            this.busy = false;
          });
        }
      } else {
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Invalid Search', detail: 'Please select a valid user/group'
        });
      }
    }
  }

  assignAccesspolicyByGrantee(data) {
    data.map(d => {
      d.modifiedDate2 = this.coreService.getTimestampFromDate(d.modifiedDate, null, '/');
    });
    this.accessPolicies = data;
    this.accessPoliciesTemp = data;
    this.colHeaders = [
      { field: 'id', header: 'Id' },
      { field: 'name', header: 'Name' },
      { field: 'orgCode', header: 'Org Code' },
      { field: 'orgName', header: 'Organization' },
      { field: 'createdBy', header: 'Created By' },
      { field: 'createdDate', header: 'Created Date' },
      { field: 'modifiedBy', header: 'Modified By' },
      { field: 'modifiedDate', header: 'Modified Date', sortField: 'modifiedDate2' },
    ];
    this.selectedAp = [];
  }

  ngOnDestroy() {
    //this.clearSubscriptions();
    this.viewpolicy = false;
    this.isUserSelected = false;
    this.accessPolicies = [];
    this.selectedAp = [];
    this.selectedPolicy = {};
    this.colHeaders = [];
    this.newPermissions = [];
    this.searchUserOrGroup = undefined;
    this.accessLevelsMap = undefined;
    this.accessLevels = undefined;
    this.accessType = undefined;
  }
}
