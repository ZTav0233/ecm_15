import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { AdminService } from '../../../services/admin.service';
import { CoreService } from '../../../services/core.service';
import { UserService } from "../../../services/user.service";
import * as global from "../../../global.variables";
import * as _ from "lodash";
import * as moment from 'moment';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-errorlog-management',
  templateUrl: './errorlog-management.component.html',
  styleUrls: ['./errorlog-management.component.css']
})
export class ErrorlogManagementComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
  public errorLogs: any = [];
  public itemsPerPage: any = 15;
  public colHeaders: any[] = [];
  details: any;
  openDetails = false;
  viewerror = false;
  public allerrors: any;
  private subscriptions: any[] = [];
  toDate: any = undefined;
  fromDate: any = undefined;
  maxFromDate: Date;
  minTo: Date;
  today: Date;
  public toTimes: any;
  public fromTimes: any;
  public fromTime;
  public toTime;
  public busy: boolean;
  constructor(private breadcrumbService: BreadcrumbService, private coreService: CoreService, private adminService: AdminService, private us: UserService) {
    this.colHeaders = [
      { field: 'id', header: 'Id', hidden: false }, { field: 'type', header: 'Error Type', hidden: false },
      { field: 'summary', header: 'Summary', hidden: false }, { field: 'timeStamp', header: 'Log Date', hidden: false, sortField: 'timeStamp2' },
      //{field: 'context', header: 'Context', hidden: false}, {field: 'servername', header: 'Server Name', hidden: false},
      //{field: 'appname', header: 'App Name', hidden: false},
    ];
    this.toTimes = global.times;
    this.fromTimes = _.cloneDeep(global.times);
    this.fromTime = { id: 30, time: '07:00 AM' };
    this.toTime = { id: 30, time: '07:00 AM' };
  }
   onClick(disabled: boolean) {
    if (disabled) {
      event.stopPropagation();
    }
  }
   clearFromDate() {
    this.fromDate = undefined;
    this.maxFromDate= new Date("December 31, 2031");
  }
   clearToDate(){
    this.toDate=undefined;
    //this.fromDate=undefined;
    this.maxFromDate= new Date("December 31, 2031");
    this.enableToTime();

  }
  enableFromTime() {
    for (var i = 0; i < this.fromTimes.length; i++) {
      this.fromTimes[i].disabled = false;
    }
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  trackByFn(index, item) {
    return item.field; // or item.id
  }
   changeFrom(event) {
    if(this.fromDate && this.fromDate<this.today){
       this.minTo = this.today;
    }
    else{
      this.minTo = new Date(event);
    }
   if (moment().format("MM-DD-YYYY") == moment(this.fromDate).format("MM-DD-YYYY")) {
      this.enableFromTime();
      for (var i = 0; i < this.fromTimes.length; i++) {
        var hour = this.fromTimes[i].label.substring(0, 2);
        var minute = this.fromTimes[i].label.substring(3, 5);
        var formate = this.fromTimes[i].label.substring(6, 8);
        if (moment().format("hh") == hour) {
          if (moment().format("mm") < minute) {
            if (moment().format("A") == formate) {
              this.fromTime = this.fromTimes[i].value;
              break;
            } else {
              //this.fromTimes[i].disabled = true;
            }
          } else {
            if (parseInt(moment().format("mm")) > 45) {
              if (moment().format("A") == formate) {
                // this.fromTimes[i].disabled = true;
                // this.fromTimes[i + 1].disabled = true;
                // this.fromTimes[i + 2].disabled = true;
                // this.fromTimes[i + 3].disabled = true;
                this.fromTime = this.fromTimes[i + 4].value;
                break;
              } else {
                //this.fromTimes[i].disabled = true;
              }
            } else {
              //this.fromTimes[i].disabled = true;
            }
          }
        } else {
          //this.fromTimes[i].disabled = true;
        }
      }
    }

    if (moment(this.toDate).format("MM-DD-YYYY") == moment(this.fromDate).format("MM-DD-YYYY")) {
      if (moment().format("MM-DD-YYYY") != moment(this.fromDate).format("MM-DD-YYYY")) {
        this.enableFromTime();
      }
      var isMatched = false;
      var count = 0;
      for (var i = 0; i < this.fromTimes.length; i++) {
        if (isMatched) {
          if (count == 4) {
            count++;
          } else {
           // this.fromTimes[i].disabled = true;
          }
        } else {
          var hour = this.fromTimes[i].label.substring(0, 2);
          var minute = this.fromTimes[i].label.substring(3, 5);
          var formate = this.fromTimes[i].label.substring(6, 8);
          if (this.fromTime.time.substring(0, 2) == hour) {
            if (this.fromTime.time.substring(3, 5) <= minute) {
              if (this.toTime.time.substring(6, 8) == formate) {
                this.fromTime = this.fromTimes[i].value;
                isMatched = true;
              }
            } else {
              if (this.toTime.time.substring(3, 5) > 45) {
                if (this.toTime.time.substring(6, 8) == formate) {
                  count++;
                  if (count == 4) {
                    this.fromTime = this.fromTimes[i + 1].value;
                    isMatched = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (moment().format("MM-DD-YYYY") != moment(this.fromDate).format("MM-DD-YYYY")
      && moment(this.toDate).format("MM-DD-YYYY") != moment(this.fromDate).format("MM-DD-YYYY")) {
      this.enableFromTime();
    }
    this.enableToTime();
  }
  changeTo(event?) {
     this.maxFromDate = new Date(event);
    // this.fromDate = undefined;
    //let fromdate=this.coreService.getFormattedDateString(this.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, '/')+ " " + this.fromTime.time;
     //fromdate=new Date(fromdate);
     let hourfrom=this.fromTime.time.substring(0,2);
     let minfrom=this.fromTime.time.substring(3,5);
     let Afrom=this.fromTime.time.substring(6,8);
    if (moment().format("MM-DD-YYYY") == moment(this.toDate).format("MM-DD-YYYY")) {
      for (var i = 0; i < this.toTimes.length; i++) {
        var hour = this.toTimes[i].label.substring(0, 2);
        var minute = this.toTimes[i].label.substring(3, 5);
        var formate = this.toTimes[i].label.substring(6, 8);
        if (hourfrom == hour) {
          if (minfrom < minute) {
            if (Afrom == formate) {
              this.toTime = this.toTimes[i].value;
              break;
            } else {
              //this.toTimes[i].disabled = true;
            }
          } else {
            if (parseInt(minute) > 45) {
              if (Afrom == formate) {
                this.toTime = this.toTimes[i + 4].value;
                //  this.toTimes[i].disabled = true;
                // this.toTimes[i + 1].disabled = true;
                // this.toTimes[i + 2].disabled = true;
                // this.toTimes[i + 3].disabled = true;
                 break;
              } else {
                //this.toTimes[i].disabled = true;
              }
            } else {
             // this.toTimes[i].disabled = true;  //imp
            }
          }
        } else {
        // this.toTimes[i].disabled = true;  //imp
        }
      }
    } else {
      for (var i = 0; i < this.toTimes.length; i++) {
        this.toTimes[i].disabled = false;
      }
    }
  }

  ngOnInit() {
    this.maxFromDate = new Date("December 31, 2031");
    this.today = new Date();
    this.busy = true;
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
      this.busy = false;
    });
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM Error Logs' }
    ]);
      this.busy = true;
       this.adminService.getLogs().subscribe(data => {
        this.busy = false;
        this.assignLogs(data)
      }, err => {
        this.busy = false;
      });
  }
  viewErrors(data) {
    this.allerrors = data;
    this.viewerror = true;
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
      //  d.timeStamp2 = this.coreService.convertToTimeErrorLogs(d.timeStamp);
      d.timeStamp2 = this.coreService.getTimestampFromDate(d.timeStamp, this.coreService.dateTimeFormats.DDMMYYYYHHmmss_SSS, '/');
    }
    );
    this.errorLogs = data;
  }
  openInfoError(data) {
    this.adminService.getLogDetails(data.id).subscribe(data => this.assignDetails(data));

  }
  assignDetails(data) {
    this.details = data;
    this.openDetails = true;
  }
  refresh() {
    this.busy = true;
    this.adminService.getLogs().subscribe(data => {
      this.busy = false;
      this.assignLogs(data)
    }, err => {
      this.busy = false;
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

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.errorLogs, 'ErrorLogs '+this.coreService.getDateTimeForExport()+'.xlsx', array)
  }
  clearFilterText(){
    this.fromDate=undefined;
    this.toDate=undefined;
    this.maxFromDate = new Date("December 31, 2031");
    this.fromTime = { id: 30, time: '07:00 AM' };
    this.toTime = { id: 30, time: '07:00 AM' };
    this.refresh();
  }
  updateSearchInDatatable(){
    let fromdate=this.coreService.getFormattedDateString(this.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, '/')+ " " + this.fromTime.time;
    let todate=this.coreService.getFormattedDateString(this.toDate, this.coreService.dateTimeFormats.DDMMYYYY, '/') + " " + this.toTime.time;
    this.busy = true;
    this.adminService.getLogsForFilter(fromdate,todate).subscribe(data=>{
      data.map((d) => {
      d.timeStamp2 = this.coreService.getTimestampFromDate(d.timeStamp, this.coreService.dateTimeFormats.DDMMYYYYHHmmss_SSS, '/');
    }
    );
    this.errorLogs = data;
    this.busy = false;
    },err=>{
      this.busy = false;
    })
  }
  ngOnDestroy() {
    this.clearSubscriptions();
    this.openDetails = false;
    this.viewerror = false;
  }
   enableToTime() {
     for (var i = 0; i < this.toTimes.length; i++) {
       this.toTimes[i].disabled = false;
}    }
   }
