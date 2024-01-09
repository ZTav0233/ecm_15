import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
// services
import { ConfirmationService, SelectItem } from "primeng/api";
import { WorkflowService } from "../../../services/workflow.service";
import { UserService } from "../../../services/user.service";
import { GrowlService } from "../../../services/growl.service";
import { CoreService } from "../../../services/core.service";
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { BrowserEvents } from "../../../services/browser-events.service";
// models
import { WorkitemSet } from "../../../models/workflow/workitem-set.model";
import { User } from "../../../models/user/user.model";
// libraries
import * as global from "../../../global.variables";
import * as $ from 'jquery';
import { saveAs } from 'file-saver';

import { FilterComponent } from "../../../components/generic-components/filter/filter.component";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { WorkitemDetails } from "../../../models/workflow/workitem-details.model";
import * as _ from "lodash";
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-filter-result',
  templateUrl: './filter-result.component.html',
  styleUrls: ['../workflow.component.css']
})
export class FilterResultComponent implements OnInit, OnDestroy {
  public user = new User();
  public emptyMessage: any = global.no_workitem_found;
  public selectedItem: any[] = [];
  public colHeaders: any[] = [
    { field: 'lastItemSentOn', header: 'Sent On', hidden: true, sortField: 'lastItemSentOn2' },
    { field: 'wfCreatorName', header: 'Workflow Created By', hidden: true },
    { field: 'createdOn', header: 'Workflow Created Date', hidden: true, sortField: 'createdOn2' },
    { field: 'deadline', header: 'Deadline', hidden: true, sortField: 'deadline2' },
  ];
  public itemsPerPage: any;
  public totalRecords: any;
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
  public sentWorkitems: WorkitemSet = {};
  public columns: any[] = [{ label: 'Sent On', value: 'lastItemSentOn' }, { label: 'Workflow Created By', value: 'wfCreatorName' },
  { label: 'Workflow Created Date', value: 'createdOn' }, { label: 'Deadline', value: 'deadline' }
  ];
  public selectedColumns: any[] = ['lastItemSentOn', 'wfCreatorName'];
  public actions: string[] = ['Recall', 'Archive', 'Finish Before'];
  public disableAction = true;
  public selectedCount = 0;
  public curPage: any = 1;
  selectedUser: any;
  type: any;
  lazy = true;
  beforeDate: Date;
  overlayPanel: any;
  public selectedTabIndex = 0;
  public dashboardSelectedTab: any;
  filterCount = { total: -1, pageSize: 0, to: 0, cc: 0, reply: 0, replyto: 0, replycc: 0, new: 0, read: 0, forwarded: 0 };
  request: any = { pageNo: 1 };
  public userTabsTotalCount = 0;
  public roleTabsTotalCount: any[] = [];
  public delTabsTotalCount: any[] = [];
  public sender: SelectItem[] = [];
  public sentTieredItems: any[] = [{
    label: 'Export',
    icon: 'fa fa-fw ui-icon-assignment-returned',
    disabled: false,
    items: [{
      label: 'PDF',
      icon: 'fa fa-fw ui-icon-description', command: (event) => {
        this.exportActioned('pdf');
      }
    }, {
      label: 'Excel',
      icon: 'fa fa-fw ui-icon-assignment', command: (event) => {
        this.exportActioned('excel');
      }
    }
    ]
  }];
  @ViewChildren(FilterComponent) filterComponent: QueryList<FilterComponent>;
  @ViewChildren(DataTableComponent) dataTableComponent: QueryList<DataTableComponent>;
  public usersTabTotalCountBadge: any[] = [];
  public recalled = false;
  private subscriptions: Subscription[] = [];
  public advanceFilterShown = false;
  private selectedWorkitem: any = {};
  private displayProgress = false;
  private dashboardFilter = false;
  public forOptions: any[];
  public resetFirstAndSort = false;
  public defaultSortField = 'lastItemSentOn2';
  public defaultSortOrder = -1;
  public expandedRowsGroups: string[] = [];
  public expandedRowsGroupsSubTotal = [];
  @ViewChild('filterResConfirmation') confirmDialogRef: ElementRef;
  @ViewChild('showTrackDialog') showTrackDialogRef: ElementRef;
  public trackColHeaders = [{ field: 'recipientName', header: 'Recipient', hidden: false }, { field: 'senderName', header: 'Sender Name', hidden: false },
  { field: 'sentOn', header: 'Sent On', hidden: false, sortField: 'sentOn2' }, { field: 'actionUser', header: 'Action By', hidden: false },
  { field: 'status', header: 'Status', hidden: false }];
  public workitemHistory: any;
  public trackWorkitemDetails: any;
  public busy: boolean;
  public showTrack = false;
  public tabsList = [];
  public progressObj = {};
  public showOperationNotPossible = false;
  constructor(private breadcrumbService: BreadcrumbService, private ws: WorkflowService,private toastr:ToastrService,
    private us: UserService, private bs: BrowserEvents,
    private router: Router, private confirmationService: ConfirmationService, private growlService: GrowlService,
    private coreService: CoreService, private workflowService: WorkflowService) {
    this.subscribeRouterEvents();
    this.subscribeRefreshRequiredEvent();
  }

  ngOnInit() {
    let isOnInitCall = !this.resetFirstAndSort;
    this.closeAllDialog();
    this.user = this.us.getCurrentUser();
    this.selectedUser = undefined;
    this.type = undefined;
    for (const colunm of this.selectedColumns) {
      for (const tableHead of this.colHeaders) {
        if (tableHead.field === colunm) {
          tableHead.hidden = false;
        }
      }
    }
    this.userGridView = this.gridViewOptions.grouped.value;
    if (this.breadcrumbService.fromDashboard && this.breadcrumbService.actionedDashboardFilterQuery.filterStatus === 'Actioned') {
      //this.dashboardFilter = true;
      //this.dashboardSelectedTab = this.breadcrumbService.dashboardTabSelected.split('@');
      /*this.breadcrumbService.setItems([
        {label: 'Workflow'},
        {label: 'Actioned'},
        {label: this.breadcrumbService.actionedDashboardFilterQuery.filterUserName}
      ]);*/
      //this.request.sysStatus = 'Actioned';
      this.setBreadcrumb();
      this._setDashboardQueryAndTabChange(isOnInitCall)
    }
  }

  /**
   * @description Set the dashboard query filter(if exists) and hit tab change
   * @param isOnInitCall
   * @private
   */
  private _setDashboardQueryAndTabChange(isOnInitCall) {
    if (this.breadcrumbService.actionedDashboardFilterQuery) {
      this.request.userId = this.breadcrumbService.actionedDashboardFilterQuery.filterUserId;
      this.request.userType = this.breadcrumbService.actionedDashboardFilterQuery.filterUserType.toUpperCase();
      this.request.type = this.breadcrumbService.actionedDashboardFilterQuery.filterWIType;
      // console.log(this.request.userId);
      // console.log(this.request.userType);
      if (this.request.userType === 'ROLE') {
        this.workflowService.roleId = this.request.userId;
      }
      if (this.breadcrumbService.actionedDashboardFilterQuery.filterReceivedDay === 'Today') {
        const date = new Date();
        this.request.receivedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      }
      this._interceptRequestAndSearchSent(isOnInitCall);
    }
  }

  _interceptRequestAndSearchSent(isOnInitCall) {
    //this.ws.inboxSelectedUserTab = this.selectedTabIndex + '@' + textLabel;
    this.selectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.disableAction = true;
    let tabData = this.tabsList[this.selectedTabIndex];
    this.setDefaultSortInRequest();
    /*if (tabData && tabData.recordId === this.request.userId && tabData.lastRequest) {
      this.advanceFilterShown = tabData.lastRequest.exportFilter;
      if (this.advanceFilterShown) {
        $('.filter').slideDown();
      } else {
        $('.filter').slideUp();
      }
      this.request = tabData.lastRequest;
      this.setDefaultSortInRequest(tabData.sortField, tabData.sortDirection);
      this.getSentItems();
    } else {*/
    this.advanceFilterShown = false;
    $('.filter').slideUp();
    this._setTabList();
    this.setDefaultSort();
    this.getForOptions(this.request.userId);
    //}
    this.getSentItems();
  }

  /**
   * @description Create a tabs list
   * Tab contains recordId, tabLabel, tabType, tabType, tabCount, tabIdentifier
   * @private
   */
  private _setTabList() {
    this.tabsList = [];
    let user = this.user;
    this.tabsList.push({
      recordId: this.request.userId,
      tabLabel: user.fulName,
      tabType: this.request.userType,
      gridType: 'sent',
      userRoleDelegate: this.request.userType,
      delegationId: null,
      tabCount: 0,
      tabIdentifier: 0 + '@' + user.fulName,
      sortField: 'lastItemSentOn2',
      sortDirection: -1,
      totalRecords: 0,
      quickFilterText: ''
    });
  }

  /**
   * @description sets default sort and order to the request
   * @param sortField
   * @param sortOrder
   */
  setDefaultSortInRequest(sortField = 'lastItemSentOn2', sortOrder = -1) {
    this.request.sort = this.getSortingMapToRequest(sortField);
    this.request.order = this.coreService.getSortOrderText(sortOrder);
  }

  /**
   * @description Update the value of give property for tabList item based on tabRecordId
   * @param tabRecordId
   * @param propertyToUpdate
   * @private
   */
  private _updateTabsList(tabRecordId, propertyToUpdate) {
    let tab;
    for (let i = 0; i < this.tabsList.length; i++) {
      tab = this.tabsList[i];
      if (tab.recordId === tabRecordId) {
        // check if propertyToUpdate is array or single object
        if (Array.isArray(propertyToUpdate) && propertyToUpdate.length) {
          for (let j = 0; j < propertyToUpdate.length; j++) {
            _.set(tab, propertyToUpdate[j].property, propertyToUpdate[j].value);
          }
        } else {
          tab[propertyToUpdate.property] = propertyToUpdate.value;
        }
        break;
      }
    }
  }

  countFiltered(data: any) {
    this.filterCount = { total: data.totalCount, pageSize: data.setCount, to: 0, cc: 0, reply: 0, replyto: 0, replycc: 0, new: 0, read: 0, forwarded: 0 };
    for (const item of data.workitems) {
      if (item.actionId === 1) {
        this.filterCount.forwarded++;
      } else if (item.actionId === 2) {
        this.filterCount.reply++;
      }
    }
  }

  setDefaultSort(sortField = 'lastItemSentOn2', sortOrder = -1) {
    this.defaultSortField = sortField;
    this.defaultSortOrder = sortOrder;
  }

  /**
   * @description clear dashboard filter, reset page no and filter model
   */
  clearDashboardFilter() {
    this.selectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.advanceFilterShown = false;
    this.resetFirst();
    //this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
    $('.filter').slideUp();
  }

  /**
   * @description Reset filter and clear the filter criteria and search again
   * @param skipSearchInbox
   */
  resetAndCloseFilters(skipSearchInbox = false) {
    this.selectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.advanceFilterShown = false;
    $('.filter').slideUp();
    this.clearFilter(skipSearchInbox);
    this.resetFirst();
  }

  /**
   * @description Clear the filter criteria
   * @param skipSearchInbox
   */
  clearFilter(skipSearchInbox = false) {
    //this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
    //this.breadcrumbService.actionedDashboardFilterQuery = undefined;
    if (!skipSearchInbox) {
      this.getSentItems();
    }
  }

  resetFirst() {
    if (this.dataTableComponent) {
      this.dataTableComponent.map(r => {
        r.resetFirst();
      });
    }
  }

  resetFilterModel() {
    if (this.filterComponent) {
      this.filterComponent.map(r => {
        r.resetFilter();
      });
      this.request.recipientName = undefined;
    }
  }

  getFilterSenderOptions(id, userType) {
    this.sender = [];
    this.busy = true;
    this.ws.getSentitemFilterUsers(id, userType, 'active').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.sender.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, Error => {
      this.busy = false;
    });
  }

  getData(data: any) {
    this.selectedItem = data;
    if (this.selectedItem) {
      if (this.selectedItem.length > 0) {
        this.disableAction = false;
        this.selectedCount = this.selectedItem.length;
      } else {
        this.disableAction = true;
        this.selectedCount = 0;
      }
    }
  }

  getRowTrackBy = (index, item) => {
    return item.sentitemId;
  };

  getFilterToggle(data: any) {
    this.advanceFilterShown = !this.advanceFilterShown;
    if (this.request.exportFilter) {
      this.advanceFilterShown = true;
    }
    this.getFilterSenderOptions(this.request.userId, this.request.userType);
    this.toggleFilter();
  }

  getSelectedAction(data: any, op) {
    if (data === 'Archive') {
      this.archiveSentitems();
    } else if (data === 'Recall') {
      this.recallSentitems();
    }
    else if (data === 'Finish Before') {
      this.openOverlayPanel(op);
    }
  }

  hideDisplayProgress() {
    this.displayProgress = false;
  }

  getWorkitemProgress() {
    this.busy = true;
    this.workflowService.getWorkitemProgress(this.selectedWorkitem.workitemId).subscribe(res => {
      this.busy = false;
      res.map(r => {
        if (r.empNo === this.user.EmpNo) {
          r.from = true;
        }
      });
      this.selectedWorkitem.progress = res;
      this.displayProgress = true;
      this.progressObj = {};
    }, Error => {
      this.busy = false;
    });
  }

  addWorkitemProgress(event) {
    this.busy = true;
    this.workflowService.addWorkitemProgress(event.message, this.user.EmpNo, this.selectedWorkitem.workitemId).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Workitem Progress Added Successfully'
      // });
      this.toastr.info('Workitem Progress Added Successfully', 'Success');
      this.getWorkitemProgress();
    }, err => {
      this.busy = false;
    });
  }

  removeWorkitemProgress(id) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      header: 'Remove Confirmation',
      key: 'filterResConfirmation',
      accept: () => {
        this.deleteWorkitemProgress2(id);
      }
    });

  }

  deleteWorkitemProgress2(id) {
    this.busy = true;
    this.workflowService.removeWorkitemProgress(id).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Workitem Progress Removed Successfully'
      // });
      this.toastr.info('Workitem Progress Removed Successfully', 'Success');
      this.getWorkitemProgress();
    }, err => {
      this.busy = false;
    });
  }

  showProgressDialogue(event) {
    this.selectedWorkitem = {};
    this.selectedWorkitem.workitemId = event;
    this.getWorkitemProgress();

  }

  columnSelectionChanged(event: any) {
    if (event) {
      this.selectedColumns=event;
      for (const tableHead of this.colHeaders) {
        tableHead.hidden = true;
      }
      for (const colunm of this.selectedColumns) {
        for (const tableHead of this.colHeaders) {
          if (tableHead.field === colunm.field) {
            tableHead.hidden = false;
          }
        }
      }
    } else {
      for (const tableHead of this.colHeaders) {
        tableHead.hidden = true;
      }
      for (const colunm of this.selectedColumns) {
        for (const tableHead of this.colHeaders) {
          if (tableHead.field === colunm) {
            tableHead.hidden = false;
          }
        }
      }
    }
    
  }

  assignSortNotPaginationInfo(data) {
    console.log(data);
    
    if (this.user) {
      if (!data || !data.rows) {
        return;
      }
      this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
      if (data && data.filters.subject.value && data.filters.subject.value.trim()) {
        this._filterRecords(data.filters.subject.value.trim(), data.sortField, data.sortOrder, (sentWorkitems) => {
          this.sentWorkitems.workitems = sentWorkitems;
        });
        return;
      } else {
        this._updateTabsList(this.request.userId, { property: 'quickFilterText', value: '' });
      }

      //this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
      this.request.sort = data.sortField;
      this.request.empNo = this.user.EmpNo;
      this.getSortingMapToRequest(data);
      this.request.order = this.coreService.getSortOrderText(data.sortOrder, true);
      this.setDefaultSort(data.sortField, data.sortOrder);
      this.getSentItems();
    }
  }

  private _filterRecords(filterText, sortField, sortOrder, cb?) {
    /*let columnsToFilter = _.cloneDeep(this.selectedColumns);
    if (columnsToFilter.indexOf('subject') === -1)
      columnsToFilter.splice(0, 0, 'subject');

    let inboxWorkItems = this.coreService.getFilterRecords(this.inboxWorkitemsCopy.workitems, filterText, columnsToFilter);
    inboxWorkItems = _.orderBy(inboxWorkItems, [workItem => workItem[sortField].toString().toLowerCase()], [this.coreService.getSortOrderText(sortOrder)]);
    */
    this.request.sort = sortField;
    this.request.order = this.coreService.getSortOrderText(sortOrder, true);
    this.setDefaultSort(sortField, sortOrder);
    this._getSubjectFilteredFromServer(filterText, (sentWorkItems) => {
      this.totalRecords = sentWorkItems.length;
      if (cb)
        cb(sentWorkItems)
    });
  }

  _getSubjectFilteredFromServer(filterText, cb?) {
    this.disableAction = true;
    this.selectedItem = [];
    this.request.repStatus = 'active';
    this.request.empNo = this.user.EmpNo;
    let requestCopyForSubject = _.cloneDeep(this.request);
    requestCopyForSubject.subject = filterText;
    this.busy = true;
    this.ws.searchActionedItems(requestCopyForSubject).subscribe(res => {
      this.busy = false;
      this.expandedRowsGroups = [];
      this.expandedRowsGroupsSubTotal = [];
      res.workitems.map(d => {
        d.lastItemSentOn2 = this.coreService.getTimestampFromDate(d.lastItemSentOn, null, '/');
        d.createdOn2 = this.coreService.getTimestampFromDate(d.createdOn, null, '/');
        d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
        let groupBy = this.request.sort;
        if (groupBy === 'wfCreatedDate') {
          groupBy = 'createdOn2';
        } else if (groupBy === 'deadline') {
          groupBy = 'deadline2';
        } else if (groupBy === 'type') {
          groupBy = 'actions';
        } else if (!groupBy || groupBy === 'lastItemSentOn') {
          groupBy = 'lastItemSentOn2';
        }
        d.recordGroupName = this.coreService.getRowGroupText(d, groupBy);
        if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1) {
          this.expandedRowsGroups.push(d.recordGroupName);
          this.expandedRowsGroupsSubTotal[d.recordGroupName] = 0;
        }
        this.expandedRowsGroupsSubTotal[d.recordGroupName] += 1;
      });

      let requestCopy = _.cloneDeep(this.request),
        propertiesToUpdate = [
          //{property: 'tabCount', value: res.totalCount},
          { property: 'quickFilterText', value: filterText },
          { property: 'lastRequest', value: requestCopy },
          { property: 'pageNo', value: requestCopy.pageNo },
          { property: 'sortField', value: this.getSortingMapFromRequest(requestCopy) },
          { property: 'sortDirection', value: this.coreService.getSortOrderValueFromText(requestCopy.order) },
          { property: 'totalRecords', value: res.totalCount }
        ];
      this._updateTabsList(this.request.userId, propertiesToUpdate);

      this.sentTieredItems.map((item, index) => {
        item.disabled = !this.sentWorkitems.workitems || this.sentWorkitems.workitems.length === 0;
      });
      if (cb)
        cb(res.workitems);
    }, Error => {
      this.busy = false;
    });
  }

  /**
   * @description Change the sorting field names for sending to backend service
   * @param sortField
   */
  getSortingMapToRequest(sortField) {
    sortField = sortField && sortField.hasOwnProperty('sortField') ? sortField.sortField : sortField;
    if (sortField === 'lastItemSentOn2') {
      this.request.sort = 'lastItemSentOn';
    } else if (sortField === 'createdOn2') {
      this.request.sort = 'wfCreatedDate';
    } else if (sortField === 'deadline2') {
      this.request.sort = 'deadline';
    } else if (sortField === 'actions') {
      this.request.sort = 'type';
    } else {
      this.request.sort = sortField;
    }
    return this.request.sort;
  }

  /**
   * @description Change the sorting field names for using in UI
   * @param sortBy
   */
  getSortingMapFromRequest(sortBy) {
    sortBy = sortBy && sortBy.hasOwnProperty('sort') ? sortBy.sort : sortBy;
    if (!sortBy) {
      return 'lastItemSentOn2';
    }

    if (sortBy === 'lastItemSentOn') {
      return 'lastItemSentOn2';
    } else if (sortBy === 'wfCreatedDate') {
      return 'createdOn2';
    } else if (sortBy === 'deadline') {
      return 'deadline2';
    } else if (sortBy === 'type') {
      return 'actions';
    } else {
      return sortBy;
    }
  }

  

  getSentItems(fromFilter = false) {
    fromFilter ? this.resetFirst() : null;
    if (this.user) {
      this.disableAction = true;
      this.selectedItem = [];
      this.request.repStatus = 'active';
      this.request.empNo = this.user.EmpNo;
      this.busy = true;
      this.ws.searchActionedItems(this.request).subscribe(res => {
        this.busy = false;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map(d => {
          d.lastItemSentOn2 = this.coreService.getTimestampFromDate(d.lastItemSentOn, null, '/');
          d.createdOn2 = this.coreService.getTimestampFromDate(d.createdOn, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');

          if (!d.hasOwnProperty('hasProgress'))
            d.hasProgress = false;

          let groupBy = this.request.sort;
          if (groupBy === 'wfCreatedDate') {
            groupBy = 'createdOn2';
          } else if (groupBy === 'deadline') {
            groupBy = 'deadline2';
          } else if (groupBy === 'type') {
            groupBy = 'actions';
          } else if (!groupBy || groupBy === 'lastItemSentOn') {
            groupBy = 'lastItemSentOn2';
          }
          d.recordGroupName = this.coreService.getRowGroupText(d, groupBy);
          if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1) {
            this.expandedRowsGroups.push(d.recordGroupName);
            this.expandedRowsGroupsSubTotal[d.recordGroupName] = 0;
          }
          this.expandedRowsGroupsSubTotal[d.recordGroupName] += 1;
        });
        if (this.recalled) {
          this.usersTabTotalCountBadge[this.request.userId] = res.totalCount;
          this.recalled = false;
        }
        this.itemsPerPage = res.pageSize;
        this.totalRecords = res.totalCount;
        this.sentWorkitems = res;
        let requestCopy = _.cloneDeep(this.request),
          propertiesToUpdate = [
            //{property: 'tabCount', value: res.totalCount},
            { property: 'lastRequest', value: requestCopy },
            { property: 'pageNo', value: requestCopy.pageNo },
            { property: 'sortField', value: this.getSortingMapFromRequest(requestCopy) },
            { property: 'sortDirection', value: this.coreService.getSortOrderValueFromText(requestCopy.order) },
            { property: 'totalRecords', value: res.totalCount }
          ];

        !this.request.exportFilter ? propertiesToUpdate.push({ property: 'tabCount', value: res.totalCount }) : null;
        this._updateTabsList(this.request.userId, propertiesToUpdate);

        //this.sentWorkitemsCopy = _.cloneDeep(res);
        this.sentWorkitems = res;
        let tab = this.tabsList[this.selectedTabIndex];
        if (tab && tab.quickFilterText) {
          this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection, (sentWorkitems) => {
            this.sentWorkitems.workitems = sentWorkitems;
          });
        }
        this.sentTieredItems.map((item, index) => {
          item.disabled = !this.sentWorkitems.workitems || this.sentWorkitems.workitems.length === 0;
        });
        if (this.advanceFilterShown) {
          this.countFiltered(res);
        } else {
          this.filterCount.total = -1;
        }

        if (this.ws.openedWorkItem) {
          if (this.request.userId === this.ws.openedWorkItem.userId) {
            this.selectedItem.push(this.ws.openedWorkItem.row);
            this.ws.openedWorkItem = undefined;
          }
        }
        localStorage.setItem('previousCount', res.totalCount);
      }, Error => {
        this.busy = false;
      });
    }
  }

  toggleFilter() {
    $('.filter').slideToggle();
  }
  archiveSentitems() {
    this.confirmationService.confirm({
      message: 'Do you want to Archive this workitem?',
      header: 'Archive Confirmation',
      key: 'filterResConfirmation',
      icon: 'ui-icon-help',
      accept: () => {
        if (this.selectedItem.length > 0) {
          let count = 0;
          this.selectedItem.map((item, index) => {
            this.subscriptions.push(this.ws.archiveSentitem(item.workitemId)
              .subscribe(data => {
                count++;
                if (this.selectedItem.length === count) {
                  this.selectedItem = [];
                  this.archiveSuccess();
                }
              }));
          });
        }
      },
      reject: () => {
      }
    });
  }

  recallSentitems() {
    this.confirmationService.confirm({
      message: 'Do you want to Recall this workitem?',
      header: 'Recall Confirmation',
      key: 'filterResConfirmation',
      icon: 'ui-icon-help',
      accept: () => {
        this.recalled = true;
        if (this.selectedItem.length > 0) {
          let count = 0;
          this.selectedItem.map((item, index) => {
            this.subscriptions.push(this.ws.recallSentitem(item.workitemId)
              .subscribe(data => {
                count++;
                if (this.selectedItem.length === count) {
                  this.sentWorkitems = {};
                  // this.growlService.showGrowl({
                  //   severity: 'info',
                  //   summary: 'Success', detail: 'Recalled Successfully'
                  // });
                  this.toastr.info('Recalled Successfully', 'Success');
                  setTimeout(() => {
                    this.getSentItems();
                    this.selectedItem = [];
                  }, 200)
                }
              }));
          });
        }
      },
      reject: () => {
      }
    });
  }

  failed(error) {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Operation Failed'
    // });
    this.toastr.error('Operation Failed', 'Failure');
  }

  exportActioned(exportType) {
    this.request.exportFilter = !!this.request.exportFilter;
    if (exportType === 'pdf') {
      this.request.exportFormat = 'pdf';
      this.busy = true;
      this.ws.exportActioned(this.request).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/pdf' });
        const fileName = 'Actioned_' + this.coreService.getDateTimeForExport() + '.pdf';
        saveAs(file, fileName);
      }, Error => {
        this.busy = false;
      });
    } else {
      this.request.exportFormat = 'xls';
      this.busy = true;
      this.ws.exportActioned(this.request).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: 'application/vnd.ms-excel' });
        const fileName = 'Actioned_' + this.coreService.getDateTimeForExport() + '.xlsx';
        saveAs(file, fileName);
      }, Error => {
        this.busy = false;
      });
    }
  }

  refreshTable(event) {
    this.request.sort = 'lastItemSentOn2';
    this.getSentItems();
  }

  openOverlayPanel(op) {
    this.overlayPanel = op;
    if (op.visible) {
      op.visible = false;
    }
    else {
      op.visible = true;
    }

  }

  selectBeforeDate(event) {
    let empNo = 0;
    let roleId = 0;
    if (this.request.userType === 'USER') {
      empNo = this.request.userId;
      roleId = 0;
    }
    else if (this.request.userType === 'ROLE') {
      empNo = 0;
      roleId = this.request.userId;
    }
    const bDate = this.coreService.getFormattedDateString(event, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    // if(this.checkDateForDisableActions(bDate)){
    //   this.showOperationNotPossible=true;
    // }
    // else {
      this.confirmationService.confirm({
        header: 'Finish?',
        key: 'filterResConfirmation',
        message: 'All Workitems sent before' + ' ' + bDate + ' ' + 'will be shifted to archived items,are you sure?',
        accept: () => {
          //Actual logic to perform a confirmation
          this.ws.archiveSentitemBefore(empNo, roleId, bDate).subscribe(dat => {
            if (dat) {
              this.archiveBeforeSuccess(dat);
            }
            else {
              this.archiveFailed();
            }
          });
        }
      });
      this.overlayPanel.visible = false;
    //}
  }

  archiveBeforeSuccess(val) {
    if (val === 'Workitems not found') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Workitems', detail: 'No workitems found..Choose a different date'
      // });
      this.toastr.error('No workitems found..Choose a different date', 'No Workitems');
    }
    else {
      const count = this.getArchiveCount(val).trim();
      let message;
      if (count === '1') {
        message = count + ' ' + 'Workitem Archived';
      }
      else {
        message = count + ' ' + 'Workitems Archived';
      }
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: message
      // });
      this.toastr.info(message, 'Success');
      this.redirectToArchive();
    }
  }

  getArchiveCount(str) {
    return str.split('-')[1];
  }

  redirectToArchive() {
    const selectedTab = this.ws.sentSelectedUserTab.split('@');
    const tabIndex = parseInt(selectedTab[0], 10);
    this.ws.archiveSelectedUserTab = (tabIndex * 2) + 1 + '@' + selectedTab[1] + 'Sent';
    //this.router.navigateByUrl('workflow/archive');
  }

  archiveSuccess() {
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Archived Successfully'
    // });
    this.toastr.info('Archived Successfully', 'Success');
    this.redirectToArchive();
  }

  archiveFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Archive Workitems'
    // });
    this.toastr.error('Failed To Archive Workitems', 'Failure');
  }

  getForOptions(EmpNo) {
    this.forOptions = [{ label: 'Select', value: null }];
    this.ws.getWorkflowActions().map((option) => {
      this.forOptions.push({ label: option.name, value: option.name })
    });
  }

  showTrackSentitem(workflowId, userType) {
    this.busy = true;
    this.ws.getWorkflowTrack(workflowId, userType).subscribe(data => {
      this.busy = false;
      if (data) {
        data.map(d => {
          d.priority = this.coreService.getPriorityString(d.priority);
          d.sentOn2 = this.coreService.getTimestampFromDate(d.sentOn, null, '/');
          d.timeStamp2 = this.coreService.getTimestampFromDate(d.timeStamp, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
        });
        this.workitemHistory = data;
        console.log(this.workitemHistory)
        console.log(this.trackColHeaders);
        
        this.showTrack = true;
      }
    }, Error => {
      this.busy = false;
    });
  }

  showTrackWorkitem(event) {
    if (event.data.details !== 'Launch') {
      this.busy = true;
      this.ws.getWorkitem(event.data.workitemId, this.user.EmpNo).subscribe(data => {
        this.busy = false;
        this.trackWorkitemDetails = data
      }, Error => {
        this.busy = false;
      });
    }
  }

  subscribeRouterEvents() {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationStart) {
        this.closeAllDialog();
      }
      if (evt instanceof NavigationEnd) {
        if (this.router.url === '/workflow/actioned') {
          this.setBreadcrumb();
          this.closeAllDialog();
        }
      }
    });
  }

  subscribeRefreshRequiredEvent() {
    this.busy = true;
    this.bs.actionedRefreshRequired.subscribe(data => {
      this.busy = false;
      if (data === 'dashboard-filter') {
        //this.clearDashboardFilter();
        this.resetAndCloseFilters(true);
        this.resetFirstAndSort = true;
        this.ngOnInit();
      }
    }, Error => {
      this.busy = false;
    });
  }

  /**
   * @description Set the breadcrumb for page
   * @param tabLabel
   */
  setBreadcrumb(tabLabel?) {
    if (tabLabel) {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Actioned' },
        { label: tabLabel }
      ])
    } else {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Actioned' },
        { label: this.user ? this.user.fulName : ' ' }
      ]);
      if (this.breadcrumbService.actionedDashboardFilterQuery) {
        this.breadcrumbService.setItems([
          { label: 'Workflow' },
          { label: 'Actioned' },
          { label: this.breadcrumbService.actionedDashboardFilterQuery.filterUserName }
        ]);
      }
    }
  }

  /**
   * @description Close all dialogs on page navigation
   */
  closeAllDialog() {
    if (this.dataTableComponent) {
      this.dataTableComponent.map((d) => {
        d.hideAllDialog();
      })
    }
    if (this.confirmDialogRef)
      this.confirmDialogRef['hide']();
    if (this.showTrackDialogRef) {
      this.showTrack = false;
      this.showTrackDialogRef['hide']();
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
    this.destroyKeys();
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      this[k] = null;
      //delete this[k];
    })
  }
  checkDateForDisableActions(date){
    let tempdate=(moment(date).format("DD/MM/YYYY"));
    return moment((tempdate), "DD/MM/YYYY").toDate() < moment((global.date_disable_action), "DD/MM/YYYY").toDate();

  }

  ngOnDestroy() {
    this.dataTableComponent.destroy();
    this.clearSubscriptions();
    this.selectedItem = [];
    this.user = undefined;
    this.emptyMessage = undefined;
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.totalRecords = undefined;
    this.sentWorkitems = {};
    this.columns = [];
    this.selectedColumns = [];
    this.actions = [];
    this.disableAction = true;
    this.selectedCount = 0;
    this.curPage = 1;
    this.selectedUser = undefined;
    this.type = undefined;
    //this.breadcrumbService.actionedDashboardFilterQuery = undefined;
    this.selectedTabIndex = 0;
    this.userTabsTotalCount = 0;
    this.roleTabsTotalCount = [];
    this.delTabsTotalCount = [];
    this.showOperationNotPossible=false;
  }
}
