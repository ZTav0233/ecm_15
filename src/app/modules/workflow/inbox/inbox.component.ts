import {
  Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener,
  ComponentRef, ViewContainerRef, ComponentFactoryResolver, Injector, ElementRef, AfterViewInit, AfterContentInit,
  OnChanges
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { WorkitemSet } from '../../../models/workflow/workitem-set.model';
import { User } from '../../../models/user/user.model';
import { SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
import { BrowserEvents } from '../../../services/browser-events.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { saveAs } from 'file-saver';
import { GrowlService } from "../../../services/growl.service";
import { FilterComponent } from "../../../components/generic-components/filter/filter.component";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { ActionButtonComponent } from "../../../components/generic-components/action-button/action-button.component";
import * as _ from "lodash";
import * as global from "../../../global.variables";
import * as moment from 'moment';
import { async } from '@angular/core/testing';
import { WorkItemAction } from '../../../models/workflow/workitem-action.model';
import { WorkflowDetails } from '../../../models/workflow/workflow-details.model';
import { ToastrService } from 'ngx-toastr';
import { OverlayPanel } from 'primeng/overlaypanel';

declare var ie11_polyfill: any;

@Component({
  selector: 'inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['../workflow.component.css']
})
export class InboxComponent implements OnInit, OnDestroy {
  @ViewChild('dateBeforePanel') overlayPanel: OverlayPanel;
  public inboxSelectedItem: any[] = [];
  public colHeaders: any[] = [
    { field: 'status', header: 'Status', hidden: true },
    { field: 'actions', header: 'For', hidden: true },
    { field: 'instructions', header: 'Instructions', hidden: true },
    { field: 'receivedDate', header: 'Received Date', hidden: true, sortField: 'receivedDate2' },
    { field: 'senderName', header: 'Sender Name', hidden: true },
    { field: 'recipientName', header: 'Recipient Name', hidden: true },
    { field: 'wfCreatorName', header: 'Created By', hidden: true },
    { field: 'deadline', header: 'Deadline', hidden: true, sortField: 'deadline2' },
    { field: 'reminder', header: 'Reminder', hidden: true, sortField: 'reminder2' }
  ];
  public itemsPerPage: any;
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
  public isAllActionsDisabled = false;
  public isRoleActive = 'ACTIVE';
  public getFromServer = false;
  public actionDisabled = false
  public isFirstLoadCall = false;
  public userGridView: any;
  public inboxWorkitems: WorkitemSet = {};
  public inboxWorkitemsCopy: WorkitemSet = {};
  public columns: any[] = [
    { label: 'Status', value: 'status' },
    { label: 'For', value: 'actions' },
    { label: 'Instructions', value: 'instructions' },
    { label: 'Received Date', value: 'receivedDate' },
    { label: 'Sender Name', value: 'senderName' },
    { label: 'Recipient Name', value: 'recipientName' },
    { label: 'Created By', value: 'wfCreatorName' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Reminder', value: 'reminder' }
  ];
  public selectedColumns: any[] = [];
  public user = new User();
  public actions: string[] = ['Finish', 'Finish Before', 'Reply', 'Reply-All', 'Forward', 'Relaunch', 'Flag'];
  advanceFilterShown = false;
  action = new FormControl();
  public selectedAction: any;
  emptyMessage: string = globalv.no_workitem_found;
  public disableAction = true;
  selectedUser: any;
  displayProgress = false;
  type: any;
  public selectedCount = 0;
  public selectedTabIndex = 0;
  public inboxPreviousSelectedTab: any;
  username: any;
  beforeDate: Date;
  dateBeforeOverlayPanel: any;
  filterQuery: any;
  filterCount: any;
  request: any = { pageNo: 1 };
  public dashboardSearchQuery: any[] = [];
  public sender: SelectItem[] = [];
  public dashboardFilter = false;
  public inboxTieredItems: any[] = [
    {
      label: 'Export',
      icon: 'fa fa-fw ui-icon-assignment-returned',
      disabled: false,
      items: [
        {
          label: 'PDF',
          icon: 'fa fa-fw ui-icon-description', command: (event) => {
            this.exportInbox('pdf');
          }
        },
        {
          label: 'Excel',
          icon: 'fa fa-fw ui-icon-assignment', command: (event) => {
            this.exportInbox('excel');
          }
        }
      ]
    }];
  public busy: boolean;
  public subscriptions: Subscription[] = [];
  public usersTabTotalCountBadge: any[] = [];
  public showDelegationInactiveDialog = false;
  @ViewChildren(FilterComponent) filterComponent: QueryList<FilterComponent>;
  @ViewChildren(DataTableComponent) dataTableComponent: QueryList<DataTableComponent>;
  public selectedWorkitem: any = {};
  public forOptions: any[];
  public resetFirstAndSort = false;
  private currentUser = new User();
  public defaultSortField;
  public defaultSortOrder;
  public expandedRowsGroups: string[] = [];
  public expandedRowsGroupsSubTotal = [];
  public tabsList: any[] = [];
  @ViewChild('inboxConfirmation') confirmDialogRef: ElementRef;
  @ViewChild('progressDialog') progressDialogRef: ElementRef;
  @ViewChild('delegationMsgDialog') delegationMsgDialogRef: ElementRef;
  @ViewChildren('matMultiSelect') matMultiSelect; //To close column multi select overlay panel
  public inactiveDialogMessage = 'Delegated user access has ended';
  public progressObj = {};
  sentItemId: any;
  public fromPage: any;
  public isAllRecalled: any;
  public showRecallInactiveDialog = false;
  public showOperationNotPossible = false;
  public showItemDialogue = false;
  public showItemDialogueDetails: any;
  public today = new Date();
  userSetting = [];
  public messageDenyAction: any;

  constructor(private breadcrumbService: BreadcrumbService, private ws: WorkflowService, private route: ActivatedRoute,
    private toastr: ToastrService,
    private us: UserService, private bs: BrowserEvents, public coreService: CoreService,
    private confirmationService: ConfirmationService, public router: Router, private growlService: GrowlService) {
    this.subscribeRouterEvents();
    this.subscribeRefreshRequiredEvent();
  }
  ngOnInit() {
    let isOnInitCall = !this.resetFirstAndSort;
    this.isFirstLoadCall = true;
    this.getUserSetting();
    this.closeAllDialog();
    this.itemsPerPage = this.us.pageSize;
    this.userGridView = this.gridViewOptions.grouped.value;
    this.inboxSelectedItem = [];
    this.filterCount = {
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
    this.coreService.displayProgress = false;
    this.showDelegationInactiveDialog = false;
    this.selectedUser = undefined;
    this.type = undefined;
    this.selectedColumns = ['status', 'actions', 'receivedDate', 'senderName', 'deadline'];

    this.user = null;
    // get user details
    this.busy = true;
    this.us.logIn(globalv.username, 'def').subscribe(loginData => {
      this.busy = false;
      this.us.setCurrentUser(loginData);
      this.user = loginData;
      this.ws.getTabsCounter(this.user.EmpNo, 'inbox').subscribe(counterData => {
        this._setTabsList(counterData);
        this._setDashboardQueryAndTabChange(isOnInitCall);
      });


      this.getForOptions(this.user.EmpNo);
    }, Error => {
      this.busy = false;
      localStorage.removeItem('user');
      this.router.navigate(['/auth/auth-failure']);
    });
  }

  getUserSetting() {
    this.us.getUserSettings().subscribe(async result => {
      console.log(result);

      this.userSetting = result;
      let isFound = false;


      for (const setting of this.userSetting) {
        if (setting.key === 'Inbox Selected Columns') {
          isFound = true;
          if (setting.val) {
            let inboxSelectedColumns = JSON.parse(setting.val);

            this.selectedColumns = inboxSelectedColumns
            this.columnSelectionChanged(null);
          } else {
            this.columnSelectionChanged(null);
          }
        }
      }
      if (!isFound) {
        this.columnSelectionChanged(null);
      }

    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToInbox') {
      console.log('refreshTable called from icn ' + this.ws.inboxMenu.badge);
      //this.refreshTable();
    }
  }

  getWorkitemProgress() {
    this.busy = true;
    this.ws.getWorkitemProgress(this.selectedWorkitem.workitemId).subscribe(res => {
      this.busy = false;
      res.map(r => {
        if (r.empNo === this.user.EmpNo) {
          r.from = true;
        }
      });
      this.selectedWorkitem.progress = res;
      this.coreService.displayProgress = true;
      this.progressObj = {};
    }, Error => {
      this.busy = false;
    });
  }

  addWorkitemProgress(event) {
    this.busy = true;
    this.ws.addWorkitemProgress(event.message, this.user.EmpNo, this.selectedWorkitem.workitemId).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Workitem Progress Added Successfully'
      // });
      this.toastr.info('Workitem Progress Added Successfully', 'Success');
      event = {};
      this.getWorkitemProgress();
      this.refreshTable();
    }, err => {
      this.busy = false;
    });
  }

  removeWorkitemProgress(id) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      header: 'Remove Confirmation',
      key: 'inboxConfirmation',
      accept: () => {
        this.deleteWorkitemProgress2(id);
      }
    });
  }

  deleteWorkitemProgress2(id) {
    this.busy = true;
    this.ws.removeWorkitemProgress(id).subscribe(res => {
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

  /**
   * @description get sender name for filter dropdown
   * @param id
   * @param userType
   */
  getFilterSenderOptions(id, userType) {
    this.sender = [];
    this.busy = true;
    this.ws.getInboxFilterUsers(id, userType, 'active').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.sender.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, Error => {
      this.busy = false;
    });
  }

  private _filterRecords(filterText, sortField, sortOrder, cb?) {
    this.request.sort = sortField;
    this.request.order = this.coreService.getSortOrderText(sortOrder, true);
    this.setDefaultSort(sortField, sortOrder);
    this._getSubjectFilteredFromServer(filterText, (inboxWorkItems) => {
      if (cb)
        cb(inboxWorkItems)
    });
  }

  private _getSubjectFilteredFromServer(filterText, cb?) {
    if (filterText.length > 2) {
      this.request.repStatus = 'active';
      let requestCopyForSubject = _.cloneDeep(this.request);
      requestCopyForSubject.subject = filterText;
      this.busy = true;
      this.ws.searchInbox(requestCopyForSubject).subscribe(res => {
        this.busy = false;
        this.inboxSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map((d) => {
          d.priority = this.coreService.getPriorityString(d.priority);
          d.receivedDate2 = this.coreService.getTimestampFromDate(d.receivedDate, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.reminder2 = this.coreService.getTimestampFromDate(d.reminder, null, '/');
          if (!d.hasOwnProperty('hasProgress'))
            d.hasProgress = false;

          let groupBy = this.request.sort;
          if (groupBy === 'deadline') {
            groupBy = 'deadline2';
          } else if (groupBy === 'reminder') {
            groupBy = 'reminder2';
          } else if (!groupBy || groupBy === 'createdDate') {
            groupBy = 'receivedDate2';
          }
          d.recordGroupName = this.coreService.getRowGroupText(d, groupBy);
          if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1) {
            this.expandedRowsGroups.push(d.recordGroupName);
            this.expandedRowsGroupsSubTotal[d.recordGroupName] = 0;
          }
          this.expandedRowsGroupsSubTotal[d.recordGroupName] += 1;
          d.progress = 'progress';
          d.isNew = (d.status.toLowerCase().trim() === 'new');
        }
        );
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

        this.inboxTieredItems.map((item, index) => {
          item.disabled = !res.workitems || res.workitems.length === 0;
        });
        if (cb)
          cb(res.workitems);
      }, Error => {
        this.busy = false;
      });
    }
  }

  assignSortNotPaginationInfo(data) {
    console.log(data, 'data');

    if (this.user) {
      if (!data || !data.rows) {
        return;
      }
      this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
      if (data && data.filters.subject?.value && data.filters.subject?.value?.trim() && data.filters.subject?.value?.trim().length > 2) {
        this._filterRecords(data.filters.subject?.value.trim(), data.sortField, data.sortOrder, (inboxWorkitems) => {
          this.inboxWorkitems.workitems = inboxWorkitems;
        });
        return;
      } else if (data && data.filters.subject?.value && data.filters.subject?.value?.trim() && data.filters.subject?.value?.trim().length <= 2) {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Message', detail: "Please enter more than 2 characters to filter"
        // });
        this.toastr.info('Please enter more than 2 characters to filter', 'Message');
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

      //if(!this.isFirstLoadCall)
      this.searchInbox();
    }
  }

  /**
   * @description Change the sorting field names for sending to backend service
   * @param sortField
   */
  getSortingMapToRequest(sortField) {
    sortField = sortField && sortField.hasOwnProperty('sortField') ? sortField.sortField : sortField;
    if (sortField === 'receivedDate2') {
      this.request.sort = 'createdDate';
    } else if (sortField === 'deadline2') {
      this.request.sort = 'deadline';
    } else if (sortField === 'reminder2') {
      this.request.sort = 'reminder';
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
      return 'receivedDate2';
    }

    if (sortBy == 'createdDate') {
      return 'receivedDate2';
    } else if (sortBy == 'deadline') {
      return 'deadline2';
    } else if (sortBy == 'reminder') {
      return 'reminder2';
    } else {
      return sortBy;
    }
  }

  searchInbox(fromFilter = false) {
    fromFilter ? this.resetFirst() : null;
    if (this.user) {
      this.request.repStatus = 'active';
      this.busy = true;
      this.ws.searchInbox(this.request).subscribe(res => {
        this.busy = false;
        this.inboxSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map((d) => {
          d.priority = this.coreService.getPriorityString(d.priority);
          d.receivedDate2 = this.coreService.getTimestampFromDate(d.receivedDate, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.reminder2 = this.coreService.getTimestampFromDate(d.reminder, null, '/');
          if (!d.hasOwnProperty('hasProgress'))
            d.hasProgress = false;

          let groupBy = this.request.sort;
          if (groupBy === 'deadline') {
            groupBy = 'deadline2';
          } else if (groupBy === 'reminder') {
            groupBy = 'reminder2';
          } else if (!groupBy || groupBy === 'createdDate') {
            groupBy = 'receivedDate2';
          }
          d.recordGroupName = this.coreService.getRowGroupText(d, groupBy);
          if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1) {
            this.expandedRowsGroups.push(d.recordGroupName);
            this.expandedRowsGroupsSubTotal[d.recordGroupName] = 0;
          }
          this.expandedRowsGroupsSubTotal[d.recordGroupName] += 1;
          d.progress = 'progress';
          /*const oneDay = 24 * 60 * 60 * 1000;
          const tod = new Date();
          const arrDate = d.receivedDate.split('/');
          const rec = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2]);
          const diffDays = Math.round(Math.abs((tod.getTime() - rec.getTime()) / (oneDay)));
          d.daysleft = diffDays;*/
          d.isNew = (d.status.toLowerCase().trim() === 'new');
        });
        this.itemsPerPage = res.pageSize;
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

        this.inboxWorkitemsCopy = _.cloneDeep(res);
        this.inboxWorkitems = res;
        let tab = this.tabsList[this.selectedTabIndex];

        if (tab && tab.quickFilterText && tab.quickFilterText.trim().length > 2) {
          this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection, (inboxWorkitems) => {
            this.inboxWorkitems.workitems = inboxWorkitems;
          });
        }
        else if (tab && tab.quickFilterText && tab.quickFilterText.trim().length < 3) {
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Message', detail: "Please enter more than 2 characters to filter"
          // });
          this.toastr.info('Please enter more than 2 characters to filter', 'Message');
        }

        this.inboxTieredItems.map((item, index) => {
          item.disabled = !this.inboxWorkitems.workitems || this.inboxWorkitems.workitems.length === 0;
        });
        if (this.advanceFilterShown) {
          this.countFiltered(res);
        } else {
          this.filterCount.total = -1;
        }

        if (this.ws.openedWorkItem) {
          if (this.request.userId === this.ws.openedWorkItem.userId) {
            this.inboxSelectedItem.push(this.ws.openedWorkItem.row);
            this.ws.openedWorkItem = undefined;
          }
        }
        localStorage.setItem('previousCount', res.totalCount);
      }, Error => {
        this.busy = false;
      });
    }
  }

  /**
   * @description returns count to show filter statistics
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

  getData(data: any) {
    this.inboxSelectedItem = data;
    this.actionDisabled = false;
    if (this.inboxSelectedItem) {
      if (this.inboxSelectedItem.length > 0) {
        this.disableAction = false;
        this.selectedCount = this.inboxSelectedItem.length;

        if (this.inboxSelectedItem.length == 1) {
          this.isAllActionsDisabled = this.checkDateForDisableActions(this.inboxSelectedItem[0].createdOn);
          if (this.inboxSelectedItem[0].openedWorkItem && this.inboxSelectedItem[0].openedWorkItem.userId && this.tabsList[this.selectedTabIndex].tabType === 'ROLE') {
            this.us.getRoleById(this.inboxSelectedItem[0].roleId, '').subscribe(d => {
              this.isRoleActive = d.status;
            })
          }
          else {
            this.isRoleActive = 'ACTIVE';
          }
        }

        if (this.inboxSelectedItem.length == 1) {
          this.actionDisabled = this.inboxSelectedItem[0].actions == 'Initial' || this.inboxSelectedItem[0].actions == 'Signature' ? true : false
        } else {
          for (let i = 0; i < this.inboxSelectedItem.length; i++) {
            if (this.inboxSelectedItem[i].actions == 'Initial' || this.inboxSelectedItem[i].actions == 'Signature') {
              this.actionDisabled = true;
              break;
            }
          }
        }
      } else {
        this.disableAction = true;
        this.selectedCount = 0;
      }
    }
  }

  /**
   * @description sets default sort and order to the grid
   * @param sortField
   * @param sortOrder
   */
  setDefaultSort(sortField = 'receivedDate2', sortOrder = -1) {
    this.defaultSortField = sortField;
    this.defaultSortOrder = sortOrder;
  }

  /**
   * @description sets default sort and order to the request
   * @param sortField
   * @param sortOrder
   */
  setDefaultSortInRequest(sortField = 'receivedDate2', sortOrder = -1) {
    this.request.sort = this.getSortingMapToRequest(sortField);
    this.request.order = this.coreService.getSortOrderText(sortOrder);
  }

  /**
   * @description clear dashboard filter, reset page no and filter model
   */
  clearDashboardFilter() {
    this.inboxSelectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.advanceFilterShown = false;
    this.resetFirst();
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
  }

  /**
   * @description Reset filter and clear the filter criteria and search again
   * @param skipSearchInbox
   */
  resetAndCloseFilters(skipSearchInbox = false) {
    this.inboxSelectedItem = [];
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
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
    this.isFirstLoadCall = false;
    this.breadcrumbService.dashboardFilterQuery = undefined;
    if (!skipSearchInbox) {
      this.searchInbox();
    }
  }

  /**
   * @description reset filter for all grids
   */
  resetFilterModel() {
    if (this.filterComponent) {
      this.filterComponent.map(r => {
        r.resetFilter();
      });
      this.request.recipientName = undefined;
    }
  }

  getFilterToggle(data: any) {
    this.advanceFilterShown = !this.advanceFilterShown;
    if (this.request.exportFilter) {
      this.advanceFilterShown = true;
    }
    this.getFilterSenderOptions(this.request.userId, this.request.userType);
    this.toggleFilter();
  }

  getSelectedAction(data: any, op) {
    if (this.ws.delegateId && this.ws.delegateId > 0) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.showDelegationInactiveDialog = true;
        } else {
          if (data === 'Finish') {
            this.finishWorkitems();
          } else if (data === 'Finish Before') {
            console.log(op);

            this.openOverlayPanel(op);
          } else if (data === 'Reply') {
            this.replyWorkitem(op);
          } else if (data === 'Reply-All') {
            this.replyAllWorkitem(op);
          } else if (data === 'Forward') {
            this.forwardWorkitem(op);
          } else if (data === 'Relaunch') {
            this.relaunchWorkItem(op);
          } else if (data === 'Flag') {
            this.updateFlag(op);
          }
        }
      });
    } else {
      if (data === 'Finish') {
        this.finishWorkitems();
      } else if (data === 'Finish Before') {
        console.log(op);
        this.openOverlayPanel(op);
      } else if (data === 'Reply') {
        this.replyWorkitem(op);
      } else if (data === 'Reply-All') {
        this.replyAllWorkitem(op);
      } else if (data === 'Forward') {
        this.forwardWorkitem(op);
      } else if (data === 'Relaunch') {
        this.relaunchWorkItem(op);
      } else if (data === 'Flag') {
        this.updateFlag(op);
      }
    }
  }


  updateFlag(record) {
    // if (this.activePage != 'sent') {
    // console.log(this.inboxSelectedItem[0])
    let url = '/WorkflowService/flagWorkitem'
    if (this.inboxSelectedItem[0].isFlag) {
      url = '/WorkflowService/unFlagWorkitem'
    }

    if (this.inboxSelectedItem.length > 0) {
      let count = 0;
      this.inboxSelectedItem.map((item, index) => {
        this.busy = true;
        this.ws.updateFlag(url, item.workitemId).subscribe(res1 => {
          this.busy = false;
          count++;
          if (this.inboxSelectedItem.length === count) {
            this.inboxSelectedItem = [];
            this.flagSuccess();
          }
        }, Error => {
          this.busy = false;
          this.flagFailed()
        });
        //this.refreshTabList();
      });
    }

    /* this.ws.updateFlag(url,this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success',
        detail: 'Flag Updated Successfully'
      }); 

      this.refreshTabList();
    });*/
    // }
  }

  flagSuccess() {
    window.parent.postMessage('FlagSuccess', '*');
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Flag Updated Successfully'
    // });
    this.toastr.info('Flag Updated Successfully', 'Success');
    this.resetCurrentTableSortAndRefresh();
    // this.redirectToArchive();
  }

  flagFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Flag Workitems'
    // });
    this.toastr.error('Failed To Flag Workitems', 'Failure');
  }

  refreshTabList() {
    let workitems = this.inboxWorkitems.workitems;
    console.log("this.inboxWorkitems")
    console.log(this.inboxWorkitems)
    console.log(this.inboxSelectedItem)
    for (let i = 0; i < workitems.length; i++) {
      let tab = workitems[i];
      if (tab.workitemId === this.inboxSelectedItem[0].workitemId) {
        // check if propertyToUpdate is array or single object
        workitems[i].isFlag = !workitems[i].isFlag;
        this.inboxWorkitems.workitems = workitems;
        break;
      }
    }
  }

  refresh() {
    throw new Error('Method not implemented.');
  }

  columnSelectionChanged(event: any) {
    console.log(event);
    if (event) {
      this.selectedColumns = event

      for (const tableHead of this.colHeaders) {
        tableHead.hidden = true;
      }
      for (const column of this.selectedColumns) {
        for (const tableHead of this.colHeaders) {
          if (tableHead.field === column.field) {
            tableHead.hidden = false;
          }
        }
      }
      this.updateGeneralSetting();
    } else {
      for (const tableHead of this.colHeaders) {
        tableHead.hidden = true;
      }
      for (const column of this.selectedColumns) {
        for (const tableHead of this.colHeaders) {
          if (tableHead.field === column.field) {
            tableHead.hidden = false;
          }
        }
      }
      this.updateGeneralSetting()
    }
  }

  updateGeneralSetting() {
    let isFound = false;
    for (const setting of this.userSetting) {
      if (setting.key === 'Inbox Selected Columns') {
        isFound = true;
        setting.val = JSON.stringify(this.selectedColumns)
      }
    }
    if (!isFound) {
      this.userSetting.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Inbox Selected Columns',
        'val': JSON.stringify(this.selectedColumns)
      });
    }
    this.us.updateUserSettings(this.userSetting).subscribe(val => {
      this.busy = false;
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description reset first in datatable component to reset page no
   */
  resetFirst() {
    if (this.dataTableComponent) {
      /*this.dataTableComponent.map(r => {
        r.resetFirst();
      });*/
      this.dataTableComponent.forEach(dtComponent => {
        if (dtComponent.tabNameIdentifier === this.ws.inboxSelectedUserTab) {
          dtComponent.resetFirst();
        }
      });
    }
  }

  inboxGridTabChange(textLabel, index, reset, isOnInitCall, fromGrid?) {
    this.isFirstLoadCall = isOnInitCall;
    const selectedIndex = this.ws.inboxSelectedUserTab && this.ws.inboxSelectedUserTab.split('@');
    // console.log(selectedIndex, 'selectedIndex');
    if (!this.request.exportFilter || (this.request.exportFilter && selectedIndex && selectedIndex.length && index != selectedIndex[0])) {
      this.inboxTabChange(textLabel, index, reset, isOnInitCall);
    }
  }

  inboxTabChange(textLabel, index, reset, isOnInitCall = false) {
    this.resetFilterModel();

    this.selectedTabIndex = index;
    this.ws.inboxSelectedUserTab = this.selectedTabIndex + '@' + textLabel;
    this.inboxSelectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.disableAction = true;
    this.setBreadcrumb(textLabel);

    let tabData = this.tabsList[index];
    this.setDefaultSortInRequest(tabData.sortField, tabData.sortDirection);

    if (!isOnInitCall) {
      if (tabData && tabData.lastRequest) {
        this.advanceFilterShown = tabData.lastRequest.exportFilter;
        if (this.advanceFilterShown) {
          $('.filter').slideDown();
        } else {
          $('.filter').slideUp();
        }
        if (tabData.userRoleDelegate === 'delegate') {
          this.us.validateDelegation(tabData.delegationId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.showDelegationInactiveDialog = true;
            } else {
              this.ws.delegateId = tabData.delegationId;
              this.ws.delegateEmpNo = tabData.recordId;
            }
          });
        } else {
          this.ws.delegateId = null;
          this.ws.delegateEmpNo = null;
        }
        if (tabData.userRoleDelegate === 'role') {
          this.us.validateRole(tabData.recordId).subscribe(res => {
            if (res === 'INACTIVE' && tabData.status === 'ACTIVE') {
              this.showDelegationInactiveDialog = true;
            } else {
              this.ws.roleId = tabData.recordId;
            }
          });
        } else {
          this.ws.roleId = null;
        }
        this.request = tabData.lastRequest;

        this.searchInbox();
      } else {
        this.advanceFilterShown = this.dashboardFilter || false;
        if (this.advanceFilterShown) {
          $('.filter').slideDown();
        } else {
          $('.filter').slideUp();
        }
        this.interceptRequestAndGetData(textLabel, reset, isOnInitCall);
      }
    } else {
      this.advanceFilterShown = false;
      $('.filter').slideUp();
      this.setDefaultSort();
      this.interceptRequestAndGetData(textLabel, reset, isOnInitCall);
    }
  }

  interceptRequestAndGetData(textLabel, reset, isOnInitCall) {
    if (this.user.roles && this.user.roles.length > 0) {
      for (const role of this.user.roles) {
        if (role.name === textLabel) {
          this.request.userType = 'ROLE';
          this.request.userId = role.id;
          this.request.empNo = this.user.EmpNo;
          this.request.recipientName = undefined;
          this.ws.delegateId = undefined;
          this.ws.delegateEmpNo = undefined;
          this.ws.roleId = role.id;
        }
      }
    }
    for (const delegate of this.user.delegated) {
      if (delegate.delName === textLabel) {
        this.request.userType = 'USER';
        this.request.userId = delegate.userId;
        this.request.recipientName = undefined; //'USER:' + delegate.userId;
        this.request.empNo = this.user.EmpNo;

        this.us.validateDelegation(delegate.id).subscribe(res => {
          if (res === 'INACTIVE') {
            this.showDelegationInactiveDialog = true;
          }
        });
        this.ws.delegateId = delegate.id;
        this.ws.delegateEmpNo = delegate.userId;
        this.ws.roleId = undefined;
      }
    }
    if (this.user.fulName === textLabel) {
      this.request.userType = 'USER';
      this.request.userId = this.user.EmpNo;
      this.request.recipientName = undefined; //'USER:' + this.user.EmpNo;
      this.request.empNo = this.user.EmpNo;
      this.ws.delegateId = undefined;
      this.ws.delegateEmpNo = undefined;
      this.ws.roleId = undefined;
    }
    if (!this.dashboardFilter) {
      if (!reset && this.inboxPreviousSelectedTab && this.ws.pageNoSelected > 0 && this.ws.pageNoSelected !== undefined) {
        this.request.pageNo = this.ws.pageNoSelected;
      } else {
        this.ws.pageNoSelected = 0;
      }
      if (!isOnInitCall)
        setTimeout(() => {
          //console.log(this.request, "dfsd")
          this.searchInbox();
        }, 2000)
    }
    this.dashboardFilter = false;
  }

  toggleFilter() {
    $('.filter').slideToggle();
  }

  /**
   * @description Finish the selected workItems
   */
  finishWorkitems() {
    let msg = "Do you want to Finish this workitem?";
    // if (this.inboxSelectedItem.length > 1) {
    //   this.messageDenyAction='Please select only one item to proceed';
    //   this.showOperationNotPossible=true;
    //   return;
    //   //msg = "Do you want to Finish these " + this.inboxSelectedItem.length + " workitems?";
    // }
    this.confirmationService.confirm({
      message: msg,
      header: 'Finish Confirmation',
      key: 'inboxConfirmation',
      icon: 'fa fa-fw ui-icon-help',
      accept: () => {
        if (this.inboxSelectedItem.length === 1) {
          this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
            if (res1 === 'INACTIVE') {
              this.showRecallInactiveDialog = true;
            } else {
              const bDate = this.coreService.getFormattedDateString(this.inboxSelectedItem[0].receivedDate2, this.coreService.dateTimeFormats.DDMMYYYY, '/');
              if (this.checkDateForDisableActions(bDate)) {
                this.messageDenyAction = 'This item cannot be finished';
                this.showOperationNotPossible = true;
              }
              else {
                this.finishProceed();
              }
            }
          });
        }
        else if (this.inboxSelectedItem.length > 1) {
          this.finishProceed();
        }

      },
      reject: () => {
      }
    });
  }

  finishProceed() {
    if (this.inboxSelectedItem.length > 0) {
      let count = 0;
      this.inboxSelectedItem.map((item, index) => {
        this.busy = true;
        this.ws.finishWorkitem(item.workitemId).subscribe(data => {
          this.busy = false;
          count++;
          if (this.inboxSelectedItem.length === count) {
            let totalCount = this.tabsList[this.selectedTabIndex].tabCount - this.inboxSelectedItem.length;
            this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }]);
            this.inboxSelectedItem = [];
            this.finishSuccess();
          }
        }, Error => {
          this.busy = false;
          this.finishFailed()
        });
      });
    }
  }

  /**
   * @description Export the grid data to pdf/xsls
   * @param exportType
   */
  exportInbox(exportType) {
    this.request.exportFilter = !!this.request.exportFilter;
    this.request.repStatus = "active";
    let exportMimeType, extension;
    if (exportType === 'pdf') {
      this.request.exportFormat = "pdf";
      exportMimeType = 'application/pdf';
      extension = '.pdf';
    } else {
      this.request.exportFormat = "xls";
      exportMimeType = 'application/vnd.ms-excel';
      extension = '.xlsx';
    }
    this.busy = true;
    this.ws.exportInbox(this.request).subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: exportMimeType });
      const fileName = 'Inbox_' + this.coreService.getDateTimeForExport() + extension;
      saveAs(file, fileName);
    }, Error => {
      this.busy = false;
    });
  }

  /**
   * @description Refresh the grid data
   */
  refreshTable() {
    if (this.ws.inboxSelectedUserTab) {
      this.inboxPreviousSelectedTab = this.ws.inboxSelectedUserTab.split('@');
      let propertiesToUpdate = [
        { property: 'sortField', value: 'receivedDate2' },
        { property: 'lastRequest.sort', value: this.getSortingMapToRequest('receivedDate2') },
        { property: 'pageNo', value: 1 },
        { property: 'lastRequest.pageNo', value: 1 },
        { property: 'sortDirection', value: -1 },
        { property: 'lastRequest.order', value: this.coreService.getSortOrderText(-1, true) }
      ];
      this._updateTabsList(this.request.userId, propertiesToUpdate);
      this.inboxTabChange(this.inboxPreviousSelectedTab[1], this.inboxPreviousSelectedTab[0], false);
    }
  }

  /**
   * @description Reset the current table sorting and refresh the table
   */
  resetCurrentTableSortAndRefresh() {
    this.dataTableComponent.forEach(dtComponent => {
      if (dtComponent.tabNameIdentifier === this.ws.inboxSelectedUserTab) {
        dtComponent.refresh();
      }
    });
  }

  openOverlayPanel(op: any) {
    // console.log(op);
    // this.dateBeforeOverlayPanel = op;
    // op.visible = !op.visible;
    this.overlayPanel.toggle(event);
  }

  selectBeforeDate(event) {
    let empNo = 0, roleId = 0;
    if (this.request.userType === 'USER') {
      empNo = this.request.userId;
      roleId = 0;
    } else if (this.request.userType === 'ROLE') {
      empNo = 0;
      roleId = this.request.userId;
    }
    const bDate = this.coreService.getFormattedDateString(event, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    // if(this.checkDateForDisableActions(bDate)){
    //   this.disableActionBefore=true;
    // }
    // else{
    this.confirmationService.confirm({
      header: 'Finish?',
      key: 'inboxConfirmation',
      message: 'All Workitems received before' + ' ' + bDate + ' ' + 'will be shifted to archived items,are you sure?',
      accept: () => {
        //Actual logic to perform a confirmation
        this.ws.finishWorkitemBefore(empNo, roleId, bDate).subscribe(val => this.finishBeforeSuccess(val), error => this.finishFailed());

      }

    });
    //this.dateBeforeOverlayPanel.visible = false;
    // }

  }

  finishBeforeSuccess(val) {
    window.parent.postMessage('FinishSuccess', '*');
    if (val === 'Workitems not found') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Workitems', detail: 'No workitems found..Choose a different date'
      // });
      this.toastr.error('No workitems found..Choose a different date', 'No Workitems');
    } else {
      const count = this.getArchiveCount(val.trim());
      let message;
      if (count === '1') {
        message = count + ' ' + 'Workitem Finished';
      } else {
        message = count + ' ' + 'Workitems Finished';
      }
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: message
      // });
      this.toastr.info(message, 'Success');
      //this.redirectToArchive();
      let totalCount = this.tabsList[this.selectedTabIndex].tabCount - parseInt(count, 10);
      this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }]);
      this.resetCurrentTableSortAndRefresh();
    }
  }

  redirectToArchive() {
    const selectedTab = this.ws.inboxSelectedUserTab.split('@');
    const tabIndex = parseInt(selectedTab[0], 10);
    this.ws.archiveSelectedUserTab = tabIndex * 2 + '@' + selectedTab[1] + 'Inbox';
    //this.router.navigateByUrl('workflow/archive');
  }

  finishSuccess() {
    window.parent.postMessage('FinishSuccess', '*');
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Finished Successfully'
    // });
    this.toastr.info('Finished Successfully', 'Success');
    this.resetCurrentTableSortAndRefresh();
    // this.redirectToArchive();
  }

  finishFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Finish Workitems'
    // });
    this.toastr.info('Failed To Finish Workitems', 'Failure');
  }

  getArchiveCount(str) {
    return str.split('-')[1];
  }

  /**
   * @description Show the progress dialog
   * @param event
   */
  showProgressDialogue(event) {
    if (!this.selectedWorkitem.workitemId) {
      this.selectedWorkitem.workitemId = event;
    }
    this.ws.validateWorkitem(this.selectedWorkitem.workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.selectedWorkitem = {};
        this.selectedWorkitem.workitemId = event;
        this.getWorkitemProgress();
      }
    });
  }
  listItemDialogue(ev: any) {
    console.log(ev);
    this.showItemDialogue = true
    this.showItemDialogueDetails = ev;
  }

  /**
   * @description Hide the progress dialog
   */
  hideDisplayProgress() {
    this.coreService.displayProgress = false;
  }

  /**
   * @description Reload the application after delegation end
   */
  reloadApp() {
    this.showDelegationInactiveDialog = false;
    //window.location.reload(true);
    window.parent.postMessage('DelegationEndReload', '*');
  }

  /**
   * @description Get for options for filter dropdown
   * @param EmpNo
   */
  getForOptions(EmpNo) {
    this.forOptions = [{ label: 'Select', value: null }];
    this.ws.getWorkflowActions().map((option) => {
      this.forOptions.push({ label: option.name, value: option.name })
    });
  }

  /**
   * @description Set the dashboard query filter(if exists) and hit tab change
   * @param isOnInitCall
   * @private
   */
  async _setDashboardQueryAndTabChange(isOnInitCall) {
    if (this.breadcrumbService.dashboardFilterQuery && this.breadcrumbService.dashboardFilterQuery.filterStatus !== 'Actioned') {
      this.dashboardFilter = true;
      const id = this.breadcrumbService.dashboardFilterQuery.filterUserId;
      this.dashboardSearchQuery[id] = this.breadcrumbService.dashboardFilterQuery;
      this.inboxTabChange(this.dashboardSearchQuery[id].filterUserName, this.dashboardSearchQuery[id].filterActiveTabIndex, false, isOnInitCall);
    } else {
      if (this.ws.inboxSelectedUserTab) {
        this.inboxPreviousSelectedTab = this.ws.inboxSelectedUserTab.split('@');
        this.inboxTabChange(this.inboxPreviousSelectedTab[1], this.inboxPreviousSelectedTab[0], false, isOnInitCall);
      } else {
        for (let i = 0; i < this.userSetting.length; i++) {
          if (this.userSetting[i].key == 'Default Tab') {
            if (this.userSetting[i].val == '' && this.user.roles.length > 0) {
              this.inboxTabChange(this.user.roles[0].name, 1, false, isOnInitCall);
            } else if (this.userSetting[i].val != '') {
              // console.log(this.userSetting[i].val)
              await this.activateSelectedTab(Number(this.userSetting[i].val), isOnInitCall)
            } else if (this.user) {
              this.inboxTabChange(this.user.fulName, 0, false, isOnInitCall);
            }
            break;
          }
        }


        // if (this.user.roles.length > 0) {
        //   this.inboxTabChange(this.user.roles[0].name, 1, false, true);
        // } else if (this.user) {
        //   this.inboxTabChange(this.user.fulName, 0, false, isOnInitCall);
        // }
      }



    }
  }

  activateSelectedTab(selectedTab, isOnInitCall) {
    if (this.user.EmpNo == selectedTab) {
      this.inboxTabChange(this.user.fulName, 0, false, true);
    } else if (this.user.roles && this.user.roles.length > 0) {
      for (let i = 0; i < this.user.roles.length; i++) {
        console.log(this.user.roles[i].id == selectedTab);
        if (this.user.roles[i].id == selectedTab) {
          this.inboxTabChange(this.user.roles[i].name, i + 1, false, true);
          break;
        }

        if (i == this.user.roles.length - 1) {
          if (this.user.delegated && this.user.delegated.length > 0) {
            for (let j = 0; j < this.user.delegated.length; j++) {
              console.log(this.user.delegated[j].id == selectedTab);

              if (this.user.delegated[j].id == selectedTab) {
                this.inboxTabChange(this.user.delegated[j].delName, (this.user.roles.length + 1) + j, false, true);
              }
            }
          } else if (this.user) {
            this.inboxTabChange(this.user.fulName, 0, false, true);
          }
        }
      }
    } else {
      if (this.user.delegated && this.user.delegated.length > 0) {
        for (let j = 0; j < this.user.delegated.length; j++) {
          console.log(this.user.delegated[j].id == selectedTab);

          if (this.user.delegated[j].id == selectedTab) {
            this.inboxTabChange(this.user.delegated[j].delName, (this.user.roles.length + 1) + j, false, true);
          }
        }
      } else if (this.user) {
        this.inboxTabChange(this.user.fulName, 0, false, true);
      }
    }
  }

  /**
   * @description Create a tabs list
   * Tab contains recordId, tabLabel, tabType, tabType, tabCount, tabIdentifier
   * @private
   */
  private _setTabsList(tabsCounter) {
    this.tabsList = [];
    let user = this.user, roleCounter, delegateCounter;
    this.tabsList.push({
      recordId: user.EmpNo,
      tabLabel: user.fulName,
      tabType: 'USER',
      gridType: 'inbox',
      userRoleDelegate: 'user',
      delegationId: null,
      tabCount: tabsCounter.userCount,
      tabIdentifier: 0 + '@' + user.fulName,
      sortField: 'receivedDate2',
      sortDirection: -1,
      totalRecords: tabsCounter.userCount,
      quickFilterText: ''
    });
    for (let i = 0; i < user.roles.length; i++) {
      roleCounter = _.find(tabsCounter.roles, function (role) {
        return role.roleId === user.roles[i].id;
      }).wiCount;
      this.tabsList.push({
        recordId: user.roles[i].id,
        tabLabel: user.roles[i].name,
        tabType: 'ROLE',
        gridType: 'inbox',
        userRoleDelegate: 'role',
        delegationId: null,
        tabCount: roleCounter,
        tabIdentifier: (1 + i) + '@' + user.roles[i].name,
        sortField: 'receivedDate2',
        sortDirection: -1,
        totalRecords: roleCounter,
        quickFilterText: '',
        status: user.roles[i].status
      });
    }
    for (let i = 0; i < user.delegated.length; i++) {
      delegateCounter = _.find(tabsCounter.delegated, function (delegated) {
        return delegated.delId === user.delegated[i].userId;
      }).wiCount;
      this.tabsList.push({
        recordId: user.delegated[i].userId,
        tabLabel: user.delegated[i].delName,
        tabType: 'USER',
        gridType: 'inbox',
        userRoleDelegate: 'delegate',
        delegationId: user.delegated[i].id,
        tabCount: delegateCounter,
        tabIdentifier: (1 + user.roles.length + i) + '@' + user.delegated[i].delName,
        sortField: 'receivedDate2',
        sortDirection: -1,
        totalRecords: delegateCounter,
        quickFilterText: '',
      });
    }
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
    } else {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Inbox' },
        { label: this.user ? this.user.fulName : ' ' }
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

  subscribeRouterEvents() {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationStart) {
        this.closeAllDialog();
      }
      if (evt instanceof NavigationEnd) {
        if (this.router.url === '/workflow/inbox') {
          this.setBreadcrumb();
          this.closeAllDialog();
        }
      }
    });
  }


  subscribeRefreshRequiredEvent() {
    this.busy = true;
    this.bs.inboxRefreshRequired.subscribe(data => {
      this.busy = false;
      if (data === 'dashboard-filter') {
        this.clearDashboardFilter();
        this.resetFirstAndSort = true;
        this.ngOnInit();
      } else if (data === 'inbox-from-dashboard' || data === 'inbox-feature') {
        this.resetAndCloseFilters(true);
        this.resetFirstAndSort = true;
        this.ngOnInit();
      } else if (data === 'task-detail') {
        this.resetFirstAndSort = false;
        this.resetCurrentTableSortAndRefresh();
      } else if (data === 'task-detail-read-action') {
        this.resetFirstAndSort = false;
        //this.resetCurrentTableSortAndRefresh();
        this.searchInbox();
      }
    }, Error => {
      this.busy = false;
    });
  }

  /**
   * @description Close all dialogs on page navigation
   */
  closeAllDialog() {
    // console.log(this.dataTableComponent);

    if (this.dataTableComponent) {
      this.dataTableComponent.map((d) => {
        d.hideAllDialog();
      })
    }
    // console.log(this.matMultiSelect);
    if (this.matMultiSelect) {
      this.matMultiSelect['_results'].map((d) => {
        //console.log(d);
        d['close']();
        //d.overlayDir.detach();
        d._overlayDir.open = false;
      })
    }
    // console.log(this.confirmDialogRef);

    // if (this.confirmDialogRef)
    //   this.confirmDialogRef['hide']();
    // if (this.progressDialogRef)
    //   this.progressDialogRef['hide']();
    // if (this.delegationMsgDialogRef)
    //   this.delegationMsgDialogRef['hide']();
    if (this.dateBeforeOverlayPanel) {
      this.dateBeforeOverlayPanel.visible = false;
    }
    //this.matMultiSelect ? this.matMultiSelect['close']() : null; //To close column multi select overlay panel
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
  checkDateForDisableActions(date) {
    return moment((date), "DD/MM/YYYY").toDate() < moment((global.date_disable_action), "DD/MM/YYYY").toDate();
  }

  ngOnDestroy() {
    console.log("this.ngOnDestroy");
    this.overlayPanel.toggle(event);
    this.filterComponent.destroy();
    //this.VCR.clear();
    this.breadcrumbService.dashboardFilterQuery = undefined;
    // if (this.busy) {
    //   this.busy.unsubscribe();
    // }
    this.clearSubscriptions();
    this.inboxSelectedItem = [];
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.inboxWorkitems = {};
    this.inboxWorkitemsCopy = {};
    this.columns = [];
    this.selectedColumns = [];
    this.user = undefined;
    this.actions = [];
    this.action = undefined;
    this.selectedAction = undefined;
    this.emptyMessage = undefined;
    this.disableAction = true;
    //this.disableActionBefore=false;
    this.selectedUser = undefined;
    this.type = undefined;
    this.selectedCount = 0;
    this.selectedTabIndex = 0;
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.usersTabTotalCountBadge = [];
    this.showRecallInactiveDialog = false;
    this.showOperationNotPossible = false;

  }
  replyWorkitem(event) {
    if (!!this.ws.delegateId) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReply();
        }
      });
    } else if (!!this.ws.roleId) {
      this.us.validateRole(this.ws.roleId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Role access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReply();
        }
      });
    } else {
      this.validateWorkitemForReply();
    }
  }

  validateWorkitemForReply() {
    this.callAddMissingPermissions(cb => {
      this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          this.router.navigate(['/workflow/launch', 'reply', { id: this.inboxSelectedItem[0].workitemId }]);
        }
      });
    });
  }

  replyAllWorkitem(event) {
    if (!!this.ws.delegateId) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReplyAll();
        }
      });
    } else if (!!this.ws.roleId) {
      this.us.validateRole(this.ws.roleId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Role access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReplyAll();
        }
      });
    } else {
      this.validateWorkitemForReplyAll();
    }
  }

  validateWorkitemForReplyAll() {
    this.callAddMissingPermissions(cb => {
      this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          //this.bs.launchRefreshRequired.emit('Workitem-Action');
          this.router.navigate(['/workflow/launch', 'replyAll', { id: this.inboxSelectedItem[0].workitemId }]);
        }
      });
    });
  }

  callAddMissingPermissions(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.inboxSelectedItem[0].actions;
    // wia.actionDetails =this.inboxSelectedItem[0].actionName
    wia.attachments = this.inboxSelectedItem[0].attachments;
    wia.deadline = this.inboxSelectedItem[0].deadline;
    wia.id = this.inboxSelectedItem[0].workitemId;
    wia.instructions = this.inboxSelectedItem[0].instructions;
    wia.recipients = this.inboxSelectedItem[0].recipients;
    wia.reminder = this.inboxSelectedItem[0].reminder;
    wia.EMPNo = this.user.EmpNo;
    wia.workflow = new WorkflowDetails();
    wia.workflow.delEmpNo = this.ws.delegateEmpNo;
    this.busy = true;
    this.ws.addMissingPermissions(wia).subscribe(data => {
      this.busy = false;
      cb();
    }, err => {
      this.busy = false;
    });
  }

  forwardWorkitem(event) {
    if (!!this.ws.delegateId) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForForward();
        }
      });
    } else if (!!this.ws.roleId) {
      this.us.validateRole(this.ws.roleId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Role access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForForward();
        }
      });
    } else {
      this.validateWorkitemForForward();
    }
  }

  validateWorkitemForForward() {
    this.callAddMissingPermissions(cb => {
      this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          this.router.navigate(['/workflow/launch', 'forward', { id: this.inboxSelectedItem[0].workitemId }]);
        }
      });
    });
  }

  finishWorkitem(event) {
    this.confirmationService.confirm({
      message: 'Do you want to Finish this workitem?',
      header: 'Finish Confirmation',
      key: 'taskDetailConfirmation',
      accept: () => {
        if (!!this.ws.delegateId) {
          this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Delegated user access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              this.validateWorkitemForFinish();
            }
          });
        } else if (!!this.ws.roleId) {
          this.us.validateRole(this.ws.roleId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Role access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              this.validateWorkitemForFinish();
            }
          });
        } else {
          this.validateWorkitemForFinish();
        }
      },
      reject: () => { }
    });
  }

  validateWorkitemForFinish() {
    this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.busy = true;
        this.ws.finishWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(data => {
          this.busy = false;
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Success', detail: 'Finished Successfully'
          // });
          this.toastr.info('Finished Successfully', 'Success');
          this.bs.inboxRefreshRequired.emit('task-detail');
          this.router.navigateByUrl('/workflow/' + this.fromPage[0]);
        }, err => {
          this.busy = false;
        });
      }
    });
  }

  relaunchWorkItem(event) {
    this.ws.validateWorkitem(this.inboxSelectedItem[0].workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        if (!!this.ws.delegateId) {
          this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Delegated user access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              this.relaunchProceedAfterAddDelegate();
            }
          });
        } else if (!!this.ws.roleId) {
          this.us.validateRole(this.ws.roleId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Role access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              this.relaunchProceedAfterAddDelegate();
            }
          });
        } else {
          this.ws.validateSentItem(this.sentItemId).subscribe(res1 => {
            if (res1 === 'INACTIVE') {
              this.showRecallInactiveDialog = true;
            } else {
              this.relaunchProceedAfterAddDelegate();
            }
          });
        }
      }
    });
  }

  relaunchProceedAfterAddDelegate() {
    this.callAddMissingPermissions(cb => {
      if (this.ws.delegateId && this.ws.delegateId > 0) {
        this.assignSecurityForDelegate(cb => {
          this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.inboxSelectedItem[0].workitemId }]);
        });
      } else {
        this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.inboxSelectedItem[0].workitemId }]);
      }
    });
  }

  assignSecurityForDelegate(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.inboxSelectedItem[0].actions;
    // wia.actionDetails = this.inboxSelectedItem[0].actionName
    wia.attachments = this.inboxSelectedItem[0].attachments;
    wia.deadline = this.inboxSelectedItem[0].deadline;
    wia.id = this.inboxSelectedItem[0].workitemId;
    wia.instructions = this.inboxSelectedItem[0].instructions;
    wia.recipients = this.inboxSelectedItem[0].recipients;
    wia.reminder = this.inboxSelectedItem[0].reminder;
    wia.EMPNo = this.currentUser.EmpNo;
    wia.workflow = new WorkflowDetails();
    wia.workflow.delEmpNo = this.ws.delegateEmpNo;
    this.busy = true;
    this.ws.addSecurityForDelegate(wia).subscribe(data => {
      this.busy = false;
      cb();
    }, err => {
      this.busy = false;
    });
  }

}



