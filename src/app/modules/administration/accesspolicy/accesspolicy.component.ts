import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccessPolicyService } from '../../../services/access-policy.service';
import { AdminService } from '../../../services/admin.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import { ConfirmationService } from "primeng/api";
import * as _ from "lodash";
import apply = Reflect.apply;
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-accesspolicy',
  templateUrl: './accesspolicy.component.html',
  styleUrls: ['./accesspolicy.component.css']
})
export class AccesspolicyComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dataTable!: Table;
  accessPolicies: any[];
  showPermissionDialogue = false;
  selectedPolicy: any = {};
  colHeaders: any[];
  granteeTypes = [{ label: 'USER', value: 'USER' }, { label: 'GROUP', value: 'GROUP' }];
  newPermissions: any[];
  searchUserOrGroup: any;
  viewpolicy = false;
  accessLevelsMap = {
    'Full Control': 998903,
    'Author': 131575,
    'Viewer': 131217,
    'Owner': 933367
  };
  accessLevels = [{ label: 'Full Access', value: 'Full Control' },
  { label: 'Author', value: 'Author' },
  { label: 'Viewer', value: 'Viewer' }, { label: 'Owner', value: 'Owner' }];
  permissionRowStyleMap: { [key: string]: string };
  private subscriptions: any[] = [];
  public orgCodes: any[];
  public pageSize: any = 15;
  public allpolicy: any;
  private tempPermissions: any[];
  private service: (jsonstring: any) => any;
  public disableAddNewPermission = false;
  public user = new User();
  selectedType: string = 'U';
  results: string[];
  isUserSelected = false;
  selectedRow = [];
  busy: boolean;
  isButtonSaveDisabled = true;
  selectedpolicyname: any;
  selectedorgcode: any;
  constructor(private accessPolicyService: AccessPolicyService, private coreService: CoreService, private adminService: AdminService,private toastr:ToastrService,
    private growlService: GrowlService, private breadcrumbService: BreadcrumbService, private us: UserService,
    private confirmationService: ConfirmationService) {
    this.user = this.us.getCurrentUser();
  }

  refresh() {
    this.disableAddNewPermission = false;
    this.getAllPermissions();
  }

  radioButtonClick(e) {
    this.selectedType = e;
  }

  clearSelection() {
    this.searchUserOrGroup = undefined;
    this.results = [];

  }

  searchSelected(e) {
    if (e.name) {
      this.isUserSelected = true;
    }

  }

  search(e) {
    if (this.searchUserOrGroup.length > 2) {
      if (this.selectedType === 'U') {
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
    }
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.getAllPermissions();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Access Policies' }
    ]);

  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
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

  // sortModDate(event){
  //   console.log(event);
  //    const tmp = this.accessPolicies.sort((a: any, b: any): number => {
  //           if (event.field) {
  //               return a[event.field] > b[event.field] ? 1 : -1;
  //           }
  //       });
  //
  // if (event.order < 0) {
  //     tmp.reverse();
  // }
  //
  // const thisRef = this;
  // this.accessPolicies = [];
  // tmp.forEach(function (row: any) {
  //     thisRef.accessPolicies.push(row);
  // });
  //
  // }

  getAllPermissions() {
    this.busy = true;
    this.accessPolicyService.getAllAccessPolicies().subscribe(res => {
      this.busy = false;
      res.map(d => {
        d.modifiedDate2 = this.coreService.getTimestampFromDate(d.modifiedDate, null, '/');
        d.createdDate2 = this.coreService.getTimestampFromDate(d.createdDate, null, '/');
      });
      this.accessPolicies = res;
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

  getRowTrackBy = (index, item) => {
    return item.id;
  };
  reset() {
    this.dataTable.reset()
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
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Error', detail: 'Policy Name Already Exists'
        // });
        this.toastr.error('Policy Name Already Exists', 'Error');
        return;
      }
    }

    this.selectedPolicy = policy;
    this.selectedpolicyname = policy.name;
    this.selectedorgcode = policy.orgCode;
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
    policy.orgUnitId = selectedOrg.id;
  }

  accessTypeChanged(permission) {
    permission.action = 'ADD';
  }
  isSaveButtonDisabled(event) {
    this.isButtonSaveDisabled = event;
  }

  permissionChanged(permission) {
    permission.action = 'ADD';
    permission.accessMask = this.accessLevelsMap[permission.accessLevel];
  }

  savePermissions() {
    const newPermissions = [];
    delete this.selectedPolicy.modifiedDate2;
    delete this.selectedPolicy.createdDate2;
    const selectedPolicy = Object.assign({}, this.selectedPolicy);
    selectedPolicy.permissions.map((p, i) => {
      if (p.action === 'ADD') {
        const oldP = Object.assign({}, p);
        oldP.accessLevel = this.tempPermissions[p.id].accessLevel;
        oldP.id = undefined;
        oldP.accessMask = this.tempPermissions[p.id].accessMask;
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
    this.busy = true;
    this.accessPolicyService[service](selectedPolicy).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: successMsg
      // });
      this.toastr.info(successMsg, 'Success');
      this.showPermissionDialogue = false;
      this.disableAddNewPermission = false;
      this.getAllPermissions();
    }, err => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Error', detail: errorMsg
      // });
      this.toastr.error(errorMsg, 'Error');
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
    this.selectedRow = [];
    if (this.accessPolicies && this.accessPolicies.length >= this.pageSize) {
      this.accessPolicies.map((ap, i) => {
        if (ap.isNew) {
          this.accessPolicies.splice(i - 1, 0, ap);
          this.accessPolicies.splice(i + 1, 1);
        }
      });
      this.accessPolicies.splice(this.pageSize - 1, 0, { isNew: true, id: null, objectId: null, type: 'DEFAULT' });
    } else {
      this.accessPolicies.push({ isNew: true, id: null, objectId: null, type: 'DEFAULT' })
    }
    this.disableAddNewPermission = true;
    this.accessPolicies = [...this.accessPolicies];
    this.selectedRow = this.accessPolicies[this.accessPolicies.length - 1]
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
    this.viewpolicy = true;
    this.allpolicy = policy;
  }

  confirmDelete(policy) {
    this.confirmationService.confirm({
      header: 'Delete ' + policy.name,
      message: 'Are you sure that you want to delete?',
      key: 'deleteAP',
      accept: () => {
        this.accessPolicyService.removeAccessPolicy(policy.id).subscribe(res => {
          if (res === 'OK') {
            // this.growlService.showGrowl({
            //   severity: 'info',
            //   summary: 'Success', detail: 'Access Policy Deleted Successfully'
            // });
            this.toastr.info('Access Policy Deleted Successfully', 'Success');
            this.refresh();
          } else if (res === 'Mapping Exists') {
            // this.growlService.showGrowl({
            //   severity: 'error',
            //   summary: 'Error', detail: 'Mapping Exists Cannot Be Deleted'
            // });
            this.toastr.error('Mapping Exists Cannot Be Deleted', 'Error');
          }
        });
      }
    });
  }


  ngOnDestroy() {
    this.clearSubscriptions();
    this.viewpolicy = false;
    this.isUserSelected = false;
  }
}
