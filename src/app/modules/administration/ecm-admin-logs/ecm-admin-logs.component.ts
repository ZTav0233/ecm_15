import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { AdminService } from '../../../services/admin.service';
import { CoreService } from '../../../services/core.service';
import { UserService } from "../../../services/user.service";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-ecm-admin-logs',
  templateUrl: './ecm-admin-logs.component.html',
  styleUrls: ['./ecm-admin-logs.component.css']
})
export class EcmAdminLogsComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
  public adminLogs: any = [];
  public itemsPerPage: any = 15;
  public colHeaders: any[] = [];
  details: any;
  openDetails = false;
  viewLogs = false;
  public allLogs: any;
  private subscriptions: any[] = [];
  busy: boolean;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private coreService: CoreService,
    private adminService: AdminService,
    private us: UserService) {
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM Admin Logs' }
    ]);
    this.busy = true;
    this.adminService.getAdminLogs().subscribe(data => {
      this.busy = false;
      this.assignLogs(data)
    }, err => {
      this.busy = false
    });
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  viewErrors(data) {
    this.allLogs = data;
    this.viewLogs = true;
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

  assignLogs(data) {
    data.map((d) => {
      //d.timeStamp2 = this.coreService.convertToTimeErrorLogs(d.timeStamp);
      d.timeStamp2 = this.coreService.getTimestampFromDate(d.timeStamp, this.coreService.dateTimeFormats.DDMMYYYYHHmmss_SSS, '/');
    }
    );
    this.adminLogs = data;
    this.colHeaders = [
      { field: 'id', header: 'Id', hidden: false }, { field: 'type', header: 'Type', hidden: false },
      { field: 'username', header: 'Actioned By', hidden: false }, { field: 'timeStamp', header: 'Log Date', hidden: false, sortField: 'timeStamp2' },
      { field: 'details', header: 'Details', hidden: false }
    ];
  }

  openInfoError(data) {
    this.adminService.getLogDetails(data.id).subscribe(data => this.assignDetails(data));
  }
  reset() {
    this.dataTable.reset()
  }
  assignDetails(data) {
    this.details = data;
    this.openDetails = true;
  }

  refresh() {
    this.adminService.getAdminLogs().subscribe(data => this.assignLogs(data));
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      delete d.timeStamp2;
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.adminLogs, 'ErrorLogs ' + this.coreService.getDateTimeForExport() + '.xlsx', array)
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.openDetails = false;
    this.viewLogs = false;
  }
}
