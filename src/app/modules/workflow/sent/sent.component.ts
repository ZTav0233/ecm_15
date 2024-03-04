import {
  Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ViewChildren,
  QueryList, HostListener, AfterViewInit, ComponentRef, ElementRef, ViewContainerRef,
  ComponentFactoryResolver, Injector, AfterContentInit, OnChanges
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { User } from '../../../models/user/user.model';
// import { SelectItem, Message } from 'primeng/primeng';
// import { ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { FormControl, FormGroup } from '@angular/forms';
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
import { WorkflowDetails } from '../../../models/workflow/workflow-details.model';
import { Recipients } from '../../../models/user/recipients.model';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { WorkitemSet } from '../../../models/workflow/workitem-set.model';
import { WorkItemAction } from '../../../models/workflow/workitem-action.model';
import { WorkitemDetails } from '../../../models/workflow/workitem-details.model';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'inbox',
  templateUrl: './sent.component.html',
  providers: [ConfirmationService],
  styleUrls: ['../workflow.component.css']
})
export class SentComponent implements OnInit, OnDestroy {
  @ViewChild('dateBeforePanel') overlayPanel: OverlayPanel;
  public user = new User();
  emptyMessage: string = globalv.no_workitem_found;
  public disableAction = true;
  public actionDisabled = false;
  public sentSelectedItem: any[] = [];
  public colHeaders: any[] = [
    { field: 'actions', header: 'For', hidden: true },
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
  public isRoleActive = 'ACTIVE';
  public isAllActionsDisabled = false;
  public isFirstLoadCall = false;
  public getFromServer = false;
  public userGridView: any;
  public sentWorkitems: WorkitemSet = {};
  public sentWorkitemsCopy: WorkitemSet = {};
  public columns: any[] = [
    { label: 'For', value: 'actions' },
    { label: 'Sent On', value: 'lastItemSentOn' },
    { label: 'Workflow Created By', value: 'wfCreatorName' },
    { label: 'Workflow Created Date', value: 'createdOn' },
    { label: 'Deadline', value: 'deadline' }
  ];
  public selectedColumns: any[] = [];
  public actions: string[] = ['Archive', 'Archive Before', 'Add-User', 'Relaunch']; //'Recall' Removed for sentItem change
  selectedUser: any;
  userSetting = [];
  public itemActions: boolean
  type: any;
  beforeDate: Date;
  dateBeforeOverlayPanel: any;
  public selectedCount = 0;
  public selectedTabIndex = 0;
  public sentPreviousSelectedTab: any;
  filterCount: any;
  filterQuery: any;
  request: any = { pageNo: 1 };
  public userTabsTotalCount = 0;
  public roleTabsTotalCount: any[] = [];
  public delTabsTotalCount: any[] = [];
  public sender: SelectItem[] = [];
  public sentTieredItems: any[] = [
    {
      label: 'Export',
      icon: 'fa fa-fw ui-icon-assignment-returned',
      disabled: false,
      items: [
        {
          label: 'PDF',
          icon: 'fa fa-fw ui-icon-description', command: (event) => {
            this.exportSent('pdf');
          }
        },
        {
          label: 'Excel',
          icon: 'fa fa-fw ui-icon-assignment', command: (event) => {
            this.exportSent('excel');
          }
        }
      ]
    }
  ];
  @ViewChildren(FilterComponent) datatableComponent: QueryList<FilterComponent>;
  @ViewChildren(FilterComponent) filterComponent: QueryList<FilterComponent>;
  @ViewChildren(DataTableComponent) dataTableComponent: QueryList<DataTableComponent>;
  public recalled = false;
  sentItemId: any;
  public docEditPropForm: FormGroup;
  public saveDocInfo = new DocumentInfoModel();
  public fileselected = false;
  public entryTemp = false;
  public fileUploaded: any = undefined;
  private updateddDocuments = new FormData();
  private breadCrumbPath: any[] = [];
  public checkAllDisabled = true;
  public isWiSenderTotalCount = 0;
  workflowId: any;
  userType: any;
  senderId: any;
  workflowTrack: any = [];
  public subscriptions: Subscription[] = [];
  public advanceFilterShown = false;
  public selectedWorkitem: any = {};
  public displayProgress = false;
  public dashboardFilter = false;
  public showDelegationInactiveDialog = false;
  public dashboardSearchQuery: any[] = [];
  public forOptions: any[];
  public resetFirstAndSort = false;
  public defaultSortField;
  public defaultSortOrder;
  public expandedRowsGroups: string[] = [];
  public expandedRowsGroupsSubTotal = [];
  public tabsList: any[] = [];
  @ViewChild('sentConfirmation') confirmDialogRef: ElementRef;
  @ViewChild('showTrackDialog') showTrackDialogRef: ElementRef;
  @ViewChild('delegationMsgDialog') delegationMsgDialogRef: ElementRef;
  @ViewChildren('matMultiSelect') matMultiSelect; //To close column multi select overlay panel
  @ViewChild('progressDialog') progressDialogRef: ElementRef;
  public inactiveDialogMessage = 'Delegated user access has ended';
  private currentUser = new User();
  public isAllRecalled: any;
  public AddUserDialog = false;
  addUser: any = {
    documents: { existing: {}, new: {}, cartItems: [] },
    recipients: { roles: {}, list: {}, search: { result: [] }, toList: [], ccList: [] },
    workflow: { model: {} }
  };
  public trackColHeaders = [
    { field: 'recipientName', header: 'Recipient', hidden: false },
    { field: 'senderName', header: 'Sender Name', hidden: false },
    { field: 'sentOn', header: 'Sent On', hidden: false, sortField: 'sentOn2' },
    { field: 'actionUser', header: 'Action By', hidden: false },
    { field: 'status', header: 'Status', hidden: false }
  ];
  public workitemHistory: any;
  public trackWorkitemDetails: any;
  public fromPage: any;
  public showTrack = false;
  public busy: boolean;
  public progressObj = {};
  public today = new Date();
  public showOperationNotPossible = false;
  public messageDenyAction: any;
  activePage: string;
  constructor(private breadcrumbService: BreadcrumbService, private ws: WorkflowService, private route: ActivatedRoute,private toastr:ToastrService,
    private us: UserService, private bs: BrowserEvents, public coreService: CoreService,
    private confirmationService: ConfirmationService, public router: Router, private growlService: GrowlService) {
    this.subscribeRouterEvents();
    this.subscribeRefreshRequiredEvent();
    this.initAdduser();
  }

  action = new FormControl();
  public selectedAction: any;
  username: any;
  public usersTabTotalCountBadge: any[] = [];
  public showRecallInactiveDialog = false;

  ngOnInit() {

    this.setDefaultSort();
    let isOnInitCall = !this.resetFirstAndSort;
    this.isFirstLoadCall = true;
    this.getUserSetting();
    this.closeAllDialog();
    this.itemsPerPage = this.us.pageSize;
    this.userGridView = this.gridViewOptions.grouped.value;
    this.sentSelectedItem = [];
    this.filterCount = {
      total: -1,
      pageSize: 0,
      to: 0,
      cc: 0,
      reply: 0,
      new: 0,
      read: 0,
      forwarded: 0,
    };
    this.selectedUser = undefined;
    this.showDelegationInactiveDialog = false;
    this.type = undefined;
    this.selectedColumns = [{"field":"lastItemSentOn","header":"Sent On","hidden":false,"sortField":"lastItemSentOn2"},
                            {"field":"wfCreatorName","header":"Workflow Created By","hidden":false},
                            {"field":"createdOn","header":"Workflow Created Date","hidden":false,"sortField":"createdOn2"},
                            {"field":"deadline","header":"Deadline","hidden":false,"sortField":"deadline2"}]
    //['lastItemSentOn', 'wfCreatorName', 'deadline'];

    this.user = null;
    // get user details
    this.busy = true;
    this.us.logIn(globalv.username, 'def').subscribe(loginData => {
      this.busy = false;
      this.us.setCurrentUser(loginData);
      this.user = loginData;
      this.ws.getTabsCounter(this.user.EmpNo, 'sent').subscribe(counterData => {
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
      this.userSetting = result;
      let isFound = false;


      for (const setting of this.userSetting) {
        if (setting.key === 'Sent Selected Columns New') {
          isFound = true;
          if (setting.val) {
            let sentSelectedColumns = JSON.parse(setting.val);
            this.selectedColumns = sentSelectedColumns
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
  // this.coreService.displayProgress = false;
  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToSent') {
      //this.refreshTable('');
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
      forwarded: 0
    };
  }

  /**
   * @description sets default sort and order to the grid
   * @param sortField
   * @param sortOrder
   */
  setDefaultSort(sortField = 'lastItemSentOn2', sortOrder = -1) {
    this.defaultSortField = sortField;
    this.defaultSortOrder = sortOrder;
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
  * @description clear dashboard filter, reset page no and filter model
  */
  clearDashboardFilter() {
    this.sentSelectedItem = [];
    this.ws.openedWorkItem = undefined;
    $('.filter').slideUp();
    this.advanceFilterShown = false;
    this.resetFirst();
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
  }

  /**
   * @description Reset filter and clear the filter criteria and search again
   * @param skipSearchSent
   */
  resetAndCloseFilters(skipSearchSent = false) {
    this.sentSelectedItem = [];
    this.ws.openedWorkItem = undefined;
    this.advanceFilterShown = false;
    $('.filter').slideUp();
    this.clearFilter(skipSearchSent);
    this.resetFirst();
  }

  /**
   * @description Clear the filter criteria
   * @param skipSearchSent
   */
  clearFilter(skipSearchSent = false) {
    this.dashboardSearchQuery = [];
    this.dashboardFilter = false;
    this.resetFilterModel();
    this.isFirstLoadCall = false;
    this.breadcrumbService.sentDashboardFilterQuery = undefined;
    if (!skipSearchSent) {
      this.getSentItems();
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

  /**
   * @description get sender name for filter dropdown
   * @param id
   * @param userType
   */
  getFilterSenderOptions(id, userType) {
    this.sender = [];
    this.busy = true;
    this.ws.getSentitemFilterUsers(id, userType, 'active').subscribe(res => {
      this.busy = false;
      for (const user of res) {
        this.sender.push({ label: user.name, value: user.userType + ':' + user.id });
      }
    }, err => {
      this.busy = false;
    });
  }

  getData(data: any) {
    this.sentSelectedItem = data;
    this.actionDisabled = false;
    if (this.sentSelectedItem) {
      if (this.sentSelectedItem.length > 0) {
        this.disableAction = false;        
        this.selectedCount = this.sentSelectedItem.length;
        if(this.sentSelectedItem.length == 1){
          this.actionDisabled =  this.sentSelectedItem[0].actions == 'Initial' || this.sentSelectedItem[0].actions == 'Signature' ? true : false
        }else{
          for(let i = 0 ;i < this.sentSelectedItem.length ;i++){
            if(this.sentSelectedItem[i].actions == 'Initial' || this.sentSelectedItem[i].actions == 'Signature'){
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
   * @description reset first in datatable component to reset page no
   */
  resetFirst() {
    if (this.dataTableComponent) {
      this.dataTableComponent.forEach(dtComponent => {
        if (dtComponent.tabNameIdentifier === this.ws.sentSelectedUserTab) {
          dtComponent.resetFirst();
        }
      });
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
          if (data === 'Archive') {
            this.getSelectedItemDetails();
            this.archiveSentitems();
          } else if (data === 'Archive Before') {
            this.openOverlayPanel(op);
          } else if (data === 'Add-User') {
            this.getSelectedItemDetails();
            this.prepareAdduser(op);
          } else if (data === 'Relaunch') {
            this.getSelectedItemDetails();
            this.relaunchWorkItem(op);
          }
        }
      });
    } else {
      if (data === 'Archive') {
        this.getSelectedItemDetails();
        this.archiveSentitems();
      } else if (data === 'Archive Before') {
        this.openOverlayPanel(op);
      } else if (data === 'Add-User') {
        this.getSelectedItemDetails();
        this.prepareAdduser(op);
      } else if (data === 'Relaunch') {
        this.getSelectedItemDetails();
        this.relaunchWorkItem(op);
      }
    }
  
  }

  getSelectedItemDetails(){
    this.ws.getWorkitemDetailsBySentItem(this.sentSelectedItem[0].sentitemId).subscribe(res => {
      console.log(res)
      this.sentSelectedItem[0].workitemId = res.workitemId;
      this.sentSelectedItem[0]["docDate"]= res.docDate;
      this.sentSelectedItem[0]["docRecdDate"]= res.docRecdDate;
      this.sentSelectedItem[0]["refNo"]= res.refNo;
      this.sentSelectedItem[0]["projNo"]= res.projNo;
      this.sentSelectedItem[0]["contractNo"]= res.contractNo;
      this.sentSelectedItem[0]["ECMNo"]= res.ECMNo;
      this.sentSelectedItem[0]["actions"]=res.actions;
      this.sentSelectedItem[0]["type"]= res.type;
      this.sentSelectedItem[0]["receivedDate"]= res.receivedDate;
      this.sentSelectedItem[0]["senderRoleId"]= res.senderRoleId;
      this.sentSelectedItem[0]["senderEMPNo"]= res.senderEMPNo;
      this.sentSelectedItem[0]["recipientEMPNo"]= res.recipientEMPNo;
      this.sentSelectedItem[0]["recipientRoleId"]= res.recipientRoleId;
      this.sentSelectedItem[0]["systemStatus"]= res.systemStatus;
      this.sentSelectedItem[0]["recipientName"]= res.recipientName;
      this.sentSelectedItem[0]["reciLoginName"]= res.reciLoginName;
      this.sentSelectedItem[0]["senderLoginName"]= res.senderLoginName;
      this.sentSelectedItem[0]["attachments"]= res.attachments;
      this.sentSelectedItem[0]["recipients"]= res.recipients;
      this.sentSelectedItem[0].instructions = res.instructions;
      this.sentSelectedItem[0].deadline = res.deadline;
      this.sentSelectedItem[0].remarks =res.remarks;
      this.sentSelectedItem[0].wiRemarks =res.wiRemarks;
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
    }, err => {
      this.busy = false;
    });
  }

  addWorkitemProgress(event) {
    this.busy = true;
    this.ws.addWorkitemProgress(event.message,
      this.user.EmpNo, this.selectedWorkitem.workitemId)
      .subscribe(res => {
        this.busy = false;
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Workitem Progress Added Successfully'
        // });
        this.toastr.info('Reply Success', 'Success');
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
      key: 'sentitemConfirmation',
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

  columnSelectionChanged(event: any) {
    if (event) {
      this.selectedColumns=event
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
      this.updateGeneralSetting();
    }
    

    //  localStorage.setItem('sentSelectedColumns',JSON.stringify(this.selectedColumns))
  }

  updateGeneralSetting() {
    let isFound = false;
    for (const setting of this.userSetting) {
      if (setting.key === 'Sent Selected Columns New') {
        isFound = true;
        setting.val = JSON.stringify(this.selectedColumns)
      }
    }
    if(!isFound){
      this.userSetting.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Sent Selected Columns New',
        'val': JSON.stringify(this.selectedColumns)
    });
    }
    this.us.updateUserSettings(this.userSetting).subscribe(val => {
      this.busy = false;
    }, err => {
      this.busy = false;
    });
  }


  private _filterRecords(filterText, sortField, sortOrder, cb?) {
    /* let columnsToFilter = _.cloneDeep(this.selectedColumns);
     if (columnsToFilter.indexOf('subject') === -1)
       columnsToFilter.splice(0, 0, 'subject');
  
     let sentWorkItems = this.coreService.getFilterRecords(this.sentWorkitemsCopy.workitems, filterText, columnsToFilter);
     sentWorkItems = _.orderBy(sentWorkItems, [workItem => workItem[sortField].toString().toLowerCase()], [this.coreService.getSortOrderText(sortOrder)]);
     */
    this.request.sort = sortField;
    this.request.order = this.coreService.getSortOrderText(sortOrder, true);
    this.setDefaultSort(sortField, sortOrder);
    this._getSubjectFilteredFromServer(filterText, (sentWorkItems) => {
      if (cb)
        cb(sentWorkItems)
    });
  }

  assignSortNotPaginationInfo(data) {
    console.log(data);
    
    if (this.user) {
      if (!data || !data.rows) {
        return;
      }
      this.request.pageNo = Math.ceil(data.first / data.rows) + 1;
      if (data && data.filters.subject?.value && data.filters.subject?.value?.trim() && data.filters.subject?.value?.trim().length > 2) {
        // this.sentWorkitems.workitems = this._filterRecords(data.filters.subject.value.trim(), data.sortField, data.sortOrder);
        this._filterRecords(data.filters.subject.value.trim(), data.sortField, data.sortOrder, (sentWorkitems) => {
          this.sentWorkitems.workitems = sentWorkitems;
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
      
      if(!this.isFirstLoadCall)
        this.getSentItems();
    }
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

  private _getSubjectFilteredFromServer(filterText, cb?) {
    if(filterText.length >=3)
    {
      this.request.repStatus = 'active';
      let requestCopyForSubject = _.cloneDeep(this.request);
      requestCopyForSubject.subject = filterText;
      this.busy = true;
      this.ws.searchSentItems(requestCopyForSubject).subscribe(res => {
        this.busy = false;
        this.sentSelectedItem = [];
        this.ws.openedWorkItem = undefined;
        this.expandedRowsGroups = [];
        this.expandedRowsGroupsSubTotal = [];
        res.workitems.map((d) => {
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
  
        this.sentTieredItems.map((item, index) => {
          item.disabled = !res.workitems || res.workitems.length === 0;
        });
        if (cb)
          cb(res.workitems);
      }, err => {
        this.busy = false;
      });
    }
 
  }

  getSentItems(fromFilter = false) {
    fromFilter ? this.resetFirst() : null;
    if (this.user) {
      this.request.repStatus = 'active';
      this.request.empNo = this.user.EmpNo;
      this.busy = true;
      this.ws.searchSentItems(this.request).subscribe(res => {
        this.busy = false;
        this.sentSelectedItem = [];
        this.ws.openedWorkItem = undefined;
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
          d.progress = 'progress';
        });
        /*const oneDay = 24 * 60 * 60 * 1000;
        const tod = new Date();
        const arrDate = d.receivedDate.split('/');
        const rec = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2]);
        const diffDays = Math.round(Math.abs((tod.getTime() - rec.getTime()) / (oneDay)));
        d.daysleft = diffDays;*/
        //   d.isNew = (d.status.toLowerCase().trim() === 'new');
        // });
        this.recalled = false;
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

        this.sentWorkitemsCopy = _.cloneDeep(res);
        this.sentWorkitems = res;
        console.log(this.selectedTabIndex)
        let tab = this.tabsList[this.selectedTabIndex];

        if (tab && tab.quickFilterText && tab.quickFilterText.trim().length > 2) {
          //this.sentWorkitems.workitems = this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection);
          this._filterRecords(tab.quickFilterText.trim(), tab.sortField, tab.sortDirection, (sentWorkitems) => {
            this.sentWorkitems.workitems = sentWorkitems;
          });
        }
        else if (tab && tab.quickFilterText && tab.quickFilterText.trim().length < 3) {
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Message', detail: "Please enter more than 2 characters to filter"
          // });
          this.toastr.info('Please enter more than 2 characters to filter', 'Message');
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
            this.sentSelectedItem.push(this.ws.openedWorkItem.row);
            this.ws.openedWorkItem = undefined;
          }
        }
        localStorage.setItem('previousCount', res.totalCount);
      }, err => {
        this.busy = false;
      });
    }
  }

  sentGridTabChange(textLabel, index, reset, isOnInitCall, fromGrid?) {
    this.isFirstLoadCall = isOnInitCall;
    const selectedIndex = this.ws.sentSelectedUserTab && this.ws.sentSelectedUserTab.split('@');
    console.log(selectedIndex, 'selectedIndex');

    if (!this.request.exportFilter || (this.request.exportFilter && selectedIndex && selectedIndex.length && index != selectedIndex[0])) {
      this.sentTabChange(textLabel, index, reset, isOnInitCall);
    }
  }

  sentTabChange(textLabel, index, reset, isOnInitCall = false) {
    this.resetFilterModel();
    console.log(index, 'index');
    this.selectedTabIndex = index;
    this.ws.sentSelectedUserTab = this.selectedTabIndex + '@' + textLabel;
    this.sentSelectedItem = [];
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
     
        this.getSentItems();
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

  interceptRequestAndGetData(userName, reset, isOnInitCall) {
    if (this.user.roles && this.user.roles.length > 0) {
      for (const role of this.user.roles) {
        if (role.name === userName) {
          this.request.userType = 'ROLE';
          this.request.userId = role.id;
          this.request.empNo = role.id;
          this.request.recipientName = undefined;
          this.ws.delegateId = undefined;
          this.ws.delegateEmpNo = undefined;
          this.ws.roleId = role.id;
        }
      }
    }
    for (const delegate of this.user.delegated) {
      if (delegate.delName === userName) {
        this.request.userType = 'USER';
        this.request.userId = delegate.userId;
        //this.request.recipientName = 'USER:' + delegate.userId;
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
    if (this.user.fulName === userName) {
      this.request.userType = 'USER';
      this.request.userId = this.user.EmpNo;
      //this.request.recipientName = 'USER:' + this.user.EmpNo;
      this.request.empNo = this.user.EmpNo;
      this.ws.delegateId = undefined;
      this.ws.delegateEmpNo = undefined;
      this.ws.roleId = undefined;
    }
    if (!this.dashboardFilter) {
      if (!reset && this.sentPreviousSelectedTab && this.ws.pageNoSelected > 0 && this.ws.pageNoSelected !== undefined) {
        this.request.pageNo = this.ws.pageNoSelected;
      } else {
        this.ws.pageNoSelected = 0;
      }
      if (!isOnInitCall)
        this.getSentItems();
    }
    this.dashboardFilter = false;
  }

  toggleFilter() {
    $('.filter').slideToggle();
  }

  archiveSentitems() {
    let msg = "Do you want to Archive this workitem?";
    this.confirmationService.confirm({
      message: msg,
      header: 'Archive Confirmation',
      key: 'sentitemConfirmation',
      icon: 'fa fa-fw ui-icon-help',
      accept: () => {
        if (this.sentSelectedItem.length > 0) {
          let count = 0;
          this.sentSelectedItem.map((item, index) => {
            this.busy = true;
            this.ws.archiveSentitem(item.sentitemId).subscribe(data => {
              this.busy = false;
              count++;
              if (this.sentSelectedItem.length === count) {
                let totalCount = this.tabsList[this.selectedTabIndex].tabCount - this.sentSelectedItem.length;
                this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }]);
                this.sentSelectedItem = [];
                this.archiveSuccess();
              }
            }, err => {
              this.busy = false;
            });
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

  refresh() {
    throw new Error('Method not implemented.');
  }
  fail(error) {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Operation Failed'
    // });
    this.toastr.error('Operation Failed', 'Failure');
  }

  /**
   * @description Export the grid data to pdf/xsls
   * @param exportType
   */
  exportSent(exportType) {
    this.request.exportFilter = !!this.request.exportFilter;
    this.request.repStatus = 'active';
    let exportMimeType, extension;
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
      const fileName = 'Outbox_' + this.coreService.getDateTimeForExport() + extension;
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  /**
 * @description Refresh the grid data
 */
  refreshTable() {
    if (this.ws.sentSelectedUserTab) {
      this.sentPreviousSelectedTab = this.ws.sentSelectedUserTab.split('@');
      let propertiesToUpdate = [
        { property: 'sortField', value: 'lastItemSentOn2' },
        { property: 'lastRequest.sort', value: this.getSortingMapToRequest('lastItemSentOn2') },
        { property: 'pageNo', value: 1 },
        { property: 'lastRequest.pageNo', value: 1 },
        { property: 'sortDirection', value: -1 },
        { property: 'lastRequest.order', value: this.coreService.getSortOrderText(-1, true) }
      ];
      this._updateTabsList(this.request.userId, propertiesToUpdate);
      this.sentTabChange(this.sentPreviousSelectedTab[1], this.sentPreviousSelectedTab[0], false);
    }
  }

  /**
 * @description Reset the current table sorting and refresh the table
 */
  resetCurrentTableSortAndRefresh() {
    this.dataTableComponent.forEach(dtComponent => {
      if (dtComponent.tabNameIdentifier === this.ws.sentSelectedUserTab) {
        dtComponent.refresh();
      }
    });
  }

  openOverlayPanel(op) {
    // this.dateBeforeOverlayPanel = op;
    // op.visible = !op.visible;
    this.overlayPanel.toggle(event);
  }

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
    // if(this.checkDateForDisableActions(bDate)){
    //   this.disableActionBefore=true;
    // }
    // else{
    this.confirmationService.confirm({
      header: 'Archive?',
      key: 'sentitemConfirmation',
      message: 'All Workitems sent before' + ' ' + bDate + ' ' + 'will be shifted to archived items,are you sure?',
      accept: () => {
        //Actual logic to perform a confirmation
        this.ws.archiveSentitemBefore(empNo, roleId, bDate).subscribe(dat => {
          if (dat) {
            this.archiveBeforeSuccess(dat);
          } else {
            this.archiveFailed();
          }
        });
      }
    });
    //this.dateBeforeOverlayPanel.visible = false;
    //}
  }

  archiveBeforeSuccess(val) {
    if (val === 'Workitems not found') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Workitems', detail: 'No workitems found..Choose a different date'
      // });
      this.toastr.error('Operation Failed', 'Failure');
    } else {
      const count = this.getArchiveCount(val).trim();
      let message;
      if (count === '1') {
        message = count + ' ' + 'Workitem Archived';
      } else {
        message = count + ' ' + 'Workitems Archived';
      }
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: message
      // });
      this.toastr.info(message, 'Success');
      let totalCount = this.tabsList[this.selectedTabIndex].tabCount - parseInt(count, 10);
      this._updateTabsList(this.request.userId, [{ property: 'tabCount', value: totalCount }]);
      this.resetCurrentTableSortAndRefresh();
    }
  }

  getArchiveCount(str) {
    return str.split('-')[1];
  }


  redirectToArchive() {
    const selectedTab = this.ws.sentSelectedUserTab.split('@');
    const tabIndex = parseInt(selectedTab[0], 10);
    this.ws.archiveSelectedUserTab = (tabIndex * 2) + 1 + '@' + selectedTab[1] + 'Sent';
    // this.router.navigateByUrl('workflow/archive');
  }

  archiveSuccess() {
    window.parent.postMessage('ArchiveSuccess', '*');
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Archived Successfully'
    // });
    this.toastr.info('Archived Successfully', 'Success');
    this.resetCurrentTableSortAndRefresh();
  }

  archiveFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Archive Workitems'
    // });
    this.toastr.error('Failed To Archive Workitems', 'Failure');
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
    })
  }

  /**
  * @description Set the dashboard query filter(if exists) and hit tab change
  * @param isOnInitCall
  * @private
  */
  private async _setDashboardQueryAndTabChange(isOnInitCall) {
    if (this.breadcrumbService.sentDashboardFilterQuery && this.breadcrumbService.sentDashboardFilterQuery.filterStatus !== 'Actioned') {
      this.dashboardFilter = true;
      console.log(this.breadcrumbService)
      const id = this.breadcrumbService.sentDashboardFilterQuery.filterUserId;
      this.dashboardSearchQuery[id] = this.breadcrumbService.sentDashboardFilterQuery;
      this.sentTabChange(this.dashboardSearchQuery[id].filterUserName, this.dashboardSearchQuery[id].filterActiveTabIndex, false, isOnInitCall);
    } else {
      if (this.ws.sentSelectedUserTab) {
        this.sentPreviousSelectedTab = this.ws.sentSelectedUserTab.split('@');
        this.sentTabChange(this.sentPreviousSelectedTab[1], this.sentPreviousSelectedTab[0], false, isOnInitCall);
      } else {
        for (let i = 0; i < this.userSetting.length; i++) {
          if (this.userSetting[i].key == 'Default Tab') {
            if (this.userSetting[i].val == '' && this.user.roles.length > 0) {
              this.sentTabChange(this.user.roles[0].name, 1, false, isOnInitCall);
            } else if (this.userSetting[i].val != '') {
              console.log(this.userSetting[i].val)
              await this.activateSelectedTab(Number(this.userSetting[i].val), isOnInitCall)
            } else if (this.user) {
              this.sentTabChange(this.user.fulName, 0, false, isOnInitCall);
            }
            break;
          }
        }


        // //this.inboxTabChange(this.user.fulName, 1, false, isOnInitCall);
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
      this.sentTabChange(this.user.fulName, 0, false, true);
    } else if (this.user.roles && this.user.roles.length > 0) {
      for (let i = 0; i < this.user.roles.length; i++) {
        console.log(this.user.roles[i].id == selectedTab);
        if (this.user.roles[i].id == selectedTab) {
          this.sentTabChange(this.user.roles[i].name, i + 1, false, true);
          break;
        }

        if (i == this.user.roles.length - 1) {
          if (this.user.delegated && this.user.delegated.length > 0) {
            for (let j = 0; j < this.user.delegated.length; j++) {
              console.log(this.user.delegated[j].id == selectedTab);

              if (this.user.delegated[j].id == selectedTab) {
                this.sentTabChange(this.user.delegated[j].delName, (this.user.roles.length + 1) + j, false, true);
              }
            }
          } else if (this.user) {
            this.sentTabChange(this.user.fulName, 0, false, true);
          }
        }
      }
    } else {
      if (this.user.delegated && this.user.delegated.length > 0) {
        for (let j = 0; j < this.user.delegated.length; j++) {
          console.log(this.user.delegated[j].id == selectedTab);

          if (this.user.delegated[j].id == selectedTab) {
            this.sentTabChange(this.user.delegated[j].delName, (this.user.roles.length + 1) + j, false, true);
          }
        }
      } else if (this.user) {
        this.sentTabChange(this.user.fulName, 0, false, true);
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
      gridType: 'sent',
      userRoleDelegate: 'user',
      delegationId: null,
      tabCount: tabsCounter.userCount,
      tabIdentifier: 0 + '@' + user.fulName,
      sortField: 'lastItemSentOn2',
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
        gridType: 'sent',
        userRoleDelegate: 'role',
        delegationId: null,
        tabCount: roleCounter,
        tabIdentifier: (1 + i) + '@' + user.roles[i].name,
        sortField: 'lastItemSentOn2',
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
        gridType: 'sent',
        userRoleDelegate: 'delegate',
        delegationId: user.delegated[i].id,
        tabCount: delegateCounter,
        tabIdentifier: (1 + user.roles.length + i) + '@' + user.delegated[i].delName,
        sortField: 'lastItemSentOn2',
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
        { label: 'Outbox' },
        { label: tabLabel }
      ])
    } else {
      this.breadcrumbService.setItems([
        { label: 'Workflow' },
        { label: 'Outbox' },
        { label: this.user ? this.user.fulName : ' ' }
      ]);
      if (this.ws.sentSelectedUserTab) {
        this.sentPreviousSelectedTab = this.ws.sentSelectedUserTab.split('@');
        this.breadcrumbService.setItems([
          { label: 'Workflow' },
          { label: 'Outbox' },
          { label: this.sentPreviousSelectedTab[1] }
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
        if (this.router.url === '/workflow/sent') {
          this.setBreadcrumb();
          this.closeAllDialog();
        }
      }
    });
  }

  subscribeRefreshRequiredEvent() {
    this.busy = true;
    this.bs.sentRefreshRequired.subscribe(data => {
      this.busy = false;
      if (data === 'dashboard-filter') {
        this.clearDashboardFilter();
        this.resetFirstAndSort = true;
        this.ngOnInit();
      } else if (data === 'sent-from-dashboard' || data === 'sent-feature') {
        this.resetAndCloseFilters(true);
        this.resetFirstAndSort = true;
        this.ngOnInit();
      } else if (data === 'task-detail') {
        this.resetFirstAndSort = false;
        this.resetCurrentTableSortAndRefresh();
      }
    }, err => {
      this.busy = false;
    });
  }

  /**
   * @description Close all dialogs on page navigation
   */
  closeAllDialog() {
    // if (this.dataTableComponent) {
    //   this.dataTableComponent.map((d) => {
    //     d.hideAllDialog();
    //   })
    // }
    // if (this.matMultiSelect) {
    //   this.matMultiSelect['_results'].map((d) => {
    //     d['close']();

    //     d.overlayDir.open = false;
    //   })
    // }
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
    // if (this.showTrackDialogRef) {
    //   this.showTrackDialogRef['hide']();
    //   this.showTrack = false;
    // }
    // if (this.delegationMsgDialogRef)
    //   this.delegationMsgDialogRef['hide']();
    if (this.dateBeforeOverlayPanel)
      this.dateBeforeOverlayPanel.visible = false;
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
        this.showTrack = true;
      }
    }, err => {
      this.busy = false;
    });
  }

  showTrackWorkitem(event) {
    if (event.data.details !== 'Launch') {
      this.busy = true;
      this.ws.getWorkitem(event.data.workitemId, this.user.EmpNo).subscribe(data => {
        this.busy = false;
        this.trackWorkitemDetails = data
      }, err => {
        this.busy = false;
      });
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
    })
  }


  checkDateForDisableActions(date) {
    return moment((date), "DD/MM/YYYY").toDate() < moment((global.date_disable_action), "DD/MM/YYYY").toDate();

  }

  ngOnDestroy() {
    console.log("ngOnDestroy");
    
    this.datatableComponent.destroy();
    this.overlayPanel.toggle(event);
    this.filterComponent.destroy();
    this.breadcrumbService.sentDashboardFilterQuery = undefined;
    this.clearSubscriptions();
    this.sentSelectedItem = [];
    this.user = undefined;
    this.emptyMessage = undefined;
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.totalRecords = undefined;
    this.sentWorkitems = {};
    this.sentWorkitemsCopy = {};
    this.columns = [];
    this.selectedColumns = [];
    this.actions = [];
    this.selectedUser = undefined;
    this.type = undefined;
    this.selectedCount = 0;
    this.selectedTabIndex = 0;
    this.userTabsTotalCount = 0;
    this.roleTabsTotalCount = [];
    this.delTabsTotalCount = [];
    this.showOperationNotPossible = false;
    this.disableAction = true;
  }

  callAddMissingPermissions(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.sentSelectedItem[0].actions;
    // wia.actionDetails =this.sentSelectedItem[0].actionName
    wia.attachments = this.sentSelectedItem[0].attachments;
    wia.deadline = this.sentSelectedItem[0].deadline;
    wia.id = this.sentSelectedItem[0].workitemId;
    wia.instructions = this.sentSelectedItem[0].instructions;
    wia.recipients = this.sentSelectedItem[0].recipients;
    wia.reminder = this.sentSelectedItem[0].reminder;
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



  prepareAdduser(event) {
    console.log(this.ws)
    if (!!this.ws.delegateId) {
      this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          //this.getOrgRole(true);
          //this.getUserLists();
        }
      });
    } else if (!!this.ws.roleId) {
      this.us.validateRole(this.ws.roleId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Role access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.AddUserDialog = true;
          //this.getOrgRole(true);
          //this.getUserLists();
        }
      });
    } else {
      //this.getOrgRole(true);
      //this.getUserLists();
      console.log(this.sentSelectedItem)
      this.ws.validateSentItem(this.sentSelectedItem[0].sentitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
          this.AddUserDialog = false;
        } else {
          this.AddUserDialog = true;
          // this.router.navigate(['/workflow/launch', 'forward', {id: this.sentSelectedItem[0].workitemId}]);
        }
      });
    }
    if (this.ws.delegateId && this.ws.delegateId > 0) {
      this.assignSecurityForDelegate(cb => {
      });
    } else { }
  }

  closeAddUserModel() {
    this.addUser.recipients.toList = [];
    this.addUser.recipients.ccList = [];
  }

  prepareStepItems() {
    this.userExist(this.addUser.recipients);
  }

  userExist(recipients) {
    let exist = false;
    if (recipients.toList.length > 0 || recipients.ccList.length > 0) {
      this.sentSelectedItem[0].recipients.map((recUser) => {
        recipients.toList.map((toUser, index) => {
          if (recUser.name === toUser.name) {
            recipients.toList.splice(index, 1);
            exist = true;
          }
        });
        recipients.ccList.map((ccUser, index) => {
          if (recUser.name === ccUser.name) {
            recipients.ccList.splice(index, 1);
            exist = true;
          }
        });
      });
    }
    if (exist) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'User Already Exist'
      // });
      this.toastr.error('User Already Exist', 'Failure');
    }
  }

  searchRoleList() {
    this.addUser.recipients.roles.roleTree = this.addUser.recipients.roles.roleTree2.filter(e => {
      if (e.data.name) {
         e.data.name.toUpperCase().indexOf(this.addUser.recipients.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
  }


  cancelAddUserModel() {
    this.AddUserDialog = false;
    this.closeEditAttModal();
  }

  closeEditAttModal() {
    this.docEditPropForm.reset();
    this.saveDocInfo = null;
    this.fileselected = false;
    this.entryTemp = false;
    this.fileUploaded = undefined;
    this.updateddDocuments = new FormData();
  }

  adduserWorkitem() {
    this.ws.getWorkitemDetailsBySentItem(this.sentSelectedItem[0].sentitemId).subscribe(res => {
      this.sentSelectedItem[0].workitemId = res.workitemId
      this.sentSelectedItem[0]["docDate"]= res.docDate,
      this.sentSelectedItem[0]["docRecdDate"]= res.docRecdDate,
      this.sentSelectedItem[0]["refNo"]= res.refNo,
      this.sentSelectedItem[0]["projNo"]= res.projNo,
      this.sentSelectedItem[0]["contractNo"]= res.contractNo,
      this.sentSelectedItem[0]["ECMNo"]= res.ECMNo,
      this.sentSelectedItem[0]["actions"]=res.actions,
      this.sentSelectedItem[0]["type"]= res.type,
      this.sentSelectedItem[0]["receivedDate"]= res.receivedDate,
      this.sentSelectedItem[0]["senderRoleId"]= res.senderRoleId,
      this.sentSelectedItem[0]["senderEMPNo"]= res.senderEMPNo,
      this.sentSelectedItem[0]["recipientEMPNo"]= res.recipientEMPNo,
      this.sentSelectedItem[0]["recipientRoleId"]= res.recipientRoleId,
      this.sentSelectedItem[0]["systemStatus"]= res.systemStatus,
      this.sentSelectedItem[0]["recipientName"]= res.recipientName,
      this.sentSelectedItem[0]["reciLoginName"]= res.reciLoginName,
      this.sentSelectedItem[0]["senderLoginName"]= res.senderLoginName,
      this.sentSelectedItem[0]["attachments"]= res.attachments,
      this.sentSelectedItem[0]["recipients"]= res.recipients

    const wia = new WorkItemAction();
    wia.actions = this.sentSelectedItem[0].actions;
    // wia.actionDetails = this.sentSelectedItem[0].actionName
    wia.attachments = this.sentSelectedItem[0].attachments;
    wia.deadline = this.sentSelectedItem[0].deadline;
    wia.id = this.sentSelectedItem[0].workitemId;
    wia.instructions = this.sentSelectedItem[0].instructions ?  this.sentSelectedItem[0].instructions : '';
    wia.wiRemarks = this.sentSelectedItem[0].wiRemarks ? this.sentSelectedItem[0].wiRemarks : '';
    wia.recipients = this.sentSelectedItem[0].recipients;
    wia.workflow = new WorkflowDetails();
    // wia.workflow = this.sentSelectedItem[0];
    // console.log(wia)
    if (!!this.ws.delegateId) {
      wia.workflow.delEmpNo = this.user.EmpNo;
    }
    else {
      wia.workflow.delEmpNo = undefined
    }
    if (this.addUser.recipients.toList.length > 0) {
      for (const toUser of this.addUser.recipients.toList) {
        const user = new Recipients();
        user.name = toUser.name;
        user.userName = toUser.userName;
        user.actionType = toUser.actionType;
        user.userType = toUser.userType;
        if (toUser.userType === 'USER') {
          user.id = toUser.EmpNo;
        } else if (toUser.userType === 'ROLE') {
          user.id = toUser.id;
        }
        if (!this.alreadyExistInRecp(this.sentSelectedItem[0].recipients, user)) {
          wia.recipients.push(user);
        }
      }
    }
    if (this.addUser.recipients.ccList.length > 0) {
      for (const ccUser of this.addUser.recipients.ccList) {
        const user = new Recipients();
        user.name = ccUser.name;
        user.userName = ccUser.userName;
        user.actionType = ccUser.actionType;
        user.userType = ccUser.userType;
        if (ccUser.userType === 'USER') {
          user.id = ccUser.EmpNo;
        } else if (ccUser.userType === 'ROLE') {
          user.id = ccUser.id;
        }
        if (!this.alreadyExistInRecp(this.sentSelectedItem[0].recipients, user)) {
          wia.recipients.push(user);
        }
      }
    }
    wia.reminder = this.sentSelectedItem[0].reminder;
    wia.EMPNo = this.user.EmpNo;
    if (this.user.roles.length > 0) {
      wia.roleId = this.user.roles[0].id
    } else {
      wia.roleId = 0
    }
    // wia.wiAction = this.sentSelectedItem[0].actionId
    this.busy = true;
    this.ws.addUserWorkitem(wia).subscribe(data => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Added User Successfully'
      // });
      this.toastr.info('Added User Successfully', 'Success');
      //this.populateRecipients();
      this.getFirstWorkitemDetails();
      this.getWorkflowTrack();
    }, err => {
      this.busy = false;
    });
    this.AddUserDialog = false;
    this.addUser.recipients.toList = [];
    this.addUser.recipients.ccList = [];
  }, err => {
    this.busy = false;
  });
  }


  initAdduser() {
    this.addUser.documents.existing = {
      model: {
        contentSearch: { name: "Content", symName: "CONTENT", dtype: "STRING", mvalues: [] },
        actionType: 'Default'
      }
    };
    this.addUser.recipients.roles = {
      selectCriterions: [{ label: 'Title', value: 'NAME' },
      { label: 'Org Code', value: 'ORGCODE' }], result: [], model: { selectedCriterion: 'NAME' }
    };
    this.addUser.recipients.roles.roleTree = [];
    this.addUser.recipients.search = {
      result: [],
      searchCriterions: [{ label: 'Name', value: 'NAME' }, { label: 'Email', value: 'EMAIL' },
      { label: 'Designation', value: 'TITLE' }, { label: 'Phone', value: 'PHONE' }, { label: 'Org Code', value: 'ORGCODE' },
      { label: 'KOC No', value: 'KOCNO' }], model: { searchCriterion: 'NAME' }
    };
    this.addUser.recipients.list = { userList: [], selectedUserList: {}, subLists: [] };
  }

  getWorkflowTrack() {
    this.checkAllDisabled = true;
    this.isAllRecalled = true;
    this.isWiSenderTotalCount = 0;
    this.busy = true;
    this.ws.getWorkflowTrack(this.workflowId, this.userType).subscribe(data => {
      this.busy = false;
      if (data) {
        data.map(d => {
          d.sentOn2 = this.coreService.getTimestampFromDate(d.sentOn, null, '/');
          //d.timeStamp2 = this.coreService.getTimestampFromDate(d.timeStamp, null, '/');
          //d.deadline2 = this.coreService.getTimestampFromDate(d.deadline, null, '/');
          d.isWiSender = this.senderId === d.senderId && d.status !== 'Recalled';
          if (d.status !== 'Recalled') {
            this.isAllRecalled = false;
          }
          if (d.isWiSender) {
            this.checkAllDisabled = false;
            this.isWiSenderTotalCount += 1;
          }
          if (!d.hasOwnProperty('hasProgress'))
            d.hasProgress = false;
        });
        this.workflowTrack = data;
      }
    }, err => {
      this.busy = false;
    });
  }

  getFirstWorkitemDetails() {
    this.busy = true;
    this.ws.getWorkitemDetailsBySentItem(this.sentSelectedItem[0].sentitemId).subscribe(res => {
      this.busy = false;
      res.priority = this.coreService.getPriorityString(res.priority);
      this.sentSelectedItem[0] = res;
      this.isAllActionsDisabled = this.checkDateForDisableActions(this.sentSelectedItem[0].receivedDate);
      this.breadCrumbPath = [{ label: 'Workflow' }];
      if (this.fromPage[0] === 'sent') {
        this.breadCrumbPath.push({ label: 'Outbox', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.sentSelectedItem[0].senderRoleName) {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderRoleName });
        } else {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderName });
        }
      } else if (this.fromPage[0] === 'archive') {
        this.breadCrumbPath.push({ label: 'Archive', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.sentSelectedItem[0].senderRoleName) {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderRoleName + ' Outbox' });
        } else if (this.sentSelectedItem[0].senderName) {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderName + ' Outbox' });
        }
      } else if (this.fromPage[0] === 'actioned') {
        this.breadCrumbPath.push({ label: 'Actioned', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.sentSelectedItem[0].senderRoleName) {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderRoleName });
        } else {
          this.breadCrumbPath.push({ label: this.sentSelectedItem[0].senderName });
        }
      }
      this.breadCrumbPath.push({ label: this.sentSelectedItem[0].subject });
      this.breadcrumbService.setItems(this.breadCrumbPath);
    }, err => {
      this.busy = false;
    });
  }


  alreadyExistInRecp(recp, newUser) {
    let exist = false;
    recp.map((rec, index) => {
      if (rec.name === newUser.name) {
        exist = true;
      }
    });
    return exist
  }

  relaunchWorkItem(event) {
    console.log(this.sentSelectedItem[0])
    this.ws.validateWorkitem(this.sentSelectedItem[0].workitemId).subscribe(res1 => {
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
          this.ws.validateSentItem(this.sentSelectedItem[0].sentitemId).subscribe(res1 => {
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
    this.callAddMissingPermissions(cb =>  {
      if (this.ws.delegateId && this.ws.delegateId > 0) {
        this.assignSecurityForDelegate(cb => {
          this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.sentSelectedItem[0].workitemId }]);
        });
      } else {
        this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.sentSelectedItem[0].workitemId }]);
      }
    });
  }

  assignSecurityForDelegate(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.sentSelectedItem[0].actions;
    // wia.actionDetails = this.sentSelectedItem[0].actionName
    wia.attachments = this.sentSelectedItem[0].attachments;
    wia.deadline = this.sentSelectedItem[0].deadline;
    wia.id = this.sentSelectedItem[0].workitemId;
    wia.instructions = this.sentSelectedItem[0].instructions;
    wia.recipients = this.sentSelectedItem[0].recipients;
    wia.reminder = this.sentSelectedItem[0].reminder;
    wia.EMPNo = this.user.EmpNo;
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


