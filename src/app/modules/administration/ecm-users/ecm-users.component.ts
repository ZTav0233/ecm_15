import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user/user.model';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { CoreService } from '../../../services/core.service';
import { SelectItem } from 'primeng/api';
import { GrowlService } from '../../../services/growl.service';
import { saveAs } from 'file-saver';
import * as _ from "lodash";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-ecm-users',
  templateUrl: './ecm-users.component.html',
  styleUrls: ['./ecm-users.component.css']
})
export class EcmUsersComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dataTable!: Table;
  ecmUserList: User[];
  colHeaders: any[];
  itemsPerPage: any = 15;
  esignSelect: SelectItem[];
  adminSelect: SelectItem[];
  initialSelect: SelectItem[];
  status: SelectItem[];
  private subscriptions: any[] = [];
  userModel = new User();
  viewuser = false;
  public allusers: any;
  busy: boolean;
  showUserInfo = false;

  constructor(
    private us: UserService,
    private coreService: CoreService,
    private breadcrumbService: BreadcrumbService,
    private growlService: GrowlService) {
  }

  trackByFn(index, item) {
    return item.id; // or item.id
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  refresh() {
    this.busy = true;
    this.us.getECMUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.esignSelect = [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }];
    this.initialSelect = [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }];
    this.adminSelect = [{ label: 'No', value: 'N' }, { label: 'Yes', value: 'Y' }];
    this.status = [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }];
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM-Users' }
    ]);
    this.busy = true;
    this.us.getECMUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
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
    data.map(d => {
      if (d.iseSignAllowed) {
        d.esignAllowed = 'Yes';
      }
      else {
        d.esignAllowed = 'No';
      }
      if (d.isInitialAllowed) {
        d.initialAllowed = 'Yes';
      }
      else {
        d.initialAllowed = 'No';
      }
    });
    this.ecmUserList = data;

    this.colHeaders = [
      { field: 'id', header: 'Id' },
      { field: 'userName', header: 'User Name' },
      { field: 'fulName', header: 'Full Name' },
      { field: 'title', header: 'Title' },
      { field: 'KocId', header: 'Koc Id' },
      { field: 'orgCode', header: 'Org Code' },
      { field: 'mail', header: 'Mail' },
      { field: 'status', header: 'Status' },
    ];
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
  reset() {
    this.dataTable.reset()
  }
  editUser(row, i) {
    let dat = _.find(this.ecmUserList, function (r) {
      return r.id === row.id;
    });
    this.userModel = _.cloneDeep(dat);
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  saveUser() {
    delete this.userModel.initialAllowed;
    delete this.userModel.roles;
    delete this.userModel.esignAllowed;
    this.us.saveUser(this.userModel).subscribe(data => this.successSave(), err => this.failureSave());
  }

  successSave() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Saved Successfully'
    });
    this.userModel = new User();
    this.busy = true;
    this.us.getECMUsers().subscribe(data => {
      this.busy = false;
      this.assignUsers(data)
    }, err => {
      this.busy = false;
    });
  }

  failureSave() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Save Failed'
    });
  }

  exportToExcel() {
    this.busy = true;
    this.us.exportUsers().subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'ECM_Users ' + this.coreService.getDateTimeForExport() + '.xlsx';
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  viewUsers(row) {
    let data = _.find(this.ecmUserList, function (r) {
      return r.id === row.id;
    });
    this.allusers = data;
    this.viewuser = true;
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.esignSelect = [];
    this.initialSelect = [];
    this.ecmUserList = [];
    this.viewuser = false;
  }
}
