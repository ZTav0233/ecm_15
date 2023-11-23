import { Component, OnInit } from '@angular/core';
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import { CoreService } from "../../../services/core.service";
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { GrowlService } from "../../../services/growl.service";
import { ConfirmationService } from "primeng/api";
import { AdminUser } from "../../../models/user/adminUser";

@Component({
  selector: 'app-ecm-admin-users',
  templateUrl: './ecm-admin-users.component.html',
  styleUrls: ['./ecm-admin-users.component.css']
})
export class EcmAdminUsersComponent implements OnInit {
  ecmAdminUserList: User[];
  private subscriptions: any[] = [];
  colHeaders: any[];
  itemsPerPage: any = 15;
  selectedUser: any;
  private users: any[];
  public dynamicCriteria: any[] = [];
  public criteria: any[];
  public searchResult: any[];
  public searchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: ''
  };
  public user = new User();
  public justificationDialog = false;
  public adminUser = new AdminUser();
  busy: boolean;

  constructor(private us: UserService, private confirmationService: ConfirmationService, private coreService: CoreService, private breadcrumbService: BreadcrumbService, private growlService: GrowlService) {
    this.criteria = [{ label: 'Name', value: 'userName' }, { label: 'Email', value: 'mail' }, { label: 'Designation', value: 'title' },
    { label: 'Phone', value: 'phone' }, { label: 'Org Code', value: 'orgCode' }, { label: 'KOC No', value: 'empNo' }];
    this.addNewCriterion();
    this.user = us.getCurrentUser();
    this.colHeaders = [
      { field: 'id', header: 'Id' },
      { field: 'userName', header: 'User Name' },
      { field: 'fulName', header: 'Full Name' },
      { field: 'KocId', header: 'KOC Id' },
      { field: 'orgCode', header: 'Org Code' },
      { field: 'createdBy', header: 'Created By' },
      { field: 'createdDate', sortField: 'createdDate2', header: 'Created Date' },
      { field: 'justification', header: 'Justification' },
      { field: 'mail', header: 'Mail' }
    ];
  }

  trackByFn(index, item) {
    return item.field; // or item.id
  }

  refresh() {
    this.busy = true;
    this.us.getAdminUsers().subscribe(data => {
      this.busy = false;
      this.assignAdminUsers(data);
    }, err => {
      this.busy = false;
    });
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.busy = true;
    this.us.getAdminUsers().subscribe(data => {
      this.busy = false;
      this.assignAdminUsers(data);
    }, err => {
      this.busy = false;
    });
    this.searchResult = [];
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM Administrators' }
    ]);
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.itemsPerPage = parseInt(d.val, 10);
          } else {
            this.itemsPerPage = 15;
          }
        }
      });
    }
  }

  assignAdminUsers(data) {
    data.map((d) => {
      d.createdDate2 = this.coreService.getTimestampFromDate(d.createdDate, null, '/');
    });
    this.ecmAdminUserList = data;
  }

  enableAdmin(data) {
    let exist = false;
    if (this.ecmAdminUserList && this.ecmAdminUserList.length > 0) {
      this.ecmAdminUserList.map(d => {
        if (data.EmpNo === d.EmpNo) {
          exist = true;
        }
      });
    }
    if (exist) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Added', detail: 'Administrator is already added'
      });
    }
    else {
      this.adminUser.empNo = data.EmpNo;
      this.adminUser.id = 0;
      this.adminUser.createdBy = this.user.fulName;
      this.justificationDialog = true;
      //this.us.saveAdminUser(data.EmpNo, 0, this.user.fulName).subscribe(data => this.successSave(), err => this.failureSave())
    }
  }

  removeAdminUser(data) {
    this.adminUser.empNo = data.EmpNo;
    this.adminUser.id = data.id;
    this.adminUser.createdBy = data.createdBy;
    this.adminUser.justification = data.justification;
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove (' + data.fulName + ') from ECM Administrator ?',
      key: 'removeEcmAdmin',
      accept: () => {
        //Actual logic to perform a confirmation
        this.us.saveAdminUser(this.adminUser).subscribe(data => this.successRemove(), err => this.failureRemove())
      }
    });
  }

  successRemove() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Removed Successfully'
    });
    this.busy = true;
    this.us.getAdminUsers().subscribe(data => {
      this.busy = false;
      this.assignAdminUsers(data);
    }, err => {
      this.busy = false;
    });
  }

  failureRemove() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Remove Failed'
    });
  }

  successSave() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Added Successfully'
    });
    this.adminUser = new AdminUser();
    this.justificationDialog = false;
    this.busy = true;
    this.us.getAdminUsers().subscribe(data => {
      this.busy = false;
      this.assignAdminUsers(data);
    }, err => {
      this.busy = false;
    });
  }

  failureSave() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Add Failed'
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  getUsersForAdmin() {
    /*    const searchQueary = {
          'userName': undefined, 'title': undefined, 'mail': undefined,
          'empNo': undefined, 'orgCode': undefined, 'phone': undefined,
          'userType': 'USER', 'filter': undefined
        };
        let formValid = true;
        this.dynamicCriteria.map((criteria, index) => {
          if (criteria.searchText !== undefined && criteria.searchText !== '' && criteria.searchText !== null) {
            searchQueary[criteria.selectedOption] = criteria.searchText;
          } else {
            formValid = false;
            this.growlService.showGrowl({
              severity: 'error',
              summary: 'Warning', detail: 'Fill All Fields'
            });
          }
        });
        if (formValid) {
          const subscription = this.us.searchEcmUsers(searchQueary).subscribe(data => {
            if (data.length === 0) {
              this.growlService.showGrowl({
                severity: 'error',
                summary: 'Failure', detail: 'No Results Found'
              });
            }
            // this.recipientsData.search.result = data;
            this.searchResult = data;

          });
          this.coreService.progress = {busy: subscription, message: '', backdrop: true};
          this.addToSubscriptions(subscription)
        }*/
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
      this.us.searchEcmUsers(this.searchQueary).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'No Result', detail: 'No Results Found'
          });
        }
        this.searchResult = data;
      }, err => {
        this.busy = false;
      });
    }
  }

  addNewCriterion() {
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
    this.dynamicCriteria.push({ options: criterionArr, selectedOption: criterionArr[0].value, searchText: undefined });
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
  }

  clearResult() {
    this.searchResult = [];
  }

  canceleJustificationDialog() {
    this.justificationDialog = false;
  }

  addAdminUser() {
    this.us.saveAdminUser(this.adminUser).subscribe(data => this.successSave(), err => this.failureSave())
  }

  exportToExcel() {
    const array = [];
    this.colHeaders.map(d => {
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.ecmAdminUserList, 'ECM_Admin_Users '+this.coreService.getDateTimeForExport()+'.xlsx', array)
  }
}
