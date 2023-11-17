import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem, SelectItem } from 'primeng/api';
import { saveAs } from 'file-saver';
//services
import { WorkflowService } from '../../../services/workflow.service';
import * as $ from 'jquery';
import { CoreService } from "../../../services/core.service";
import * as _ from 'lodash';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public activePage: any;
  @Output() filterData = new EventEmitter();
  @Output() clearFilter = new EventEmitter();
  public statusOptions: SelectItem[] = [
    { label: 'Select', value: null },
    { label: 'Not Actioned', value: 'notactioned' },
    { label: 'New', value: 'New' },
    { label: 'Read', value: 'Read' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Actioned', value: 'actioned' }
  ];
  public type: SelectItem[] = [
    { label: 'Select', value: null },
    { label: 'To', value: 'TO' },
    { label: 'CC', value: 'CC' }
  ];
  public priority: SelectItem[] = [
    { label: 'Select', value: null },
    { label: 'Normal', value: 2 },
    { label: 'High', value: 3 }
  ];
  @Input() public filterSenderoptions: any;
  public senderName: string[] = [];
  @Input() public filterQuery: any = {};
  @Input() public filteredData: any;
  @Input() public filterCount :any
  @Input() public searchFromDashboard: any;
  @Input() public id: any;
  selectedReceivedDate: Date[];
  selectedDeadline: Date[];
  maxDate: Date;
  public disableReceivedDate = false;
  public disableDuedate = false;
  private subscriptions: Subscription[] = [];
  private pageUrl: any;
  public currentPage: any;
  public filterNewToday = false;
  @ViewChild('filterForm') filterForm;
  public exportBtnItems: MenuItem[] = [
    {
      'label': 'PDF', command: event => {
        this.exportToPdf();
      }
    },
    {
      'label': 'Excel', command: event => {
        this.exportToExcel();
      }
    }
  ];
  @Input() public forOptions: any;
  @Input() public disableFilter = false;
  busy: boolean;
  constructor(private workflowService: WorkflowService, private router: Router, private coreService: CoreService) {
    this.pageUrl = router.url;
    this.currentPage = (this.pageUrl.slice(this.pageUrl.indexOf('workflow/') + 9)).split('/');
  }

  ngOnChanges() {
    if (this.id === this.filterQuery.userId && (this.currentPage[0] === 'inbox' || this.currentPage[0] === 'sent'
      || (this.currentPage[0] === 'archive' && (this.activePage === 'inbox' && this.filterQuery.repStatus === 'finish')
        || (this.activePage === 'sent' && this.filterQuery.repStatus === 'archive')))) {
      //"13/5/2019;15/5/2019"
      if (this.filterQuery.deadline) {
        this.setDateFromQuery(_.cloneDeep(this.filterQuery.deadline), 'deadline');
      }
      if (this.filterQuery.receivedDate) {
        this.setDateFromQuery(_.cloneDeep(this.filterQuery.receivedDate), 'receivedDate');
      }
      //"ROLE:3@USER:1007"
      if (this.filterQuery.recipientName && this.activePage === 'sent') {
        this.setSenderFromQuery(_.cloneDeep(this.filterQuery.recipientName), 'recipientName');
      } else if (this.filterQuery.senderName && this.activePage === 'inbox') {
        this.setSenderFromQuery(_.cloneDeep(this.filterQuery.senderName), 'senderName');
      }
      if (this.filterQuery.status === 'newToday') {
        this.filterNewToday = true;
        this.disableReceivedDate = true;
        this.disableDuedate = false;
      } else if (this.filterQuery.status === 'overdue') {
        this.disableDuedate = true;
        this.filterNewToday = false;
        this.disableReceivedDate = false;
      }
    }
  }

  ngOnInit() {
    /*if (this.activePage === 'sent') {
      this.type.push({label: 'Reply-To', value: 'Reply-TO'});
      this.type.push({label: 'Reply-CC', value: 'Reply-CC'});
    }*/
    this.maxDate = new Date();
    if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
      this.statusOptions.push({ label: 'New Today', value: 'newToday' });
      // remove actioned option from statusOptions in case of inbox only
      this.statusOptions.splice(_.findIndex(this.statusOptions, ['value', 'actioned']), 1);
    }
    if (this.searchFromDashboard) {
      this.filterFromDashBoard(this.searchFromDashboard);
    }
  }

  isFormValid() {
    let fields = this.filterForm.controls,
      fieldNames = Object.keys(fields),
      value, isValid = true;
    for (let i = 0; i < fieldNames.length; i++) {
      value = fields[fieldNames[i]].value;
      if (typeof value === 'undefined' || value === null || value === '' || (Array.isArray(value) && !value.length)) {
        isValid = false;
      } else {
        isValid = true;
        break;
      }
    }
    return isValid;
  }

  filter() {
    this.setReceivedDate();
    this.setDueDate();
    if (this.filterQuery.status === 'Forward') {
      this.filterQuery.actionId = 1;
    } else {
      this.filterQuery.actionId = 0;
    }
    this.filterQuery.exportFilter = true;
    this.filterQuery.pageNo = 1;
    this.filterData.emit();
  }

  filterFromDashBoard(searchQueryFromDashboard) {
    if (searchQueryFromDashboard.filterStatus === 'Read') {
      this.filterQuery.status = 'Read';
    } else if (searchQueryFromDashboard.filterStatus === 'Unread') {
      this.filterQuery.status = 'New';
    } else if (searchQueryFromDashboard.filterStatus === 'Pending') {
      this.filterQuery.sysStatus = 'Read';
    } else if (searchQueryFromDashboard.filterStatus === 'New') {
      this.filterQuery.sysStatus = 'New';
    }
    if (searchQueryFromDashboard.filterReceivedDay === 'Today') {
      //this.filterQuery.receivedDate = this.maxDate.getDate() + '/' + (this.maxDate.getMonth() + 1) + '/' + this.maxDate.getFullYear();
      this.selectedReceivedDate = [];
      this.selectedReceivedDate[0] = new Date();
    } else if (searchQueryFromDashboard.filterReceivedDay === 'Total') {
      this.filterQuery.receivedDate = undefined;
    } else if (searchQueryFromDashboard.filterReceivedDay === 'deadline') {
      this.filterQuery.status = 'overdue';
    }
    if (searchQueryFromDashboard.filterWIType) {
      this.filterQuery.type = searchQueryFromDashboard.filterWIType;
    }
    if (this.id === searchQueryFromDashboard.filterUserId) {
      this.filter();
    }
  }

  setReceivedDate() {
    if (!this.selectedReceivedDate) {
      this.filterQuery.receivedDate = undefined;
      return;
    }
    if (this.selectedReceivedDate[0]) {
      const fromDate = new Date(this.selectedReceivedDate[0]);
      this.filterQuery.receivedDate = fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear();
    }
    if (this.selectedReceivedDate[1]) {
      const date = new Date(this.selectedReceivedDate[1]);
      this.filterQuery.receivedDate = this.filterQuery.receivedDate + ';' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

    }

  }

  setDueDate() {
    if (!this.selectedDeadline) {
      this.filterQuery.deadline = undefined;
      return;
    }
    if (this.selectedDeadline[0]) {
      const fromDate = new Date(this.selectedDeadline[0]);
      this.filterQuery.deadline = fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear();
    }
    if (this.selectedDeadline[1]) {
      const date = new Date(this.selectedDeadline[1]);
      this.filterQuery.deadline = this.filterQuery.deadline + ';' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }
  }

  /**
   * @description set Received and Sent date from filter query to model
   * @param dateValue
   * @param field
   */
  setDateFromQuery(dateValue, field) {
    if (this.filterQuery[field].indexOf(';') != -1) {
      let date = [];
      date[0] = new Date(this.coreService.getTimestampFromDate(dateValue.split(';')[0], this.coreService.dateTimeFormats.DDMMYYYY, '/'));
      date[1] = new Date(this.coreService.getTimestampFromDate(dateValue.split(';')[1], this.coreService.dateTimeFormats.DDMMYYYY, '/'));
      field === 'deadline' ? this.selectedDeadline = date : this.selectedReceivedDate = date;
    } else {
      if (field === 'deadline') {
        this.selectedDeadline = [];
        this.selectedDeadline[0] = new Date(this.coreService.getTimestampFromDate(dateValue, this.coreService.dateTimeFormats.DDMMYYYY, '/'));
        this.selectedDeadline[1] = null;
      } else {
        this.selectedReceivedDate = [];
        this.selectedReceivedDate[0] = new Date(this.coreService.getTimestampFromDate(dateValue, this.coreService.dateTimeFormats.DDMMYYYY, '/'));
        this.selectedReceivedDate[1] = null;
      }
    }
  }

  /**
   * @description set Recipient and Sender from filter query to model
   * @param selectedUsersCopy
   * @param fieldName
   */
  setSenderFromQuery(selectedUsersCopy, fieldName) {
    this.senderName = [];
    let usersRoles;
    let users = [], roles = [];
    if (selectedUsersCopy.indexOf('@') != -1) {
      usersRoles = selectedUsersCopy.split('@');
      for (let i = 0; i < usersRoles.length; i++) {
        let userRole = usersRoles[i].split(':');
        if (userRole[0] === 'USER') {
          if (userRole[1].indexOf(';') != -1) {
            let user = userRole[1].split(';');
            user.map(u => {
              users.push(u);
            });
          } else {
            users.push(userRole[1]);
          }
        } else if (userRole[0] === 'ROLE') {
          if (userRole[1].indexOf(';') != -1) {
            let role = userRole[1].split(';');
            role.map(u => {
              roles.push(u);
            });
          } else {
            roles.push(userRole[1]);
          }
        }
      }
    } else {
      usersRoles = selectedUsersCopy.split(':');
      if (usersRoles[0] === 'USER') {
        if (usersRoles[1].indexOf(';') != -1) {
          let user = usersRoles[1].split(';');
          user.map(u => {
            users.push(u);
          });
        } else {
          users.push(usersRoles[1]);
        }
      } else if (usersRoles[0] === 'ROLE') {
        if (usersRoles[1].indexOf(';') != -1) {
          let role = usersRoles[1].split(';');
          role.map(u => {
            roles.push(u);
          });
        } else {
          roles.push(usersRoles[1]);
        }
      }
    }
    users.map(u => {
      this.senderName.push('USER:' + u);
    });
    roles.map(u => {
      this.senderName.push('ROLE:' + u);
    });
    //[ "USER:1007", "USER:1001", "USER:1002", "ROLE:1", "ROLE:10000" ]
  }

  clearFilterResults() {
    this.resetFilter();
    //this.clearFilter.emit({'bool': true, 'id': this.filterQuery.userId});
  }

  resetFilter() {
    const temp = {
      userType: this.filterQuery.userType,
      userId: this.filterQuery.userId,
      recipientName: this.activePage === 'inbox' ? this.filterQuery.recipientName : undefined,
      empNo: this.filterQuery.empNo,
      pageNo: 1
    };
    Object.keys(this.filterQuery).map(k => {
      this.filterQuery[k] = undefined;
    });
    this.filterQuery = Object.assign(this.filterQuery,
      temp);
    this.resetReceivedDatePicker();
    this.resetDueDatePicker();
    this.senderName = [];
    this.disableReceivedDate = false;
    this.disableDuedate = false;
  }

  senderChange(event) {
    if (event.value.length) {
      let roles = 'ROLE:';
      let users = 'USER:';
      let roleCount = 0;
      let userCount = 0;
      for (const role of event.value) {
        const r = role.split(':');
        if (r[0] === 'ROLE') {
          roleCount++;
          roles = roles + r[1] + ';';
        }
      }
      for (const user of event.value) {
        const u = user.split(':');
        if (u[0] === 'USER') {
          userCount++;
          users = users + u[1] + ';';
        }
      }
      roles = roles.slice(0, -1);
      users = users.slice(0, -1);
      if (roleCount > 0 && userCount > 0) {
        if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
          this.filterQuery.senderName = roles + '@' + users;
        } else if (this.activePage === 'sent') {
          this.filterQuery.recipientName = roles + '@' + users;
        }

      } else if (roleCount > 0) {
        if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
          this.filterQuery.senderName = roles;
        } else if (this.activePage === 'sent') {
          this.filterQuery.recipientName = roles;
        }
      } else if (userCount > 0) {
        if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
          this.filterQuery.senderName = users;
        } else if (this.activePage === 'sent') {
          this.filterQuery.recipientName = users;
        }
      }
    } else {
      if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
        this.filterQuery.senderName = undefined;
      } else if (this.activePage === 'sent') {
        this.filterQuery.recipientName = undefined;
      }
    }
  }

  statusChange(event) {
    if (event.value === 'newToday') {
      this.filterNewToday = true;
      this.disableReceivedDate = true;
      this.resetReceivedDatePicker();
      this.disableDuedate = false;
    } else if (event.value === 'overdue') {
      this.disableDuedate = true;
      this.resetDueDatePicker();
      this.filterNewToday = false;
      this.disableReceivedDate = false;
    } else {
      this.filterNewToday = false;
      this.disableReceivedDate = false;
      this.disableDuedate = false;
    }
  }

  exportToExcel() {
    this.filterQuery.exportFormat = 'xls';
    this.filterQuery.exportFilter = true;
    if(this.filterQuery.status===null){
      this.filterQuery.status="";
    }
    if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
      let fileName;
      if (this.activePage === 'inbox' && this.currentPage[0] === 'archive') {
        fileName = 'Archived_Inbox_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      } else {
        fileName = 'Inbox_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      }
      this.busy = true;
      this.workflowService.exportInbox(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/vnd.ms-excel' });
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    } else if (this.activePage === 'sent' && this.currentPage[0] !== 'actioned') {
      let fileName;
      if (this.activePage === 'sent' && this.currentPage[0] === 'archive') {
        fileName = 'Archived_Sent_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      } else {
        fileName = 'Sent_Report' + '.xlsx';
      }
      this.busy = true;
      this.workflowService.exportSent(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/vnd.ms-excel' });
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    } else if (this.activePage === 'sent' && this.currentPage[0] === 'actioned') {
      this.busy = true;
      this.workflowService.exportActioned(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/vnd.ms-excel' });
        const fileName = 'Actioned Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    }
  }

  exportToPdf() {
    this.filterQuery.exportFormat = 'pdf';
    this.filterQuery.exportFilter = true;
    if(this.filterQuery.status===null){
      this.filterQuery.status="";
    }
    if (this.activePage === 'inbox' || this.activePage === 'inbox-new') {
      let fileName;
      if ((this.activePage === 'inbox' || this.activePage === 'inbox-new') && this.currentPage[0] === 'archive') {
        fileName = 'Archived_Inbox_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      } else {
        fileName = 'Inbox_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      }
      this.busy = true;
      this.workflowService.exportInbox(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/pdf' });
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    } else if (this.activePage === 'sent' && this.currentPage[0] !== 'actioned') {
      let fileName;
      if (this.activePage === 'sent' && this.currentPage[0] === 'archive') {
        fileName = 'Archived_Sent_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      } else {
        fileName = 'Sent_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      }
      this.busy = true;
      this.workflowService.exportSent(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/pdf' });
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    } else if (this.activePage === 'sent' && this.currentPage[0] === 'actioned') {
      this.busy = true;
      this.workflowService.exportActioned(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/pdf' });
        const fileName = 'Actioned Report_' + this.coreService.getDateTimeForExport() + '.pdf';
        saveAs(file, fileName);
      }, err => {
        this.busy = false;
      });
    }
  }

  resetReceivedDatePicker() {
    this.filterQuery.receivedDate = undefined;
    this.selectedReceivedDate = undefined;
  }

  resetDueDatePicker() {
    this.filterQuery.deadline = undefined;
    this.selectedDeadline = undefined;
  }

  collapse(event) {
    $('.filter').slideUp();
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.subscriptions = undefined;
    this.statusOptions = [];
    this.type = [];
    this.priority = [];
    this.senderName = [];
    this.selectedReceivedDate = undefined;
    this.selectedDeadline = undefined;
  }
}
