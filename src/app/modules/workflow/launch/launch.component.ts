import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
  ViewChildren,
  QueryList,
  Output,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
// service
import { WorkflowService } from '../../../services/workflow.service';
// import { UserService } from '../../../services/user.service';
import { ContentService } from '../../../services/content.service';
// models
import { User } from '../../../models/user/user.model';
import { ConfirmationService, Message } from 'primeng/api';
import { DocumentService } from '../../../services/document.service';
import { Subscription } from 'rxjs';
import { Attachment } from '../../../models/document/attachment.model';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BrowserEvents } from '../../../services/browser-events.service';
import { UserService } from '../../../services/user.service';
import { WorkItemAction } from '../../../models/workflow/workitem-action.model';
import { CoreService } from '../../../services/core.service';
import { Recipients } from '../../../models/user/recipients.model';
import { GrowlService } from '../../../services/growl.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as global from "../../../global.variables";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import * as _ from "lodash";
import * as moment from 'moment';
import { EventEmitter } from '@angular/core';
import { DocumentCartComponent } from '../../../components/generic-components/document-cart/document-cart.component';
import { MemoService } from '../../../services/memo.service';
import { filter } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  providers: [Location],
  styleUrls: ['launch.component.css']
})
export class LaunchComponent implements OnInit, OnDestroy {
  public currentUser: User = new User();
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  dropDownHideShow: boolean = false;
  public launch: any = {
    routeParams: {},
    documents: {
      existing: {},
      new: {},
      cartItems: []
    },
    recipients: {
      roles: { result: undefined },
      list: {},
      search: {},
      toList: [],
      ccList: []
    },
    workflow: { model: {} }
  };
  isRelaunch = false;
  replyRecipients = [];
  subjectDisabled = false;
  public actionType: any;
  public actionTypes: any;
  public wiaAction: any;
  wiaReply = new WorkItemAction();
  wiaForward = new WorkItemAction();
  wiaReplyAll = new WorkItemAction();
  private memoId: any = 0;
  private memoData: any;
  //items: any;
  reminderRequired = false;
  public distList = { 'id': 1, 'empNo': 1002, 'name': 'Distribution List', lists: [] };
  public globalList = { 'id': 1, 'empNo': 1002, 'name': 'Global List', lists: [] };
  public defaultList = { 'id': -1, 'empNo': 1002, 'name': 'Default List' };
  flag = true;
  public isFromDraft = false;
  emitActionType: any = 'Default';
  private searchTemplateNew: any;
  private documentClassesNew: any = [];
  private selectedDocumentClassNew: string;
  private tmpRoleTree = [];
  private searchResult: any;
  private subscriptions: Subscription[] = [];
  private breadCrumbPath: any[] = [];
  private activeIndex = 0;
  public bulkRole: any;
  public isDel: any;
  public colHeaders = [
    /*{field: 'creator', header: 'Created By'},
    {field: 'addOn', header: 'Added On'},
    {field: 'modOn', header: 'Modified On'},
    {field: 'modifier', header: 'Modified By'}];*/
    { field: 'creator', header: 'Created By' },
    { field: 'documentDate', header: 'Document Date' },
    { field: 'orgcode', header: 'OrgCode' },
    { field: 'ecmno', header: 'ECM No' },
    { field: 'addOn', header: 'Added On' }];
  private itemsPerPage = 8;
  private recepientsLoaded: boolean;
  private filteredRoles: any[];
  private actionId: any;
  private draftWorkflow: any;
  showIframe = false;
  public attach_url: SafeResourceUrl;
  public viewer = false;
  public emptyMessage: any;
  public previousUrl: any;
  private isContractUser: any = false;
  @ViewChildren(DataTableComponent) dataTableComponentRef: QueryList<DataTableComponent>;
  allSelectedValues = [];
  @Input() selectedValues = new EventEmitter();
  @Input() checkedItems = new EventEmitter();
  @ViewChild(DocumentCartComponent) documentCartComponent: DocumentCartComponent;
  public busy: boolean;
  public searchResultCopy: any[] = [];
  public step1TabIndex = 0;
  public criteria: any[] = [{ label: 'Name', value: 'userName' }, { label: 'Email', value: 'mail' },
  { label: 'Designation', value: 'title' }, { label: 'Phone', value: 'phone' },
  { label: 'Org Code', value: 'orgCode' }, { label: 'KOC No', value: 'empNo' }];
  public userSearchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: undefined
  };
  public roleSearchQueary = {
    userName: undefined, mail: undefined, title: undefined, phone: undefined, orgCode: undefined,
    empNo: undefined, userType: undefined, filter: undefined
  };
  public selectedType = 'USER';
  public roleSearchquery;
  public dlSearchquery;
  public favSearchquery;
  public defSearchquery;
  openNewDocDilaog = false;
  selectedIndexAccordion = 0;
  searchType: any;
  showRoleTree = false;
  public roleTreeData: any = { roles: { model: {} } };
  workflowType: any = 'Default';
  selectedCartItems: any;
  searchResultDocsSelected: any = [];
  public tabActiveIndex :any= 0;
  public openSearchDialog = false;
  public openAddFromFolderDilaog = false;
  public openSearchDialogLoaded = false;
  public openAddFromFolderDilaogLoaded = false;
  public openNewDocDilaogLoaded = false;
  public showRoleTreeLoaded = false;
  public deadLineTimes: any;
  public reminderTimes: any;
  public deadLineTime;
  public reminderTime;
  isDefaultTab = false;
  isDefaultTabRole = false;
  isRelaunchForReset = false;
  public defaultTabId: any = 0;
  defaultTabName = "";
  isSelectedAll = false
  pWidth = window.innerWidth;
  browsingOptions: { name: string; code: string; }[];
  selectedOptionForDocument
  public isMemoUser: boolean = false;
  constructor(
    private toastr:ToastrService,
    private ref: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
    private ws: WorkflowService,
    private sanitizer: DomSanitizer,
    private us: UserService,
    private bs: BrowserEvents,
    private contentService: ContentService,
    private documentService: DocumentService,
    private router: Router,
    private actroute: ActivatedRoute,
    private coreService: CoreService,
    private location: Location,
    private growlService: GrowlService,
    private userService: UserService,
    private memoService: MemoService,
    private confirmationService: ConfirmationService) {
    // Launch page Caching change
    //this.subscribeRouterEvents();
    //this.subscribeRefreshRequiredEvent();
    // this.deadLineTimes = _.cloneDeep(global.times);
    this.deadLineTimes = global.times;
    this.reminderTimes = _.cloneDeep(global.times);
    this.deadLineTime = { id: 30, time: '07:00 AM' };
    this.reminderTime = { id: 30, time: '07:00 AM' };
    this.browsingOptions = [
      { name: 'Search Existing Document', code: 'SD' },
      { name: 'Add New Document', code: 'BF' },
      { name: 'Add from Folder', code: 'AF' },
    ];
    this.init();
  }
  selectedOption() {
    console.log("selectedOption", this.selectedOptionForDocument.name)
    if (this.selectedOptionForDocument.name == "Search Existing Document") {
      this.openSearchDialog = true;
      this.openSearchDialogLoaded = true

    } else if (this.selectedOptionForDocument.name == "Add New Document") {
      this.openNewDocDilaog = true;
      this.openNewDocDilaogLoaded = true;
    } else if (this.selectedOptionForDocument.name == "Add from Folder") {
      this.openAddFromFolderDilaog = true;
      this.openAddFromFolderDilaogLoaded = true;
    }
  }
  myFunction(e) {
    // alert("I need to expand/collpase");
    e.stopPropagation();
  }

  init() {
 
    this.bs.setWfSubject.subscribe(d => {
      this.setWorkflowSubject();
    });
    this.currentUser = this.us.getCurrentUser();
    this.launch.documents.existing = {
      activeAccordionIndices: [0, 1],
      documentClasses: [],
      searchTemplate: undefined,
      model: {
        contentSearch: {
          name: "Content",
          symName: "CONTENT",
          dtype: "STRING",
          mvalues: []
        },
        actionType: 'Default',
        skip: 0
      },
      actionTypes: [{
        label: 'Default',
        value: 'Default'
      }, {
        label: 'Bulk Launch',
        value: 'bulkLaunch'
      }, {
        label: 'Signature',
        value: 'Signature'
      }, {
        label: 'Initial',
        value: 'Initial'
      }],
      matchTypes: [{
        label: 'Exact match',
        value: 'exact_match'
      }, {
        label: 'All of the words',
        value: 'all_of_the_words'
      }, {
        label: 'Any of the words',
        value: 'any_of_the_words'
      }],
      maxRowLimit: 250, isCurrent: true
    };
    this.launch.documents.cartItems = this.documentService.cartItems;
    this.launch.recipients.roles = {
      selectCriterions: [{ label: 'Title', value: 'NAME' },
      { label: 'Org Code', value: 'ORGCODE' }], result: undefined, model: { selectedCriterion: 'NAME' }
    };
    this.launch.recipients.roles.roleTree = [];
    this.launch.recipients.search = {
      searchCriterions: [{ label: 'Name', value: 'NAME' }, { label: 'Email', value: 'EMAIL' },
      { label: 'Designation', value: 'TITLE' }, { label: 'Phone', value: 'PHONE' }, { label: 'Org Code', value: 'ORGCODE' },
      { label: 'Koc No', value: 'KOCNO' }], model: { searchCriterion: 'NAME' }
    };
    this.launch.recipients.list = { userList: [], selectedUserList: {}, selectedSublist: {} };
    this.launch.workflow.forOptions = [];
    this.launch.workflow.priorityOptions = [
      { label: 'Normal', value: 2 },
      { label: 'High', value: 3 }
    ];
    this.launch.workflow.model.priority = 2;
    this.launch.workflow.model.isDeadlineEnabled = false;

    this.launch.launchBtnItems = [];
    this.launch.replyBtnItems = [];
    this.launch.forwardBtnItems = [];
    this.launch.replyAllBtnItems = [];

    this.loadUserSettings();
    this.assignLaunchUserOptions();
    //this.assignActionUserOptions();
    this.launch.currentDate = new Date();
  }

  assignLaunchUserOptions() {
    this.verifyContractUser();
    this.currentUser.roles.map((r, i) => {
      if (r.status === 'ACTIVE') {
        this.launch.launchBtnItems.push({
          'label': "Launch (On Behalf Of " + r.name + ")", command: event => {
            this.launchAsRole(r, 'normal');
          }
        });
      }
    });
    this.currentUser.delegated.map((d, i) => {
      this.launch.launchBtnItems.push({
        'label': "Launch (On Behalf Of " + d.delName + ")", command: event => {
          this.launchAsDelegatedUser(d, 'normal');
        }
      });
    });
    if (this.currentUser.roles.length > 0) {
      this.launch.launchBtnItems.push({
        'label': "Launch (As " + this.currentUser.fulName + ")", command: event => {
          this.launchAsCurrentUser('normal', 0, false, '');
        }
      });
    }
  }
  verifyContractUser(){
    this.userService.validateContractUser().subscribe((res) => {
      //console.log("validateContractUser :: " + res);
      if(res === "1"){
        this.isContractUser = true;
        if(this.actionTypes && (this.actionTypes == 'forward' || this.actionTypes == 'reply'))
          this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' },
                            { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }, 
                            { label: 'Multi Sign',  value: 'MultiSign' }]);
        else
          this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' }, {label: 'Bulk Launch', value: 'bulkLaunch'},
                            { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }, 
                            { label: 'Multi Sign',  value: 'MultiSign' }]);
      }
      else{
        this.isContractUser = false;
        if(this.actionTypes && (this.actionTypes == 'forward' || this.actionTypes == 'reply'))
          this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' },
                            { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }, 
                            { label: 'Multi Sign',  value: 'MultiSign' }]);
        else
          this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' }, {label: 'Bulk Launch', value: 'bulkLaunch'},
                            { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }, 
                            { label: 'Multi Sign',  value: 'MultiSign' }]);
      }
        
      this.busy = false;
    });
  }
  assignBulkLaunchOptions() {
    this.currentUser.roles.map((r, i) => {
      if (r.status === 'ACTIVE') {
        this.launch.launchBtnItems.push({
          'label': "Bulk launch (On Behalf Of " + r.name + ")", command: event => {
            //this.launchAsCurrentUser('bulk', r, false, '');
            this.launchAsRole(r, 'bulk');
          }
        });
      }
    });
    this.currentUser.delegated.map((d, i) => {
      this.launch.launchBtnItems.push({
        'label': "Bulk launch (On Behalf Of " + d.delName + ")", command: event => {
          //this.launchAsCurrentUser('bulk', d, false, 'del');
          this.launchAsDelegatedUser(d, 'bulk');
        }
      });
    });
    if (this.currentUser.roles.length > 0) {
      this.launch.launchBtnItems.push({
        'label': "Bulk launch (As " + this.currentUser.fulName + ")", command: event => {
          this.launchAsCurrentUser('bulk', 0, false, '');
        }
      });
    }
  }

  forwardAsCurrentUser(empNo, userName) {
    if (this.currentUser.EmpNo === empNo) {
      this.wiaForward.workflow.delEmpNo = 0;
      this.wiaForward.EMPNo = empNo;
      this.wiaForward.workflow.empNo = empNo;
      this.wiaForward.workflow.role = 0;
      this.wiaForward.roleId = 0;
      this.ws.sentSelectedUserTab = 0 + '@' + userName;
      this.setforwardWorkItem();
    } else {
      this.currentUser.delegated.map((del, index) => {
        if (del.userId === empNo) {
          this.forwardAsDelegatedUser(del);
        }
      });
    }
  }

  forwardAsRole(roleId) {
    this.wiaForward.workflow.delEmpNo = 0;
    this.wiaForward.workflow.role = roleId;
    this.wiaForward.roleId = roleId;

    this.currentUser.roles.map((role, index) => {
      if (role.id === roleId) {
        this.ws.sentSelectedUserTab = (index + 1) + '@' + role.name;
      }
    });
    this.setforwardWorkItem();
  }

  forwardAsDelegatedUser(d) {
    this.wiaForward.workflow.delEmpNo = this.currentUser.EmpNo;
    this.wiaForward.EMPNo = d.userId;
    this.wiaForward.workflow.empNo = d.userId;
    this.wiaForward.workflow.role = 0;
    this.wiaForward.roleId = 0;
    this.ws.sentSelectedUserTab = (this.currentUser.roles.length + this.currentUser.delegated.indexOf(d) + 1) + '@' + d.delName;
    this.setforwardWorkItem();
  }

  replyAsCurrentUser(empNo, userName) {
    console.log("replyAsCurrentUser")
    if (this.currentUser.EmpNo === empNo) {
      this.wiaReply.workflow.delEmpNo = 0;
      this.wiaReply.EMPNo = empNo;
      this.wiaReply.workflow.empNo = empNo;
      this.wiaReply.workflow.role = 0;
      this.wiaReply.roleId = 0;
      this.ws.sentSelectedUserTab = 0 + '@' + userName;
      this.reply();
    } else {
      this.currentUser.delegated.map((del, index) => {
        if (del.userId === empNo) {
          this.replyAsDelegatedUser(del);
        }
      });
    }
  }

  replyAsRole(roleId) {
    console.log("replyAsRole")
    this.wiaReply.workflow.delEmpNo = 0;
    this.wiaReply.workflow.role = roleId;
    this.wiaReply.roleId = roleId;
    this.currentUser.roles.map((role, index) => {
      if (role.id === roleId) {
        this.ws.sentSelectedUserTab = (index + 1) + '@' + role.name;
      }
    });
    this.reply();
  }

  replyAsDelegatedUser(d) {
    this.wiaReply.workflow.delEmpNo = this.currentUser.EmpNo;
    this.wiaReply.EMPNo = d.userId;
    this.wiaReply.workflow.empNo = d.userId;
    this.wiaReply.workflow.role = 0;
    this.wiaReply.roleId = 0;
    this.ws.sentSelectedUserTab = (this.currentUser.roles.length + this.currentUser.delegated.indexOf(d) + 1) + '@' + d.delName;
    this.reply();
  }

  replyAllAsCurrentUser(empNo, userName) {
    if (this.currentUser.EmpNo === empNo) {
      this.wiaReplyAll.workflow.delEmpNo = 0;
      this.wiaReplyAll.EMPNo = empNo;
      this.wiaReplyAll.workflow.empNo = empNo;
      this.wiaReplyAll.workflow.role = 0;
      this.wiaReplyAll.roleId = 0;
      this.ws.sentSelectedUserTab = 0 + '@' + userName;
      this.replyAll();
    } else {
      this.currentUser.delegated.map((del, index) => {
        if (del.userId === empNo) {
          this.replyAllAsDelegatedUser(del);
        }
      });
    }
  }

  replyAllAsRole(roleId) {
    this.wiaReplyAll.workflow.delEmpNo = 0;
    this.wiaReplyAll.workflow.role = roleId;
    this.wiaReplyAll.roleId = roleId;

    this.currentUser.roles.map((role, index) => {
      if (role.id === roleId) {
        this.ws.sentSelectedUserTab = (index + 1) + '@' + role.name;
      }
    });
    this.replyAll();
  }

  replyAllAsDelegatedUser(d) {
    this.wiaReplyAll.workflow.delEmpNo = this.currentUser.EmpNo;
    this.wiaReplyAll.EMPNo = d.userId;
    this.wiaReplyAll.workflow.empNo = d.userId;
    this.wiaReplyAll.workflow.role = 0;
    this.wiaReplyAll.roleId = 0;
    this.ws.sentSelectedUserTab = (this.currentUser.roles.length + this.currentUser.delegated.indexOf(d) + 1) + '@' + d.delName;
    this.replyAll();
  }

  clickIt() {
    this.flag = !this.flag;
  }

  ngOnInit() {
    this.bs.removeExistingAttachement.subscribe(data => {
      this.launch.workflow.model.attachments.map((d, i) => {
        if (d.docId === data.docId) {
          this.confirmationService.confirm({
            message: 'Are you sure that you want to remove existing attachment?',
            key: 'confirmationDraft',
            accept: () => {
              this.launch.workflow.model.attachments.splice(i, 1);
            }
          });
        }
      })
    });
    this.getUserLists();
    this.busy = true;
    
    this.us.validateMemoUser().subscribe((res) => {
      console.log("ValidateMemoUser :: " + res);
      if(res === "1")
        this.isMemoUser = true;
      else
        this.isMemoUser = false;
      this.busy = false;
    });

    this.busy = true;
    // this.actroute.data.subscribe(data => {
    //   this.busy = false;
    //   //this.contentService.entryTemplatesListForSearchAndAdd.addList=data.entryTemplateForSearchAndAdd.addList;
    //   //this.contentService.entryTemplatesListForSearchAndAdd.searchList=data.entryTemplateForSearchAndAdd.searchList;
    // }, Error => {
    //   this.busy = false;
    // });
    this.breadcrumbService.setItems([
      { label: 'Launch' }
    ]);
    this.busy = true;
    let isActRoute = 0;
    this.actroute.paramMap.subscribe(data => {
      //console.log("actroute inside :: " + data);
      this.busy = false;
      //console.log('actroute---------------'+new Date().getTime());
      const routeParams: any = data;
      this.launch.routeParams = routeParams.params;
      this.prepareStepItems();
      this.getDocumentCart();
      //this.getEntryTemplate();
      this.busy = true;
      this.actroute.params.subscribe(params => {
        this.busy = false;
        //console.log('routeParams---------------'+new Date().getTime());
        isActRoute = 1;
        routeParams.actionType = params['actionType'];
        this.assignActionType(routeParams);
      }, Error => {
        this.busy = false;
      });
    }, Error => {
      this.busy = false;
    });

    //console.log("isActRoute :: " + isActRoute);
    this.verifyContractUser();
    this.emptyMessage = global.no_doc_found;
  }


  loadUserSettings() {
    console.log("Inside loadUserSettings");
    if (this.us.userSettings) {
      this.us.userSettings.map((setting, i) => {
        if (setting.key === 'Default Tab') {
          if (setting.val) {
            this.isDefaultTab = true;
            this.defaultTabId = parseInt(setting.val, 10);
            this.currentUser.roles.map((r, i) => {
              if (r.id === this.defaultTabId) {
                this.defaultTabName = r.name;
                this.isDefaultTabRole = true;
              }
            });
            // if(this.defaultTabName === ""){
            //   this.currentUser.delegated.map((d, i) => {
            //     if (d.delegateId === this.defaultTabId) {
            //       this.defaultTabName = d.delName;
            //       this.isDefaultTabRole = true;
            //     }
            //   });
            // }
            if (this.defaultTabName === "") {
              this.defaultTabName = this.currentUser.name;
            }
          } else {
            this.isDefaultTab = false;
            this.defaultTabId = 0;
          }

        }
      });
    }
    else {
      this.busy = true;
      this.us.getUserSettings().subscribe(val => {
        this.busy = false;
        val.map((setting, i) => {
          if (setting.key === 'Default Tab') {
            if (setting.val) {
              this.isDefaultTab = true;
              this.defaultTabId = parseInt(setting.val, 10);
              this.currentUser.roles.map((r, i) => {
                if (r.id === this.defaultTabId) {
                  this.defaultTabName = r.name;
                  this.isDefaultTabRole = true;
                }
              });
              if (this.defaultTabName === "") {
                this.currentUser.delegated.map((d, i) => {
                  if (d.delegateId === this.defaultTabId) {
                    this.defaultTabName = d.delName;
                    this.isDefaultTabRole = true;
                  }
                });
              }
              if (this.defaultTabName === "") {
                this.defaultTabName = this.currentUser.name;
              }
            } else {
              this.isDefaultTab = false;
              this.defaultTabId = 0;
            }

          }
        });
      }, Error => {
        this.busy = false;
      });
    }

    console.log("isDefaultTab ==> " + this.isDefaultTab);
    console.log("defaultTabId ==> " + this.defaultTabId);
    console.log("defaultTabName ==> " + this.defaultTabName);
    console.log("isDefaultTabRole ==> " + this.isDefaultTabRole);
  }

  onActionTypeChanged(event) {
    this.workflowType = event.value;
    if (event.value === 'Signature' || event.value === 'Initial'|| event.value === 'MultiSign') {
      this.launch.recipients.ccList = [];
      this.launch.recipients.toList = [];
    }
    this.emitActionType = event.value;
    if (event.value === 'bulkLaunch') {
      this.subjectDisabled = true;
      //  if (this.documentService.cartItems.length > 0 && this.launch.workflow.model.subject === "") {
      if (this.selectedCartItems && this.selectedCartItems.length > 0 && this.launch.workflow.model.subject === "") {
        this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
      }
      else if (this.documentService.cartItems && this.documentService.cartItems.length > 0 && this.launch.workflow.model.subject === "") {
        this.launch.workflow.model.subject = this.documentService.cartItems[0].fileName;
      }
    } else if (!(this.isRelaunch || this.actionTypes === 'forward' || this.actionTypes === 'reply' || this.actionTypes === 'replyAll')) {
      this.subjectDisabled = false;
      //NEw added 21-Apr-2022----start
      if (this.selectedCartItems && this.selectedCartItems.length > 0 && this.launch.workflow.model.subject === "") {
        this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
      }
      else if (this.documentService.cartItems && this.documentService.cartItems.length > 0 && this.launch.workflow.model.subject === "") {
        this.launch.workflow.model.subject = this.documentService.cartItems[0].fileName;
      }
      //NEw added 21-Apr-2022----end
    }


    if (this.router.url.includes('reLaunch') && this.wiaAction) {
      if ((this.wiaAction.actions === 'Signature' || this.wiaAction.actions === 'Initial') && this.workflowType === 'Default')
        this.isRelaunchForReset = true;
    }

    this.assignActionTypes();
    this.prepareStepItems();
  }

  checkDoc(isAction?) {
    let array = [];
    isAction ? array = this.selectedCartItems : array = this.launch.documents.cartItems;
    let isSelectedCardInvalid = false;
    let docPdfWordCount = 0;
    let docPdfWordSignedCount = 0;
    let multiSignPDF = 0;
    if (array && array.length > 0) {
      array.map(doc => {
        if (doc.format.indexOf('pdf') !== -1 || doc.format.indexOf('word') !== -1) {
          docPdfWordCount++;
          if (doc.isSign == 1) {
            docPdfWordSignedCount++;
          }
          if(doc.format.indexOf('pdf') !== -1){
            multiSignPDF++;
          }
        }
      });
    }
    if (docPdfWordCount == 0&& this.launch.documents.existing.model.actionType !== 'MultiSign') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one PDF or MS word file should be selected for Signature/Initial.'
      // });
      this.toastr.error('At least one PDF or MS word file should be selected for Signature/Initial.', 'Not Allowed');
      isSelectedCardInvalid = true;
    } else if (docPdfWordSignedCount == 0&& this.launch.documents.existing.model.actionType !== 'MultiSign') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one document should be marked for eSign.'
      // });
      this.toastr.error('At least one document should be marked for eSign.', 'Not Allowed');
      isSelectedCardInvalid = true;
    }
    else if(this.launch.documents.existing.model.actionType==='MultiSign' && multiSignPDF == 0){
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'Only one PDF document should be selected for MultieSign.'
      // });
      this.toastr.error('Only one PDF document should be selected for MultieSign.', 'Not Allowed');
      isSelectedCardInvalid = true;
    }
    return isSelectedCardInvalid;
  }


  checkDocOtherActions(attachmentData, isAction?) {
    let array = [];
    isAction ? array = attachmentData : array = this.launch.documents.cartItems;
    let isSelectedCardInvalid = false;
    let docPdfWordCount = 0;
    let docPdfWordSignedCount = 0;
    let multiSignPDF = 0;
    if (array && array.length > 0) {
      array.map(doc => {
        if (doc.format.indexOf('pdf') !== -1 || doc.format.indexOf('word') !== -1) {
          docPdfWordCount++;
          if (doc.isSign == 1) {
            docPdfWordSignedCount++;
          }
        }
      });
    }
    if (docPdfWordCount == 0&& this.launch.documents.existing.model.actionType !== 'MultiSign') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one PDF or MS word file should be selected for Signature/Initial.'
      // });
      this.toastr.error('At least one PDF or MS word file should be selected for Signature/Initial', 'Not Allowed');
      isSelectedCardInvalid = true;
    } else if (docPdfWordSignedCount == 0&& this.launch.documents.existing.model.actionType !== 'MultiSign') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one document should be marked for eSign.'
      // });
      this.toastr.error('At least one document should be marked for eSign', 'Not Allowed');
      isSelectedCardInvalid = true;
    }
    else if(this.launch.documents.existing.model.actionType==='MultiSign' && multiSignPDF == 0){
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'Only one PDF document should be selected for MultieSign.'
      // });
      this.toastr.error('Only one PDF document should be selected for MultieSign.', 'Not Allowed');
      isSelectedCardInvalid = true;
    }
    return isSelectedCardInvalid;
  }

  onAccordionTabOpen($event) {
    this.launch.documents.existing.activeAccordionIndices = [];
    this.launch.documents.existing.activeAccordionIndices.push($event.index);
    if ($event.index === 0) {
      this.launch.documents.existing.activeAccordionIndices.push(1);
    }
  }

  updateSearchResultCopy(searchResult) {
    this.searchResultCopy = searchResult;
  }

  onAccordionTabClose($event) {
    const activeIndices = Object.assign([], this.launch.documents.existing.activeAccordionIndices);
    this.launch.documents.existing.activeAccordionIndices.map((activeIndex, i) => {
      if (activeIndex === $event.index) {
        activeIndices.splice(i, 1);
      }
      if ($event.index === 0 && activeIndex === 1) {
        activeIndices.splice(i - 1, 1);
      }
    });
    this.launch.documents.existing.activeAccordionIndices = activeIndices;
  }

  onDocumentSearchComplete(data) {
    //  this.launch.documents.existing.activeAccordionIndices.splice();
    this.launch.documents.existing.activeAccordionIndices = [1];
    this.searchResultCopy = data.dataCopy;
  }

  onRecipientRemoved() {
    setTimeout(() => {
      this.prepareStepItems();
    }, 1000);
  }

  onDocumentRemoved() {
    this.prepareStepItems();
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Document Removed From Cart'
    // });
    this.toastr.info('Document Removed From Cart', 'Success');
  }

  prepareStepItems() {
    if (this.launch.documents.existing.model.actionType === 'bulkLaunch') {
      this.launch.launchBtnItems = [];
      this.assignBulkLaunchOptions();
    } else {
      this.launch.launchBtnItems = [];
      this.assignLaunchUserOptions();
    }
  }

  assignDefaultsInWorkflow() {
    // if(!localStorage.getItem('workflowSubject')) {
    //modified on 19022019

    //Abhishek && !this.isRelaunch
    if ((this.actionTypes === 'launch' || (this.actionTypes === 'browseLaunch' && this.launch.documents.existing.model.actionType === 'bulkLaunch'))
      && !this.launch.workflow.model.subject && !this.launch.workflow.model.ECMNo) {
      if (this.launch.documents.cartItems.length > 0 && this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
        this.launch.workflow.model.ECMNo = this.selectedCartItems[0].ECMNo ? this.selectedCartItems[0].ECMNo : ' ';
      }
      else if (this.launch.documents.cartItems.length > 0 && (this.actionTypes === 'browseLaunch' && this.launch.documents.existing.model.actionType === 'bulkLaunch')) {
        this.launch.workflow.model.subject = this.launch.documents.cartItems[0].fileName;
        this.launch.workflow.model.ECMNo = this.launch.documents.cartItems[0].ECMNo ? this.launch.documents.cartItems[0].ECMNo : ' ';
      }
    }
    else if (this.actionTypes === 'draftLaunch' && this.draftWorkflow && this.wiaAction.attachments) {
      //this.launch.workflow.model.actions = this.draftWorkflow.actions.split(',');
      this.launch.workflow.model.actions = [];
      this.launch.workflow.model.ECMNo = this.wiaAction.attachments[0].ECMNo ? this.wiaAction.attachments[0].ECMNo : ' ';
    }
    //}
    // else{
    //   this.launch.workflow.model.subject=localStorage.getItem('workflowSubject');
    // }
  }

  assignSubjectFromCart(data) {
    this.launch.workflow.model.subject = data;
  }

  assignActionTypes(fn?) {
    this.launch.workflow.forOptions = [];
    if (this.launch.documents.existing.model.actionType.match(/Signature/) !== null) {
      this.launch.workflow.forOptions.push({ label: 'Signature', value: 'Signature' });
      this.launch.workflow.model.actions = [this.launch.workflow.forOptions[0].value];
      console.log(this.launch.workflow.model.actions)
    }
    else if (this.launch.documents.existing.model.actionType.match(/Initial/) !== null) {
      this.launch.workflow.forOptions.push({ label: 'Initial', value: 'Initial' });
      this.launch.workflow.model.actions = [this.launch.workflow.forOptions[0].value];
      console.log(this.launch.workflow.model.actions)

    
    }//MultiSign
    else if (this.launch.documents.existing.model.actionType.match(/MultiSign/) !== null) {
      this.launch.workflow.forOptions.push({ label: 'MultiSign', value: 'MultiSign' });
      this.launch.workflow.model.actions = [this.launch.workflow.forOptions[0].value];
      console.log(this.launch.workflow.model.actions);
    }
    else {
      //if (this.activeIndex === 2) {
      if (this.launch.routeParams.docId && this.selectedCartItems && this.selectedCartItems.length > 0) {
        //this.launch.documents.cartItems.map(d => {
        this.selectedCartItems.map(d => {
          d.name = d.fileName;
          if (d.id === this.launch.routeParams.docId) {
            this.populateWorkflowForm(d);
          }
        })
      } else if (this.launch.routeParams.docId && this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
        this.launch.workflow.model.attachments.map(d => {
          d.name = d.fileName;
          if (d.id === this.launch.routeParams.docId) {
            this.populateWorkflowForm(d);
          }
        })
      }
      else if (this.launch.routeParams.docId && this.launch.documents.cartItems && this.launch.documents.cartItems.length > 0) {
        this.launch.documents.cartItems.map(d => {
          d.name = d.fileName;
          if (d.id === this.launch.routeParams.docId) {
            this.populateWorkflowForm(d);
          }
        })
      }
      this.ws.getWorkflowActions().map(a => {
        if (a.name !== 'Signature' && a.name !== 'Initial'&& a.name !== 'MultiSign') {
          this.launch.workflow.forOptions.push({ label: a.name, value: a.name });
        }
      });
      if ((this.actionTypes !== 'draftLaunch' && !this.router.url.includes('reLaunch')) || this.isRelaunchForReset) {
        if (this.us.userSettings) {
          this.us.userSettings.map((setting, i) => {
            if (setting.key === 'Default Action') {
              if (setting.val) {
                if (setting.val !== '') {
                  this.launch.workflow.model.actions = [setting.val];
                } else {
                  this.launch.workflow.model.actions = [];
                }
              } else {
                this.launch.workflow.model.actions = [];
              }
            }
            if (setting.key === 'Page Size') {
              if (setting.val) {
                this.itemsPerPage = parseInt(setting.val, 10);
                this.launch.documents.existing.pageSize = 50;
              } else {
                this.itemsPerPage = 15;
                this.launch.documents.existing.pageSize = 50;
              }
            }
          });
        } else {
          this.busy = true;
          this.us.getUserSettings().subscribe(val => {
            this.busy = false;
            val.map((setting, i) => {
              if (setting.key === 'Default Action') {
                if (setting.val) {
                  if (setting.val !== '') {
                    this.launch.workflow.model.actions = [setting.val];
                  } else {
                    this.launch.workflow.model.actions = [];
                  }
                } else {
                  this.launch.workflow.model.actions = [];
                }
              }
              if (setting.key === 'Page Size') {
                if (setting.val) {
                  this.itemsPerPage = parseInt(setting.val, 10);
                  this.launch.documents.existing.pageSize = 50;
                } else {
                  this.itemsPerPage = 15;
                  this.launch.documents.existing.pageSize = 50;
                }
              }
            });
          }, Error => {
            this.busy = false;
          });
        }
      } else if (this.actionTypes === 'draftLaunch' && this.draftWorkflow) {
        //this.launch.workflow.model.actions = this.draftWorkflow.actions.split(',');
        this.launch.workflow.model.actions = [];
        this.launch.workflow.model.ECMNo = this.wiaAction.attachments[0].ECMNo ? this.wiaAction.attachments[0].ECMNo : ' ';
      } else if (this.router.url.includes('reLaunch') && this.wiaAction) {
        if (this.wiaAction.actions != '')
          this.launch.workflow.model.actions = this.wiaAction.actions.split(',');
      }
      if (fn) {
        fn();
      }
    }
  }

  goToNextStep(nextIndex) {
    this.activeIndex = nextIndex;
    if (nextIndex === 1) {
      this.loadRecepients();
    }
    if (nextIndex === 2) {
      this.loadWorkflow();
      this.assignDefaultsInWorkflow();
    }
  }

  loadRecepients() {
    /*if (this.launch.recipients.roles.roleTree.length === 0) {
      this.getOrgRole(true);
      this.getUserLists();
    }*/
    this.launch.recipients.roles.result = [];
    this.launch.recipients.search.result = [];
  }

  loadWorkflow() {
    this.initWorkflow();
  }

  initWorkflow() {
    this.assignActionTypes()
  }

  setChildren(parent, response, index) {
    let newParent;
    if (!parent.children) {
      parent.children = [];
      parent.children.push({
        label: response[index].headRoleName, data: response[index], expandedIcon: this.roleTreeExpandedIcon,
        collapsedIcon: this.roleTreeCollapsedIcon, leaf: false, expanded: true
      });
      newParent = parent.children[0];
    } else {
      parent.children.map(c => {
        if (c.data.id === response[index].id) {
          c.expanded = true;
          newParent = c;
        }
      })
    }
    if (index < response.length - 1) {
      this.setChildren(newParent, response, index + 1);
    } else {
      this.launch.recipients.roles.roleTree = this.tmpRoleTree;
    }
  }

  getUserSupervisorTree(tmpRoleTree) {
    this.busy = true;
    this.us.getUserSupervisorTree(this.currentUser.EmpNo).subscribe(res => {
      this.busy = false;
      if (res.length > 1) {
        this.setChildren(this.tmpRoleTree[0], res, 1);
      }
      else {
        this.launch.recipients.roles.roleTree = tmpRoleTree;
      }
    }, err => {
      this.busy = false;
    });
  }

  getOrgRole(init) {
    this.launch.recipients.roles.roleTree = [];
    this.busy = true;
    this.us.getRolesByTypeForUI(1, 0).subscribe(res => {
      this.busy = false;
      this.launch.recipients.roles.roleTree = res;//this.tmpRoleTree;
      this.launch.recipients.roles.roleTree2 = res;//this.tmpRoleTree;
    }, err => {
      this.busy = false;
    });
  }

  //favourite 0, default -1, dist=1, rest>1 will be in dist
  getUserLists() {
    this.busy = true;
    this.us.getUserLists(true).subscribe(res => {
      this.busy = false;
      const remainings = [];
      this.distList.lists = [];
      res.map((l, i) => {
        if (l.id > 1 && l.isGlobal === 'N') {
          this.distList.lists.push(l);
        } else if (l.id > 1 && l.isGlobal === 'Y') {
          this.globalList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.launch.recipients.list.userList = remainings;
      this.launch.recipients.list.userList.push(this.defaultList);
      this.launch.recipients.list.userList.push(this.distList);
      this.launch.recipients.list.userList.push(this.globalList);
    }, err => {
      this.busy = false;
    });
  }

  getSubOrgRoles(parent, init?) {
    this.busy = true;
    this.us.getSubRolesList(parent.data.id).subscribe(res => {
      this.busy = false;
      parent.children = [];
      res.map(d => {
        parent.children.push({
          label: d.headRoleName,
          data: d,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false
        });
      });
      if (init) {
        this.getUserSupervisorTree(this.tmpRoleTree);
      }
    }, err => {
      this.busy = false;
    });
  }

  searchUsersList() {
    this.busy = true;
    this.us.searchUsersList('ROLE', this.launch.recipients.roles.model.searchText,
      this.launch.recipients.roles.model.selectedCriterion, '').subscribe(res => {
        this.busy = false;
        this.launch.recipients.roles.result = res;
      }, err => {
        this.busy = false;
      });
  }

  // getListUsers(event, type) {
  //   let list;
  //   if (event.value && event.value[0]) {
  //     list = event.value[0];
  //   }
  //   if (!list) {
  //     list = event;
  //   }
  //
  //   if (list.lists) {
  //     this.launch.recipients.list.subLists = list.lists;
  //     return;
  //   } else if (type === 'list') {
  //     this.launch.recipients.list.subLists = [];
  //   }
  //   if (list.users) {
  //     this.launch.recipients.list.selectedUserList = list;
  //     return;
  //   }
  //
  //
  //   const subscription = this.us.getListUsers(list.id).subscribe(res => {
  //     list.users = res;
  //     this.launch.recipients.list.selectedUserList = list;
  //   }, err => {
  //
  //   });
  //   this.coreService.progress = {busy: subscription, message: '', backdrop: true};
  //   this.addToSubscriptions(subscription);
  // }

  getListUsers(event, type) {
    let list;
    if (event.value && event.value[0]) {
      list = event.value[0];
    }
    if (!list) {
      list = event;
    }
    if (list.lists || list.users) {
      if (type === 'sublist') {
        this.launch.recipients.list.selectedSublist = list;
      } else {
        this.launch.recipients.list.selectedUserList = list;
        this.launch.recipients.list.selectedSublist = undefined;
      }
      return;
    }
    this.busy = true;
    this.us.getListUsers(list.id).subscribe((res: any) => {
      this.busy = false;
      list.users = res;
      if (type === 'sublist') {
        this.launch.recipients.list.selectedSublist = list;
      } else {
        this.launch.recipients.list.selectedUserList = list;
        this.launch.recipients.list.selectedSublist = undefined;
      }
    }, err => {
      this.busy = false;
    });
  }

  getRoleMembers(role, type) {
    if (role.id > 0 && (!role.members && role.members !== '') && (type === 'roleList' || ((type === 'fav' || type === 'defaultList') && role.appRole === 'ROLE'))) {
      let RoleNameString = '';
      // this.busy = true;
      this.us.getRoleMembers(role.id).subscribe(res => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  getRoleMembersForTree(role, type?) {
    if (role.id > 0 && (!role.members && role.members !== '')) {
      let RoleNameString = '';
      // this.busy = true;
      this.us.getRoleMembers(role.id).subscribe(res => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  getListUsersForTooltip(list) {
    if (list.id > 0 && (!list.members && list.members !== '') && (!list.appRole || list.appRole === 'ROLE')) {
      let RoleNameString = '';
      // this.busy = true;
      this.us.getListUsers(list.id).subscribe((res: any) => {
        // this.busy = false;
        for (const RName of res) {
          if (RName.appRole === 'ROLE') {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>people</i>' + ' ' + RName.fulName;
          }
          if (RName.appRole === 'USER') {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.fulName;
          }
        }
        list.members = RoleNameString.slice(1);
      }, err => {
        // this.busy = false;
      });
    }
  }

  setWorkflowSubject() {
    if ((this.actionTypes === 'launch' || (this.actionTypes === 'browseLaunch'))
      && !this.isRelaunch && !this.launch.workflow.model.subject) {
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
      }
      else if (this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
        this.launch.workflow.model.subject = this.launch.workflow.model.attachments[0].fileName;
      }
      else if (this.launch.documents.cartItems && this.launch.documents.cartItems.length > 0) {
        this.launch.workflow.model.subject = this.launch.documents.cartItems[0].fileName;
      }
    }
  }

  getDocumentCart(isFromAdd?) {
    this.busy = true;
    this.documentService.getCart(this.currentUser.EmpNo).subscribe((data) => {
      this.busy = false;
      this.documentService.refreshCart(data);
      if (isFromAdd) {
        this.setWorkflowSubject();
      }
      if ((this.actionTypes === 'launch' || (this.actionTypes === 'browseLaunch'))
        && !this.isRelaunch && !this.launch.workflow.model.subject && !this.launch.workflow.model.ECMNo) {
        if (this.selectedCartItems && this.selectedCartItems.length > 0) {
          this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
          this.launch.workflow.model.ECMNo = this.selectedCartItems[0].ECMNo ? this.selectedCartItems[0].ECMNo : ' ';
        }
        else if (this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
          this.launch.workflow.model.subject = this.launch.workflow.model.attachments[0].fileName;
          this.launch.workflow.model.ECMNo = this.launch.workflow.model.attachments[0].ECMNo ? this.launch.workflow.model.attachments[0].ECMNo : ' ';
        }
        else if (this.launch.documents.cartItems && this.launch.documents.cartItems.length > 0) {
          this.launch.workflow.model.subject = this.launch.documents.cartItems[0].fileName;
          this.launch.workflow.model.ECMNo = this.launch.documents.cartItems[0].ECMNo ? this.launch.documents.cartItems[0].ECMNo : ' ';
        }
      }
      /*if (this.launch.routeParams.docId) {
        this.launch.documents.cartItems.map(d => {
          d.name = d.fileName;
          if (d.id === this.launch.routeParams.docId) {
            this.populateWorkflowForm(d);
          }
        })
      }*/
      this.prepareStepItems();
    }, (err) => {
      this.busy = false;
    });
  }

  getEntryTemplate() {
    this.busy = true;
    this.contentService.getEntryTemplates().subscribe(data => {
      this.busy = false;
      data.map((d) => {
        this.documentClassesNew.push({ value: d.id, label: d.symName });
      });
      if (data[0]) {
        this.selectedDocumentClassNew = data[0].id;
        this.getEntryTemplateId(data[0].id);
      }
    }, err => {
      this.busy = false;
    });
  }

  getEntryTemplateId(id) {
    this.busy = true;
    this.contentService.getEntryTemplatesId(id).subscribe(data => {
      this.busy = false;
      this.searchTemplateNew = data;
    }, err => {
      this.busy = false;
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  switchDocumentClassNew() {
    this.getEntryTemplateId(this.selectedDocumentClassNew);
  }

  changeAction(action) { }

  removeFromCart(item) {
    console.log("remove from cart called");
    this.busy = true;
    this.documentService.removeFromCart(this.currentUser.EmpNo, item.id).subscribe((data) => {
      this.busy = false;
      this.launch.documents.cartItems.map((d, i) => {
        if (d.id === item.id) {
          this.launch.documents.cartItems.splice(i, 1);
        }
      });

      console.log("remove from cart selectedCartItems called");
      this.selectedCartItems.map((d, i) => {
        if (d.id === item.id) {
          this.selectedCartItems.splice(i, 1);
          console.log("remove from cart selectedCartItems spliced");
        }
      });

      this.prepareStepItems();
    }, (err) => {
      this.busy = false;
    });
  }

  expandNode(event) {
    this.getSubOrgRoles(event.node, false);
  }

  addToCart(doc) {
    if (this.actionTypes === 'draftLaunch') {
      if (!(this.existsInAttachment(this.launch.workflow.model.attachments, doc))) {
        this.addToCart2(doc);
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Document Already Exists in Draft Attachment'
        // });
        this.toastr.error('Document Already Exists in Draft Attachment', 'Failure');
      }
    } else {
      this.addToCart2(doc);
    }
  }

  addToCart2(doc) {
    this.busy = true;
    this.documentService.addToCart(this.currentUser.EmpNo, doc.id).subscribe(res => {
      this.busy = false;
      this.openNewDocDilaog = false;
      if (res === 'OK') {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Document Added To Cart'
        // });
        this.toastr.info('Document Added To Cart', 'Success');
        this.getDocumentCart(true);
        window.parent.postMessage('AddCartSuccess', '*');
      }
      else if (res === 'Exists') {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Already Exist', detail: 'Document Already Exist in Cart'
        // });
        this.toastr.error('Document Already Exist in Cart', 'Already Exist');
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Add To Cart Failed'
        // });
        this.toastr.error('Add To Cart Failed', 'Failure');
      }
      if (res.status !== 'Exists' && (this.actionTypes === 'forward' || this.actionTypes === 'reply' || this.actionTypes === 'replyAll')) {
        let temp = [...[doc]];
        let newarray = [];
        newarray = this.documentService.checkedCartItems;
        temp.map(d => {
          newarray.push(d);
        });
        //console.log(newarray);
        this.bs.setCartSelection.emit(newarray);
      }
    }, Error => {
      this.busy = false;
    });
  }

  downloadDoc(doc) {
    window.location.assign(this.documentService.downloadDocument(doc.id));
  }

  addToToList(role) {
    if (!this.existsInList(role)) {
      role.userType = 'ROLE';
      role.actionType = 'TO';
      if (role.fulName) {
        role.name = role.fulName;
        role.userType = 'USER';
      }
      if (role.headRoleName) {
        role.name = role.headRoleName;
        role.userType = 'ROLE';
        //role.userName = role.adGroup;
      }
      role.disabled = true;
      this.launch.recipients.toList.push(role);
      this.launch.recipients.toList=[...this.launch.recipients.toList]
      
      this.prepareStepItems();
    }
  }

  addToCCList(role) {
    if (!this.existsInList(role)) {
      role.userType = 'ROLE';
      role.actionType = 'CC';
      if (role.fulName) {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.headRoleName) {
        role.userType = 'ROLE';
        role.name = role.headRoleName;
        //role.userName = role.adGroup;
      }
      role.disabled = true;
      this.launch.recipients.ccList.push(role);
      this.launch.recipients.ccList=[...this.launch.recipients.ccList]
      this.prepareStepItems();
    }
  }

  // addListUsersToToList(list) {
  //   if (list.users) {
  //     list.users.map(l => {
  //       if (!this.existsInList(l)) {
  //         l.disabled = true;
  //         this.launch.recipients.toList.push(l);
  //       }
  //     });
  //     //this.prepareStepItems();
  //   } else {
  //     const subscription = this.us.getListUsers(list.id).subscribe(users => {
  //       users.map(l => {
  //         if (!this.existsInList(l)) {
  //           l.disabled = true;
  //           this.launch.recipients.toList.push(l);
  //         }
  //       });
  //       //this.prepareStepItems();
  //     }, err => { });
  //     this.coreService.progress = {busy: subscription, message: '', backdrop: true};
  //     this.addToSubscriptions(subscription);
  //   }
  // }
  // addListUsersToCCList(list) {
  //   if (list.users) {
  //     list.users.map(l => {
  //       if (!this.existsInList(l)) {
  //         l.disabled = true;
  //         this.launch.recipients.ccList.push(l);
  //       }
  //     });
  //     this.prepareStepItems();
  //   } else {
  //     const subscription = this.us.getListUsers(list.id).subscribe(users => {
  //       list.users.map(l => {
  //         if (!this.existsInList(l)) {
  //           l.disabled = true;
  //           this.launch.recipients.ccList.push(l);
  //         }
  //       });
  //       this.prepareStepItems();
  //     }, err => { });
  //     this.coreService.progress = {busy: subscription, message: '', backdrop: true};
  //     this.addToSubscriptions(subscription);
  //   }
  // }

  addListUsersToToList(list, isDefaultOrFav?) {
    if (!isDefaultOrFav) {
      if (!list.userName) {
        if (list.users) {
          list.users.map(l => {
            if (!this.existsInList(l)) {
              if (l.appRole === 'ROLE') {
                l.userType = 'ROLE';
              } else if (l.appRole === 'USER') {
                l.userType = 'USER';
              }
              l.actionType = 'TO';
              l.disabled = true;
              this.launch.recipients.toList.push(l);
              this.launch.recipients.toList=[...this.launch.recipients.toList]
            }
          });
          this.prepareStepItems();
        } else {
          this.busy = true;
          this.us.getListUsers(list.id).subscribe((users: any) => {
            this.busy = false;
            users.map(l => {
              if (!this.existsInList(l)) {
                if (l.appRole === 'ROLE') {
                  l.userType = 'ROLE';
                } else if (l.appRole === 'USER') {
                  l.userType = 'USER';
                }
                l.actionType = 'TO';
                l.disabled = true;
                this.launch.recipients.toList.push(l);
                this.launch.recipients.toList=[...this.launch.recipients.toList]
              }
            });
            list.users = users;
            this.prepareStepItems();
          }, err => {
            this.busy = false;
          });
        }
      }
      else {
        if (!this.existsInList(list)) {
          if (list.appRole === 'ROLE') {
            list.userType = 'ROLE';
          } else if (list.appRole === 'USER') {
            list.userType = 'USER';
          }
          list.actionType = 'TO';
          list.disabled = true;
          this.launch.recipients.toList.push(list);
          this.launch.recipients.toList=[...this.launch.recipients.toList]
          this.prepareStepItems();
        }
      }
    }
    else {
      if (!this.existsInList(list)) {
        if (list.appRole === 'ROLE') {
          list.userType = 'ROLE';
        } else if (list.appRole === 'USER') {
          list.userType = 'USER';
        }
        list.actionType = 'TO';
        list.disabled = true;
        this.launch.recipients.toList.push(list);
        this.launch.recipients.toList=[...this.launch.recipients.toList]
        this.prepareStepItems();
      }
    }
  }

  addListUsersToCCList(list, isDefaultOrFav?) {
    if (!isDefaultOrFav) {
      if (!list.userName) {
        if (list.users) {
          list.users.map(l => {
            if (!this.existsInList(l)) {
              if (l.appRole === 'ROLE') {
                l.userType = 'ROLE';
              } else if (l.appRole === 'USER') {
                l.userType = 'USER';
              }
              l.actionType = 'CC';
              l.disabled = true;
              this.launch.recipients.ccList.push(l);
              this.launch.recipients.ccList=[...this.launch.recipients.ccList]
            }
          });
          this.prepareStepItems();
        } else {
          this.busy = true;
          this.us.getListUsers(list.id).subscribe((users: any) => {
            this.busy = false;
            users.map(l => {
              if (!this.existsInList(l)) {
                if (l.appRole === 'ROLE') {
                  l.userType = 'ROLE';
                } else if (l.appRole === 'USER') {
                  l.userType = 'USER';
                }
                l.actionType = 'CC';
                l.disabled = true;
                this.launch.recipients.ccList.push(l);
                this.launch.recipients.ccList=[...this.launch.recipients.ccList]
              }
            });
            list.users = users;
            this.prepareStepItems();
          }, err => {
            this.busy = false;
          });
        }
      }
      else {
        if (!this.existsInList(list)) {
          if (list.appRole === 'ROLE') {
            list.userType = 'ROLE';
          } else if (list.appRole === 'USER') {
            list.userType = 'USER';
          }
          list.actionType = 'CC';
          list.disabled = true;
          this.launch.recipients.ccList.push(list);
          this.launch.recipients.ccList=[...this.launch.recipients.ccList]
          this.prepareStepItems();
        }
      }
    }
    else {
      if (!this.existsInList(list)) {
        if (list.appRole === 'ROLE') {
          list.userType = 'ROLE';
        } else if (list.appRole === 'USER') {
          list.userType = 'USER';
        }
        list.actionType = 'CC';
        list.disabled = true;
        this.launch.recipients.ccList.push(list);
        this.launch.recipients.ccList=[...this.launch.recipients.ccList]
        this.prepareStepItems();
      }
    }
  }
  isPresentinMemoFromThruList(obj){
    let exist = false;
    if (obj.EmpNo) {
      obj.id = obj.EmpNo;
    }
    if(this.memoData && this.memoData.recipients){
      var recipientsData = this.memoData.recipients.filter(word => (word.recipientType == "FROM" || word.recipientType == "THRU"));
      if(recipientsData && recipientsData.length > 0){
        recipientsData.map((reci, index) => {
          if (reci.userId === obj.id &&  reci.userType === obj.appRole) {
            exist = true;
          }
        });
      }
    }
    
    return exist;

  }

  addToCCListFromList(role) {
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'CC';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'CC';
        role.name = role.fulName;
      }
      role.disabled = true;
      this.launch.recipients.ccList.push(role);
      this.launch.recipients.ccList=[...this.launch.recipients.ccList]
      this.prepareStepItems();
    }
  }

  addToToListFromList(role) {
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'TO';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'TO';
        role.name = role.fulName;
      }
      role.disabled = true;
      this.launch.recipients.toList.push(role);
      console.log(this.launch.recipients.toList);
      
      this.prepareStepItems();
      this.launch.recipients.toList=[...this.launch.recipients.toList]
    }
  }

  existsInList(role) {
    let exists = false;
    if (role.fulName) {
      role.name = role.fulName;
    }
    if (role.headRoleName) {
      role.name = role.headRoleName;
    }
    if ((this.launch.documents.existing.model.actionType === 'Signature' 
          || this.launch.documents.existing.model.actionType === 'Initial' 
          || this.launch.documents.existing.model.actionType === 'MultiSign')
              && this.launch.recipients.toList.length === 1) {
      role.disabled = true;
      if (role.name === this.launch.recipients.toList[0].name && this.launch.recipients.toList[0].id === role.id) {
        return true;
      } else {
        return false;
      }
    }
    if (role.EmpNo) {
      role.id = role.EmpNo;
    }
    this.launch.recipients.toList.concat(this.launch.recipients.ccList).map(r => {
      if (r.name === role.name && r.id === role.id) {
        exists = true;
      }
    });
    role.disabled = exists;
    console.log(role.disabled)
    return exists;
  }

  dupCheckForRecipients(data) {
    let exists = false;
    this.launch.recipients.toList.concat(this.launch.recipients.ccList).map(r => {
      if (r.name === data.name && r.id === data.id) {
        exists = true;
      }
    });

    return exists;
  }

  existsInListUserList(role) {
    return false;
  }

  existsInAttachment(attachment, newDoc) {
    let exist = false;
    attachment.map((att, index) => {
      if (att.docId === newDoc.id) {
        exist = true;
      }
    });
    return exist
  }

  existsInCart(cart, att) {
    let exist = false;
    cart.map((item, index) => {
      if (item.id === att.docId) {
        exist = true;
      }
    });
    return exist
  }

  searchRoles(event, q) {
    if ((this.launch.documents.existing.model.actionType === 'Signature' 
        || this.launch.documents.existing.model.actionType === 'Initial' 
        || this.launch.documents.existing.model.actionType === 'MultiSign')
          && this.launch.recipients.toList.length === 1) {
      this.filteredRoles = [];
      return;
    }
    this.filteredRoles = this.launch.recipients.search.result.concat(this.launch.recipients.roles.result)
      .filter(r => r.name.indexOf(event.query) !== -1
        && !this.existsInList(r));
  }

  searchUsers(selectedType) {
    this.selectedType = selectedType;
    let isSignInit;
    if (this.launch.documents.existing.model.actionType === 'Signature') {
      isSignInit = 'esign';
    }
    else if (this.launch.documents.existing.model.actionType === 'Initial') {
      isSignInit = 'initial'
    }
    else if (this.launch.documents.existing.model.actionType === 'MultiSign') {
      isSignInit = 'esign'
    }
    else {
      isSignInit = this.launch.documents.existing.model.actionType;
    }
    let searchQueary = {
      'userName': undefined, 'title': undefined, 'mail': undefined,
      'empNo': undefined, 'orgCode': undefined, 'phone': undefined,
      'userType': selectedType, 'filter': isSignInit
    };
    if (selectedType === 'USER') {
      searchQueary = Object.assign({}, this.userSearchQueary);
    } else {
      searchQueary = Object.assign({}, this.roleSearchQueary);
    }
    searchQueary.userType = selectedType;
    searchQueary.filter = isSignInit;

    let formValid = true;
    if ((searchQueary.userName !== undefined && searchQueary.userName !== '' && searchQueary.userName !== null) ||
      (searchQueary.title !== undefined && searchQueary.title !== '' && searchQueary.title !== null) ||
      (searchQueary.mail !== undefined && searchQueary.mail !== '' && searchQueary.mail !== null) ||
      (searchQueary.empNo !== undefined && searchQueary.empNo !== '' && searchQueary.empNo !== null) ||
      (searchQueary.orgCode !== undefined && searchQueary.orgCode !== '' && searchQueary.orgCode !== null) ||
      (searchQueary.phone !== undefined && searchQueary.phone !== '' && searchQueary.phone !== null)) {
    } else {
      formValid = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Warning', detail: 'Fill Any One Field To Search'
      // });
      this.toastr.error('Fill Any One Field To Search', 'Warning');
    }
    if (formValid) {
      if (searchQueary.userName === "") {
        delete searchQueary.userName;
      }
      if (searchQueary.orgCode === "") {
        delete searchQueary.orgCode;
      }
      this.busy = true;
      this.us.searchEcmUsers(searchQueary).subscribe(data => {
        this.busy = false;
        if (data.length === 0) {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'No Result', detail: 'No Results Found'
          // });
          this.toastr.error('No Results Found', 'No Result');
        }
        if (selectedType === 'ROLE') {
          this.launch.recipients.roles.result = data;
        } else {
          this.launch.recipients.search.result = data;
        }
      }, err => {
        this.busy = false;
      });
    }
  }

  onTabOpen(e) {
    let tabName = '';
    this.launch.recipients.search.defSearchquery = '';
    this.launch.recipients.search.favSearchquery = '';
    this.launch.recipients.search.dlSearchquery = '';
    this.selectedIndexAccordion = e.index;
    let temparray = [];
    // if (this.selectedIndexAccordion === 0 || this.selectedIndexAccordion === 1 || this.selectedIndexAccordion === 2 ||
    //   this.selectedIndexAccordion === 3) {
    if (this.selectedIndexAccordion === 0) {
      tabName = 'Default List';
      this.busy = true;
      this.us.getListUsers(-1).subscribe((res: any) => {
        this.busy = false;
        this.launch.recipients.list.selectedUserList.lists = res;
        this.launch.recipients.list.selectedUserList.lists2 = res;
      }, err => {
        this.busy = false;
      });
    }
    else if (this.selectedIndexAccordion === 1) {
      tabName = 'Favorites';
      // this.busy = true;  //commented because of issue with accordion
      this.us.getListUsers(0).subscribe((res: any) => {
        //this.busy = false;
        this.launch.recipients.list.selectedUserList.users = res;
        this.launch.recipients.list.selectedUserList.users2 = res;
      }, err => {
        //this.busy = false;
      });
    }
    else if (this.selectedIndexAccordion === 2) {
      tabName = 'Distribution List';
      if (this.launch.recipients.list.userList.length > 0) {
        this.launch.recipients.list.userList.map(d => {
          if (d.name === tabName) {
            this.launch.recipients.list.selectedUserList.lists = d.lists;
            this.launch.recipients.list.selectedUserList.lists2 = d.lists;
          }
        });
      }
      else {
        this.launch.recipients.list.selectedUserList.lists2 = [];
        this.launch.recipients.list.selectedUserList.lists = [];
      }
    }
    else if (this.selectedIndexAccordion === 3) {
      tabName = 'Global List';
      if (this.launch.recipients.list.userList.length > 0) {
        this.launch.recipients.list.userList.map(d => {
          if (d.name === tabName) {
            this.launch.recipients.list.selectedUserList.lists = d.lists;
            this.launch.recipients.list.selectedUserList.lists2 = d.lists;
          }
        });
      }
      else {
        this.launch.recipients.list.selectedUserList.lists2 = [];
        this.launch.recipients.list.selectedUserList.lists = [];
      }
      if (this.launch.recipients.search.roleSearchquery && this.launch.recipients.search.roleSearchquery != '') {
        this.launch.recipients.search.roleSearchquery = '';
        this.searchRL(this.launch.recipients.search.roleSearchquery);
      }
      //this.getOrgRole(true);
    }
    // if (this.selectedIndexAccordion === 1) {
    //   this.busy = true;
    //   this.us.getListUsers(0).subscribe((res: any) => {
    //     this.busy = false;
    //     this.launch.recipients.list.selectedUserList.users = res;
    //     this.launch.recipients.list.selectedUserList.users2 = res;
    //   }, err => {
    //     this.busy = false;
    //   });
    // }
    // else if (this.selectedIndexAccordion === 0) {
    //
    // }
    // else {
    //
    // }
    //}
    // if (this.selectedIndexAccordion === 5) {
    //   this.selectedType = 'ROLE';
    // }
    // else if (this.selectedIndexAccordion === 6) {
    //   this.selectedType = 'USER';
    // }
  }

  onDocumentAdded(doc) {
    if (this.actionTypes === 'draftLaunch') {
      if (!(this.existsInAttachment(this.launch.workflow.model.attachments, doc))) {
        this.addToCart2(doc);
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Document Already Exists in Draft Attachment'
        // });
        this.toastr.error('Document Already Exists in Draft Attachment', 'Failure');
      }
    } else {
      this.addToCart2(doc);

    }
  }

  initWorkflowObj(draft) {
    const workflow: any = {
      EMPNo: undefined,
      roleId: undefined,
      workflow: {
        role: undefined,
        roleId: undefined,
        ECMNo: undefined,
        empNo: undefined,
        docDate: 1452364200000,
        docRecDate: 1452709800000,
        isMemo:0,
        memoId:0
      },
      wiAction: 'LAUNCH',
      draftId: 0,
      draft: draft,
      actionDetails: 'New',
      attachments: [],
      recipients: [],
      workflowBulk: []
    };
    workflow.workflow = Object.assign({}, this.launch.workflow.model);
    workflow.actions = workflow.workflow.actions ? workflow.workflow.actions.toString() : '';
    workflow.workflow.actions = undefined;
    workflow.workflow.role = 0;
    workflow.workflow.projNo = 0;
    workflow.workflow.refNo = 0;
    workflow.workflow.docDate = 1452364200000;
    workflow.workflow.docRecDate = 1452709800000;
    workflow.workflow.contractNo = 0;
    workflow.roleId = 0;
    workflow.priority = 0;
    workflow.wiRemarks = undefined;
    if (!workflow.workflow.deadlineDate) {
      workflow.deadline = null;
    } else {
      workflow.deadline = this.coreService.getFormattedDateString(workflow.workflow.deadlineDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      workflow.deadline = workflow.deadline + " " + this.deadLineTime.time;
    }
    if (workflow.workflow.instructions) {
      workflow.instructions = workflow.workflow.instructions;
      workflow.workflow.instructions = undefined;
    }

    workflow.workflow.deadlineDate = undefined;
    if (!workflow.workflow.reminderDate) {
      workflow.reminder = null;
    } else {
      workflow.reminder = this.coreService.getFormattedDateString(workflow.workflow.reminderDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      workflow.reminder = workflow.reminder + " " + this.reminderTime.time;
    }
    if (workflow.workflow.wiAction) {
      workflow.wiAction = workflow.workflow.wiAction;
      workflow.workflow.wiAction = undefined;
    }
    if (workflow.workflow.draftId) {
      workflow.draftId = workflow.workflow.draftId;
      workflow.workflow.draftId = undefined;
    }
    if (workflow.workflow.attachments) {
      workflow.attachments = workflow.workflow.attachments;
    }
    if (workflow.workflow.attachments) {
      workflow.workflow.ECMNo = workflow.workflow.ECMNo;
    } else {
      workflow.workflow.ECMNo = "";
    }


    workflow.workflow.attachments = undefined;
    workflow.workflow.reminderDate = undefined;
    /*if (!workflow.workflow.docFrom) {
      workflow.workflow.docFrom = "";
    }
    if (!workflow.workflow.docTo) {
      workflow.workflow.docTo = "";
    }*/
    if (!workflow.workflow.keywords) {
      workflow.workflow.keywords = "";
    }
    if (!workflow.workflow.remarks) {
      workflow.workflow.remarks = "";
    }
    if (this.currentUser.roles.length > 0 && !draft) {
      workflow.workflow.role = this.currentUser.roles[0].id;
      workflow.roleId = this.currentUser.roles[0].id;
    }
    workflow.EMPNo = this.currentUser.EmpNo;
    workflow.workflow.empNo = this.currentUser.EmpNo;
    workflow.workflow.delEmpNo = 0;

    return workflow;
  }

  launchAsDelegatedUser(delegated, type) {
    console.log("launchAsDelegatedUser == type " + type);
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    console.log("Launch ActionType == " + launchActionType);
    console.log("Selected Cart Items == " + this.selectedCartItems);

    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)
              && (!this.launch.workflow.model.attachments || this.launch.workflow.model.attachments.length <=0)) {
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }
    if ((this.launch.documents.existing.model.actionType === 'Signature' 
            || this.launch.documents.existing.model.actionType === 'Initial' 
            || this.launch.documents.existing.model.actionType === 'MultiSign') && launchActionType !== 'reLaunch') {
      if (this.checkDoc()) {
        return;
      }
    }

    //&& this.actionTypes !== 'draftLaunch' && !this.router.url.includes('reLaunch')
    if (this.selectedCartItems && this.selectedCartItems.length > 0 && this.actionTypes !== 'draftLaunch' && type !== 'bulk' && this.launch.workflow.model.ECMNo) {
      if (!this.isSetECMNoDocExist()) {
        this.launch.workflow.model.ECMNo = this.selectedCartItems[0].ECMNo ? this.selectedCartItems[0].ECMNo : ' ';
      }
    }

    const workflow: any = this.initWorkflowObj(false);
    workflow.workflow.delEmpNo = this.currentUser.EmpNo;
    workflow.workflow.role = 0;
    workflow.roleId = 0;
    workflow.EMPNo = delegated.userId;
    workflow.workflow.empNo = delegated.userId;
    this.ws.sentSelectedUserTab = (1 + this.currentUser.roles.length + this.currentUser.delegated.indexOf(delegated)) + '@' + delegated.delName;
    if (type === 'bulk') {
      this.bulkRole = 0;
    }
    this.launchWorkflow(workflow, type, false);
  }

  clearCart(draft, isBulk = false, isReplyForward?) {
    if (!draft) {
      window.parent.postMessage('GoToSent', '*');
    }
    if (!isReplyForward) {
      this.busy = true;
      this.contentService.clearCart().subscribe((data) => {
        this.busy = false;
        if (draft) {
          this.navigateToDraft();
        } else {
          //this.navigateToSent();
          this.navigateToInbox();
        }
      }, (err) => {
        this.busy = false;
      });
      window.parent.postMessage('LaunchSuccess', '*');
    } else {
      let tem = { docIds: [] };
      this.selectedCartItems.map(d => {
        tem.docIds.push(d.id);
      });
      this.busy = true;
      this.documentService.removeFromCartMulti(tem).subscribe((data) => {
        this.busy = false;
        //console.log(this.selectedCartItems.length);
        window.parent.postMessage({ v1: 'setCartCount', v2: this.selectedCartItems.length }, '*');
        if (draft) {
          this.navigateToDraft();
        } else {
          //this.navigateToSent();
          this.navigateToInbox();
        }
      }, (err) => {
        this.busy = false;
      });
    }
  }

  navigateToDraft() {
    // this.router.navigate(['/workflow/draft']);
    // window.parent.postMessage('DraftSaveSuccess', '*');

    // navigate to draft or reload and navigate to draft
    let launchRefreshCounter = localStorage.getItem('launchRefreshCounter');
    let counter = 0;
    if (launchRefreshCounter) {
      counter = parseInt(launchRefreshCounter, 10);
    } else {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.setItem('launchRefreshCounter', '1');
      this.router.navigate(['/workflow/draft']);
      window.parent.postMessage('DraftSaveSuccess', '*');
    }
    if (counter > 3) {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.setItem('navigateToDraft', 'true');
      localStorage.removeItem('launchRefreshCounter');
      this.router.navigate(['/workflow/draft']);
      window.parent.postMessage('Reload', '*');
    } else {
      const count = counter + 1;
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      //console.log(count);
      localStorage.setItem('launchRefreshCounter', (count).toString());
      this.router.navigate(['/workflow/draft']);
      window.parent.postMessage('DraftSaveSuccess', '*');
    }
  }

  navigateToDashboard() {
    localStorage.removeItem('sentSelectedUserTab');
    localStorage.removeItem('navigateToDraft');
    if ((this.actionTypes === 'launch' || this.actionTypes === 'bulkLaunch') && !this.isRelaunch) {
      //this.router.navigate(['/workflow/launch']);
      this.router.navigate(['/']);
      window.parent.postMessage('LoadDash', '*');
    }
    else {
      this.location.back();
      this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))  // Use pipe to apply the filter operator
      .subscribe(e => this.identifyNavigateScreen(e));
    }
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'RefreshCart') {
      this.getDocumentCart();
    }
  }

  navigateToSent() {
    //this.bs.inboxRefreshRequired.emit('sent-feature');

    // this.bs.sentRefreshRequired.emit('sent-feature');
    // this.router.navigate(['/workflow/sent']);
    // window.parent.postMessage('ReplySuccess', '*');

    // navigate to sent or reload and navigate to sent
    let launchRefreshCounter = localStorage.getItem('launchRefreshCounter');
    let counter = 0;
    if (launchRefreshCounter) {
      counter = parseInt(launchRefreshCounter, 10);
    } else {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.setItem('launchRefreshCounter', '1');
      this.bs.sentRefreshRequired.emit('sent-feature');
      this.router.navigate(['/workflow/sent']);
      window.parent.postMessage('ReplySuccess', '*');
    }
    if (counter > 3) {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.setItem('sentSelectedUserTab', this.ws.sentSelectedUserTab);
      localStorage.removeItem('launchRefreshCounter');
      window.parent.postMessage('Reload', '*');
    } else {
      const count = counter + 1;
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      //console.log(count);
      localStorage.setItem('launchRefreshCounter', (count).toString());
      this.bs.sentRefreshRequired.emit('sent-feature');
      this.router.navigate(['/workflow/sent']);
      window.parent.postMessage('ReplySuccess', '*');
    }
  }


  navigateToInbox() {
    this.bs.inboxRefreshRequired.emit('inbox-feature');
    this.router.navigate(['/workflow/inbox']);
    //window.parent.postMessage('ReplySuccess', '*');
    window.parent.postMessage('GoToInbox', '*');
  }


  launchByRoleId(roleId, type) {
    console.log("launchByRoleId == roleId " + roleId);
    let role: any = null;
    this.currentUser.roles.map((r, i) => {
      if (r.id === roleId) {
        role = r;
      }
    });
    console.log("launchByRoleId - Call launchAsRole == role " + role.id);
    this.launchAsRole(role, type);

  }


  launchAsRole(role, type) {
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)
              && (!this.launch.workflow.model.attachments || this.launch.workflow.model.attachments.length <=0)) {
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }

    if ((this.launch.documents.existing.model.actionType === 'Signature' 
        || this.launch.documents.existing.model.actionType === 'Initial' 
        || this.launch.documents.existing.model.actionType === 'MultiSign') && launchActionType !== 'reLaunch') {
      if (this.checkDoc(true)) {
        return;
      }
    } else {
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.selectedCartItems.map(cartItem => {
          delete cartItem.isSign;
        })
      }
    }

    if (this.selectedCartItems && this.selectedCartItems.length > 0 && this.actionTypes !== 'draftLaunch' && type !== 'bulk' && this.launch.workflow.model.ECMNo) {
      if (!this.isSetECMNoDocExist()) {
        this.launch.workflow.model.ECMNo = this.selectedCartItems[0].ECMNo ? this.selectedCartItems[0].ECMNo : ' ';
      }
    }

    const workflow = this.initWorkflowObj(false);
    workflow.workflow.role = role.id;
    workflow.roleId = role.id;
    this.bulkRole = role;
    // if(this.router.url.includes('reLaunch')){
    //   role.name
    // }
    let temp = role.name;
    if (!temp) {
      temp = this.currentUser.fulName;
    }
    this.ws.sentSelectedUserTab = (1 + this.currentUser.roles.indexOf(role)) + '@' + temp;
    this.launchWorkflow(workflow, type, false);
  }

  launchAsCurrentUser(type, id, draft, flag?) {
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    console.log("launchActionType" + launchActionType);

    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)
              && (!this.launch.workflow.model.attachments || this.launch.workflow.model.attachments.length <=0)) {
      console.log("Inside me 1");
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }

    if ((this.launch.documents.existing.model.actionType === 'Signature' 
            || this.launch.documents.existing.model.actionType === 'Initial' 
            || this.launch.documents.existing.model.actionType === 'MultiSign') && launchActionType !== 'reLaunch') {
      if (this.checkDoc(true)) {
        return;
      }
    }
    else {
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.selectedCartItems.map(cartItem => {
          delete cartItem.isSign;
        })
      }
    }

    if (this.selectedCartItems && this.selectedCartItems.length > 0 && type !== 'bulk' && this.launch.workflow.model.ECMNo) {
      if (!this.isSetECMNoDocExist()) {
        this.launch.workflow.model.ECMNo = this.selectedCartItems[0].ECMNo ? this.selectedCartItems[0].ECMNo : ' ';
      }
    }
    else if (!this.selectedCartItems && this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
      //Abhishek
    }

    let workflow = this.initWorkflowObj(draft);
    //---------------Draft change--------------
    if (draft && (this.actionTypes === 'reply' || this.actionTypes === 'forward')) {
      workflow.workflow.recipientRoleName = this.wiaAction.recipientRoleName;
      workflow.workflow.recipientRoleId = this.wiaAction.recipientRoleId;
      workflow.workflow.recipientEMPNo = this.wiaAction.recipientEMPNo;
      workflow.workflow.recipientName = this.wiaAction.recipientName;
      workflow.id = this.wiaAction.workitemId;
    }
    //---------------Draft change--------------
    this.bulkRole = id;
    this.isDel = flag;
    if (id === 0 && !draft) {
      workflow.workflow.role = 0;
      workflow.roleId = 0;
      this.ws.sentSelectedUserTab = 0 + '@' + this.currentUser.fulName;
    } else if (flag !== 'del' && id && !draft) {
      this.ws.sentSelectedUserTab = (1 + this.currentUser.roles.indexOf(id)) + '@' + id.name
    } else if (flag === 'del' && id && !draft) {
      this.ws.sentSelectedUserTab = (1 + this.currentUser.roles.length + this.currentUser.delegated.indexOf(id)) + '@' + id.delName
    }
    this.launchWorkflow(workflow, type, draft);
  }

  launchWorkflow(workflow, type, draft) {
    let docIds = [];
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    console.log("Launch ActionType == " + launchActionType);
    if (this.launch.documents.cartItems.length > 0 || launchActionType === 'reLaunch') {
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.selectedCartItems.map((att) => {
          docIds.push(att.id);
        });
      } else if (draft) {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to save draft without attachment from document cart ?',
          key: 'launchConfirm',
          accept: () => {
            let postdata = { empNo: workflow.EMPNo, docIds: docIds };
            this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
              this.launchProceed(workflow, type, draft);
            });
          }
        });
      }
      else {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to launch without new attachment from document cart ?',
          key: 'launchConfirm',
          accept: () => {
            let postdata = { empNo: workflow.EMPNo, docIds: docIds };
            this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
              this.launchProceed(workflow, type, draft);
            });
          }
        });
      }
    } else {
      //this.selectedCartItems && this.launch.workflow.model.attachments && (this.selectedCartItems.length + this.launch.workflow.model.attachments.length)<=0
      if (launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0) 
                && (!this.launch.workflow.model.attachments || this.launch.workflow.model.attachments.length <=0)) {
        //let postdata = { empNo: workflow.EMPNo, docIds: docIds };
        // this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
        //  this.launchProceed(workflow, type, draft);
        // });
        let msg = "Please select at least one attachment."
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Attachment Required', detail: msg
        // });
        this.toastr.error(msg, 'Attachment Required');
        return;
      }
    }

    if (this.selectedCartItems && this.selectedCartItems.length > 0) {
      let postdata = { empNo: workflow.EMPNo, docIds: docIds };
      this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
        this.launchProceed(workflow, type, draft);
      });
    }
  }

  launchProceed(workflow, type, draft) {
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    if (this.actionTypes === 'draftLaunch' && this.launch.documents.existing.model.actionType === 'bulkLaunch') {
      workflow.attachments.map((att) => {
        const attachment = {
          id: att.docId,
          format: att.format,
          fileName: att.docTitle,
          vsid: att.vsid,
          isSign: att.isSign,
          fromDraft: true
        };
        if (!this.existsInCart(this.launch.documents.cartItems, att)) {
          this.launch.documents.cartItems.push(attachment);
          this.selectedCartItems.push(attachment);
        }
      });
    }


    //console.log(this.actionTypes);
    if (workflow.workflow.instructions || workflow.workflow.instructions === "") {
      workflow.instructions = workflow.workflow.instructions;
      workflow.workflow.instructions = undefined;
    }
    workflow.wiRemarks = this.launch.workflow.model.remarks;
    workflow.isDeadlineEnabled = this.launch.workflow.model.isDeadlineEnabled;
    this.launch.recipients.toList.map(r => {
      let user = new Recipients();
      user.name = r.name;
      user.userName = r.userName;
      user.actionType = r.actionType;
      user.userType = r.userType;
      if (this.actionTypes === 'draftLaunch') {
        user.id = r.id;
      } else {
        if (r.userType === 'USER') {
          user.id = r.EmpNo;
        } else if (r.userType === 'ROLE') {
          user.id = r.id;
        }
      }
      workflow.recipients.push(user);
    });
    this.launch.recipients.ccList.map(r => {
      let user = new Recipients();
      user.name = r.name;
      user.userName = r.userName;
      user.actionType = r.actionType;
      user.userType = r.userType;
      if (this.actionTypes === 'draftLaunch') {
        user.id = r.id;
      } else {
        if (r.userType === 'USER') {
          user.id = r.EmpNo;
        } else if (r.userType === 'ROLE') {
          user.id = r.id;
        }
      }
      workflow.recipients.push(user);
    });
    let workflowArray = [];
    let iSelCount = 0;
    this.launch.documents.cartItems.map((doc, i) => {
      const att = new Attachment();
      att.docId = doc.id;
      att.format = doc.format;
      att.vsid = doc.vsid;
      att.docTitle = doc.fileName;
      att.isSign = doc.isSign;
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        if (!this.existsInAttachment(workflow.attachments, doc)) {
          this.selectedCartItems.map(a => {
            if (att.docId === a.id) {
              workflow.attachments.push(att);
            }
          })
        }
      }
      if (type === 'bulk') {
        if (this.isDel === 'del') {
          workflow.workflow.delEmpNo = this.currentUser.EmpNo;
          workflow.EMPNo = this.bulkRole.userId;
          workflow.workflow.empNo = this.bulkRole.userId;
          workflow.roleId = this.currentUser.id;
          workflow.workflow.role = this.currentUser.id;
        }
        else {
          workflow.roleId = this.bulkRole.id ? this.bulkRole.id : this.bulkRole;
          workflow.workflow.role = this.bulkRole.id ? this.bulkRole.id : this.bulkRole;
        }
        if (this.selectedCartItems.length > 1) {
          this.selectedCartItems.map(a => {
            if (att.docId === a.id) {
              iSelCount = iSelCount + 1;
              this.getECMNoForBulkLaunch(workflow, doc, () => {
                workflow.workflow.subject = att.docTitle;
                workflowArray.push(_.cloneDeep(workflow.workflow));
                if (iSelCount === this.selectedCartItems.length) {
                  this.busy = true;
                  this.ws.launchBulkWorkflow(Object.assign({}, workflow, { workflowBulk: workflowArray }))
                    .subscribe(data => {
                      this.busy = false;
                      // this.growlService.showGrowl({
                      //   severity: 'info',
                      //   summary: 'Success', detail: 'Launched Successfully'
                      // });
                      this.toastr.info('Launched Successfully', 'Success');
                      if (this.selectedCartItems) {
                        this.clearCart(draft, false, true);
                      }
                      else {
                        if (draft) {
                          this.navigateToDraft();
                        } else {
                          //this.navigateToSent();
                          this.navigateToInbox();
                        }
                      }
                      // this.clearCart(draft, false, false);
                    }, error => {
                      this.busy = false;
                      // this.growlService.showGrowl({
                      //   severity: 'error',
                      //   summary: 'Failure', detail: error.message
                      // });
                      this.toastr.error(error.message, 'Failure');
                    });
                }
              });
            }
          })
        } else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Bulk Launch Not Allowed', detail: 'Minimum 2 documents  required in cart for bulk launch'
          // });
          this.toastr.error('Minimum 2 documents  required in cart for bulk launch', 'Bulk Launch Not Allowed');
        }
      }
    });

    if ((this.launch.documents.existing.model.actionType === 'Signature' 
            || this.launch.documents.existing.model.actionType === 'Initial' 
            || this.launch.documents.existing.model.actionType === 'MultiSign') && launchActionType === 'reLaunch') {
      console.log("Relaunch checkDocOtherActions");
      if (this.checkDocOtherActions(workflow.attachments, true)) {
        return;
      }

    }

    if (type !== 'bulk') {
      this.busy = true;
      this.ws.launchWorkflow(workflow).subscribe(data => {
        this.busy = false;
        if (draft) {
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Success', detail: 'Saved Successfully'
          // });
          this.toastr.info('Saved Successfully', 'Success');
        } else {
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Success', detail: 'Launched Successfully'
          // });
          this.toastr.info('Launched Successfully', 'Success');
        }
        if (this.selectedCartItems) {
          this.clearCart(draft, false, true);
        }
        else {
          if (draft) {
            this.navigateToDraft();
          } else {
            //this.navigateToSent();
            this.navigateToInbox();
          }
        }
        // this.clearCart(draft);
      }, error => {
        this.busy = false;
        if (draft) {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Failure', detail: error.message
          // });
          this.toastr.error(error.message, 'Failure');
        } else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Failure', detail: error.message
          // });
          this.toastr.error(error.message, 'Failure');
        }
      });
      /*setTimeout(() => {
        this.ws.updateDraftsCount();
      }, 3000);*/
    }
  }

  getECMNoForBulkLaunch(workflow, doc, cb?) {
    /*if (doc.docTo) {
      workflow.workflow.docTo = doc.docTo;
    }
    if (doc.docFrom) {
      workflow.workflow.docFrom = doc.docFrom;
    }*/
    if (doc.keywords) {
      workflow.workflow.keywords = doc.keywords;
    }
    if (doc.ECMNo) {
      workflow.workflow.ECMNo = doc.ECMNo;
    } else {
      workflow.workflow.ECMNo = ' ';
    }
    if (cb) {
      cb();
    }
  }

  //modified on 20022019
  isSetECMNoDocExist() {
    let exist = false;
    /* this.launch.documents.cartItems.map((doc) => {
      if (this.launch.workflow.model.ECMNo === doc.ECMNo) {
        exist = true;
        return exist
      }
    }); */

    this.selectedCartItems.map((doc) => {
      if (this.launch.workflow.model.ECMNo === doc.ECMNo) {
        exist = true;
         exist
      }
    });

    return exist
  }

  assignCartItemsForLaunch(items) {
    console.log(items)
    this.selectedCartItems = items;
    //this.launch.documents.cartItems=items;
    if (this.launch.documents.cartItems.length == this.selectedCartItems.length) {
      this.allSelectedValues = ["selectedAll"];
    } else {
      this.allSelectedValues = [];
    }
  }

  populateWorkflowForm(item) {
    if (!this.subjectDisabled || this.launch.documents.existing.model.actionType === 'bulkLaunch') {
      /*const subscription = this.documentService.getDocumentInfo(item.id,1).subscribe(data => this.assignDefaultForm(data));
      this.coreService.progress = {busy: subscription, message: '', backdrop: true};
      this.addToSubscriptions(subscription);*/
      this.assignDefaultForm(item);
    }
  }

  showDocPreview(item) {
    //this.showIframe=true;
    //const subscription1 = this.documentService.getDocumentInfo(item.id).subscribe(data=>this.assignDocIdForView(data));
    //this.coreService.progress = {busy: subscription1, message: '', backdrop: true};
    //this.addToSubscriptions(subscription1);
    let docItem = _.cloneDeep(item);
    if (docItem.docId) {
      //item.id = item.docId;
      docItem.id = docItem.docId;
    }
    this.documentService.getDocumentInfo(docItem.id, 0).subscribe(data => {
      window.parent.postMessage({ v1: 'openViewer', v2: data.id }, '*');
    });
  }

  viewAttachment(item) {
    //this.showIframe=true;
    //const subscription = this.documentService.getDocumentInfo(item.docId).subscribe(data=>this.assignDocIdForView(data));
    //this.coreService.progress = {busy: subscription, message: '', backdrop: true};
    //this.addToSubscriptions(subscription);
    //window.parent.postMessage({v1: 'openViewer', v2: item.docId}, '*');
    this.documentService.getDocumentInfo(item.docId, 0).subscribe(data => {
      window.parent.postMessage({ v1: 'openViewer', v2: data.id }, '*');
    });
  }

  assignDocIdForView(data) {
    this.attach_url = this.transform(this.documentService.getViewUrl(data.id));
    this.viewer = true;
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  assignDefaultForm(data) {
    console.log("assignDefaultForm ==> ", data);

    if (data.fileName) {
      //this.launch.workflow.model.subject = data.fileName.replace(/\.[^/.]+$/, "");
      console.log("assignDefaultForm ==> " + data.fileName);
      this.launch.workflow.model.subject = data.fileName;
    }
    else if (data && data.length > 0 && data[0].fileName) {
      console.log("assignDefaultForm ==> " + data[0].fileName);
      this.launch.workflow.model.subject = data[0].fileName;
    }

    if (data.keywords) {
      this.launch.workflow.model.keywords = data.keywords;
    } else if (data && data.length > 0 && data[0].keywords) {
      this.launch.workflow.model.keywords = data[0].keywords;
    }

    if (data.ECMNo) {
      this.launch.workflow.model.ECMNo = data.ECMNo;
    } else if (data && data.length > 0 && data[0].ECMNo) {
      this.launch.workflow.model.ECMNo = data[0].ECMNo;
    } else {
      this.launch.workflow.model.ECMNo = ' ';
    }
  }

  assignActionType(data) {
    this.actionId = data.params.id;
    this.actionTypes = data.params.actionType;
    this.assignActionTypes(() => {
      if (data.params.actionType !== undefined) {
        if (data.params.actionType === 'draftLaunch') {
          this.busy = true;
          this.ws.getDrafts(this.currentUser.EmpNo, 'USER').subscribe(data2 => {
            this.busy = false;
            this.assignDraft(data2)
          }, err => {
            this.busy = false;
          });
        } else if (data.params.actionType === 'browseLaunch') {
          this.loadRecepients();
          this.activeIndex = 0;
        }
        else {
          this.busy = true;
          this.ws.getWorkitem(data.params.id, this.currentUser.EmpNo).subscribe(res => {
            this.busy = false;
            this.assignRecepients(res, false)
          }, err => {
            this.busy = false;
          });
          this.subjectDisabled = true;
          this.loadRecepients();
        }
      }
      else {
        this.actionTypes = 'launch'
      }
    })
  }

  assignRecepients(data, fromDraft) {
    if (data.isMemo == 1 && (this.actionTypes == 'forward' || this.actionTypes == 'reply') && (this.memoId && this.memoId > 0)) {
      this.memoService.getMemoById(this.memoId.toString()).subscribe(res => {
        this.memoData = res;
      }, err => {
        this.busy = false;
      });
    }

    if(this.isContractUser)
      this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' },
                              { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }, 
                              { label: 'Multi Sign',  value: 'MultiSign' }]);
    else
      this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' },
                              { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }]);
    //, { label: 'Multi Sign',  value: 'MultiSign' }
    //console.log(this.launch.documents.existing.model.actionType)
    this.isFromDraft = fromDraft;
    this.launch.workflow.model.attachments = [];
    this.wiaAction = data;
    console.log(data.isMemo, this.wiaAction)
    this.launch.workflow.model.attachments = Object.assign([], this.wiaAction.attachments);
    this.launch.workflow.model.subject = data.subject ? data.subject : '';//---------------Draft change--------------
    this.launch.workflow.model.ECMNo = data.ECMNo;
    if (fromDraft) {
      this.launch.workflow.model.subject = data.workflow.subject;
      /*-------------Draft change-------------*/
      this.wiaAction.recipientRoleName = data.workflow.recipientRoleName;
      this.wiaAction.recipientRoleId = data.workflow.recipientRoleId;
      this.wiaAction.recipientEMPNo = data.workflow.recipientEMPNo;
      this.wiaAction.recipientName = data.workflow.recipientName;
      this.wiaAction.workitemId = data.id;
      /*-------------Draft change-------------*/
    }
    if (this.actionTypes === 'forward') {
      this.activeIndex = 1;
      this.breadcrumbService.setItems([
        { label: 'Forward' }
      ]);
      this.launch.workflow.model.wiAction = "FORWARD";

      this.wiaForward = this.initWorkflowObj(false);
      this.wiaForward.actionDetails = '';
      this.wiaForward.id = this.wiaAction.workitemId;
      this.wiaForward.wiAction = "FORWARD";
      this.wiaForward.attachments = this.wiaAction.attachments;
      if(this.wiaAction && this.wiaAction.isMemo != undefined && this.wiaAction.isMemo == 1){
        this.wiaForward.memoStepName = this.wiaAction.memoStepname;
        this.wiaForward.isMemoApproval = 0;
        this.wiaForward.workflow.isMemo = this.wiaAction.isMemo;
        this.wiaForward.workflow.memoId = this.wiaAction.memoId;
      }
    }
    else if (this.actionTypes === 'reply') {
      this.activeIndex = 1;
      this.breadcrumbService.setItems([
        { label: 'Reply' }
      ]);
      this.launch.workflow.model.wiAction = "REPLY";

      this.wiaReply = this.initWorkflowObj(false);
      this.wiaReply.wiAction = "REPLY";
      this.wiaReply.actionDetails = '';
      this.wiaReply.id = this.wiaAction.workitemId;
      this.wiaReply.attachments = this.wiaAction.attachments;
      this.launch.workflow.model.remarks = this.wiaAction.remarks;
      this.launch.workflow.model.instructions = this.wiaAction.instructions;
      if(this.wiaAction && this.wiaAction.isMemo != undefined && this.wiaAction.isMemo == 1){
        this.wiaReply.memoStepName = this.wiaAction.memoStepname;
        this.wiaReply.isMemoApproval = 0;
        this.wiaReply.workflow.isMemo = this.wiaAction.isMemo;
        this.wiaReply.workflow.memoId = this.wiaAction.memoId;
      }
      // launch.workflow.model.instructions

      if (!fromDraft) {
        const sender = { actionType: 'TO', id: 0, name: '', userName: '', userType: '' };
        if (this.wiaAction.senderName) {
          sender.id = this.wiaAction.senderEMPNo;
          sender.name = this.wiaAction.senderName;
          sender.userName = this.wiaAction.senderLoginName;
          sender.userType = 'USER';

        } else if (this.wiaAction.senderRoleName) {
          sender.id = this.wiaAction.senderRoleId;
          sender.name = this.wiaAction.senderRoleName;
          sender.userName = this.wiaAction.senderRoleADName;
          sender.userType = 'ROLE';
        }
        this.launch.recipients.toList.push(sender);
      }
    }
    else if (this.actionTypes === 'replyAll') {
      this.activeIndex = 1;
      this.breadcrumbService.setItems([
        { label: 'Reply All' }
      ]);
      this.replyRecipients = this.wiaAction.recipients;
      this.launch.workflow.model.wiAction = "REPLY";
      this.wiaReplyAll = this.initWorkflowObj(false);
      this.wiaReplyAll.wiAction = "REPLY";
      this.wiaReplyAll.actionDetails = '';
      this.wiaReplyAll.id = this.wiaAction.workitemId;
      this.wiaReplyAll.attachments = this.wiaAction.attachments;
      if (!fromDraft) {
        this.replyRecipients.map((recipient, index) => {
          if (recipient.name === this.wiaAction.recipientName || recipient.name === this.wiaAction.recipientRoleName) {
            this.replyRecipients.splice(index, 1);
          }
        });
        const sender = { actionType: 'TO', id: 0, name: '', userName: '', userType: '' };
        if (this.wiaAction.senderName) {
          sender.id = this.wiaAction.senderEMPNo;
          sender.name = this.wiaAction.senderName;
          sender.userName = this.wiaAction.senderLoginName;
          sender.userType = 'USER';
        } else if (this.wiaAction.senderRoleName) {
          sender.id = this.wiaAction.senderRoleId;
          sender.name = this.wiaAction.senderRoleName;
          sender.userName = this.wiaAction.senderRoleADName;
          sender.userType = 'ROLE';
        }
        this.replyRecipients.push(sender);
        let existincc = false;
        let existinto = false;
        this.replyRecipients.map((d, i) => {
          if (this.wiaAction.senderEMPNo === d.id && (d.actionType === 'TO' || d.actionType === 'Reply-TO')) {
            //&& d.actionType === 'CC'
            //this.launch.recipients.ccList.splice(i,1);
            existinto = true;
          }
          else if (this.wiaAction.senderEMPNo === d.id && (d.actionType === 'CC' || d.actionType === 'Reply-CC')) {
            existincc = true;
          }
        });
        this.replyRecipients.map((rec, i) => {
          if ((rec.actionType === 'TO' || rec.actionType === 'Reply-TO')) {
            rec.actionType = 'TO';
            if (!this.dupCheckForRecipients(rec))
              this.launch.recipients.toList.push(rec);
          }
          else if ((rec.actionType === 'CC' || rec.actionType === 'Reply-CC') && !existincc) {
            rec.actionType = 'CC';
            if (!this.dupCheckForRecipients(rec))
              this.launch.recipients.ccList.push(rec);
          }
        });
      }
    }
    else if (this.actionTypes === 'reLaunch') {
      this.activeIndex = 0;
      this.launch.workflow.model.subject = this.wiaAction.subject;
      this.launch.workflow.model.priority = this.wiaAction.priority;
      this.launch.workflow.model.remarks = this.wiaAction.remarks;
      this.launch.workflow.model.instructions = this.wiaAction.instructions;
      this.launch.workflow.model.keywords = this.wiaAction.Keywords;
      this.launch.workflow.model.attachments = [];
      this.launch.workflow.model.attachments = Object.assign([], this.wiaAction.attachments);
      if (this.wiaAction.actions != '' && this.wiaAction.actions != null) {
        // this.wiaAction.actions = "Signature"
        const actions = this.wiaAction.actions.split(',');
        console.log(actions)
        this.launch.workflow.model.actions = Object.assign([], actions);
        if (actions[0] === 'Signature' || actions[0] === 'Initial' || actions[0] === 'MultiSign') {
          this.launch.documents.existing.model.actionType = actions[0];
          console.log(this.launch.documents.existing.model.actionType)
          this.launch.workflow.forOptions.push({ label: actions[0], value: actions[0] });

          this.onActionTypeChanged({ value: 'Signature' })
        }
      }
      this.subjectDisabled = false;
      this.actionTypes = 'launch';
      this.isRelaunch = true;
    }

    this.launch.recipients.toList = [...this.launch.recipients.toList];
    this.launch.recipients.ccList = [...this.launch.recipients.ccList];
  }

  assignDraft(data) {
    data.map((item, index) => {
      if (this.actionId == item.draftId) {
        this.draftWorkflow = item;
      }
    });
    this.loadRecepients();
    this.activeIndex = 0;
    this.launch.workflow.model.draftId = this.draftWorkflow.draftId;
    //this.launch.workflow.model.subject = this.draftWorkflow.workflow.subject.substring(0, this.draftWorkflow.workflow.subject.indexOf('.'));
    this.launch.workflow.model.subject = this.draftWorkflow.workflow.subject;
    this.launch.workflow.model.priority = this.draftWorkflow.workflow.priority;
    this.launch.workflow.model.remarks = this.draftWorkflow.workflow.remarks;
    this.launch.workflow.model.instructions = this.draftWorkflow.instructions;
    this.launch.workflow.model.keywords = this.draftWorkflow.workflow.keywords;
    this.launch.workflow.model.ECMNo = this.draftWorkflow.workflow.ECMNo;
    this.draftWorkflow.recipients.map((rec, i) => {
      if (rec.actionType === 'TO') {
        this.launch.recipients.toList.push(rec);
      }
      else if (rec.actionType === 'CC') {
        this.launch.recipients.ccList.push(rec);
      }
    });
    if (this.draftWorkflow.wiAction === 'FORWARD') {
      this.actionTypes = 'forward';
      this.subjectDisabled = true;
      this.assignRecepients(this.draftWorkflow, true);
    } else if (this.draftWorkflow.wiAction === 'REPLY') {
      this.actionTypes = 'reply';
      this.subjectDisabled = true;
      this.assignRecepients(this.draftWorkflow, true);
    } else {
      this.launch.workflow.model.attachments = [];
      this.launch.workflow.model.attachments = Object.assign([], this.draftWorkflow.attachments);
      this.actionTypes = 'draftLaunch';
      // moved out
      /*const actions = this.draftWorkflow.actions.split(',');
      this.launch.workflow.model.actions = Object.assign([], actions);
      if (actions[0] === 'Signature' || actions[0] === 'Initial') {
        
      }*/
    }
    //---------------Draft change--------------
    const actions = this.draftWorkflow.actions.split(',');
    if (actions[0] === 'Signature' || actions[0] === 'Initial' || actions[0] === 'MultiSign') {
      this.launch.workflow.forOptions = [{ label: actions[0], value: actions[0] }];
      this.launch.documents.existing.model.actionType = actions[0];
      console.log(this.launch.documents.existing.model.actionType);

      this.launch.workflow.model.actions = [actions[0]];
    } else {
      this.launch.workflow.model.actions = Object.assign([], actions);
    }

    this.launch.recipients.toList = [...this.launch.recipients.toList];
    this.launch.recipients.ccList = [...this.launch.recipients.ccList];
  }

  setforwardWorkItem() {

    this.wiaForward.recipients = [];
    this.wiaForward.priority = this.launch.workflow.model.priority;
    this.wiaForward.actionTaken = this.launch.workflow.model.actionTaken;
    this.wiaForward.wiRemarks = this.launch.workflow.model.remarks;
    this.wiaForward.instructions = this.launch.workflow.model.instructions;
    /*this.wiaForward.docFrom = this.launch.workflow.model.docFrom;
    this.wiaForward.docTo = this.launch.workflow.model.docTo;*/
    this.wiaForward.actions = this.launch.workflow.model.actions.toString();
    if (this.launch.workflow.model.deadlineDate) {
      this.wiaForward.deadline = this.coreService.getFormattedDateString(this.launch.workflow.model.deadlineDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaForward.deadline = this.wiaForward.deadline + " " + this.deadLineTime.time;
    }
    else {
      this.wiaForward.deadline = null;
    }
    if (this.launch.workflow.model.reminderDate) {
      this.wiaForward.reminder = this.coreService.getFormattedDateString(this.launch.workflow.model.reminderDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaForward.reminder = this.wiaForward.reminder + " " + this.reminderTime.time;
    }
    else {
      this.wiaForward.reminder = null;
    }
    this.launch.recipients.toList.map(r => {
      this.wiaForward.recipients.push({
        id: r.id,
        name: r.name,
        userName: r.userName,
        actionType: r.actionType,
        userType: r.userType
      });
    });
    this.launch.recipients.ccList.map(r => {
      this.wiaForward.recipients.push({
        id: r.id,
        name: r.name,
        userName: r.userName,
        actionType: r.actionType,
        userType: r.userType
      });
    });

    // if (this.wiaAction.actions === 'Signature' || this.wiaAction.actions === 'Initial') {
    //   const subscription = this.ws.forwardWorkflow(this.wiaForward)
    //     .subscribe(data => this.forwardSuccess(), error => this.forwardfail());
    //   this.coreService.progress = {busy: subscription, message: 'Forwarding...'};
    //   this.addToSubscriptions(subscription);
    // } else {
    let subscription1 = this.documentService.getCart(this.currentUser.EmpNo).subscribe((items) => {
      if (items.cart.length > 0) {
        items.cart.map((doc, i) => {
          const att = new Attachment();
          att.docId = doc.id;
          att.format = doc.format;
          att.docTitle = doc.fileName;
          att.vsid = doc.vsid;
          att.isSign = doc.isSign;
          if (this.selectedCartItems && this.selectedCartItems.length > 0) {
            if (!this.existsInAttachment(this.wiaForward.attachments, doc)) {
              this.selectedCartItems.map(a => {
                if (att.docId === a.id) {
                  att.isSign = a.isSign;
                  this.wiaForward.attachments.push(att);
                }
              });
            }
          }
          else {
            this.confirmationService.confirm({
              message: 'Are you sure that you want to forward without new attachment from document cart ?',
              key: 'forwardConfirm',
              accept: () => {
                this.proceedForward(this.wiaForward);
              }
            });
          }
        })
      }
      else {
        if (!this.selectedCartItems) {
          this.proceedForward(this.wiaForward);
        }
      }
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.proceedForward(this.wiaForward, true, this.selectedCartItems);
      }
    });
    // }
  }

  proceedForward(data, isNewAtt?, attachments?) {
    
    if (this.launch.documents.existing.model.actionType === 'Signature' 
        || this.launch.documents.existing.model.actionType === 'Initial'
        || this.launch.documents.existing.model.actionType === 'MultiSign') {
      if (this.checkDocOtherActions(data.attachments, true)) {
        return;
      }
    }

    if (isNewAtt) {
      let docIds = [];
      attachments.map((att) => {
        docIds.push(att.id);
      });
      let postdata = { empNo: this.wiaForward.EMPNo, docIds: docIds };
      this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
        this.forwardProceedAftersetWfPolicy(data);
      })
    }
    else {
      this.forwardProceedAftersetWfPolicy(data);
    }
  }

  forwardProceedAftersetWfPolicy(data) {
    this.busy = true;
    this.ws.forwardWorkflow(data).subscribe(data => {
      this.busy = false;
      this.forwardSuccess()
    }, error => {
      this.busy = false;
      this.forwardfail()
    });
  }

  reply() {

    this.wiaReply.recipients = [];
    this.wiaReply.priority = this.launch.workflow.model.priority;
    this.wiaReply.actionTaken = this.launch.workflow.model.actionTaken;
    this.wiaReply.wiRemarks = this.launch.workflow.model.remarks;
    this.wiaReply.instructions = this.launch.workflow.model.instructions;
    /*this.wiaReply.docFrom = this.launch.workflow.model.docFrom;
    this.wiaReply.docTo = this.launch.workflow.model.docTo;*/
    this.wiaReply.actions = this.launch.workflow.model.actions.toString();
    if (this.launch.workflow.model.deadlineDate) {
      this.wiaReply.deadline = this.coreService.getFormattedDateString(this.launch.workflow.model.deadlineDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaReply.deadline = this.wiaReply.deadline + " " + this.deadLineTime.time;
    }
    else {
      this.wiaReply.deadline = null;
    }
    if (this.launch.workflow.model.reminderDate) {
      this.wiaReply.reminder = this.coreService.getFormattedDateString(this.launch.workflow.model.reminderDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaReply.reminder = this.wiaReply.reminder + " " + this.reminderTime.time;
    }
    else {
      this.wiaReply.reminder = null;
    }
    this.launch.recipients.toList.map((to, i) => {
      const toItems = {
        'actionType': to.actionType,
        'id': to.id,
        'name': to.name,
        'userName': to.userName,
        'userType': to.userType
      };
      if (to.userType === 'USER' && !this.isFromDraft) {
        if (to.EmpNo !== undefined) {
          toItems.id = to.EmpNo;
        }
        else {
          toItems.id = to.id;
        }
      } else if (this.isFromDraft) {
        toItems.id = to.id
      }
      this.wiaReply.recipients.push(toItems)
    });
    this.launch.recipients.ccList.map((cc, i) => {
      const ccItems = {
        'actionType': cc.actionType,
        'id': cc.id,
        'name': cc.name,
        'userName': cc.userName,
        'userType': cc.userType
      };
      if (cc.userType === 'USER' && !this.isFromDraft) {
        if (cc.EmpNo !== undefined) {
          ccItems.id = cc.EmpNo
        }
        else {
          ccItems.id = cc.id;
        }
      } else if (this.isFromDraft) {
        ccItems.id = cc.id
      }
      this.wiaReply.recipients.push(ccItems)
    });
    // if (this.wiaAction.actions === 'Signature' || this.wiaAction.actions === 'Initial') {
    //   const subscription = this.ws.replyWorkflow(this.wiaReply).subscribe(data => this.replysuccess(), error => this.replyfailed());
    //   this.coreService.progress = {busy: subscription, message: 'Replying...'};
    //   this.addToSubscriptions(subscription);
    // } else {
    let subscription = this.documentService.getCart(this.currentUser.EmpNo).subscribe((items) => {
      if (items.cart.length > 0) {
        items.cart.map((doc, i) => {
          const att = new Attachment();
          att.docId = doc.id;
          att.format = doc.format;
          att.docTitle = doc.fileName;
          att.vsid = doc.vsid;
          att.isSign = doc.isSign;
          if (this.selectedCartItems && this.selectedCartItems.length > 0) {
            if (!this.existsInAttachment(this.wiaReply.attachments, doc)) {
              this.selectedCartItems.map(a => {
                if (att.docId === a.id) {
                  att.isSign = a.isSign;
                  this.wiaReply.attachments.push(att);
                }
              });
            }
          } else {
            this.confirmationService.confirm({
              message: 'Are you sure that you want to reply without new attachment from document cart ?',
              key: 'replyConfirm',
              accept: () => {
                this.proceedReply(this.wiaReply);
              }
            });
          }
        })
      } else {
        // this.confirmationService.confirm({
        //   message: 'Are you sure that you want to reply without new attachements ?',
        //   key: 'replyConfirm',
        //   accept: () => {
        //     this.proceedReply(this.wiaReply);
        //   }
        // });
        if (!this.selectedCartItems) {
          this.proceedReply(this.wiaReply);
        }
      }
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.proceedReply(this.wiaReply, true, this.selectedCartItems);
      }
    });
    // }
  }

  proceedReply(data, isNewAtt?, attachments?, isReplyAll?) {
    let array = this.wiaReply.attachments;
    let empno = this.wiaReply.EMPNo;
    if (isReplyAll) {
      array = this.wiaReplyAll.attachments;
      empno = this.wiaReplyAll.EMPNo;
    }

    if (this.launch.documents.existing.model.actionType === 'Signature' 
        || this.launch.documents.existing.model.actionType === 'Initial'
        || this.launch.documents.existing.model.actionType === 'MultiSign') {
      if (this.checkDocOtherActions(array, true)) {
        return;
      }
    }


    if (isNewAtt) {
      let docIds = [];
      attachments.map((att) => {
        docIds.push(att.id);
      });
      let postdata = { empNo: empno, docIds: docIds };
      this.documentService.setWorkflowPolicies(postdata).subscribe(d => {
        this.replyProceedAftersetWfPolicy(data);
      })
    }
    else {
      this.replyProceedAftersetWfPolicy(data);
    }
  }

  replyProceedAftersetWfPolicy(data) {
    this.busy = true;
    if (this.wiaAction.isMemo == 0) {
      this.ws.replyWorkflow(data).subscribe(data => {
        this.busy = false;
        this.replysuccess()
      }, error => {
        this.busy = false;
        this.replyfailed()
      });
    } else {
      if (data.memoStepname == 'APPROVER') {
        data = Object.assign({ routeString: 'COMPOSER' }, data);
      }
      else if (data.memoStepname == 'REVIEWER') {
        data = Object.assign({ routeString: 'APPROVER' }, data);
      }
      else if (data.memoStepname == 'SUB-FROM') {
        data = Object.assign({ routeString: 'APPROVER' }, data);
      }
      else if (data.memoStepname == 'THRU') {
        data = Object.assign({ routeString: 'APPROVER' }, data);
      }
      else if (data.memoStepname == 'TO') {
        data = Object.assign({ routeString: 'APPROVER' }, data);
      }
      this.memoService.returnMemo(data).subscribe(res => {
        this.busy = false;
        this.replysuccess()
      }, error => {
        this.busy = false;
        this.replyfailed()
      });
    }

  }

  replyAll() {

    this.wiaReplyAll.recipients = [];
    this.wiaReplyAll.priority = this.launch.workflow.model.priority;
    this.wiaReplyAll.actionTaken = this.launch.workflow.model.actionTaken;
    this.wiaReplyAll.wiRemarks = this.launch.workflow.model.remarks;
    this.wiaReplyAll.instructions = this.launch.workflow.model.instructions;
    /*this.wiaReplyAll.docFrom = this.launch.workflow.model.docFrom;
    this.wiaReplyAll.docTo = this.launch.workflow.model.docTo;*/
    this.wiaReplyAll.actions = this.launch.workflow.model.actions.toString();
    if (this.launch.workflow.model.deadlineDate) {
      this.wiaReplyAll.deadline = this.coreService.getFormattedDateString(this.launch.workflow.model.deadlineDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaReplyAll.deadline = this.wiaReplyAll.deadline + " " + this.deadLineTime.time;
    }
    else {
      this.wiaReplyAll.deadline = null;
    }
    if (this.launch.workflow.model.reminderDate) {
      this.wiaReplyAll.reminder = this.coreService.getFormattedDateString(this.launch.workflow.model.reminderDate, this.coreService.dateTimeFormats.DDMMYYYY, null);
      this.wiaReplyAll.reminder = this.wiaReplyAll.reminder + " " + this.reminderTime.time;
    }
    else {
      this.wiaReplyAll.reminder = null;
    }
    this.launch.recipients.toList.map((to, i) => {
      const toItems = {
        'actionType': to.actionType,
        'id': to.id,
        'name': to.name,
        'userName': to.userName,
        'userType': to.userType
      };
      if (to.userType === 'USER' && !this.isFromDraft) {
        if (to.EmpNo !== undefined) {
          toItems.id = to.EmpNo
        }
        else {
          toItems.id = to.id
        }
      } else if (this.isFromDraft) {
        toItems.id = to.id
      }
      this.wiaReplyAll.recipients.push(toItems)
    });
    this.launch.recipients.ccList.map((cc, i) => {
      const ccItems = {
        'actionType': cc.actionType,
        'id': cc.id,
        'name': cc.name,
        'userName': cc.userName,
        'userType': cc.userType
      };
      if (cc.userType === 'USER' && !this.isFromDraft) {
        if (cc.EmpNo !== undefined) {
          ccItems.id = cc.EmpNo;
        }
        else {
          ccItems.id = cc.id;
        }
      } else if (this.isFromDraft) {
        ccItems.id = cc.id
      }
      this.wiaReplyAll.recipients.push(ccItems)
    });
    let subscription = this.documentService.getCart(this.currentUser.EmpNo).subscribe((items) => {
      if (items.cart.length > 0) {
        items.cart.map((doc, i) => {
          const att = new Attachment();
          att.docId = doc.id;
          att.format = doc.format;
          att.docTitle = doc.fileName;
          att.vsid = doc.vsid;
          att.isSign = doc.isSign;
          if (this.selectedCartItems && this.selectedCartItems.length > 0) {
            if (!this.existsInAttachment(this.wiaReplyAll.attachments, doc)) {
              this.selectedCartItems.map(a => {
                if (att.docId === a.id) {
                  att.isSign = a.isSign;
                  this.wiaReplyAll.attachments.push(att);
                }
              });
            }
          }
          else {
            this.confirmationService.confirm({
              message: 'Are you sure that you want to reply without new attachment from document cart ?',
              key: 'replyConfirm',
              accept: () => {
                this.proceedReply(this.wiaReplyAll, false, items.cart, true);
              }
            });
          }
        })
      }
      else {
        // this.confirmationService.confirm({
        //   message: 'Are you sure that you want to reply without new attachements ?',
        //   key: 'replyConfirm',
        //   accept: () => {
        //     this.proceedReply(this.wiaReplyAll);
        //   }
        // });
        if (!this.selectedCartItems) {
          this.proceedReply(this.wiaReplyAll);
        }
      }
      if (this.selectedCartItems && this.selectedCartItems.length > 0) {
        this.proceedReply(this.wiaReplyAll, true, this.selectedCartItems, true);
      }
    });
  }

  replysuccess() {
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Reply Success'
    // });
    this.toastr.info('Reply Success', 'Success');
    //if (this.wiaAction.actions !== 'Signature' && this.wiaAction.actions !== 'Initial') {
    if (this.selectedCartItems) {
      this.clearCart(false, false, true);
    }
    else {
      //this.clearCart(false, false, false);
      //this.navigateToSent();
      this.navigateToInbox();
    }
    /*} else {
      this.navigateToSent();
    }*/
  }

  replyfailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Reply Failed - Please check attachments or recipients are valid'
    // });
    this.toastr.error("Reply Failed - Please check attachments or recipients are valid", 'Failure');
    this.wiaReplyAll.recipients = [];
    //this.navigateToSent();
  }

  forwardSuccess() {
    //window.parent.postMessage('ForwardSuccess', '*');
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Forward Success'
    // });
    this.toastr.info('Forward Success', 'Success');
    //if (this.wiaAction.actions !== 'Signature' && this.wiaAction.actions !== 'Initial') {
    //console.log(this.documentService.cartItems);
    //console.log(this.selectedCartItems);
    if (this.selectedCartItems) {
      this.clearCart(false, false, true);
    }
    else {
      //this.clearCart(false, false, false);
      //this.navigateToSent();
      this.navigateToInbox();
    }
    /* } else {
      this.navigateToSent();
    }*/
  }

  forwardfail() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Forward Failed - Please check attachments or recipients are valid'
    // });
    this.toastr.error('Forward Failed - Please check attachments or recipients are valid', 'Failure');
    this.wiaForward.recipients = [];
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  goBack() {
    this.location.back();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))  // Use pipe to apply the filter operator
    .subscribe(e => this.identifyNavigateScreen(e));
  }

  identifyNavigateScreen(e) {
    this.previousUrl = e['url'];
    if (this.previousUrl.indexOf('/browse/browse-folders') !== -1) {
      window.parent.postMessage('GoBackToBrowse', '*');
    }
    if (this.previousUrl.indexOf('/browse/favourite-folders') !== -1) {
      window.parent.postMessage('GoBackToFavourites', '*');
    }
    else if (this.previousUrl.indexOf('/workflow/inbox') !== -1) {
      window.parent.postMessage('GoToInbox', '*');
    }
    else if (this.previousUrl.indexOf('/workflow/archive') !== -1) {
      window.parent.postMessage('GoBackToArchive', '*');
    }
    else if (this.previousUrl.indexOf('/workflow/sent') !== -1) {
      window.parent.postMessage('GoToSent', '*');
    }
    else if (this.previousUrl.indexOf('search') !== -1) {
      window.parent.postMessage('GoBackToSearch', '*');
    }
    else if (this.previousUrl.indexOf('workflow/draft') !== -1) {
      window.parent.postMessage('DraftSaveSuccess', '*');
    }
    else if (this.previousUrl.indexOf('teamshared') !== -1 || (this.previousUrl.indexOf('favourites') !== -1) || (this.previousUrl.indexOf('recents') !== -1)) {
      window.parent.postMessage({ v1: 'ClearFeatureSelection', v2: this.previousUrl }, '*');
    }
  }

  selectDeadLine() {
    console.log(this.launch.workflow.model.deadlineDate)
    this.launch.workflow.model.reminderDate = undefined;
    if (moment().format("MM-DD-YYYY") == moment(this.launch.workflow.model.deadlineDate).format("MM-DD-YYYY")) {
      for (var i = 0; i < this.deadLineTimes.length; i++) {
        var hour = this.deadLineTimes[i].label.substring(0, 2);
        var minute = this.deadLineTimes[i].label.substring(3, 5);
        var formate = this.deadLineTimes[i].label.substring(6, 8);
        if (moment().format("hh") == hour) {
          if (moment().format("mm") < minute) {
            if (moment().format("A") == formate) {
              this.deadLineTime = this.deadLineTimes[i].value;
              console.log(this.deadLineTime)
              break;
            } else {
              this.deadLineTimes[i].disabled = true;
            }
          } else {
            if (parseInt(moment().format("mm")) > 45) {
              if (moment().format("A") == formate) {
                this.deadLineTime = this.deadLineTimes[i + 4].value;
                this.deadLineTimes[i].disabled = true;
                this.deadLineTimes[i + 1].disabled = true;
                this.deadLineTimes[i + 2].disabled = true;
                this.deadLineTimes[i + 3].disabled = true;
                break;
              } else {
                this.deadLineTimes[i].disabled = true;
              }
            } else {
              this.deadLineTimes[i].disabled = true;
            }
          }
        } else {
          this.deadLineTimes[i].disabled = true;
        }
      }
      console.log(this.launch.workflow.model.deadlineDate)

    } else {
      for (var i = 0; i < this.deadLineTimes.length; i++) {
        this.deadLineTimes[i].disabled = false;
      }
      console.log(this.launch.workflow.model.deadlineDate)

    }
  }

  selectReminder() {
    if (moment().format("MM-DD-YYYY") == moment(this.launch.workflow.model.reminderDate).format("MM-DD-YYYY")) {
      this.enableReminderTime();
      for (var i = 0; i < this.reminderTimes.length; i++) {
        var hour = this.reminderTimes[i].label.substring(0, 2);
        var minute = this.reminderTimes[i].label.substring(3, 5);
        var formate = this.reminderTimes[i].label.substring(6, 8);
        if (moment().format("hh") == hour) {
          if (moment().format("mm") < minute) {
            if (moment().format("A") == formate) {
              this.reminderTime = this.reminderTimes[i].value;
              break;
            } else {
              this.reminderTimes[i].disabled = true;
            }
          } else {
            if (parseInt(moment().format("mm")) > 45) {
              if (moment().format("A") == formate) {
                this.reminderTimes[i].disabled = true;
                this.reminderTimes[i + 1].disabled = true;
                this.reminderTimes[i + 2].disabled = true;
                this.reminderTimes[i + 3].disabled = true;
                this.reminderTime = this.reminderTimes[i + 4].value;
                break;
              } else {
                this.reminderTimes[i].disabled = true;
              }
            } else {
              this.reminderTimes[i].disabled = true;
            }
          }
        } else {
          this.reminderTimes[i].disabled = true;
        }
      }
    }

    if (moment(this.launch.workflow.model.deadlineDate).format("MM-DD-YYYY") == moment(this.launch.workflow.model.reminderDate).format("MM-DD-YYYY")) {
      if (moment().format("MM-DD-YYYY") != moment(this.launch.workflow.model.reminderDate).format("MM-DD-YYYY")) {
        this.enableReminderTime();
      }
      var isMatched = false;
      var count = 0;
      for (var i = 0; i < this.reminderTimes.length; i++) {
        if (isMatched) {
          if (count == 4) {
            count++;
          } else {
            this.reminderTimes[i].disabled = true;
          }
        } else {
          var hour = this.reminderTimes[i].label.substring(0, 2);
          var minute = this.reminderTimes[i].label.substring(3, 5);
          var formate = this.reminderTimes[i].label.substring(6, 8);
          if (this.deadLineTime.time.substring(0, 2) == hour) {
            if (this.deadLineTime.time.substring(3, 5) <= minute) {
              if (this.deadLineTime.time.substring(6, 8) == formate) {
                this.reminderTime = this.reminderTimes[i].value;
                isMatched = true;
              }
            } else {
              if (this.deadLineTime.time.substring(3, 5) > 45) {
                if (this.deadLineTime.time.substring(6, 8) == formate) {
                  count++;
                  if (count == 4) {
                    this.reminderTime = this.reminderTimes[i + 1].value;
                    isMatched = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (moment().format("MM-DD-YYYY") != moment(this.launch.workflow.model.reminderDate).format("MM-DD-YYYY")
      && moment(this.launch.workflow.model.deadlineDate).format("MM-DD-YYYY") != moment(this.launch.workflow.model.reminderDate).format("MM-DD-YYYY")) {
      this.enableReminderTime();
    }
  }

  enableReminderTime() {
    for (var i = 0; i < this.reminderTimes.length; i++) {
      this.reminderTimes[i].disabled = false;
    }
  }

  closeViewPopUp() {
    this.showIframe = false;
    this.viewer = false;
  }

  getActionOnBehalfOf():any {
    if (this.wiaAction && this.wiaAction.recipientRoleName) {
      return 'On Behalf Of ' + this.wiaAction.recipientRoleName;
    } else if (this.wiaAction && this.wiaAction.recipientName) {
      return 'On Behalf Of ' + this.wiaAction.recipientName;
    }
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      //this[k] = null;
      delete this[k];
    })
  }

  searchRoleList() {
    this.launch.recipients.roles.roleTree = this.launch.recipients.roles.roleTree2.filter(e => {
      if (e.data.name) {
         e.data.name.toUpperCase().indexOf(this.launch.recipients.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
  }

  /* /!**
    * perform search on sorting and paging
    * @param event
    *!/
   continueSearch(event) {
     //if (this.launch.documents.existing.totalResults) {
       const pageNo = Math.ceil(event.first / event.rows) + 1;
       const skip = this.launch.documents.existing.pageSize * (pageNo - 1);
       if (!event || !event.rows) {
         return;
       }
       else if (event && event.globalFilter && event.globalFilter.trim()) {
         this.launch.documents.existing.searchResult = this.getFilterRecords(this.searchResultCopy, event.globalFilter.trim());
         this.launch.documents.existing.totalResults = this.launch.documents.existing.searchResult.length;
         return;
       }
       else if (event.sortField !== undefined) {
         this.launch.documents.existing.model.orderBy = event.sortField;
         if (event.sortOrder === 1) {
           this.launch.documents.existing.model.ascdesc = 'ASC';
         }
         else {
           this.launch.documents.existing.model.ascdesc = 'DESC';
         }
         this.launch.documents.existing.model.skip = skip;
         this.searchDocComponent.assignSortNotPaginationAdv();
       } else if (skip === 0 && this.searchDocComponent) {
         this.searchDocComponent.assignSortNotPaginationAdv();
       } else {
         if (pageNo > 1) {
           this.busyModel = this.documentService.continueSearch(
             {
               continueData: this.launch.documents.existing.continueData,
               skip: skip,
               pageSize: this.launch.documents.existing.pageSize
             }).subscribe(data => {
             this.launch.documents.existing.continueData = data.continueData;
             data.row.map(d => {
               d.name = this.coreService.getPropValue(d.props, 'DocumentTitle');
               d.documentDate = this.coreService.getPropValue(d.props, 'DocumentDate');
               d.orgcode = this.coreService.getPropValue(d.props, 'OrgCode');
               d.ecmno = this.coreService.getPropValue(d.props, 'ECMNo');

             });
             this.launch.documents.existing.searchResult = data.row;
             //this.onSearchComplete.emit();
             this.searchResultCopy = _.cloneDeep(data.row);
           });
           //this.coreService.progress = {busy: this.busyModel, message: ''};
           this.addToSubscriptions(this.busyModel);
         }
       }
    //}
   }

   /!**
    * get filtered records from search results
    * @param searchResultCopy
    * @param searchText
    *!/
   getFilterRecords(searchResultCopy, searchText) {
     if (!searchText) {
       return this.searchResultCopy;
     }
     let searchedRecords = [];
     searchText = searchText.toLowerCase();
     let self = this, title, orgCode, ecmNo, docDate;
     _.map(this.searchResultCopy, function (record) {
       title = self.coreService.getPropValue(record.props, 'DocumentTitle'),
         orgCode = self.coreService.getPropValue(record.props, 'OrgCode'),
         docDate = self.coreService.getPropValue(record.props, 'DocumentDate'),
         ecmNo = self.coreService.getPropValue(record.props, 'ECMNo');
       if ((!!title && title.toLowerCase().indexOf(searchText) > -1) ||
         (!!orgCode && orgCode.toLowerCase().indexOf(searchText) > -1) ||
         (!!ecmNo && ecmNo.toLowerCase().indexOf(searchText) > -1) ||
         (!!docDate && docDate.toLowerCase().indexOf(searchText) > -1) ||
         (!!record.creator && record.creator.toLowerCase().indexOf(searchText) > -1) ||
         (!!record.addOn && record.addOn.toLowerCase().indexOf(searchText) > -1)) {
         searchedRecords.push(record);
       }
     });
     return searchedRecords;
   }*/

  clearDocCart() {
    this.busy = true;
    this.contentService.clearCart().subscribe(data => {
      this.busy = false;
      if (data) {
        this.getDocumentCart();
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Document Cart Cleared Successfully'
        // });
        this.toastr.info('Document Cart Cleared Successfully', 'Success');
        window.parent.postMessage('clearCartSuccess', '*');
        this.prepareStepItems();
      }
    }, Error => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Failed to Clear'
      // });
      this.toastr.error('Failed to Clear', 'Attachment Required');
    });
  }

  step1TabChange(event) {
    this.step1TabIndex = event.index;
    if (event.index === 1) {
      this.bs.getEntryTemplateForAddLazy.emit();
      let obj = { index: 0 };
      this.onTabOpen(obj)
    }
    if (this.launch.recipients.roles.roleTree.length === 0) {
      this.getOrgRole(true);
      //this.getUserLists();
    }
  }

  searchRL(roleSearchquery) {
    this.launch.recipients.roles.roleTree = this.launch.recipients.roles.roleTree2.filter(e => {
      if (e.data.name) {
        return e.data.name.toUpperCase().indexOf(this.launch.recipients.search.roleSearchquery.toUpperCase()) !== -1;
      }
      return false; // Return false for elements that don't have a name
    });
  
    this.launch.recipients.list.selectedUserList.lists = this.launch.recipients.list.selectedUserList.lists2.filter(e => {
      if (e.name) {
        return e.name.toUpperCase().indexOf(this.launch.recipients.search.roleSearchquery.toUpperCase()) !== -1;
      }
      return false; // Return false for elements that don't have a name
    });
  }
  

  searchDL(dlSearchquery) {
    this.launch.recipients.list.selectedUserList.lists = this.launch.recipients.list.selectedUserList.lists2.filter(e => {
      if (e.name) {
        e.name.toUpperCase().indexOf(this.launch.recipients.search.dlSearchquery.toUpperCase()) !== -1
      }
    });
  }

  searchDFL(defSearchquery) {
    this.launch.recipients.list.selectedUserList.lists = this.launch.recipients.list.selectedUserList.lists2.filter(e => {
      let searchField = e.fulName ? e.fulName : e.name;
      return searchField.toUpperCase().indexOf(this.launch.recipients.search.defSearchquery.toUpperCase()) !== -1
        || (e.mail && e.mail.toUpperCase().indexOf(this.launch.recipients.search.defSearchquery.toUpperCase()) !== -1)
    });
  }

  searchFL(favSearchquery) {
    this.launch.recipients.list.selectedUserList.users = this.launch.recipients.list.selectedUserList.users2.filter(e => {
      let searchField = e.fulName ? e.fulName : e.name;
      return searchField.toUpperCase().indexOf(this.launch.recipients.search.favSearchquery.toUpperCase()) !== -1
        || (e.mail && e.mail.toUpperCase().indexOf(this.launch.recipients.search.favSearchquery.toUpperCase()) !== -1)
    });
  }

  showRoleTreeModel() {
    this.showRoleTree = true;
    this.showRoleTreeLoaded = true;
    this.getOrgRoleTree();
  }

  getOrgRoleTree() {
    this.busy = true;
    this.us.getTopRolesList().subscribe(res => {
      this.busy = false;
      const response = res;
      this.tmpRoleTree = [];
      res.map((head) => {
        this.tmpRoleTree.push({
          label: head.headRoleName,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false,
          selectable: head.orgCode ? true : false
        });
      });
      this.roleTreeData.roles.roleTree = this.tmpRoleTree;
      this.roleTreeData.roles.roleTree2 = this.tmpRoleTree;
    }, err => {
      this.busy = false;
    });
  }

  selectedRowData(e) {
    //console.log(e);
    this.searchResultDocsSelected = e;
  }

  addToCartMulti(docs) {
    let postArray = { empNo: this.currentUser.EmpNo, docIds: [] };
    docs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.busy = true;
    this.documentService.addToCartMulti(postArray).subscribe(res => {
      this.busy = false;
      this.addToCartSuccess(res, docs)
    }, error => {
      this.busy = false;
      this.addToCartFailure()
    });
  }

  addToCartSuccess(res, docs) {
    if (res.status !== 'Exists') {
      let temp = [...docs];
      let newarray = [];
      newarray = this.documentService.checkedCartItems;
      temp.map(d => {
        newarray.push(d);
      });
      this.bs.setCartSelection.emit(newarray);
      this.subscriptions.push(this.documentService.getCart(this.currentUser.EmpNo).subscribe((data) => {
        this.documentService.refreshCart(data);
        this.setWorkflowSubject();
      }));
    }
    let loop = 0;
    docs.map((d, i) => {
      loop++;
      if (loop === docs.length) {
        docs.splice(0, docs.length);
      }
    });
    let message = '';
    let summary = 'Success';
    let severity = 'info';
    switch (res.status) {
      case 'Success':
        window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
        message = 'Document Added To Cart';
        break;
      case 'Exists':
        message = 'Document Already Exist in Cart';
        summary = 'Already Exist';
        severity = 'error';
        break;
      case 'Partial':
        window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
        message = 'Document Added To Cart';
        break;
    }
    // this.growlService.showGrowl({
    //   severity: severity,
    //   summary: summary,
    //   detail: message
    // });
    this.toastr.info(message, summary);

    // if(this.launch.workflow.model.subject && (this.launch.workflow.model.subject).trim().length===0){
    //   this.launch.workflow.model.subject = this.documentService.cartItems[0].fileName;
    // }
  }

  addToCartFailure() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add To Cart Failed'
    // });
    this.toastr.error('Add To Cart Failed', 'Failure');
  }

  roleTreeExpanded(event) {
    this.busy = true;
    this.us.getRoleTreeExpandedForUI().subscribe(res => {
      this.busy = false;
      this.roleTreeData.roles.roleTree = res;
      this.roleTreeData.roles.roleTree2 = res;
    }, err => {
      this.busy = false;
    });
  }

  searchExpandedRoleTree(query) {
    let self = this;
    this.roleTreeData.roles.roleTree = this.roleTreeData.roles.roleTree2.filter(e => {
      if (e.label) {
         e.children && self.existInChildNode(e);
      }
    });
  }

  existInChildNode(node) {
    let self = this;
    let exist = node.children.filter(e => {
      return e.children && self.existInRole(e);
    });
    return !!exist;
  }

  existInRole(node) {
    let exist = node.children.filter(e => {
      if (e.label) {
         e.label.toUpperCase().indexOf(this.roleTreeData.roleTreeSearchquery.toUpperCase()) !== -1;
      }
    });
    return !!exist;
  }

  selectRecipientsTab() {
    if (this.step1TabIndex === 0) {
      this.tabActiveIndex = [1];
      this.step1TabChange({ index: 1 });
    }
  }

  changeDeadlineDate(event) {
    console.log(new Date(event));
  }

  onClick(disabled: boolean) {
    if (disabled) {
      event.stopPropagation();
    }
  }

  clearReminderDate() {
    this.launch.workflow.model.reminderDate = undefined;
  }

  // Launch page Caching change
  /*subscribeRouterEvents() {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationStart) {
        this.closeAllDialog();
      }
      if (evt instanceof NavigationEnd) {
        if (this.router.url.includes('/workflow/launch')) {
          this.setBreadcrumb();
          this.closeAllDialog();
        }
      }
    });
  }

  subscribeRefreshRequiredEvent() {
    const subscription = this.bs.launchRefreshRequired.subscribe(data => {
      if (data === 'launch-feature') {
        this.init();
        this.assignActionTypes();
        //this.ngOnInit();
      } else if (data === 'Workitem-Action') {
        this.init();
        //this.ngOnInit();
      }
    });
    this.addToSubscriptions(subscription);
  }

  /!**
   * @description Set the breadcrumb for page
   * @param tabLabel
   *!/
  setBreadcrumb(tabLabel?) {
    this.breadcrumbService.setItems([
      {label: 'Launch'}
    ]);
  }

  /!**
   * @description Close all dialogs on page navigation
   *!/
  closeAllDialog() { }*/
  checkDeadlineCheckBox(e) {
    if (this.launch.workflow.model.isDeadlineEnabled) {
      this.launch.workflow.model.deadlineDate = new Date();
      this.launch.workflow.model.deadlineDate.setDate(this.launch.workflow.model.deadlineDate.getDate() + 7);
    }
    else {
      this.clearDeadline();
    }
  }

  clearDeadline() {
    this.launch.workflow.model.deadlineDate = undefined;
    this.launch.workflow.model.reminderDate = undefined;
  }

  clearReminder() {
    this.launch.workflow.model.reminderDate = undefined;
  }

  ngOnDestroy() {
    //console.log('Launch ngOnDestroy Called');
    this.documentService.checkedCartItems = [];
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
    this.subjectDisabled = false;
    this.isRelaunch = false;
    this.reminderRequired = false;
    //localStorage.removeItem('workflowSubject');
    this.showIframe = false;
    this.viewer = false;
    this.step1TabIndex = 0;
    this.tabActiveIndex = [0];
    Object.keys(this).map(k => {
      //this[k] = null;
      delete this[k];
    });
  }

  generateNew() {
    this.router.navigate(['/workflow/memo']);
  }
  
  hideDropdown(open: any) {
    console.log(open)
    if (open == true) {
      setTimeout(() => {
        const myElement = document.getElementById("up");
        if(myElement){
          myElement.style.marginTop = '95px';
        }
      }, 150)
      this.dropDownHideShow = true;
    }
    else if (open == false) {
      console.log(open, "else")
      const myElement = document.getElementById("up");
        if(myElement){
          myElement.style.marginTop = '5px';
        }
      this.dropDownHideShow = false;

    }
  }

  onMouseClick(e: any) {
    var abc = e.target.className.includes("ui-dropdown-label")
    setTimeout(() => {
      if (abc == false) {
        const myElement = document.getElementById("up");
        if(myElement){
          myElement.style.marginTop = '5px';
        }
        this.dropDownHideShow = false;
      }
    }, 150)
  }

}
