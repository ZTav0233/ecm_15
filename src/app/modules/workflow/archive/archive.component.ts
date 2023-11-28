import {
  Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild,
  ViewChildren
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { WorkitemSet } from '../../../models/workflow/workitem-set.model';
import { User } from '../../../models/user/user.model';
import { ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as globalv from '../../../global.variables';
import { saveAs } from 'file-saver';
import { CoreService } from "../../../services/core.service";
import { FilterComponent } from "../../../components/generic-components/filter/filter.component";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { BrowserEvents } from "../../../services/browser-events.service";
import * as _ from "lodash";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { WorkitemDetails } from "../../../models/workflow/workitem-details.model";
import { GrowlService } from "../../../services/growl.service";
import * as global from "../../../global.variables";
import * as moment from 'moment';
import { WorkItemAction } from '../../../models/workflow/workitem-action.model';
import { WorkflowDetails } from '../../../models/workflow/workflow-details.model';


@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['../workflow.component.css']

})
export class ArchiveComponent implements OnInit, OnDestroy {
  @ViewChildren(FilterComponent) filterComponent: QueryList<FilterComponent>;
  @ViewChildren(DataTableComponent) dataTableComponent: QueryList<DataTableComponent>;
  public selectedWorkitem: any = {};
  public archiveSelectedItem: any
  public colHeaders: any[] = [
    { field: 'status', header: 'Status', hidden: true },
    { field: 'actions', header: 'For', hidden: true },
    { field: 'receivedDate', header: 'Received Date', hidden: true, sortField: 'receivedDate2' },
    { field: 'senderName', header: 'Sender Name', hidden: true },
    { field: 'recipientName', header: 'Recipient Name', hidden: true },
    { field: 'wfCreatorName', header: 'Created By', hidden: true },
    { field: 'workitemId', header: 'workitemId', hidden: true },
    { field: 'sentitemId', header: 'sentitemId', hidden: true },
    { field: 'instructions', header: 'Instructions', hidden: true },
    { field: 'deadline', header: 'Deadline', hidden: true, sortField: 'deadline2' },
    { field: 'reminder', header: 'Reminder', hidden: true, sortField: 'reminder2' }
  ];
  public sentColHeaders: any[] = [
    { field: 'actions', header: 'For', hidden: true },
    { field: 'lastItemSentOn', header: 'Sent On', hidden: true, sortField: 'lastItemSentOn2' },
    { field: 'wfCreatorName', header: 'Workflow Created By', hidden: true },
    { field: 'status', header: 'Status', hidden: true },
    { field: 'createdOn', header: 'Workflow Created Date', hidden: true, sortField: 'createdOn2' },
    { field: 'deadline', header: 'Deadline', hidden: true, sortField: 'deadline2' }
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
  public isRoleActive = 'ACTIVE';
  public isAllActionsDisabled = false;
  public isAllRecalled;
  private currentUser = new User();
  public userGridView: any;
  emptyMessage: string = globalv.no_workitem_found;
  public archiveWorkitems: WorkitemSet = {};
  public columns: any[] = [
    { label: 'Status', value: 'status' },
    { label: 'For', value: 'actions' },
    { label: 'Received Date', value: 'receivedDate' },
    { label: 'Sender Name', value: 'senderName' },
    { label: 'Recipient Name', value: 'recipientName' },
    { label: 'Created By', value: 'wfCreatorName' },
    { label: 'Instructions', value: 'instructions' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Reminder', value: 'reminder' }
  ];
  filterCount: any;
  public sentColumns: any[] = [
    { label: 'For', value: 'actions' },
    { label: 'Sent On', value: 'lastItemSentOn' },
    { label: 'Workflow Created By', value: 'wfCreatorName' },
    { label: 'Status', value: 'status' },
    { label: 'Workflow Created Date', value: 'createdOn' },
    { label: 'Deadline', value: 'deadline' }
  ];
  public inboxSelectedColumns: string[] = [];
  public sentSelectedColumns: string[] = [];
  public user = new User();
  public actions: string[] = ['Un-Archive', 'Relaunch'];
  action = new FormControl();
  public selectedAction: any;
  public disableAction = true;
  public selectedCount = 0;
  public selectedTabIndex = 0;
  public archivePreviousSelectedTab: any;
  public filterQuery: any;
  public userInboxTabsTotalCount = 0;
  public userSentTabsTotalCount = 0;
  public sender: SelectItem[] = [];
  public recipients: SelectItem[] = [];
  public type;
  public activeTab = 'inbox';
  public lazy = true;
  public archiveTieredItems: any[] = [
    {
      label: 'Export',
      icon: 'fa fa-fw ui-icon-assignment-returned',
      disabled: false,
      items: [
        {
          label: 'PDF',
          icon: 'fa fa-fw ui-icon-description', command: (event) => {
            this.exportArchive('pdf');
          }
        },
        {
          label: 'Excel',
          icon: 'fa fa-fw ui-icon-assignment', command: (event) => {
            this.exportArchive('excel');
          }
        }
      ]
    }
  ];
  private subscriptions: Subscription[] = [];
  request: any = { pageNo: 1 };
  public advanceFilterShown = false;
  public showDelegationInactiveDialog = false;
  public forOptions: any[];
  public resetFirstAndSort = false;
  public archiveWorkitemsCopy: WorkitemSet = {};
  public tabCategory: string = 'all';

  public defaultSortField;
  public defaultSortOrder;
  public expandedRowsGroups: string[] = [];
  public expandedRowsGroupsSubTotal = [];
  public tabsList: any[] = [];

  @ViewChild('showTrackDialog') showTrackDialogRef: ElementRef;
  @ViewChild('delegationMsgDialog') delegationMsgDialogRef: ElementRef;
  public inactiveDialogMessage = 'Delegated user access has ended';
  sentItemId: any;
  public trackColHeaders = [
    { field: 'recipientName', header: 'Recipient', hidden: false },
    { field: 'senderName', header: 'Sender Name', hidden: false },
    { field: 'sentOn', header: 'Sent On', hidden: false, sortField: 'sentOn2' },
    { field: 'actionUser', header: 'Action By', hidden: false },
    { field: 'status', header: 'Status', hidden: false }
  ];
  public workitemHistory: any;
  public selectedColumns: string[] = [];
  public trackWorkitemDetails: WorkitemDetails;
  public showTrack = false;
  public busy: boolean;
  public progressObj = {};
  public showRecallInactiveDialog = false;
  messageDenyAction: string;
  userSetting = [];
  public showOperationNotPossible = false;
  constructor(private breadcrumbService: BreadcrumbService, private router: Router, private ws: WorkflowService, private us: UserService, private bs: BrowserEvents,
    public coreService: CoreService, private growlService: GrowlService, private confirmationService: ConfirmationService, ) {
    this.subscribeRouterEvents();
    this.subscribeRefreshRequiredEvent();
  }

  ngOnInit() {
    this.setDefaultSort();
    let isOnInitCall = !this.resetFirstAndSort;
    this.getUserSetting();
    this.closeAllDialog();

    this.itemsPerPage = this.us.pageSize;
    this.userGridView = this.gridViewOptions.grouped.value;
    this.archiveSelectedItem = [];
    this.filterCount = {
      total: -1,
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
    this.showDelegationInactiveDialog = false;
    this.user = null;
    // get user details
    this.busy = true;
    this.us.logIn(globalv.username, 'def').subscribe(loginData => {
      this.busy = false;
      this.us.setCurrentUser(loginData);
      this.user = loginData;
      this.ws.getTabsCounter(this.user.EmpNo, 'archive').subscribe(counterData => {
        let inboxData = counterData[0], sentData = counterData[1];
        this._setTabsList(inboxData, sentData);
        this._setDashboardQueryAndTabChange(isOnInitCall);
      });
      this.getForOptions(this.user.EmpNo);
    }, Error => {
      this.busy = false;
      localStorage.removeItem('user');
      this.router.navigate(['/auth/auth-failure']);
    });
    this.actions = [];
    // inbox

    this.inboxSelectedColumns = ['receivedDate', 'senderName', 'deadline'];
    // let inboxSelectedColumns:any = localStorage.getItem('archiveInboxSelectedColumns')
    // if(inboxSelectedColumns){
    //   inboxSelectedColumns = JSON.parse(inboxSelectedColumns);
    //   this.inboxSelectedColumns  = inboxSelectedColumns
    //   this.columnSelectionChanged(null, false);
    // }else{
    //   this.columnSelectionChanged(null, false);
    // }



    // sentitems
    this.sentSelectedColumns = ['lastItemSentOn', 'wfCreatorName', 'deadline'];
    // let sentSelectedColumns:any = localStorage.getItem('archiveSentSelectedColumns')
    // if(sentSelectedColumns){ 
    //   sentSelectedColumns = JSON.parse(sentSelectedColumns);
    //   this.sentSelectedColumns  = sentSelectedColumns
    //   this.columnSelectionChanged(null, true);
    // }else{
    //   this.columnSelectionChanged(null, true);
    // }

  }

  getUserSetting() {
    this.us.getUserSettings().subscribe(async result => {
      this.userSetting = result;
      let isFound = false;
      for (const setting of this.userSetting) {
        if (setting.key === 'Archive Inbox Selected Columns') {
          isFound = true;
          if (setting.val) {
            let inboxSelectedColumns = JSON.parse(setting.val);
            this.inboxSelectedColumns = inboxSelectedColumns
            this.columnSelectionChanged(null, false);
          } else {
            this.columnSelectionChanged(null, false);
          }
        }
        // } 
        // for (const setting of this.userSetting) {      
        if (setting.key === 'Archive Sent Selected Columns') {
          isFound = true;
          if (setting.val) {
            let sentSelectedColumns = JSON.parse(setting.val);
            this.sentSelectedColumns = sentSelectedColumns
            this.columnSelectionChanged(null, true);
          } else {
            this.columnSelectionChanged(null, true);
          }
        }
      }
      if (!isFound) {
        this.columnSelectionChanged(null, false);
        this.columnSelectionChanged(null, true);
      }

    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToArchive') {
      //this.refreshTable('');
    }
  }

  /**
   * @description Show the progress dialog
   * @param event
   */
  showProgressDialogue(event) {
    this.selectedWorkitem = {};
    this.selectedWorkitem.workitemId = event;
    this.getWorkitemProgress();
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
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Workitem Progress Added Successfully'
      });
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
   * @description Hide the progress dialog
   */
  hideDisplayProgress() {
    this.coreService.displayProgress = false;
  }

  /**
   * @description sets default sort and order to the grid
   * @param sortField
   * @param sortOrder
   */
  setDefaultSort(sortField?, sortOrder?) {
    if (this.activeTab === 'inbox') {
      this.defaultSortField = sortField || 'receivedDate2';
    } else {
      this.defaultSortField = sortField || 'lastItemSentOn2';
    }
    this.defaultSortOrder = sortOrder || -1;
  }

  /**
   * @description sets default sort and order to the request
   * @param sortField
   * @param sortOrder
   */
  setDefaultSortInRequest(sortField?, sortOrder?) {
    let _sortField;
    if (this.activeTab === 'inbox') {
      _sortField = sortField || 'receivedDate2';
    } else {
      _sortField = sortField || 'lastItemSentOn2';
    }
    let _sortOrder = sortOrder || -1;
    this.request.sort = this.getSortingMapToRequest(_sortField);
    this.request.order = this.coreService.getSortOrderText(_sortOrder);
  }

  /**
   * @description Reset filter and clear the filter criteria and search again
   * @param skipSearchArchive
   */
  resetAndCloseFilters(skipSearchArchive = false) {
    this.archiveSelectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.advanceFilterShown = false;
    $('.filter').slideUp();
    this.clearFilter(skipSearchArchive);
    this.resetFirst();
  }

  /**
   * @description Clear the filter criteria
   * @param skipSearchArchive
   */
  clearFilter(skipSearchArchive = false) {
    this.resetFilterModel();
    this.breadcrumbService.dashboardFilterQuery = undefined;
    this.breadcrumbService.sentDashboardFilterQuery = undefined;
    this.breadcrumbService.actionedDashboardFilterQuery = undefined;
    if (!skipSearchArchive) {
      this.getArchives();
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

  getFilterSenderOptions(id, userType) {
    this.sender = [];
    this.busy = true;
    this.ws.getInboxFilterUsers(id, userType, 'finish').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.sender.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, Error => {
      this.busy = false;
    });
  }

  getFilterRecipientOptions(id, userType) {
    this.recipients = [];
    this.busy = true;
    this.ws.getSentitemFilterUsers(id, userType, 'archive').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.recipients.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, Error => {
      this.busy = false;
    });
  }

  getData(data: any) {
    this.archiveSelectedItem = data;
    if (this.archiveSelectedItem) {
      if (this.archiveSelectedItem.length > 0) {
        this.disableAction = false;
        this.selectedCount = this.archiveSelectedItem.length;
      } else {
        this.disableAction = true;
        this.selectedCount = 0;
      }
    }
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
        if (dtComponent.tabNameIdentifier === this.ws.archiveSelectedUserTab) {
          dtComponent.resetFirst();
        }
      });
    }
  }

  getFilterToggle(data) {
    this.advanceFilterShown = !this.advanceFilterShown;
    if (this.request.exportFilter) {
      this.advanceFilterShown = true;
    }
    this.activeTab === 'inbox' ? this.getFilterSenderOptions(this.request.userId, this.request.userType) : this.getFilterRecipientOptions(this.request.userId, this.request.userType);
    this.toggleFilter();
  }

  getSelectedAction(data: any, val: string) {
    if (this.ws.delegateId && this.ws.delegateId > 0) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.showDelegationInactiveDialog = true;
        } else {
          if (data === 'UnArchive') {
            this.unArchiveWorkitems(val);
          } else if (data === 'Relaunch') {
            this.relaunchWorkItem(val);
          }
        }
      });
    } else {
      if (data === 'UnArchive') {
        this.unArchiveWorkitems(val);
      } else if (data === 'Relaunch') {
        this.relaunchWorkItem(val);
      }
    }
  }

  getInboxSelectedAction(data: any, val: string) {
    if (this.ws.delegateId && this.ws.delegateId > 0) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.showDelegationInactiveDialog = true;
        } else {
          if (data === 'UnArchive') {
            this.unArchiveWorkitems(val);
          } else if (data === 'Relaunch') {
            this.relaunchWorkItem(val);
          }
        }
      });
    } else {
      if (data === 'UnArchive') {
        this.unArchiveWorkitems(val);
      } else if (data === 'Relaunch') {
        this.relaunchWorkItem(val);
      }
    }
  }

  getOutboxSelectedAction(data: any, val: string) {
    this.ws.getWorkitemDetailsBySentItem(this.archiveSelectedItem[0].sentitemId).subscribe(res => {
      console.log(res)
      this.archiveSelectedItem[0].workitemId = res.workitemId;
      this.archiveSelectedItem[0]["docDate"] = res.docDate;
      this.archiveSelectedItem[0]["docRecdDate"] = res.docRecdDate;
      this.archiveSelectedItem[0]["refNo"] = res.refNo;
      this.archiveSelectedItem[0]["projNo"] = res.projNo;
      this.archiveSelectedItem[0]["contractNo"] = res.contractNo;
      this.archiveSelectedItem[0]["ECMNo"] = res.ECMNo;
      this.archiveSelectedItem[0]["actions"] = res.actions;
      this.archiveSelectedItem[0]["type"] = res.type;
      this.archiveSelectedItem[0]["receivedDate"] = res.receivedDate;
      this.archiveSelectedItem[0]["senderRoleId"] = res.senderRoleId;
      this.archiveSelectedItem[0]["senderEMPNo"] = res.senderEMPNo;
      this.archiveSelectedItem[0]["recipientEMPNo"] = res.recipientEMPNo;
      this.archiveSelectedItem[0]["recipientRoleId"] = res.recipientRoleId;
      this.archiveSelectedItem[0]["systemStatus"] = res.systemStatus;
      this.archiveSelectedItem[0]["recipientName"] = res.recipientName;
      this.archiveSelectedItem[0]["reciLoginName"] = res.reciLoginName;
      this.archiveSelectedItem[0]["senderLoginName"] = res.senderLoginName;
      this.archiveSelectedItem[0]["attachments"] = res.attachments;
      this.archiveSelectedItem[0]["recipients"] = res.recipients;
      this.archiveSelectedItem[0].instructions = res.instructions;
      this.archiveSelectedItem[0].deadline = res.deadline;
      this.archiveSelectedItem[0].remarks = res.remarks;
      this.archiveSelectedItem[0].wiRemarks = res.wiRemarks;
      if (this.ws.delegateId && this.ws.delegateId > 0) {
        this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
          if (res === 'INACTIVE') {
            this.showDelegationInactiveDialog = true;
          } else {
            if (data === 'UnArchive') {
              this.unArchiveWorkitems(val);
            } else if (data === 'Relaunch') {
              this.relaunchWorkItem(val);
            }
          }
        });
      } else {
        if (data === 'UnArchive') {
          this.unArchiveWorkitems(val);
        } else if (data === 'Relaunch') {
          this.relaunchWorkItem(val);
        }
      }
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Un-Archive the selected workItems
   */
  unArchiveWorkitems(val: string) {
    let msg = "Do you want to Un-Archive this workitem?";
    this.confirmationService.confirm({
      message: msg,
      header: 'Un-Archive Confirmation',
      key: 'archiveConfirmation',
      icon: 'fa fa-fw ui-icon-help',
      accept: () => {
        if (this.archiveSelectedItem.length === 1) {
          this.ws.validateWorkitem(this.archiveSelectedItem[0].workitemId).subscribe(res1 => {
            if (res1 === 'INACTIVE') {
              this.showRecallInactiveDialog = true;
            } else {
              const bDate = this.coreService.getFormattedDateString(this.archiveSelectedItem[0].receivedDate2, this.coreService.dateTimeFormats.DDMMYYYY, '/');
              if (this.checkDateForDisableActions(bDate)) {
                this.messageDenyAction = 'This item cannot be Un-Archive';
                this.showOperationNotPossible = true;
              }
              else {
                this.unArchiveProceed(val);
              }
            }
          });
        }
        else if (this.archiveSelectedItem.length > 1) {
          this.unArchiveProceed(val);
        }
      },
      reject: () => {
      }
    });
  }

  checkDateForDisableActions(date) {
    return moment((date), "DD/MM/YYYY").toDate() < moment((global.date_disable_action), "DD/MM/YYYY").toDate();
  }

  unArchiveProceed(val: string) {
    if (this.archiveSelectedItem.length > 0) {
      let count = 0;
      this.archiveSelectedItem.map((item, index) => {
        this.busy = true;
        if (val == 'inbox') {
          this.ws.undoFinishWorkitem(item.workitemId).subscribe(data => {
            this.busy = false;
            count++;
            if (this.archiveSelectedItem.length === count) {
              let totalCount = this.tabsList[this.selectedTabIndex].tabCount - this.archiveSelectedItem.length;
              this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }], this.activeTab);
              this.archiveSelectedItem = [];
              this.unArchiveSuccess();
            }
          }, Error => {
            this.busy = false;
            this.unArchiveFailed()
          });
        } else {
          this.ws.undoArchiveSentitem(item.sentitemId).subscribe(data => {
            this.busy = false;
            count++;
            if (this.archiveSelectedItem.length === count) {
              let totalCount = this.tabsList[this.selectedTabIndex].tabCount - this.archiveSelectedItem.length;
              this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }], this.activeTab);
              this.archiveSelectedItem = [];
              this.unArchiveSuccess();
            }
          }, Error => {
            this.busy = false;
            this.unArchiveFailed()
          });
        }
      });
    }
  }

  unArchiveSuccess() {
    window.parent.postMessage('Un-ArchiveSuccess', '*');
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Un-Archived Successfully'
    });
    this.resetCurrentTableSortAndRefresh();
  }

  unArchiveFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Un-Archive Workitems'
    });
  }

  columnSelectionChanged(event: any, isSent = false) {
    if (!isSent) {
      for (const tableHead of this.colHeaders) {
        tableHead.hidden = true;
      }
      // localStorage.setItem('archiveInboxSelectedColumns',JSON.stringify(this.inboxSelectedColumns))
      for (const column of this.inboxSelectedColumns) {
        for (const tableHead of this.colHeaders) {
          if (tableHead.field === column) {
            tableHead.hidden = false;
          }
        }
      }
      this.updateInboxGeneralSetting();
    } else {
      for (const tableHead of this.sentColHeaders) {
        tableHead.hidden = true;
      }
      // localStorage.setItem('archiveSentSelectedColumns',JSON.stringify(this.sentSelectedColumns))
      for (const column of this.sentSelectedColumns) {
        for (const tableHead of this.sentColHeaders) {
          if (tableHead.field === column) {
            tableHead.hidden = false;
          }
        }
      }
      this.updateSentGeneralSetting();
    }
  }

  updateInboxGeneralSetting() {
    let isFound = false;
    for (const setting of this.userSetting) {
      if (setting.key === 'Archive Inbox Selected Columns') {
        isFound = true;
        setting.val = JSON.stringify(this.inboxSelectedColumns)
      }
    }
    if (!isFound) {
      this.userSetting.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Archive Inbox Selected Columns',
        'val': JSON.stringify(this.inboxSelectedColumns)
      });
    }
    this.us.updateUserSettings(this.userSetting).subscribe(val => {
      this.busy = false;
    }, err => {
      this.busy = false;
    });
  }

  updateSentGeneralSetting() {
    let isFound = false;
    for (const setting of this.userSetting) {
      if (setting.key === 'Archive Sent Selected Columns') {
        isFound = true;
        setting.val = JSON.stringify(this.sentSelectedColumns)
      }
    }
    if (!isFound) {
      this.userSetting.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Archive Sent Selected Columns',
        'val': JSON.stringify(this.sentSelectedColumns)
      });
    }
    this.us.updateUserSettings(this.userSetting).subscribe(val => {
      this.busy = false;
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Change of view dropdown to show/hide tabs
   * @param event
   */
  archiveViewChanged(event) {
    if (event.value === 'all') {
      this.archiveTabChange(this.user.fulName + ' Inbox', 0);
      this.ws.archiveSelectedUserTab = (0) + '@' + this.user.fulName;
    } else if (event.value === 'inbox') {
      this.archiveTabChange(this.user.fulName + ' Inbox', 0);
      this.ws.archiveSelectedUserTab = (0) + '@' + this.user.fulName;
    } else {
      this.archiveTabChange(this.user.fulName + ' Outbox', 0);
      this.ws.archiveSelectedUserTab = (2) + '@' + this.user.fulName;
    }
  }

  archiveGridTabChange(textLabel, index, isOnInitCall, fromGrid?) {
    const selectedIndex = this.ws.archiveSelectedUserTab && this.ws.archiveSelectedUserTab.split('@');
    if (selectedIndex && selectedIndex.length && index != selectedIndex[0]) {
      this.archiveTabChange(textLabel, index, isOnInitCall);
    }
  }

  archiveTabChange(textLabel, index, isOnInitCall = false) {
    this.advanceFilterShown = false;
    this.resetFilterModel();
    this.selectedTabIndex = index;
    this.ws.archiveSelectedUserTab = this.selectedTabIndex + '@' + textLabel;

    this.archiveSelectedItem = [];
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
        /*if (tabData.userRoleDelegate === 'role') {
          this.us.validateRole(tabData.recordId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.showDelegationInactiveDialog = true;
            } else {
              this.ws.roleId = tabData.recordId;
            }
          });
        } else {
          this.ws.roleId = null;
        }*/
        this.request = tabData.lastRequest;
        this.getArchives(tabData.gridType);
      } else {
        this.advanceFilterShown = false;
        if (this.advanceFilterShown) {
          $('.filter').slideDown();
        } else {
          $('.filter').slideUp();
        }
        this.interceptRequestAndGetData(textLabel, isOnInitCall);
      }
    } else {
      this.advanceFilterShown = false;
      $('.filter').slideUp();
      this.setDefaultSort();
      this.interceptRequestAndGetData(textLabel, isOnInitCall);
    }
  }

  interceptRequestAndGetData(textLabel, isOnInitCall) {
    for (const role of this.user.roles) {
      if (textLabel.includes(role.name)) {
        this.request.userType = 'ROLE';
        this.request.userId = role.id;
        this.request.empNo = role.id;
        this.request.recipientName = undefined;
        this.request.senderName = undefined;
        this.ws.delegateId = undefined;
        this.ws.delegateEmpNo = undefined;
        this.ws.roleId = role.id;
      }
    }
    for (const delegate of this.user.delegated) {
      if (textLabel.includes(delegate.delName)) {
        this.request.userType = 'USER';
        if (textLabel.includes('Outbox')) {
          this.request.senderName = delegate.userId;
          this.request.recipientName = undefined;
        } else {
          this.request.recipientName = undefined; //'USER:' + delegate.userId;
          this.request.senderName = undefined;
        }
        this.request.userId = delegate.userId;
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
    if (textLabel.includes(this.user.fulName)) {
      this.request.userType = 'USER';
      if (textLabel.includes('Outbox')) {
        this.request.senderName = this.user.EmpNo;
        this.request.recipientName = undefined;
      } else {
        this.request.recipientName = undefined; // 'USER:' + this.user.EmpNo;
        this.request.senderName = undefined;
      }

      this.request.userId = this.user.EmpNo;
      this.request.empNo = this.user.EmpNo;
      this.ws.delegateId = undefined;
      this.ws.delegateEmpNo = undefined;
      this.ws.roleId = undefined;
    }

    if (textLabel.includes('Inbox')) {
      this.activeTab = 'inbox';
      //this.getFilterSenderOptions(this.request.userId, this.request.userType);
    }
    if (textLabel.includes('Outbox')) {
      this.activeTab = 'sent';
      //this.getFilterRecipientOptions(this.request.userId, this.request.userType)
    }
    if (!isOnInitCall)
      this.getArchives();
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
    if (this.activeTab === 'inbox') {
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
      }
    }
  }

  toggleFilter() {
    $('.filter').slideToggle();
  }

  /**
   * @description Change the sorting field names for sending to backend service
   * @param sortField
   */
  getSortingMapToRequest(sortField) {
    if (this.activeTab === 'inbox') {
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
    } else {
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
  }

  /**
   * @description Change the sorting field names for using in UI
   * @param sortBy
   */
  getSortingMapFromRequest(sortBy) {
    if (this.activeTab === 'inbox') {
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
    } else {
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
  }


  /**
   * @description Export the grid data to pdf/xsls
   * @param exportType
   */
  exportArchive(exportType) {
    this.request.exportFilter = !!this.request.exportFilter;
    let exportMimeType, extension;
    if (this.activeTab === 'inbox') {
      this.request.repStatus = 'finish';
      if (exportType === 'pdf') {
        this.request.exportFormat = 'pdf';
        exportMimeType = 'application/pdf';
        extension = '.pdf';
      } else {
        this.request.exportFormat = 'xls';
        exportMimeType = 'application/vnd.ms-excel';
        extension = '.xlsx';
      }
      this.busy = true;
      this.ws.exportInbox(this.request).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: exportMimeType });
        const fileName = 'Finished_Inbox_' + this.coreService.getDateTimeForExport() + extension;
        saveAs(file, fileName);
      }, Error => {
        this.busy = false;
      });
    } else if (this.activeTab === 'sent') {
      this.request.repStatus = 'archive';
      if (exportType === 'pdf') {
        this.request.exportFormat = 'pdf';
        exportMimeType = 'application/pdf';
        extension = '.pdf';

      } else {
        this.request.exportFormat = 'xls';
        exportMimeType = 'application/vnd.ms-excel';
        extension = '.xlsx';
      }
      this.busy = true;
      this.ws.exportSent(this.request).subscribe(res => {
        this.busy = false;
        const file = new Blob([res], { type: exportMimeType });
        const fileName = 'Archived_Outbox_' + this.coreService.getDateTimeForExport() + extension;
        saveAs(file, fileName);
      }, Error => {
        this.busy = false;
      });
    }
  }

  /**
   * @description Refresh the grid data
   */
  refreshTable() {
    if (this.ws.archiveSelectedUserTab) {
      this.archivePreviousSelectedTab = this.ws.archiveSelectedUserTab.split('@');
      let sort = this.activeTab === 'inbox' ? 'receivedDate2' : 'lastItemSentOn2';
      let propertiesToUpdate = [
        { property: 'sortField', value: sort },
        { property: 'lastRequest.sort', value: this.getSortingMapToRequest(sort) },
        { property: 'pageNo', value: 1 },
        { property: 'lastRequest.pageNo', value: 1 },
        { property: 'sortDirection', value: -1 },
        { property: 'lastRequest.order', value: this.coreService.getSortOrderText(-1, true) }
      ];
      this._updateTabsList(this.request.userId, propertiesToUpdate, this.activeTab);
      this.archiveTabChange(this.archivePreviousSelectedTab[1], this.archivePreviousSelectedTab[0], false);
    }
  }

  /**
   * @description Reset the current table sorting and refresh the table
   */
  resetCurrentTableSortAndRefresh() {
    this.dataTableComponent.forEach(dtComponent => {
      if (dtComponent.tabNameIdentifier === this.ws.archiveSelectedUserTab) {
        dtComponent.refresh();
      }
    });
  }

  private _filterRecords(filterText, sortField, sortOrder, cb?) {
    /*let columnsToFilter = _.cloneDeep(this.activeTab === 'inbox' ? this.inboxSelectedColumns : this.sentSelectedColumns);
    if (columnsToFilter.indexOf('subject') === -1)
      columnsToFilter.splice(0, 0, 'subject');

    let sentWorkItems = this.coreService.getFilterRecords(this.archiveWorkitemsCopy.workitems, filterText, columnsToFilter);
    sentWorkItems = _.orderBy(sentWorkItems, [workItem => workItem[sortField].toString().toLowerCase()], [this.coreService.getSortOrderText(sortOrder)]);*/

    this.request.sort = sortField;
    this.request.order = this.coreService.getSortOrderText(sortOrder, true);
    this.setDefaultSort(sortField, sortOrder);
    this._getSubjectFilteredFromServer(filterText, (archiveWorkitems) => {
      if (cb)
        cb(archiveWorkitems)
    });
  }

  _getSubjectFilteredFromServer(filterText, cb?) {
    this.request.empNo = this.user.EmpNo;
    let subscription;
    if (this.activeTab === 'inbox') {
      this.request.repStatus = 'finish';
      let requestCopyForSubject = _.cloneDeep(this.request);
      requestCopyForSubject.subject = filterText;
      this.busy = true;
      this.ws.searchInbox(requestCopyForSubject).subscribe(res => {
        this.busy = false;
        this.archiveSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map(d => {
          d.receivedDate2 = this.coreService.getTimestampFromDate(d.receivedDate, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.reminder2 = this.coreService.getTimestampFromDate(d.reminder, null, '/');
          d.priority = this.coreService.getPriorityString(d.priority);
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
        this._updateTabsList(this.request.userId, propertiesToUpdate, this.activeTab);

        this.archiveTieredItems.map((item, index) => {
          item.disabled = !this.archiveWorkitems.workitems || this.archiveWorkitems.workitems.length === 0;
        });
        if (cb)
          cb(res.workitems);
      }, Error => {
        this.busy = false;
      });
    } else if (this.activeTab === 'sent') {
      this.request.repStatus = 'archive';
      let requestCopyForSubject = _.cloneDeep(this.request);
      requestCopyForSubject.subject = filterText;
      this.busy = true;
      this.ws.searchSentItems(requestCopyForSubject).subscribe(res => {
        this.busy = false;
        this.archiveSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map(d => {
          d.status = d.status === 'ARCHIVE' ? 'Archived' : d.status;
          d.lastItemSentOn2 = this.coreService.getTimestampFromDate(d.lastItemSentOn, null, '/');
          d.createdOn2 = this.coreService.getTimestampFromDate(d.createdOn, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.priority = this.coreService.getPriorityString(d.priority);
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
        this._updateTabsList(this.request.userId, propertiesToUpdate, this.activeTab);
        this.archiveTieredItems.map((item, index) => {
          item.disabled = !this.archiveWorkitems.workitems || this.archiveWorkitems.workitems.length === 0;
        });
        if (cb)
          cb(res.workitems);
      }, Error => {
        this.busy = false;
      });
    }
  }

  assignSortNotPaginationInfo(data) {
    console.log(data);
    
    if (!data || !data.rows) {
      return;
    }
    this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
    if (data && data.filters.subject?.value && data.filters.subject?.value.trim()) {
      this._filterRecords(data.filters.subject?.value.trim(), data.sortField, data.sortOrder, (archiveWorkitems) => {
        this.archiveWorkitems.workitems = archiveWorkitems;
      });
      return;
    } else {
      this._updateTabsList(this.request.userId, { property: 'quickFilterText', value: '' }, this.activeTab);
    }

    //this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
    this.request.sort = data.sortField;
    this.request.empNo = this.user.EmpNo;
    this.getSortingMapToRequest(data);
    this.request.order = this.coreService.getSortOrderText(data.sortOrder, true);
    this.setDefaultSort(data.sortField, data.sortOrder);
    this.getArchives();
  }

  getArchives(gridType?, fromFilter = false) {
    fromFilter ? this.resetFirst() : null;
    this.activeTab = gridType ? gridType : this.activeTab;
    //this.request.repStatus = 'finish';
    this.request.empNo = this.user.EmpNo;
    // let subscription;
    if (this.activeTab === 'inbox') {
      this.request.repStatus = 'finish';
      this.busy = true;
      this.ws.searchInbox(this.request).subscribe(res => {
        this.busy = false;
        this.archiveSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map(d => {
          d.receivedDate2 = this.coreService.getTimestampFromDate(d.receivedDate, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.reminder2 = this.coreService.getTimestampFromDate(d.reminder, null, '/');
          d.priority = this.coreService.getPriorityString(d.priority);
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
        this._updateTabsList(this.request.userId, propertiesToUpdate, this.activeTab);
        this.archiveWorkitemsCopy = _.cloneDeep(res);
        this.archiveWorkitems = res;
        let tab = this.tabsList[this.selectedTabIndex];
        if (tab && tab.quickFilterText) {
          //this.archiveWorkitems.workitems = this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection);
          this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection, (archiveWorkitems) => {
            this.archiveWorkitems.workitems = archiveWorkitems;
          });
        }
        this.archiveTieredItems.map((item, index) => {
          item.disabled = !this.archiveWorkitems.workitems || this.archiveWorkitems.workitems.length === 0;
        });
        if (this.advanceFilterShown) {
          this.countFiltered(res);
        } else {
          this.filterCount.total = -1;
        }
        console.log(this.archiveSelectedItem)
        if (this.ws.openedWorkItem) {
          if (this.request.userId === this.ws.openedWorkItem.userId) {
            this.archiveSelectedItem.push(this.ws.openedWorkItem.row);
            console.log(this.archiveSelectedItem)
            this.ws.openedWorkItem = undefined;
          }

        }
        localStorage.setItem('previousCount', res.totalCount);
      }, Error => {
        this.busy = false;
      });
    } else if (this.activeTab === 'sent') {
      this.request.repStatus = 'archive';
      this.busy = true;
      this.ws.searchSentItems(this.request).subscribe(res => {
        this.busy = false;
        this.archiveSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map(d => {
          d.status = d.status === 'ARCHIVE' ? 'Archived' : d.status;
          d.lastItemSentOn2 = this.coreService.getTimestampFromDate(d.lastItemSentOn, null, '/');
          d.createdOn2 = this.coreService.getTimestampFromDate(d.createdOn, null, '/');
          d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.priority = this.coreService.getPriorityString(d.priority);
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
        this._updateTabsList(this.request.userId, propertiesToUpdate, this.activeTab);
        this.archiveWorkitemsCopy = _.cloneDeep(res);
        this.archiveWorkitems = res;
        let tab = this.tabsList[this.selectedTabIndex];
        if (tab && tab.quickFilterText) {
          //this.archiveWorkitems.workitems = this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection);
          this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection, (archiveWorkitems) => {
            this.archiveWorkitems.workitems = archiveWorkitems;
          });
        }
        this.archiveTieredItems.map((item, index) => {
          item.disabled = !this.archiveWorkitems.workitems || this.archiveWorkitems.workitems.length === 0;
        });
        if (this.advanceFilterShown) {
          this.countFiltered(res);
        } else {
          this.filterCount.total = -1;
        }

        if (this.ws.openedWorkItem) {
          if (this.request.userId === this.ws.openedWorkItem.userId) {
            this.archiveSelectedItem.push(this.ws.openedWorkItem.row);
            this.ws.openedWorkItem = undefined;
          }
        }
        localStorage.setItem('previousCount', res.totalCount);
      }, Error => {
        this.busy = false;
      });
    }
  }

  reloadApp() {
    this.showDelegationInactiveDialog = false;
    //window.location.reload(true);
    window.parent.postMessage('DelegationEndReload', '*');
  }

  /**
   * @description get track sentItem details for preview
   * @param workflowId
   * @param userType
   */
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
        this.showTrack = true;
      }
    }, Error => {
      this.busy = false;
    });
  }

  /**
   * @description get track workitem details for track preview
   * @param event
   */
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
   * @private
   */
  private _setDashboardQueryAndTabChange(isOnInitCall) {
    if (this.ws.archiveSelectedUserTab) {
      this.archivePreviousSelectedTab = this.ws.archiveSelectedUserTab.split('@');
      this.archiveTabChange(this.archivePreviousSelectedTab[1], this.archivePreviousSelectedTab[0], isOnInitCall);
    } else if (this.user) {
      this.archiveTabChange(this.user.fulName + ' Inbox', 0, isOnInitCall);
    }
  }

  /**
   * @description Create a tabs list
   * Tab contains recordId, tabLabel, tabType, tabType, tabCount, tabIdentifier
   * @private
   */
  private _setTabsList(inboxCounter, sentCounter) {
    this.tabsList = [];
    let user = this.us.getCurrentUser();
    this.tabsList.push({
      recordId: user.EmpNo,
      tabLabel: user.fulName + ' Inbox',
      tabType: 'USER',
      gridType: 'inbox',
      userRoleDelegate: 'user',
      delegationId: null,
      tabCount: inboxCounter.userCount,
      tabIdentifier: 0 + '@' + user.fulName + ' Inbox',
      sortField: 'receivedDate2',
      sortDirection: -1,
      totalRecords: inboxCounter.userCount,
      quickFilterText: ''

    });
    this.tabsList.push({
      recordId: user.EmpNo,
      tabLabel: user.fulName + ' Outbox',
      tabType: 'USER',
      gridType: 'sent',
      userRoleDelegate: 'user',
      delegationId: null,
      tabCount: sentCounter.userCount,
      tabIdentifier: 1 + '@' + user.fulName + ' Outbox',
      sortField: 'lastItemSentOn2',
      sortDirection: -1,
      totalRecords: sentCounter.userCount,
      quickFilterText: ''
    });
    for (let i = 0; i < user.roles.length; i++) {
      let roleCounterInbox = _.find(inboxCounter.roles, function (role) {
        return role.roleId === user.roles[i].id;
      }).wiCount,
        roleCounterOutbox = _.find(sentCounter.roles, function (role) {
          return role.roleId === user.roles[i].id;
        }).wiCount;
      this.tabsList.push({
        recordId: user.roles[i].id,
        tabLabel: user.roles[i].name + ' Inbox',
        tabType: 'ROLE',
        gridType: 'inbox',
        userRoleDelegate: 'role',
        delegationId: null,
        tabCount: roleCounterInbox,
        tabIdentifier: ((i * 2) + 2) + '@' + user.roles[i].name + ' Inbox',
        sortField: 'receivedDate2',
        sortDirection: -1,
        totalRecords: roleCounterInbox,
        quickFilterText: '',
        status: user.roles[i].status
      });
      this.tabsList.push({
        recordId: user.roles[i].id,
        tabLabel: user.roles[i].name + ' Outbox',
        tabType: 'ROLE',
        gridType: 'sent',
        userRoleDelegate: 'role',
        delegationId: null,
        tabCount: roleCounterOutbox,
        tabIdentifier: ((i * 2) + 3) + '@' + user.roles[i].name + ' Outbox',
        sortField: 'lastItemSentOn2',
        sortDirection: -1,
        totalRecords: roleCounterOutbox,
        quickFilterText: '',
        status: user.roles[i].status
      });
    }
    for (let i = 0; i < user.delegated.length; i++) {
      let delegateCounterInbox = _.find(inboxCounter.delegated, function (delegated) {
        return delegated.delId === user.delegated[i].userId;
      }).wiCount,
        delegateCounterOutbox = _.find(sentCounter.delegated, function (delegated) {
          return delegated.delId === user.delegated[i].userId;
        }).wiCount;
      this.tabsList.push({
        recordId: user.delegated[i].userId,
        tabLabel: user.delegated[i].delName + ' Inbox',
        tabType: 'USER',
        gridType: 'inbox',
        userRoleDelegate: 'delegate',
        delegationId: user.delegated[i].id,
        tabCount: delegateCounterInbox,
        tabIdentifier: (i + (user.roles.length * 2) + 2) + '@' + user.delegated[i].delName + ' Inbox',
        sortField: 'receivedDate2',
        sortDirection: -1,
        totalRecords: delegateCounterInbox,
        quickFilterText: ''
      });
      this.tabsList.push({
        recordId: user.delegated[i].userId,
        tabLabel: user.delegated[i].delName + ' Outbox',
        tabType: 'USER',
        gridType: 'sent',
        userRoleDelegate: 'delegate',
        delegationId: user.delegated[i].id,
        tabCount: delegateCounterOutbox,
        tabIdentifier: (i + (user.roles.length * 2) + 3) + '@' + user.delegated[i].delName + ' Outbox',
        sortField: 'lastItemSentOn2',
        sortDirection: -1,
        totalRecords: delegateCounterOutbox,
        quickFilterText: ''
      });
    }
  }

  /**
   * @description Update the value of give property for tabList item based on tabRecordId and gridType
   * @param tabRecordId
   * @param propertyToUpdate
   * @param gridType
   * @private
   */
  private _updateTabsList(tabRecordId, propertyToUpdate, gridType) {
    let tab;
    for (let i = 0; i < this.tabsList.length; i++) {
      tab = this.tabsList[i];
      if (tab.recordId === tabRecordId && tab.gridType === gridType) {
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
        { label: 'Archive' },
        { label: tabLabel }
      ])
    } else {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Archive' },
        { label: this.user ? this.user.fulName : ' ' }
      ]);
      if (this.ws.archiveSelectedUserTab) {
        this.archivePreviousSelectedTab = this.ws.archiveSelectedUserTab.split('@');
        this.breadcrumbService.setItems([
          { label: 'Workflow' },
          { label: 'Archive' },
          { label: this.archivePreviousSelectedTab[1] }
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
        if (this.router.url === '/workflow/archive') {
          this.setBreadcrumb();
          this.closeAllDialog();
        }
      }
    });
  }

  subscribeRefreshRequiredEvent() {
    this.busy = true;
    this.bs.archiveRefreshRequired.subscribe(data => {
      this.busy = false;
      if (data === 'archive-from-dashboard' || data === 'archive-feature') {
        this.resetAndCloseFilters(true);
        this.resetFirstAndSort = true;
        this.ngOnInit();
      } else if (data === 'task-detail') {
        this.resetFirstAndSort = false;
        this.resetCurrentTableSortAndRefresh();
        //this.ngOnInit();
      }
    }, Error => {
      this.busy = false;
    });
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
    // if (this.showTrackDialogRef) {
    //   this.showTrackDialogRef['hide']();
    //   this.showTrack = false;
    // }
    // if (this.delegationMsgDialogRef)
    //   this.delegationMsgDialogRef['hide']();
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

  ngOnDestroy() {
    this.clearSubscriptions();
    this.archiveSelectedItem = [];
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.archiveWorkitems = {};
    this.archiveWorkitemsCopy = {};
    this.columns = [];
    this.inboxSelectedColumns = [];
    this.sentSelectedColumns = [];
    this.user = undefined;
    this.actions = [];
    this.selectedAction = undefined;
    this.disableAction = true;
    this.selectedCount = 0;
    //this.selectedTabIndex = 0;
    this.userInboxTabsTotalCount = 0;
    this.userSentTabsTotalCount = 0;
  }

  relaunchWorkItem(event) {
    this.ws.validateWorkitem(this.archiveSelectedItem[0].workitemId).subscribe(res1 => {
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
          this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.archiveSelectedItem[0].workitemId }]);
        });
      } else {
        this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.archiveSelectedItem[0].workitemId }]);
      }
    });
  }

  callAddMissingPermissions(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.archiveSelectedItem[0].actions;
    wia.attachments = this.archiveSelectedItem[0].attachments;
    wia.deadline = this.archiveSelectedItem[0].deadline;
    wia.id = this.archiveSelectedItem[0].workitemId;
    wia.instructions = this.archiveSelectedItem[0].instructions;
    wia.recipients = this.archiveSelectedItem[0].recipients;
    wia.reminder = this.archiveSelectedItem[0].reminder;
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

  assignSecurityForDelegate(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.archiveSelectedItem[0].actions;
    // wia.actionDetails = this.sentSelectedItem[0].actionName
    wia.attachments = this.archiveSelectedItem[0].attachments;
    wia.deadline = this.archiveSelectedItem[0].deadline;
    wia.id = this.archiveSelectedItem[0].workitemId;
    wia.instructions = this.archiveSelectedItem[0].instructions;
    wia.recipients = this.archiveSelectedItem[0].recipients;
    wia.reminder = this.archiveSelectedItem[0].reminder;
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
