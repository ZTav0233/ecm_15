import {
  Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener,
  ComponentRef, ViewContainerRef, ComponentFactoryResolver, Injector, ElementRef, AfterViewInit, AfterContentInit,
  OnChanges
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import * as $ from 'jquery';
import { WorkitemSet } from '../../../models/workflow/workitem-set.model';
import { User } from '../../../models/user/user.model';
import { SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { BrowserEvents } from '../../../services/browser-events.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { saveAs } from 'file-saver';
import { GrowlService } from "../../../services/growl.service";
import { FilterComponent } from "../../../components/generic-components/filter/filter.component";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { ActionButtonComponent } from "../../../components/generic-components/action-button/action-button.component";
import * as _ from "lodash";

@Component({
  selector: 'inbox-new',
  templateUrl: './inbox-new.component.html',
  styleUrls: ['../workflow.component.css']
})
export class InboxNewComponent implements OnInit, OnDestroy {
  public user = new User();
  public tabsCounter: any = {};
  public tabsList: any[] = [];
  public gridViewOptions = {
    unGrouped: {
      value: false,
      text: 'Ungrouped View'
    },
    grouped: {
      value: true,
      text: 'Grouped View'
    }
  };
  public userGridView: any;
  public colHeaders: any[] = [
    { field: 'status', header: 'Status', hidden: true },
    { field: 'type', header: 'Type', hidden: true }, { field: 'instructions', header: 'Instructions', hidden: true },
    { field: 'receivedDate', header: 'Received Date', hidden: true, sortField: 'receivedDate2' },
    { field: 'senderName', header: 'Sender Name', hidden: true }, { field: 'actions', header: 'For', hidden: true },
    { field: 'priority', header: 'Priority', hidden: true },
    { field: 'recipientName', header: 'Recipient Name', hidden: true },
    { field: 'wfCreatorName', header: 'Created By', hidden: true },
    { field: 'workitemId', header: 'workitemId', hidden: true },
    { field: 'sentitemId', header: 'sentitemId', hidden: true },
    { field: 'deadline', header: 'Deadline', hidden: true },
    { field: 'reminder', header: 'Reminder', hidden: true },
    { field: 'isNew', header: 'IsNew', hidden: true }
  ];
  public columns: any[] = [
    { label: 'Status', value: 'status' },
    { label: 'Type', value: 'type' },
    { label: 'Instructions', value: 'instructions' },
    { label: 'Received Date', value: 'receivedDate' },
    { label: 'Sender Name', value: 'senderName' },
    { label: 'For', value: 'actions' },
    { label: 'Priority', value: 'priority' },
    { label: 'Recipient Name', value: 'recipientName' },
    { label: 'Created By', value: 'wfCreatorName' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Reminder', value: 'reminder' }
  ];
  public selectedColumns: string[] = ['status', 'type', 'receivedDate', 'senderName', 'priority'];
  public actions: string[] = ['Finish', 'Finish Before'];
  public exportItemsList: any[] = [
    {
      label: 'Call Date Report',
      icon: 'ui-icon-event-note',
      items: [
        {
          label: 'PDF',
          icon: 'ui-icon-description', command: (event) => {
            this.exportInbox('today', 'pdf');
          }
        },
        {
          label: 'Excel',
          icon: 'ui-icon-assignment', command: (event) => {
            this.exportInbox('today', 'excel');
          }
        }
      ],
      disabled: true,
      visible: false
    },
    {
      label: 'Export All Workitems',
      icon: 'ui-icon-assignment-returned',
      disabled: true,
      items: [
        {
          label: 'PDF',
          icon: 'ui-icon-description', command: (event) => {
            this.exportInbox('all', 'pdf');
          }
        },
        {
          label: 'Excel',
          icon: 'ui-icon-assignment', command: (event) => {
            this.exportInbox('all', 'excel');
          }
        }
      ]
    }
  ];
  filterQuery: any = {
    'receivedDate': '',
    'recipientName': '',
    'userId': '',
    'userType': '',
    'repStatus': '',
    'receiveCount': 0,
    'exportFormat': '',
    'exportFilter': false
  };
  filterCount = {
    total: 0,
    pageSize: 0,
    to: 0,
    cc: 0,
    reply: 0,
    new: 0,
    read: 0,
    forwarded: 0,
    overdue: 0,
    newToday: 0
  };
  public inboxWorkitems: WorkitemSet = {};
  public inboxWorkitemsCopy: WorkitemSet = {};
  public totalRecords = 0;
  public itemsPerPage: any;
  emptyMessage: string = globalv.no_workitem_found;
  public selectedTabIndex = 0;
  public inboxPreviousSelectedTab: any;
  public inboxSelectedItem: any[] = [];
  advanceFilterShown: boolean = false;
  public disableAction = true;
  displayProgressDialog = false;
  beforeDate: Date;
  beforeDateOverlayPanel: any;
  public showDelegationInactiveDialog = false;
  request: any = { pageNo: 1 };
  public dashboardSearchQuery: any[] = [];
  public dashboardFilter: boolean = false;
  public forOptions: any[];
  public sendersListForFilter: SelectItem[] = [];
  public busy: boolean;
  private subscriptions: any[] = [];
  @ViewChildren(FilterComponent) filterComponent: QueryList<FilterComponent>;
  public progressDialogWorkItem: any = {};

  constructor(
    private breadcrumbService: BreadcrumbService,
    private ws: WorkflowService,
    private route: ActivatedRoute,
    private us: UserService,
    private bs: BrowserEvents,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private growlService: GrowlService) {
  }

  ngOnInit() {
    // get data from resolver
    this.route.data.subscribe((data:any) => {
      this.tabsCounter = data.tabsCounter;
      /*data.workItems.workitems = this._interceptWorkItems(data.workItems.workitems);
      this.inboxWorkitems = data.workItems;
      this.inboxWorkitemsCopy = _.cloneDeep(this.inboxWorkitems);
      this.totalRecords = data.workItems.totalCount;*/
    });
    this.user = this.us.getCurrentUser();
    this.itemsPerPage = this.us.pageSize;
    this.userGridView = this.gridViewOptions.unGrouped.value;
    this._setTabsList();
    this.setBreadcrumb();
    /*// set the query value for filter component
    if (this.breadcrumbService.dashboardFilterQuery && this.breadcrumbService.dashboardFilterQuery.filterStatus !== 'Actioned') {
      this.dashboardFilter = true;
      this.advanceFilterShown = true;
      $('.filter').slideUp();
      const id = this.breadcrumbService.dashboardFilterQuery.filterUserId;
      this.dashboardSearchQuery[id] = this.ws.dashboardFilterQuery;
      this._updateTabsList(id,'tabCount', this.totalRecords);
    }*/
    let selectedTabLabelAndIndex = this.ws._getTabLabelAndIndex();
    this.selectedTabIndex = selectedTabLabelAndIndex.index;
    this.ws.inboxSelectedUserTab = this.selectedTabIndex + '@' + selectedTabLabelAndIndex.label;
    this._updateColumnVisibility()
  }

  /**
   * @description Create a tabs list
   * Tab contains recordId, tabLabel, tabType, tabType, tabCount, tabIdentifier
   * @private
   */
  private _setTabsList() {
    let user = this.user;
    this.tabsList.push({
      recordId: this.user.EmpNo,
      tabLabel: this.user.fulName,
      tabType: 'USER',
      tabCount: this.tabsCounter.userCount,
      tabIdentifier: 0 + '@' + this.user.fulName
    });
    for (let i = 0; i < this.user.roles.length; i++) {
      this.tabsList.push({
        recordId: this.user.roles[i].id,
        tabLabel: this.user.roles[i].name,
        tabType: 'ROLE',
        //tabCount: this.tabsCounter.roles[this.user.roles[i].id],
        tabCount: _.find(this.tabsCounter.roles, function (role) {
          return role.roleId === user.roles[i].id;
        }).wiCount,
        tabIdentifier: (1 + i) + '@' + this.user.roles[i].name
      });
    }
    for (let i = 0; i < this.user.delegated.length; i++) {
      this.tabsList.push({
        recordId: this.user.delegated[i].userId,
        tabLabel: this.user.delegated[i].delName,
        tabType: 'USER',
        //tabCount: (this.tabsCounter.delegated[this.user.delegated[i].userId]),
        tabCount: _.find(this.tabsCounter.delegated, function (delegated) {
          return delegated.delId === user.delegated[i].userId;
        }).wiCount,
        tabIdentifier: (1 + this.user.roles.length + i) + '@' + this.user.delegated[i].delName
      });
    }
  }

  /**
   * @description Update the value of give property for tabList item based on tabRecordId
   * @param tabRecordId
   * @param propertyToUpdate
   * @param value
   * @private
   */
  private _updateTabsList(tabRecordId, propertyToUpdate, value) {
    for (let i = 0; i < this.tabsList.length; i++) {
      if (this.tabsList[i].recordId === tabRecordId) {
        this.tabsList[i][propertyToUpdate] = value;
      }
    }
  }

  /**
   * @description Set the breadcrumb for page
   * @param tabLabel
   */
  setBreadcrumb(tabLabel?) {
    if (tabLabel) {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Inbox' },
        { label: tabLabel }
      ])
    }
    else {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Inbox' },
        { label: this.user.fulName }
      ]);
      if (this.ws.inboxSelectedUserTab) {
        this.inboxPreviousSelectedTab = this.ws.inboxSelectedUserTab.split('@');
        this.breadcrumbService.setItems([
          { label: 'Workflow' },
          { label: 'Inbox' },
          { label: this.inboxPreviousSelectedTab[1] }
        ]);
      }
    }
  }

  /**
   * @description Get the progress of work item
   */
  getWorkitemProgress() {
    this.busy = true;
    this.ws.getWorkitemProgress(this.progressDialogWorkItem.workitemId).subscribe(res => {
      this.busy = false;
      res.map(r => {
        if (r.empNo === this.user.EmpNo) {
          r.from = true;
        }
      });
      this.progressDialogWorkItem.progress = res;
      this.displayProgressDialog = true;
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Add new progress to progress of work item
   * @param event
   */
  addWorkitemProgress(event) {
    this.busy = true;
    this.ws.addWorkitemProgress(event.message, this.user.EmpNo, this.progressDialogWorkItem.workitemId).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Workitem Progress Added Successfully'
      });
      event = {};
      this.getWorkitemProgress();
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Confirm and remove the progress of work item
   * @param id
   */
  removeWorkitemProgress(id) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      key: 'addToCartConfirmation',
      accept: () => {
        this.deleteWorkitemProgressConfirmed(id);
      }
    });
  }

  /**
   * @description Removes the progress of work item
   * @param id
   */
  deleteWorkitemProgressConfirmed(id) {
    this.busy = true;
    this.ws.removeWorkitemProgress(id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Workitem Progress Removed Successfully'
      });
      this.getWorkitemProgress();
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Get sender options for filter sender dropdown
   * @param id
   * @param userType
   */
  getFilterSenderOptions(id, userType) {
    this.sendersListForFilter = [];
    this.busy = true;
    this.ws.getInboxFilterUsers(id, userType, 'active').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.sendersListForFilter.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Lazy load call from grid
   * @param data
   */
  lazyLoadWorkItems(data) {
    if (!data || !data.rows) {
      return;
    }

    if (data && data.globalFilter && data.globalFilter.trim()) {
      let columnsToFilter = _.cloneDeep(this.selectedColumns);
      if (columnsToFilter.indexOf('subject') === -1)
        columnsToFilter.splice(0, 0, 'subject');
      this.inboxWorkitems.workitems = this.coreService.getFilterRecords(this.inboxWorkitemsCopy.workitems, data.globalFilter.trim(), columnsToFilter);
      //this.inboxWorkitems.workitems = _.orderBy(this.inboxWorkitems.workitems, [workItem => workItem[data.sortField].toString().toLowerCase()], [this.coreService.getSortOrderText(data.sortOrder)]);
      this.totalRecords = this.inboxWorkitems.workitems.length;
      return;
    }

    this.request = this.ws.createRequestBody(this.route.snapshot.params);
    this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
    this.request.sort = data.sortField;
    this.request.empNo = this.user.EmpNo;
    if (data.sortField === 'receivedDate2') {
      this.request.sort = 'createdDate';
    }
    this.request.order = this.coreService.getSortOrderText(data.sortOrder, true);
    this.searchInbox();
  }

  /**
   * @description Intercept/Map the result workitems
   * @param workItems
   * @private
   */
  private _interceptWorkItems(workItems) {
    return workItems.map((d) => {
      d.priority = this.coreService.getPriorityString(d.priority);
      d.receivedDate2 = this.coreService.getTimestampFromDate(d.receivedDate, null, '/');
      let groupBy = this.request.sort;
      if (!groupBy || groupBy === 'createdDate') {
        groupBy = 'receivedDate2';
      }
      d.recordGroupName = this.coreService.getRowGroupText(d, groupBy);
      d.progress = 'progress';
      const oneDay = 24 * 60 * 60 * 1000;
      const tod = new Date();
      const arrDate = d.receivedDate.split('/');
      const rec = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2]);
      const diffDays = Math.round(Math.abs((tod.getTime() - rec.getTime()) / (oneDay)));
      d.daysleft = diffDays;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d.status.includes('New')) {
        d.isNew = true;
      }
      return d;
    });
  }

  /**
   * @description Get the data for grid on lazy load or tab change
   */
  searchInbox(resetPage?) {
    if (resetPage) {
      this.request.pageNo = 1;
      this.inboxSelectedItem = [];
      this.ws.pageNoSelected = 1;
      this.ws.first = 0;
    }
    this.busy = true;
    this.ws.searchInboxNew(this.request).subscribe(res => {
      this.busy = false;
      res.workitems = this._interceptWorkItems(res.workitems);
      this.inboxWorkitems = res;
      this.inboxWorkitemsCopy = _.cloneDeep(this.inboxWorkitems);
      this.totalRecords = res.totalCount;
      this._updateTabsList(this.request.userId, 'tabCount', res.totalCount);
      this.setDefaultFilterForExport(this.request.userType, this.request.userId);
      if (this.advanceFilterShown) {
        this.countFiltered(res);
      } else {
        this.filterCount.total = -1;
      }
      this.exportItemsList.map((item, index) => {
        item.disabled = !this.inboxWorkitems.workitems || this.inboxWorkitems.workitems.length === 0;
      });
      if (this.ws.openedWorkItem) {
        if (this.request.userId === this.ws.openedWorkItem.userId) {
          this.inboxSelectedItem.push(this.ws.openedWorkItem.row);
          this.ws.openedWorkItem = undefined;
        }
      }
      localStorage.setItem('previousCount', res.totalCount);
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Tab change
   * @param textLabel
   * @param index
   * @param resetPageNumber
   */
  inboxTabChange(textLabel, index, resetPageNumber) {
    this.resetFilterModel();
    this.selectedTabIndex = index;
    this.ws.inboxSelectedUserTab = this.selectedTabIndex + '@' + textLabel;
    this.inboxSelectedItem = [];
    this.disableAction = true;
    this.setBreadcrumb(textLabel);
    /*if (!this.dashboardFilter) {
      if (!resetPageNumber && this.inboxPreviousSelectedTab && this.ws.pageNoSelected > 0 && this.ws.pageNoSelected !== undefined) {
        this.request.pageNo = this.ws.pageNoSelected;
      } else {
        this.ws.pageNoSelected = 0;

      }
      this.searchInbox();
    }*/
    this.searchInbox(true);
  }

  /**
   * @description Update the count after search when advance filter is used
   * @param data
   */
  countFiltered(data: any) {
    this.filterCount = {
      total: data.totalCount,
      pageSize: data.setCount,
      to: 0,
      cc: 0,
      reply: 0,
      new: 0,
      read: 0,
      forwarded: 0,
      overdue: 0,
      newToday: 0
    };
    for (const item of data.workitems) {
      if (item.status.includes('Read')) {
        this.filterCount.read++;
      }
      if (item.status.includes('New')) {
        this.filterCount.new++;
      }
      if (item.actionId === 1) {
        this.filterCount.forwarded++;
      }
      if (item.type.includes('TO')) {
        this.filterCount.to++;
      }
      if (item.type.includes('CC')) {
        this.filterCount.cc++;
      }
      if (item.actionId === 2) {
        this.filterCount.reply++;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (item.deadline) {
        const deadline = this.coreService.getTimestampFromDate(item.deadline, null, '/');
        if (item.deadline) {
          if (deadline <= today.getTime()) {
            this.filterCount.overdue++;
          }
        }
      }
      if (item.receivedDate) {
        const receivedDate = this.coreService.getTimestampFromDate(item.receivedDate, null, '/');
        if (item.receivedDate) {
          if (receivedDate >= today.getTime() && item.status.includes('New')) {
            this.filterCount.newToday++;
          }
        }
      }
    }
  }

  /**
   * @description Manage selected items
   * @param data
   */
  onSelectRow(data: any) {
    this.inboxSelectedItem = data;
    if (this.inboxSelectedItem) {
      if (this.inboxSelectedItem.length > 0) {
        this.disableAction = false;
      } else {
        this.disableAction = true;
      }
    }
  }

  /**
   * @description Only clear the fields of the filter
   */
  clearFilter() {
    this.breadcrumbService.dashboardFilterQuery = undefined;
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
    this.searchInbox(true);
  }

  /**
   * @description Reset the filter and search again
   * @param event
   */
  closeFilters(event) {
    this.advanceFilterShown = false;
    $('.filter').slideUp();
    this.clearFilter();
  }

  resetFilterModel() {
    $('.filter').slideUp();
    this.advanceFilterShown = false;
    if (this.filterComponent) {
      this.filterComponent.map(r => {
        r.resetFilter();
      });
    }
  }

  /**
   * @description Toggle the filter
   * @param data
   */
  getFilterToggle(data: any) {
    this.advanceFilterShown = !this.advanceFilterShown;
    this.getFilterSenderOptions(this.request.userId, this.request.userType);
    this.getForOptionsForFilter(this.user.EmpNo);
    $('.filter').slideToggle();
  }

  /**
   * @description Callback for action button above grid
   * @param data
   * @param op
   */
  actionButtonCallback(data: any, op) {
    if (this.ws.delegateId && this.ws.delegateId > 0) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.showDelegationInactiveDialog = true;
        } else {
          if (data === 'Finish') {
            this.finishWorkitems();
          } else if (data === 'Finish Before') {
            this.openFinishBeforeOverlayPanel(op);
          }
        }
      });
    } else {
      if (data === 'Finish') {
        this.finishWorkitems();
      } else if (data === 'Finish Before') {
        this.openFinishBeforeOverlayPanel(op);
      }
    }
  }

  /**
   * @description Update the show/hide of columns
   * @private
   */
  _updateColumnVisibility() {
    for (const column of this.selectedColumns) {
      for (const tableHead of this.colHeaders) {
        if (tableHead.field === column) {
          tableHead.hidden = false;
        }
      }
    }
  }

  /**
   * @description Column selection changed by user
   * @param event
   */
  columnSelectionChanged(event: any) {
    for (const tableHead of this.colHeaders) {
      tableHead.hidden = true;
    }
    this._updateColumnVisibility();
  }

  /**
   * @description Finish the work item
   */
  finishWorkitems() {
    this.confirmationService.confirm({
      message: 'Do you want to Finish this workitem?',
      header: 'Finish Confirmation',
      icon: 'ui-icon-help',
      accept: () => {
        if (this.inboxSelectedItem.length > 0) {
          let count = 0;
          this.inboxSelectedItem.map((item, index) => {
            this.busy = true;
            this.ws.finishWorkitem(item.workitemId).subscribe(data => {
              this.busy = false;
              count++;
              if (this.inboxSelectedItem.length === count) {
                this.inboxSelectedItem = [];
                this._finishSuccess();
              }
            }, Error => {
              this.busy = false;
              this._finishFailed()
            });
          });
        }
      },
      reject: () => { }
    });
  }

  setDefaultFilterForExport(type, id) {
    this.filterQuery.recipientName = type + ':' + id;
    this.filterQuery.userId = id;
    this.filterQuery.userType = type;
    this.filterQuery.repStatus = 'active';
  }

  /**
   * @description Exports the inbox items
   * @param type
   * @param exportType
   */
  exportInbox(type, exportType) {
    if (this.request.sort && this.request.order) {
      this.filterQuery.sort = this.request.sort;
      this.filterQuery.order = this.request.order;
    }
    if (type === 'today') {
      const today = new Date();
      this.filterQuery.receivedDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    }
    if (exportType === 'pdf') {
      this.filterQuery.exportFormat = "pdf";
      this.busy = true;
      this.ws.exportInbox(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/pdf' });
        const fileName = 'Inbox_' + this.coreService.getDateTimeForExport() + '.pdf';
        saveAs(file, fileName);
        this.filterQuery.receivedDate = '';
      }, err => {
        this.busy = false;
      });
    } else {
      this.filterQuery.exportFormat = "xls";
      this.busy = true;
      this.ws.exportInbox(this.filterQuery).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/vnd.ms-excel' });
        const fileName = 'Inbox_' + this.coreService.getDateTimeForExport() + '.xlsx';
        saveAs(file, fileName);
        this.filterQuery.receivedDate = '';
      }, err => {
        this.busy = false;
      });
    }
  }

  /**
   * @description Get the row track by value
   * @param index
   * @param item
   */
  getRowTrackBy = (index, item) => {
    return item.workitemId;
  };

  /**
   * @description Refresh the grid
   */
  refreshTable() {
    this.request.sort = 'receivedDate2';
    this.ws.updateInboxCount();
    if (this.ws.inboxSelectedUserTab) {
      this.inboxPreviousSelectedTab = this.ws.inboxSelectedUserTab.split('@');
      // this.selectedTabIndex = this.inboxPreviousSelectedTab[0];
      this.inboxTabChange(this.inboxPreviousSelectedTab[1], this.inboxPreviousSelectedTab[0], false);
    }
  }

  /**
   * @description Opens the datepicker overlay
   * @param op
   */
  openFinishBeforeOverlayPanel(op) {
    this.beforeDateOverlayPanel = op;
    if (op.visible) {
      op.visible = false;
    } else {
      op.visible = true;
    }
  }

  /**
   * @description Finish before date selected
   * @param event
   */
  selectBeforeDate(event) {
    let empNo = 0;
    let roleId = 0;
    if (this.request.userType === 'USER') {
      empNo = this.request.userId;
      roleId = 0;
    } else if (this.request.userType === 'ROLE') {
      empNo = 0;
      roleId = this.request.userId;
    }
    const bDate = this.coreService.getFormattedDateString(event, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    this.confirmationService.confirm({
      header: 'Finish?',
      message: 'All Workitems received before' + ' ' + bDate + ' ' + 'will be shifted to archived items,are you sure?',
      accept: () => {
        //Actual logic to perform a confirmation
        this.ws.finishWorkitemBefore(empNo, roleId, bDate).subscribe(val => this._finishBeforeSuccess(val), error => this._finishFailed());
      }
    });
    this.beforeDateOverlayPanel.visible = false;
  }

  /**
   * @description On success of finish before
   * @param val
   * @private
   */
  _finishBeforeSuccess(val) {
    window.parent.postMessage('FinishSuccess', '*');
    if (val === 'Workitems not found') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'No Workitems', detail: 'No workitems found..Choose a different date'
      });
    } else {
      const count = val.trim().split('-')[1];
      let message;
      if (count === '1') {
        message = count + ' ' + 'Workitem Finished';
      } else {
        message = count + ' ' + 'Workitems Finished';
      }
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: message
      });
      //this.redirectToArchive();
      this.refreshTable();
    }
  }

  /**
   * @description On success of finish
   */
  _finishSuccess() {
    window.parent.postMessage('FinishSuccess', '*');
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Finished Successfully'
    });
    this.refreshTable();
    // this.redirectToArchive();
  }

  /**
   * @description On fail of finish
   */
  _finishFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Finish Workitems'
    });
  }

  /**
   * @description Shows the progress dialog for workItem
   * @param event
   */
  showProgressDialogue(event) {
    this.progressDialogWorkItem = {};
    this.progressDialogWorkItem.workitemId = event;
    this.getWorkitemProgress();
  }

  /**
   * @description Hides the progress dialog for workItem
   */
  hideProgressDialog() {
    this.progressDialogWorkItem = {};
    this.displayProgressDialog = false;
  }

  reloadApp() {
    this.showDelegationInactiveDialog = false;
    //window.location.reload(true);
    window.parent.postMessage('DelegationEndReload', '*');
  }

  /**
   * @description Gets the options for "for" dropdown in filter
   * @param EmpNo
   */
  getForOptionsForFilter(EmpNo) {
    this.forOptions = [];
    this.ws.getWorkflowActions().map((option) => {
      this.forOptions.push({ label: option.name, value: option.name })
    });
  }

  /**
   * @description Clear all subscriptions
   */
  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.filterComponent.destroy();
    this.breadcrumbService.dashboardFilterQuery = undefined;
    this.clearSubscriptions();
    this.inboxSelectedItem = [];
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.totalRecords = undefined;
    this.inboxWorkitems = {};
    this.inboxWorkitemsCopy = {};
    this.columns = [];
    this.selectedColumns = [];
    this.user = undefined;
    this.actions = [];
    this.emptyMessage = undefined;
    this.disableAction = true;
    this.selectedTabIndex = 0;
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
  }
}