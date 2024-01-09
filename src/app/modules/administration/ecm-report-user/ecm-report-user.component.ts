import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { UserService } from '../../../services/user.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { User } from '../../../models/user/user.model';
import { ConfirmationService, SelectItem } from 'primeng/api';
import * as _ from "lodash";
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ecm-report-user',
  templateUrl: './ecm-report-user.component.html',
  styleUrls: ['./ecm-report-user.component.css']
})
export class EcmReportUserComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
  ecmUserList: User[];
  colHeaders: any[];
  itemsPerPage: any = 15;
  esignSelect: SelectItem[];
  initialSelect: SelectItem[];
  private subscriptions: any[] = [];
  userModel = new User();
  criteria: SelectItem[];
  selectedcriteria: string;
  searchText: any;
  showEditUser = false;
  searchStarted: boolean;
  public SelectedUserList = [];
  public isReportAdmin;
  public isReportAdminEdit;
  public selectedUserForEdit;
  public isExcludeOperators;
  editReportUserDialog = false;
  public searchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: ''
  };
  public busy: boolean;
  constructor(private toastr:ToastrService ,private us: UserService, private confirmationService: ConfirmationService, private coreService: CoreService, private breadcrumbService: BreadcrumbService,
    private growlService: GrowlService) { }
  refresh() {
    this.busy = true;
    this.us.getReportUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
  }
  trackByFn(index, item) {
    return item.id; // or item.id
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.esignSelect = [];
    this.initialSelect = [];
    this.criteria = [];
    this.selectedcriteria = 'NAME';
    this.criteria.push({ label: 'Email', value: 'EMAIL' });
    this.criteria.push({ label: 'Name', value: 'NAME' });
    this.criteria.push({ label: 'Designation', value: 'TITLE' });
    this.criteria.push({ label: 'Phone', value: 'PHONE' });
    this.criteria.push({ label: 'Org Code', value: 'ORGCODE' });
    this.criteria.push({ label: 'Koc No', value: 'KOCNO' });
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM Report Users' }
    ]);
    this.esignSelect.push({ label: 'ACTIVE', value: 1 });
    this.esignSelect.push({ label: 'INACTIVE', value: 0 });
    this.busy = true;
    this.us.getReportUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  editReportAdmin(row, i) {
    let dat = _.find(this.ecmUserList, function (r) {
      return r.id === row.id;
    });
    this.selectedUserForEdit = dat;
    if (dat.isReportAdmin === 'Yes') {
      this.isReportAdminEdit = true;
    }
    else {
      this.isReportAdminEdit = false;
    }

  }
  saveReportAdmin() {
    this.us.saveReportUser(this.selectedUserForEdit.EmpNo, this.selectedUserForEdit.id, this.isReportAdminEdit ? 'Y' : 'N', "Y").subscribe(data => this.addUserSuccess(data, true), err => this.addUserFailed());

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
  assignUsers(data) {
    this.ecmUserList = data;
    this.colHeaders = [
      { field: 'id', header: 'Id' },
      { field: 'userName', header: 'User Name' },
      { field: 'fulName', header: 'Full Name' },
      { field: 'KocId', header: 'KOC Id' },
      { field: 'isReportAdmin', header: 'Report Admin' },
    ];
    this.ecmUserList.map(d => {
      if (d.isReportAdmin === 'Y') {
        d.isReportAdmin = 'Yes'
      }
      else {
        d.isReportAdmin = 'No'
      }
    });
  }
  clearResult() {
    this.searchStarted = false;
    //this.searchText = '';
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
  }
  searchUsers() {
    this.searchStarted = true;
    /*    const subscription = this.us.searchUsersList('USER', this.searchText, this.selectedcriteria,'').subscribe(data => {
          this.SelectedUserList = data;
        });*/
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
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Warning', detail: 'Fill Any One Field To Search'
      // });
      this.toastr.error('Fill Any One Field To Search', 'Warning');
    }
    if (formValid) {
      this.busy = true;
      this.us.searchEcmUsers(this.searchQueary).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'No Result', detail: 'No Results Found'
          // });
          this.toastr.error('No Results Found', 'No Result');
        }
        this.SelectedUserList = data;
      }, err => {
        this.busy = false;
      });
    }
  }

  addUser(e) {
    this.us.saveReportUser(e.EmpNo, 0, this.isReportAdmin ? 'Y' : 'N', "Y").subscribe(data => this.addUserSuccess(data), err => this.addUserFailed());
    this.showEditUser = false;
    this.SelectedUserList = [];
    //this.searchText='';
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
  }
  reset() {
    this.dataTable.reset()
  }

  addUserSuccess(val, isEdit?) {
    if (val === 'User Exists') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Already Exist', detail: 'User Already Exist'
      // });
      this.toastr.error('User Already Exist', 'Already Exist');
    }
    else {
      let msg = 'Add User Successful';
      if (isEdit) {
        msg = 'User information saved';
      }
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: msg
      // });
      this.toastr.info(msg, 'Success');
    }
    this.busy = true;
    this.us.getReportUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
  }

  addUserFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add User Failed'
    // });
    this.toastr.error('Add User Failed', 'Failure');
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  successSave() {
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Saved Successfully'
    // });
    this.toastr.info('Saved Successfully', 'Success');
  }

  failureSave() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Save Failed'
    // });
    this.toastr.error('Save Failed', 'Failure');
  }

  confirm(event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove?',
      key: 'removeConfirm',
      accept: () => {
        //Actual logic to perform a confirmation
        this.removeUser(event);
      }
    });
  }

  removeUser(dat) {
    this.us.saveReportUser(dat.EmpNo, dat.id, 'N', "N").subscribe(data => this.removeSuccess(), err => this.removeFailed())
  }

  removeSuccess() {
    this.us.getReportUsers().subscribe(data => this.assignUsers(data));
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Removed Successfully'
    // });
    this.toastr.info('Removed Successfully', 'Success');
  }

  removeFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Remove Failed'
    // });
    this.toastr.error('Remove Failed', 'Failure');
  }

  closeModel() {
    this.SelectedUserList = [];
    //this.searchText='';
    this.searchQueary = {
      userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
      empNo: undefined, userType: undefined, filter: ''
    };
    this.isReportAdmin = false;
  }

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.ecmUserList, 'ECM_Report_Users ' + this.coreService.getDateTimeForExport() + '.xlsx', array)
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.ecmUserList = [];
    this.SelectedUserList = [];
    this.selectedUserForEdit = undefined;
  }
}
