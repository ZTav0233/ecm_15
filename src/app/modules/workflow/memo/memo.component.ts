import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
  ViewChildren,
  QueryList,
  Input,
  OnChanges
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
// service
import { WorkflowService } from '../../../services/workflow.service';
// import { UserService } from '../../../services/user.service';
import { ContentService } from '../../../services/content.service';
// models
import { User } from '../../../models/user/user.model';
// import { ConfirmationService, Message } from 'primeng/primeng';
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
// import { $ } from "protractor";
import { EventEmitter } from '@angular/core';
import { DocumentCartComponent } from '../../../components/generic-components/document-cart/document-cart.component';
import { DataService } from '../../../services/data.Service';
import { AdminService } from '../../../services/admin.service';
import { MemoService } from '../../../services/memo.service';
import { ConfirmationService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
declare var CKEDITOR: any;
declare var CKSource: any;
declare var DecoupledEditor: any

@Component({
  selector: 'app-memo',
  templateUrl: './memo.component.html',
  providers: [Location],
  styleUrls: ['memo.component.css']
})
export class MemoComponent implements OnInit, OnDestroy {
  watchdog: any
  dates: Date[];
  rangeDates: Date[];
  minDate: Date;
  maxDate: Date;
  es: any;
  invalidDates: Array<Date>;
  data: any;
  recipientsActionType = [{ name: '' }, { name: 'Initial' }, { name: 'Signature' }, { name: 'Comments' }];
  fromReciActionType = [{ name: 'Signature' }];
  toReciActionType = [{ name: '' }, { name: 'Initial' }, { name: 'Signature' }];
  thruReciActionType = [{ name: 'Initial' }, { name: 'Signature' }];
  revReciActionType = [{ name: 'Comments' }, { name: 'Initial' }];
  myDropDown: string;

  public currentUser: User = new User();
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
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
      ccList: [],
      ThruList: [],
      RevList: [],
      FromList: [],
      SubFromList: []
    },
    workflow: { model: {} }
  };
  isRelaunch = false;
  replyRecipients = [];
  subjectDisabled = false;
  public actionType: any;
  public actionTypes: any;
  public memoWorkitemId: any = 0;
  public memoSubject: any;
  public wiaAction: any;
  public memoDataLength: any = 0;
  public subscriptionEsign: any;
  public userSearchSuggestion;
  public onBehalfUser;
  wiaReply = new WorkItemAction();
  showFrom: boolean = false;
  showThru: boolean = false;
  enableThruRadioButton: boolean = true;
  enableToRadioButton: boolean = true;
  ShowRev: boolean = false;
  selectedPort: string = '';
  wiaForward = new WorkItemAction();
  wiaReplyAll = new WorkItemAction();
  @Input() public transferList: any;
  reminderRequired = false;
  public distList = { 'id': 1, 'empNo': 1002, 'name': 'Distribution List', lists: [] };
  public globalList = { 'id': 1, 'empNo': 1002, 'name': 'Global List', lists: [] };
  public defaultList = { 'id': -1, 'empNo': 1002, 'name': 'Default List' };
  flag = true;
  public busyEsign: boolean;
  public roleId: any;
  public isFromDraft = false;
  emitActionType: any = 'Default';
  public searchTemplateNew: any;
  public documentClassesNew: any = [];
  public selectedDocumentClassNew: string;
  public tmpRoleTree = [];
  public searchResult: any;
  public subscriptions: Subscription[] = [];
  public breadCrumbPath: any[] = [];
  public activeIndex = 0;
  public bulkRole: any;
  public isDel: any;
  public colHeaders = [
    { field: 'creator', header: 'Created By' },
    { field: 'documentDate', header: 'Document Date' },
    { field: 'orgcode', header: 'OrgCode' },
    { field: 'ecmno', header: 'ECM No' },
    { field: 'addOn', header: 'Added On' }];
  public itemsPerPage = 8;
  public recepientsLoaded: boolean;
  public filteredRoles: any[];
  public actionId: any;
  public memoId: any = 0;
  public memoStepname: any = "COMPOSER";
  public draftId: any;
  public workItemId: any
  public recipientRoleId: any
  public draftWorkflow: any;
  showIframe = false;
  public attach_url: SafeResourceUrl;
  public viewer = false;
  public emptyMessage: any;
  editorData: any = `<p>Write, Memo!</p>`;
  public previousUrl: any;
  enable: boolean = false;
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
  workflowType: any = 'Memo';
  selectedCartItems: any;
  searchResultDocsSelected: any = [];
  public tabActiveIndex: any = 0;
  public openSearchDialog = false;
  public openAddFromFolderDilaog = false;
  public openTheDialog = false;
  public openThePreviewDialog = false;
  public openSearchDialogLoaded = false;
  public openAddFromFolderDilaogLoaded = false;
  public openTheDialogLoaded = false;
  public openTheDialogPreview = false;
  public openConfirmationDialog = false;
  public openTheConfirmationDialog = false;
  public openReviewerConfirmationDialog = false;
  public openTheReviewerConfirmationDialog = false;
  public openConfirmationActionDialog = false;
  public openTheConfirmationActionDialog = false;
  public openInformationDialog = false;
  public isInfoButtonClicked = false;
  public openTheInformationDialog = false;
  public isConfirmationActionChecked = false;
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
  thisOne: string;
  pWidth = window.innerWidth;
  browsingOptions: { name: string; code: string; }[];
  toggleDrop: any = true;
  type: { name: string; code: string; }[];
  language: { name: string; code: string; }[];
  subFontSizes: { name: string; code: string; }[];
  boolOnBehalfVals: { name: string; code: string; }[];
  For: { name: string; code: string; }[];
  pushList: any;
  give: any;
  remove: any[];
  RevGive: any[];
  thruGive: any[];
  toGive: any[];
  showApprover: boolean = false;
  selectedOrgUnit: any;
  roleData: any;
  suggestionsResults: any;
  fileNote: boolean = false;
  letter: boolean = false;
  isMemo: boolean = true;
  memo: boolean = true;
  ECM_NO: any;
  signUser2: any = "";
  memoRoleId: any = 0;
  memoRefSetId: any = 0;
  isMemoReferenceList: boolean = false;
  memoReferenceList: any[] = [];
  isMemoRefValid: boolean = true; 
  public memoRefListData: any[] = [{ 'setid': 0, 'roleId': 1002, 'refNo': 'Test' }];
  memoReferenceNo: any;
  memoSubFontSize: any = { name: '14', code: '14' };
  isOnBehalf: any = { name: 'No', code: 'No' };
  memoLang: any = { name: 'English', code: 'English' };
  memoType: any = { name: 'Memo', code: 'Memo' };
  memoDocId: any = "";
  selectedFor: any = { name: 'Action', code: 'Action' };
  Approver: boolean = false;
  Composer: boolean = true;
  recipients: any[] = [];
  attachment: any[] = [];
  Enclosures: any[] = [];
  previewResponse: any = '';
  onlinePreview: any = '';
  isOnlinePreviewReady: boolean = false;
  previewResponseForNewTab: any = '';
  date: any = new Date();
  recipientTab: boolean = false;
  memoDetailsTab: boolean = false;
  designation: string;
  suffix: string;
  greeting: string;
  address: string;
  To: string;
  addDocumentType: string = "Attachment";
  recipientTypeName: string;
  from: boolean = false;
  subFrom: boolean = false;
  rev: boolean = false;
  through: boolean = false;
  to: boolean = false;
  cc: boolean = false;
  maxChars = 500;
  public eSignDialog = false;
  public submitMemoDialog = false;
  public isesignCancelDisabled = true;
  reviewerWiRemarks: string;
  throughWiRemarks: string;
  ccWiRemarks: string;
  toWiRemarks: string;
  sub_fromWiRemarks: string;
  fromWiRemarks: string;
  public workitem: any;
  folderId: any;
  folderpath: any;
  memoDocTitle: any;
  memoContract: any;
  removeEnabled = false;
  public openTree = false;
  folderList: any[];
  index: any;
  public folderPermission = { usage: 'addDocument', folderSelected: false, permission: true };
  selectedFolder: any;
  editorEN: any;
  editorAR: any;
  intervalId!: ReturnType<typeof setTimeout>;

  constructor(
    private toastr:ToastrService,
    public cs: ContentService,
    public ds: DocumentService,
    public breadcrumbService: BreadcrumbService,
    public adminService: AdminService,
    public ws: WorkflowService,
    public memoService: MemoService,
    public sanitizer: DomSanitizer,
    public us: UserService,
    public bs: BrowserEvents,
    public as: AdminService,
    public contentService: ContentService,
    public documentService: DocumentService,
    public router: Router,
    public actroute: ActivatedRoute,
    public coreService: CoreService,
    public location: Location,
    public growlService: GrowlService,
    public confirmationService: ConfirmationService,
    public dataService: DataService) {
    this.deadLineTimes = global.times;
    this.reminderTimes = _.cloneDeep(global.times);
    this.deadLineTime = { id: 30, time: '07:00 AM' };
    this.reminderTime = { id: 30, time: '07:00 AM' };
    this.type = [
      { name: 'Memo', code: 'Memo' },
      { name: 'File Note', code: 'File Note' },
      { name: 'Letter', code: 'Letter' }
    ]

    this.language = [
      { name: 'English', code: 'English' },
      { name: 'Arabic', code: 'Arabic' }
    ]
    this.boolOnBehalfVals = [
      { name: 'No', code: 'No' },
      { name: 'Yes', code: 'Yes' }
    ]

    this.subFontSizes = [
      { name: '14', code: '14' },
      { name: '8', code: '8' },
      { name: '9', code: '9' },
      { name: '10', code: '10' },
      { name: '11', code: '11' },
      { name: '12', code: '12' },
      { name: '13', code: '13' },
      { name: '15', code: '15' },
      { name: '16', code: '16' },
      { name: '18', code: '18' },
      { name: '19', code: '19' },
      { name: '20', code: '20' },
      { name: '22', code: '22' },
      { name: '24', code: '24' },
      { name: '26', code: '26' },
      { name: '28', code: '28' },
      { name: '30', code: '30' }
    ]
    this.For = [
      { name: 'Action', code: 'Action' },
      { name: 'Advise', code: 'Advise' },
      { name: 'Approval', code: 'Approval' },
      { name: 'Circulation', code: 'Circulation' },
      { name: 'Comments', code: 'Comments' },
      { name: 'Coordination', code: 'Coordination' },
      { name: 'Discuss', code: 'Discuss' },
      { name: 'File', code: 'File' },
      { name: 'Follow up', code: 'Follow up' },
      { name: 'Handling', code: 'Handling' },
      { name: 'Information', code: 'Information' },
      { name: 'Others', code: 'Others' },
      { name: 'Per request', code: 'Per request' },
      { name: 'Return', code: 'Return' },
      { name: 'Review', code: 'Review' },
      { name: 'Update', code: 'Update' },
      { name: 'Verification', code: 'Verification' },
    ]
    this.isMemo = true;
    this.init();

  }

  myFunction(e) {
    e.stopPropagation();
  }


  init() {
    /*  this.bs.setWfSubject.subscribe(d => {
       this.setWorkflowSubject();
     }); */
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
    this.launch.documents.enclosureCartItems = this.documentService.enclosureCartItems;
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
  // ngDoCheck(){
  //   console.log(this.editorEN.getData());
  // }

  // initializeCKEditor() {

  //   var s = document.createElement("script");
  //   s.type = "text/javascript";
  //   s.innerHTML = "setTimeout(function(){ CKEDITOR.replace( 'composeTextAr', {contentsLangDirection:'rtl'},{removeButtons: 'Image,About,Iframe'} ); }, 10 );"; //inline script
  //   // this.elementRef.nativeElement.appendChild(s);
  //   var fragment = document.createDocumentFragment();
  //   fragment.appendChild(s);
  //   document.getElementById('ckdiv').appendChild(fragment);
  //   window['CKEDITOR'].config.extraPlugins = 'justify,colorbutton, font';
  //   window['CKEDITOR'].config.removePlugins = 'scayt';
  //   window['CKEDITOR'].config.disableNativeSpellChecker = true;
  //   window['CKEDITOR'].config.enterMode = window['CKEDITOR'].ENTER_BR;
  //   let _self = this;
  //   setTimeout(function () {
  //     window['CKEDITOR'].instances.composeTextAr.on('change', function (event) {
  //       _self.workItem.memo.memoArMessage = window['CKEDITOR'].instances.composeTextAr.getData();
  //       _self.shareService.idle.watch();
  //       _self.shareService.idleState = "Started.";
  //       _self.shareService.timedOut = false;
  //     });
  //   }
  //     , 200);
  // }
  applyMargin() {
    if (document.getElementById("drop")) {
      const myElement = document.getElementById("up");
      myElement.style.marginTop = '90px';
    }
  }


  assignLaunchUserOptions() {
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
      ////console.log(d, "d")
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

  assignBulkLaunchOptions() {
    this.currentUser.roles.map((r, i) => {
      ////console.log("roles.map")
      if (r.status === 'ACTIVE') {
        this.launch.launchBtnItems.push({
          'label': "Bulk launch (On Behalf Of " + r.name + ")", command: event => {
            this.launchAsRole(r, 'bulk');
          }
        });
      }
    });
    this.currentUser.delegated.map((d, i) => {
      //console.log("delegated.map")
      this.launch.launchBtnItems.push({
        'label': "Bulk launch (On Behalf Of " + d.delName + ")", command: event => {
          this.launchAsDelegatedUser(d, 'bulk');
        }
      });
    });
    if (this.currentUser.roles.length > 0) {
      //console.log("roles.length")
      this.launch.launchBtnItems.push({
        'label': "Bulk launch (As " + this.currentUser.fulName + ")", command: event => {
          this.launchAsCurrentUser('bulk', 0, false, '');
        }
      });
    }
  }

  clickIt() {
    this.flag = !this.flag;
  }

  ngOnInit() {
    var editor  = null;
    this.recipientTab = true;

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);
    this.maxDate = new Date();
    this.maxDate.setMonth(nextMonth);
    this.maxDate.setFullYear(nextYear);
    this.memoWorkitemId = 0;
    let invalidDate = new Date();
    invalidDate.setDate(today.getDate() - 1);
    this.invalidDates = [today, invalidDate];
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
    this.actroute.data.subscribe(data => {
      this.busy = false;
    }, Error => {
      this.busy = false;
    });
    this.breadcrumbService.setItems([
      { label: 'Memo' }
    ]);
    this.busy = true;
    this.actroute.paramMap.subscribe(data => {
      //console.log(data)
      this.busy = false;
      const routeParams: any = data;
      this.launch.routeParams = routeParams.params;
      this.prepareStepItems();
      this.getDocumentCart();
      this.busy = true;
      this.actroute.params.subscribe((params: any) => {
        //console.log(params)
        this.busy = false;
        routeParams.actionType = params['actionType'];
        let paramAction = routeParams.params.actionType;
        if (paramAction === 'edit') {
          this.getWorkItemdetails(params.workItemId, params.memoStep);
          this.memoStepname = params.memoStep;
        }
        else  if (paramAction === 'draftMemo') {
          console.log("onng draftMemo draftid = " + params.id);
          console.log("onng draftMemo workItemId = " + params.workItemId);
          console.log("onng draftMemo memoStep = " + params.memoStep);
          console.log("onng draftMemo memoId = " + params.memoId);
          if(params.workItemId && params.workItemId > 0 && params.memoStep && params.memoStep !== null){
            this.getWorkItemdetails(params.workItemId, params.memoStep);
            this.memoStepname = params.memoStep;
          }
        }
        else if(paramAction === 'memoMerge'){
          if(params.ecmNo && params.ecmNo !== null && params.ecmNo !== "")
          this.launch.workflow.model.ECMNo = params.ecmNo;
          this.ECM_NO = params.ecmNo;
        }
        this.assignActionType(routeParams);
        
      }, Error => {
        this.busy = false;
      });
    }, Error => {
      this.busy = false;
    });
    this.emptyMessage = global.no_doc_found;

    if (!this.actionTypes) {
      let orgData;
      this.memoService.getOrgUnitbyOrgCode(this.currentUser.orgCode).subscribe(res => {
        this.busy = false
        orgData = res
        this.launch.workflow.model.selectedorgCode = orgData
        //console.log(typeof (this.launch.workflow.model.selectedorgCode))
      });

      if (!this.ECM_NO) {
        this.adminService.getNextECMNo().subscribe((res) => {
          this.ECM_NO = res;
          this.busy = false
        });
      }
    }

    let self = this;
    setTimeout(() => {
      // this.onReadyCkEditor()
      self.onReadyCkEditorEN('en');
      self.onReadyCkEditorAR('ar');
    }, 600);

    setTimeout(() => {
      self.timerStart();
    } , 1000);
  }


  timerStop() {
    console.log("Clear Interval 2");
    if(this.intervalId)
      clearInterval(this.intervalId);
    this.intervalId = null;
  }
  
  timerRestart() {
    let self = this;
    const myElement = document.getElementById("timerVal");
    console.log('Restart timerElement = ' + myElement);
    self.timerStop();
    myElement.innerHTML = '25';
    self.timerStart();
  }

  timerStart () {
    var editor  = null;
    this.timerStop();
    const myElement = document.getElementById("timerVal");
    console.log('Start timerElement = ' + myElement);
      //updateMemoPreview testing
    let self = this;
    self.intervalId = setInterval(function () {
      let timeleft = parseInt(myElement.innerHTML, 10); ;
      if(+timeleft > 0){
        myElement.innerHTML = (+timeleft - 1).toString();
      } else{
        debugger;
          if(!self.launch || self.launch === null || self.launch === undefined 
              || !self.launch.recipients || self.launch.recipients === null || self.launch.recipients === undefined){
            console.log("Clear Interval 1");
            clearInterval(self.intervalId);
            self.isOnlinePreviewReady = false;
          }

          if(self.launch.recipients && self.launch.recipients.FromList.length == 0 
              ||(self.memoType.name=='Memo'&& (self.launch.recipients && self.launch.recipients.toList.length == 0)) 
              || !self.folderpath || !self.date || !self.launch.workflow.model.selectedorgCode 
              || !self.launch.workflow.model.refNo|| !self.launch.workflow.model.subject 
              || (self.memoLang.name=='English' && !self.launch.workflow.model.messages) 
              || (self.memoLang.name!='English' && !self.launch.workflow.model.arMessages) 
              || (self.memoType.name=='Letter' && !self.designation) ||(self.memoType.name=='Letter' && !self.address) 
              || (self.memoType.name=='Letter' && !self.To)){
                setTimeout(() => {
                  self.timerRestart();
                } , 200);
          }
          else{
              /* var ckData = editor.getData();
              console.log("CKEditor data :: " + ckData)
              if(ckData && ckData.length > 0)
              {
                self.memoDataLength = ckData.length;
                console.log( 'Total bytes: ' + self.memoDataLength);

                self.updateMemoPreview();
                setTimeout(() => {
                  self.timerRestart();
                } , 500);
              }*/
              var ckData = (self.memoLang.name==='English' && self.editorEN.getData()) ? self.editorEN.getData() : ((self.memoLang.name!=='English' && self.editorAR.getData()) ? self.editorAR.getData() : '');
              if(ckData && ckData.length > 0)
              {
                self.memoDataLength = ckData.length;
                console.log( 'Total bytes: ' + self.memoDataLength);

                self.updateMemoPreview();
                setTimeout(() => {
                  self.timerRestart();
                } , 1000);
              }
          }
       
      }
      
    }, 1000);
  }

  loadUserSettings() {
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
            if (this.defaultTabName === "") {
              this.defaultTabName = this.currentUser.name;
            }
          } else {
            this.isDefaultTab = false;
            this.defaultTabId = 0;
          }
        }
        else if (setting.key === 'Default Folder') {
          if (setting.val && setting.val != "") {
            this.setDefaultFolderDetails(setting.val);
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
          else if (setting.key === 'Default Folder') {
            if (setting.val && setting.val != "") {
              this.setDefaultFolderDetails(setting.val);
            }
          }
        });
      }, Error => {
        this.busy = false;
      });
    }
  }


  setDefaultFolderDetails(fId) {
    this.busy = true
    this.contentService.getFolderDetails(fId).subscribe(res => {
      this.busy = false;
      this.folderId = res.id;
      this.folderpath = res.path;
      this.removeEnabled = true;
    });
  }

  checkDoc(isAction?) {
    let array = [];
    isAction ? array = this.selectedCartItems : array = this.launch.documents.cartItems;
    let isSelectedCardInvalid = false;
    let docPdfWordCount = 0;
    let docPdfWordSignedCount = 0;
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
    if (docPdfWordCount == 0) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one PDF or MS word file should be selected for Signature/Initial.'
      // });
      this.toastr.error('At least one PDF or MS word file should be selected for Signature/Initial.', 'Not Allowed');
      isSelectedCardInvalid = true;
    } else if (docPdfWordSignedCount == 0) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one document should be marked for eSign.'
      // });
      this.toastr.error('At least one document should be marked for eSign.', 'Not Allowed');
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
    if (docPdfWordCount == 0) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one PDF or MS word file should be selected for Signature/Initial.'
      // });
      this.toastr.error('At least one PDF or MS word file should be selected for Signature/Initial.', 'Not Allowed');
      isSelectedCardInvalid = true;
    } else if (docPdfWordSignedCount == 0) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Not Allowed', detail: 'At least one document should be marked for eSign.'
      // });
      this.toastr.error('At least one document should be marked for eSign.', 'Not Allowed');
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
    this.launch.documents.existing.activeAccordionIndices = [1];
    this.searchResultCopy = data.dataCopy;
  }

  onDocumentRemoved() {
    //console.log("clears")
    this.prepareStepItems();
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Document Removed From Enclosures'
    // });
    this.toastr.info('Document Removed From Enclosures', 'Success');
  }

  prepareStepItems(isFrom?) {
    // console.log("prepareStepItems" ,this.launch.documents.existing.model.actionType)
    if (this.launch.documents.existing.model.actionType === 'bulkLaunch') {
      // console.log("if" )
      this.launch.launchBtnItems = [];
      this.assignBulkLaunchOptions();
    } else {
      // console.log("else" )
      this.launch.launchBtnItems = [];
      this.assignLaunchUserOptions();
    }
    if(isFrom == '1')
    {
      this.getMemoReferenceListValues('0');
    }
  }

  resetMemoRefControl(){
    let listLen = this.memoReferenceList?this.memoReferenceList.length:0;
    console.log("resetMemoRefControl Len :: " +listLen);
    if(this.memoReferenceList && this.memoReferenceList.length > 0){
      this.isMemoReferenceList=true;
      let firstRefVal = this.memoReferenceList[0].value;
      this.launch.workflow.model.refNo = firstRefVal;
      this.memoReferenceNo = firstRefVal;
      this.validateData(firstRefVal, 0);
    }
    else{
      this.isMemoReferenceList=false;
      //if()
      this.getMemoReferenceListValues('0');
    }
  }

  getMemoReferenceListValues(isEdit, refNo?){
    console.log("getMemoReferenceListValues");
    this.memoRoleId = this.getMemoRoleId();
    //if(isEdit === '2')
      //this.updateMemoReferenceCounter();
    if(this.memoRoleId > 0)
    {
      this.memoReferenceList = [];
      this.memoRefListData= [];
      if(isEdit == '1')
        this.memoReferenceList.push({ label: refNo , value: refNo });
      this.busy = true;
      this.memoService.getMemoRefValuesByRole(this.memoRoleId).subscribe((res: any) => {
        this.busy = false;
        let isValueExists = false;
        res.map(d => {
            isValueExists = true;
            this.memoReferenceList.push({ label: d.refValue , value: d.refValue });
            this.memoRefListData.push({ 'setId': d.setId, 'roleId': d.roleId, 'refNo': d.refValue });
        });
        if(isValueExists){
          this.memoReferenceList.push({ label: "Enter Manually" , value: "Enter Manually" });
          this.isMemoReferenceList = true;
          let firstRefVal = this.memoReferenceList[0].value;
          this.launch.workflow.model.refNo = firstRefVal;
          this.memoReferenceNo = firstRefVal;
          this.validateData(firstRefVal, 0);
        }
          
      }, err => {
        this.busy = false;
      });
    }
  }

  //this.launch.workflow.model.refNo
  updateMemoReferenceCounter(){
    if(this.actionTypes !== 'edit' && this.memoId === 0){
      this.busy = true;
      console.log("updateMemoReferenceCounter :: roleid = " + this.memoRoleId + " : RefSetId = " + this.memoRefSetId);
      this.memoService.updateMemoRefCounter(this.memoRoleId, this.memoRefSetId).subscribe((res: any) => {
        this.busy = false;
      }, err => {
        this.busy = false;
      });
    }
  }

  assignSubjectFromCart(data) {
    // this.launch.workflow.model.subject = data;
  }

  assignActionTypes(fn?) {
    this.launch.workflow.forOptions = [];
    if (this.launch.documents.existing.model.actionType.match(/Signature/) !== null) {
      this.launch.workflow.forOptions.push({ label: 'Signature', value: 'Signature' });
      this.launch.workflow.model.actions = [this.launch.workflow.forOptions[0].value];
    }
    else if (this.launch.documents.existing.model.actionType.match(/Initial/) !== null) {
      this.launch.workflow.forOptions.push({ label: 'Initial', value: 'Initial' });
      this.launch.workflow.model.actions = [this.launch.workflow.forOptions[0].value];
    }
    else {
      if (this.launch.routeParams.docId && this.selectedCartItems && this.selectedCartItems.length > 0) {
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
      let data = this.ws.getWorkflowActions();
      if (data) {
        data.map(a => {
          if (a.name !== 'Signature' && a.name !== 'Initial') {
            this.launch.workflow.forOptions.push({ label: a.name, value: a.name });
          }
        });
      }
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

  loadRecepients() {
    this.launch.recipients.roles.result = [];
    this.launch.recipients.search.result = [];
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
      this.us.getRoleMembers(role.id).subscribe(res => {
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
      });
    }
  }

  getRoleMembersForTree(role, type?) {
    if (role.id > 0 && (!role.members && role.members !== '')) {
      let RoleNameString = '';
      this.us.getRoleMembers(role.id).subscribe(res => {
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
      });
    }
  }

  getListUsersForTooltip(list) {
    if (list.id > 0 && (!list.members && list.members !== '') && (!list.appRole || list.appRole === 'ROLE')) {
      let RoleNameString = '';
      this.us.getListUsers(list.id).subscribe((res: any) => {
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
      });
    }
  }

  //setWorkflowSubject() {
  // if ((this.actionTypes === 'launch' || (this.actionTypes === 'browseLaunch'))
  //   && !this.isRelaunch && !this.launch.workflow.model.subject) {
  //   if (this.selectedCartItems && this.selectedCartItems.length > 0) {
  //     this.launch.workflow.model.subject = this.selectedCartItems[0].fileName;
  //   }
  //   else if (this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
  //     this.launch.workflow.model.subject = this.launch.workflow.model.attachments[0].fileName;
  //   }
  //   else if (this.launch.documents.cartItems && this.launch.documents.cartItems.length > 0) {
  //     this.launch.workflow.model.subject = this.launch.documents.cartItems[0].fileName;
  //   }
  // }
  //} 

  getDocumentCart(isFromAdd?) {
    this.busy = true;
    // if (this.step1TabIndex == 1) {
    this.documentService.getEnclosureCart(this.currentUser.EmpNo).subscribe((data) => {
      this.busy = false;
      this.documentService.refreshEnclosureCart(data);
    })
    // } else {
    this.documentService.getCart(this.currentUser.EmpNo).subscribe((data) => {
      this.busy = false;
      this.documentService.refreshCart(data);

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
      this.prepareStepItems();
    }, (err) => {
      this.busy = false;
    });
    // }

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
    //console.log("remove from cart called");
    this.busy = true;
    this.documentService.removeFromCart(this.currentUser.EmpNo, item.id).subscribe((data) => {
      this.busy = false;
      this.launch.documents.cartItems.map((d, i) => {
        if (d.id === item.id) {
          this.launch.documents.cartItems.splice(i, 1);
        }
      });

      //console.log("remove from cart selectedCartItems called");
      this.selectedCartItems.map((d, i) => {
        if (d.id === item.id) {
          this.selectedCartItems.splice(i, 1);
          //console.log("remove from cart selectedCartItems spliced");
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
        this.addToCart2_v2(doc);
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Document Already Exists in Draft Attachment'
        // });
        this.toastr.error('Document Already Exists in Draft Attachment', 'Failure');
      }
    } else {
      this.addToCart2_v2(doc);
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
        this.bs.setCartSelection.emit(newarray);
      }
    }, Error => {
      this.busy = false;
    });
  }
  
  addToCart2_v2(doc) {
    this.busy = true;
    if (this.addDocumentType == "Enclosure") {
      if (doc.format && doc.format.toLowerCase() == "application/pdf") {
        let docs = [];
        docs.push(doc);
        this.addToEncMulti(docs);
      }
      else
        alert("Only PDF documents supported for enclosure");

      this.busy = false;
    }
    else {
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
          this.bs.setCartSelection.emit(newarray);
        }
      }, Error => {
        this.busy = false;
      });
    }
  }

  downloadDoc(doc) {
    window.location.assign(this.documentService.downloadDocument(doc.id));
  }

  //Add CC from Search User, Role Tree, Role List
  addToCCList(role) {
    if (!this.existsInList(role)) {
      role.EmpNo = role.id;
      role.userType = 'ROLE';
      role.actionType = 'CC';
      if (role.fulName) {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.headRoleName) {
        role.userType = 'ROLE';
        role.name = role.headRoleName;
      }
      role.disabled = true;
      this.launch.recipients.ccList.push(role);
      this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.ccList = [...this.launch.recipients.ccList]
      this.recipients.push({
        userName: role.userName || role.name,
        displayName: role.name,
        userId: role.id,
        userType: role.userType,
        action: " ",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      //console.log(this.recipients)
      this.prepareStepItems();
    }
  }
  addToThruList(role) {
    if (!this.existsInList(role)) {
      role.EmpNo = role.id;
      role.userType = 'ROLE';
      role.actionType = 'THRU';
      if (role.fulName) {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.headRoleName) {
        role.userType = 'ROLE';
        role.name = role.headRoleName;
      }
      role.disabled = true;
      this.launch.recipients.ThruList.push(role);
      this.launch.recipients.ThruList.map(v => Object.assign(v, { action: "Initial" }));
      this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
      this.recipients.push({
        userName: role.userName || role.name,
        displayName: role.name,
        userId: role.id,
        userType: role.userType,
        action: "Initial",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      //console.log(this.recipients)
      this.prepareStepItems();
    }
  }
  //Add TO from Search User, Role Tree, Role List
  addToToList(role) {
    //console.log(role)
    if (!this.existsInList(role)) {
      role.EmpNo = role.id;
      role.userType = 'ROLE';
      role.actionType = 'TO';
      if (role.fulName) {
        role.name = role.fulName;
        role.userType = 'USER';
      }
      if (role.headRoleName) {
        role.name = role.headRoleName;
        role.userType = 'ROLE';
      }
      role.disabled = true;
      this.launch.recipients.toList.push(role);
      this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.toList = [...this.launch.recipients.toList]
      //console.log(this.launch.recipients.toList)
      this.recipients.push({
        userName: role.userName || role.name,
        displayName: role.name,
        userId: role.id,
        userType: role.userType,
        action: " ",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      //console.log(this.recipients)
      this.prepareStepItems('1');
    }
  }
  addToFromList(role) {
    console.log(role)
    if (!this.existsInList(role)) {
      role.EmpNo = role.id;
      role.userType = 'ROLE';
      role.actionType = 'FROM';
      if (role.fulName) {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.headRoleName) {
        role.userType = 'ROLE';
        role.name = role.headRoleName;
      }
      role.disabled = true;
      if (this.launch.recipients.FromList.length < 1) {
        this.launch.recipients.FromList.push(role);
        this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.FromList = [...this.launch.recipients.FromList]

      } else if (this.launch.recipients.SubFromList.length < 2) {
        this.busy = false
        role.actionType = "SUB-FROM"
        this.launch.recipients.SubFromList.push(role);
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only three user or role allowed in From'
        // });
        this.toastr.error('Only three user or role allowed in From', 'Warning');
        return;
      }
      this.recipients.push({
        userName: role.userName || role.name,
        displayName: role.name,
        userId: role.id,
        userType: role.userType,
        action: "Signature",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      //console.log(this.recipients)
      this.prepareStepItems('1');
    }
  }
  addToRevList(role) {
    if (!this.existsInList(role)) {
      role.EmpNo = role.id;
      role.userType = 'ROLE';
      if (role.fulName) {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      if (role.headRoleName) {
        role.userType = 'ROLE';
        role.name = role.headRoleName;
      }
      role.disabled = true;
      if (!this.Approver && this.launch.recipients.RevList.length < 1) {
        role.actionType = 'PREV';
        this.launch.recipients.RevList.push(role);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      }
      else if (this.Approver) {
        role.actionType = 'REV';
        this.launch.recipients.RevList.push(role);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
        // });
        this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
        return;
      }
      this.recipients.push({
        userName: role.userName || role.name,
        displayName: role.name,
        userId: role.id,
        userType: role.userType,
        action: "Comments",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      //console.log(this.recipients)
      this.prepareStepItems();
    }
  }
  keyDown(e) {
    e.preventDefault();
  }
  //Abhishek 20-Feb-2023
  //Add TO from Distribution & Global List
  addListUsersToToList(list) {
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
            this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
            this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
            this.launch.recipients.toList = [...this.launch.recipients.toList]
            this.recipients.push({
              userName: l.userName,
              displayName: l.fulName,
              userId: l.EmpNo,
              userType: l.userType,
              action: " ",
              recipientType: l.actionType,
              addStatus: "ADD",
              status: 'ACTIVE',
              wiRemarks: ""
            })
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
              this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
              this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.toList = [...this.launch.recipients.toList]
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: " ",
                recipientType: l.actionType,
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              })
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
        this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.toList = [...this.launch.recipients.toList]
        this.recipients.push({
          userName: list.userName,
          displayName: list.fulName,
          userId: list.EmpNo,
          userType: list.userType,
          action: " ",
          recipientType: list.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add TO from Global List New!!!
  addListUsersToToListNew(list) {
    var selectedList = { id: list.id, name: list.name, userName: '', fulName: list.name, title: '', EmpNo: list.id, appRole: 'LIST', userType: 'LIST', actionType: 'TO' };
    if (!list.userName) {
      list.userType = 'LIST';
      list.actionType = 'TO';
      list.disabled = true;
      this.launch.recipients.toList.push(selectedList);
      this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.toList = [...this.launch.recipients.toList]
      this.recipients.push({
        userName: selectedList.userName,
        displayName: selectedList.fulName,
        userId: selectedList.EmpNo,
        userType: selectedList.userType,
        action: " ",
        recipientType: selectedList.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.prepareStepItems();
    }
    else {
      if (!this.existsInList(list)) {
        list.userType = 'LIST';
        list.actionType = 'TO';
        list.disabled = true;
        this.launch.recipients.toList.push(selectedList);
        this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.toList = [...this.launch.recipients.toList]
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add THRU from Distribution & Global List
  addListUsersToThruList(list) {
    if (!list.userName) {
      if (list.users) {
        list.users.map(l => {
          if (!this.existsInList(l)) {
            if (l.appRole === 'ROLE') {
              l.userType = 'ROLE';
            } else if (l.appRole === 'USER') {
              l.userType = 'USER';
            }
            l.actionType = 'THRU';
            l.disabled = true;
            this.launch.recipients.ThruList.push(l);
            this.launch.recipients.ThruList.map(v => Object.assign(v, { action: "Initial" }));
            this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
            this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
            this.recipients.push({
              userName: l.userName,
              displayName: l.fulName,
              userId: l.EmpNo,
              userType: l.userType,
              action: "Initial",
              recipientType: l.actionType,
              addStatus: "ADD",
              status: 'ACTIVE',
              wiRemarks: ""
            })
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
              l.actionType = 'THRU';
              l.disabled = true;
              this.launch.recipients.ThruList.push(l);
              this.launch.recipients.ThruList.map(v => Object.assign(v, { action: "Initial" }));
              this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: "Initial",
                recipientType: l.actionType,
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              })
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
        list.actionType = 'THRU';
        list.disabled = true;
        this.launch.recipients.ThruList.push(list);
        this.launch.recipients.ThruList.map(v => Object.assign(v, { action: "Initial" }));
        this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
        this.recipients.push({
          userName: list.userName,
          displayName: list.fulName,
          userId: list.EmpNo,
          userType: list.userType,
          action: "Initial",
          recipientType: list.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add THRU from Distribution & Global List New!!!
  addListUsersToThruListNew(list) {
    var selectedList = { id: list.id, name: list.name, userName: '', fulName: list.name, title: '', EmpNo: list.id, appRole: 'LIST', userType: 'LIST', actionType: 'THRU' };
    if (!list.userName) {
      list.userType = 'LIST';
      list.actionType = 'THRU';
      list.disabled = true;
      this.launch.recipients.ThruList.push(selectedList);
      this.launch.recipients.ThruList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
      this.recipients.push({
        userName: selectedList.userName,
        displayName: selectedList.fulName,
        userId: selectedList.EmpNo,
        userType: selectedList.userType,
        action: " ",
        recipientType: selectedList.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.prepareStepItems();
    }
    else {
      if (!this.existsInList(list)) {
        list.userType = 'LIST';
        list.actionType = 'THRU';
        list.disabled = true;
        this.launch.recipients.ThruList.push(selectedList);
        this.launch.recipients.ThruList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add REV from Distribution
  addListUsersToRevList(list) {
    if (!list.userName) {
      if (list.users) {
        list.users.map(l => {
          if (!this.existsInList(l)) {
            if (l.appRole === 'ROLE') {
              l.userType = 'ROLE';
            } else if (l.appRole === 'USER') {
              l.userType = 'USER';
            }
            l.actionType = this.Approver ? 'REV' : 'PREV';
            l.disabled = true;

            if (!this.Approver && this.launch.recipients.RevList.length < 1) {
              l.actionType = 'PREV';
              this.launch.recipients.RevList.push(l);
              this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
              this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.RevList = [...this.launch.recipients.RevList]
            }
            else if (this.Approver) {
              l.actionType = 'REV';
              this.launch.recipients.RevList.push(l);
              this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
              this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.RevList = [...this.launch.recipients.RevList]
            }
            else {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
              // });
              this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
              return;
            }
            this.recipients.push({
              userName: l.userName,
              displayName: l.fulName,
              userId: l.EmpNo,
              userType: l.userType,
              action: "Comments",
              recipientType: l.actionType,
              addStatus: "ADD",
              status: 'ACTIVE',
              wiRemarks: ""
            })
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
              l.actionType = this.Approver ? 'REV' : 'PREV';
              l.disabled = true;
              if (!this.Approver && this.launch.recipients.RevList.length < 1) {
                l.actionType = 'PREV';
                this.launch.recipients.RevList.push(l);
                this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
                this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
                this.launch.recipients.RevList = [...this.launch.recipients.RevList]
              }
              else if (this.Approver) {
                l.actionType = 'REV';
                this.launch.recipients.RevList.push(l);
                this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
                this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
                this.launch.recipients.RevList = [...this.launch.recipients.RevList]
              }
              else {
                // this.growlService.showGrowl({
                //   severity: 'error',
                //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
                // });
                this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
                return;
              }
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: "Comments",
                recipientType: l.actionType,
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              })
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
        list.actionType = this.Approver ? 'REV' : 'PREV';
        list.disabled = true;

        if (!this.Approver && this.launch.recipients.RevList.length < 1) {
          list.actionType = 'PREV';
          this.launch.recipients.RevList.push(list);
          this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
          this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        }
        else if (this.Approver) {
          list.actionType = 'REV';
          this.launch.recipients.RevList.push(list);
          this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
          this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        }
        else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
          // });
          this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
          return;
        }
        this.recipients.push({
          userName: list.userName,
          displayName: list.fulName,
          userId: list.EmpNo,
          userType: list.userType,
          action: "Comments",
          recipientType: list.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add REV from Global List New!!!
  addListUsersToRevListNew(list) {
    var selectedList = { id: list.id, name: list.name, userName: '', fulName: list.name, title: '', EmpNo: list.id, appRole: 'LIST', userType: 'LIST', actionType: (this.Approver ? 'REV' : 'PREV') };
    if (!list.userName) {
      list.userType = 'LIST';
      list.actionType = this.Approver ? 'REV' : 'PREV';
      list.disabled = true;

      if (!this.Approver && this.launch.recipients.RevList.length < 1) {
        list.actionType = 'PREV';
        this.launch.recipients.RevList.push(selectedList);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      }
      else if (this.Approver) {
        list.actionType = 'REV';
        this.launch.recipients.RevList.push(selectedList);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
        // });
        this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
        return;
      }
      this.recipients.push({
        userName: selectedList.userName,
        displayName: selectedList.fulName,
        userId: selectedList.EmpNo,
        userType: selectedList.userType,
        action: " ",
        recipientType: selectedList.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.prepareStepItems();
    }
    else {
      if (!this.existsInList(list)) {
        list.userType = 'LIST';
        list.actionType = this.Approver ? 'REV' : 'PREV';
        list.disabled = true;
        if (!this.Approver && this.launch.recipients.RevList.length < 1) {
          list.actionType = 'PREV';
          this.launch.recipients.RevList.push(selectedList);
          this.launch.recipients.RevList.map(v => Object.assign(v, { action: " " }));
          this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.RevList = [...this.launch.recipients.RevList]
        }
        else if (this.Approver) {
          list.actionType = 'REV';
          this.launch.recipients.RevList.push(selectedList);
          this.launch.recipients.RevList.map(v => Object.assign(v, { action: " " }));
          this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.RevList = [...this.launch.recipients.RevList]
        }
        else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
          // });
          this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
          return;
        }
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }
  //Add FROM from Distribution & Global List
  addListUsersToFromList(list) {
    if (!list.userName) {
      if (list.users) {
        list.users.map(l => {
          if (!this.existsInList(l)) {
            if (l.appRole === 'ROLE') {
              l.userType = 'ROLE';
            } else if (l.appRole === 'USER') {
              l.userType = 'USER';
            }
            // l.actionType = 'REV';
            l.disabled = true;
            if (this.launch.recipients.FromList.length < 1) {
              this.launch.recipients.FromList.push(l);
              this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
              this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.FromList = [...this.launch.recipients.FromList]
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: "Signature",
                recipientType: 'FROM',
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              });

            } else if (this.launch.recipients.SubFromList.length < 2) {
              this.launch.recipients.SubFromList.push(l);
              this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
              this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: "Signature",
                recipientType: 'SUB-FROM',
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              })
            } else {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Warning', detail: 'Only three user or role allowed in From'
              // });
              this.toastr.error('Only three user or role allowed in From', 'Warning');
              return;
            }
          }
        });
        this.prepareStepItems('1');
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
              // l.actionType = 'REV';
              l.disabled = true;
              if (this.launch.recipients.FromList.length < 1) {
                this.launch.recipients.FromList.push(l);
                this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
                this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
                this.launch.recipients.FromList = [...this.launch.recipients.FromList]
                this.recipients.push({
                  userName: l.userName,
                  displayName: l.fulName,
                  userId: l.EmpNo,
                  userType: l.userType,
                  action: "Signature",
                  recipientType: 'FROM',
                  addStatus: "ADD",
                  status: 'ACTIVE',
                  wiRemarks: ""
                });
              } else if (this.launch.recipients.SubFromList.length < 2) {
                this.launch.recipients.SubFromList.push(l);
                this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
                this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
                this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
                this.recipients.push({
                  userName: l.userName,
                  displayName: l.fulName,
                  userId: l.EmpNo,
                  userType: l.userType,
                  action: "Signature",
                  recipientType: 'SUB-FROM',
                  addStatus: "ADD",
                  status: 'ACTIVE',
                  wiRemarks: ""
                })
              } else {
                // this.growlService.showGrowl({
                //   severity: 'error',
                //   summary: 'Warning', detail: 'Only three user or role allowed in From'
                // });
                this.toastr.error('Only three user or role allowed in From', 'Warning');
                return;
              }
            }
          });
          list.users = users;
          this.prepareStepItems('1');
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
        // list.actionType = 'REV';
        list.disabled = true;
        if (this.launch.recipients.FromList.length < 1) {
          this.launch.recipients.FromList.push(list);
          this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
          this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.FromList = [...this.launch.recipients.FromList]
          this.recipients.push({
            userName: list.userName,
            displayName: list.fulName,
            userId: list.EmpNo,
            userType: list.userType,
            action: "Signature",
            recipientType: 'FROM',
            addStatus: "ADD",
            status: 'ACTIVE',
            wiRemarks: ""
          });
        } else if (this.launch.recipients.SubFromList.length < 2) {
          this.launch.recipients.SubFromList.push(list);
          this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
          this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
          this.recipients.push({
            userName: list.userName,
            displayName: list.fulName,
            userId: list.EmpNo,
            userType: list.userType,
            action: "Signature",
            recipientType: 'SUB-FROM',
            addStatus: "ADD",
            status: 'ACTIVE',
            wiRemarks: ""
          })
        } else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Warning', detail: 'Only three user or role allowed in From'
          // });
          this.toastr.error('Only three user or role allowed in From', 'Warning');
          return;
        }
        this.prepareStepItems();
      }
    }
  }
  //Add FROM from Distribution & Global List New!!!
  addListUsersToFromListNew(list) {
    var selectedList = { id: list.id, name: list.name, userName: '', fulName: list.name, title: '', EmpNo: list.id, appRole: 'LIST', userType: 'LIST', actionType: 'FROM' };
    if (!list.userName) {
      list.userType = 'LIST';
      list.actionType = 'FROM';
      list.disabled = true;
      if (this.launch.recipients.FromList.length < 1) {
        this.launch.recipients.FromList.push(selectedList);
        this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.FromList = [...this.launch.recipients.FromList]
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        });
      } else if (this.launch.recipients.SubFromList.length < 2) {
        this.launch.recipients.SubFromList.push(selectedList);
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only three user or role allowed in From'
        // });
        this.toastr.error('Only three user or role allowed in From', 'Warning');
        return;
      }
      this.prepareStepItems('1');
    }
    else {
      if (!this.existsInList(list)) {
        list.userType = 'LIST';
        list.actionType = 'CC';
        list.disabled = true;
        if (this.launch.recipients.FromList.length < 1) {
          this.launch.recipients.FromList.push(selectedList);
          this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
          this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.FromList = [...this.launch.recipients.FromList]
          this.recipients.push({
            userName: selectedList.userName,
            displayName: selectedList.fulName,
            userId: selectedList.EmpNo,
            userType: selectedList.userType,
            action: " ",
            recipientType: selectedList.actionType,
            addStatus: "ADD",
            status: 'ACTIVE',
            wiRemarks: ""
          });
        } else if (this.launch.recipients.SubFromList.length < 2) {
          this.launch.recipients.SubFromList.push(selectedList);
          this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
          this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
          this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
          this.recipients.push({
            userName: selectedList.userName,
            displayName: selectedList.fulName,
            userId: selectedList.EmpNo,
            userType: selectedList.userType,
            action: " ",
            recipientType: selectedList.actionType,
            addStatus: "ADD",
            status: 'ACTIVE',
            wiRemarks: ""
          })
        } else {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Warning', detail: 'Only three user or role allowed in From'
          // });
          this.toastr.error('Only three user or role allowed in From', 'Warning');
          return;
        }
        this.prepareStepItems('1');
      }
    }
  }
  //Add CC from Distribution & Global List
  addListUsersToCCList(list) {
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
            this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
            this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
            this.launch.recipients.ccList = [...this.launch.recipients.ccList]
            this.recipients.push({
              userName: l.userName,
              displayName: l.fulName,
              userId: l.EmpNo,
              userType: l.userType,
              action: " ",
              recipientType: l.actionType,
              addStatus: "ADD",
              status: 'ACTIVE',
              wiRemarks: ""
            })
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
              this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
              this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
              this.launch.recipients.ccList = [...this.launch.recipients.ccList]
              this.recipients.push({
                userName: l.userName,
                displayName: l.fulName,
                userId: l.EmpNo,
                userType: l.userType,
                action: " ",
                recipientType: l.actionType,
                addStatus: "ADD",
                status: 'ACTIVE',
                wiRemarks: ""
              })
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
        this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.ccList = [...this.launch.recipients.ccList]
        this.recipients.push({
          userName: list.userName,
          displayName: list.fulName,
          userId: list.EmpNo,
          userType: list.userType,
          action: " ",
          recipientType: list.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }

  //Add CC from Distribution & Global List New!!!
  addListUsersToCCListNew(list) {
    var selectedList = { id: list.id, name: list.name, userName: '', fulName: list.name, title: '', EmpNo: list.id, appRole: 'LIST', userType: 'LIST', actionType: 'CC' };
    if (!list.userName) {
      list.userType = 'LIST';
      list.actionType = 'CC';
      list.disabled = true;
      this.launch.recipients.ccList.push(selectedList);
      this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.launch.recipients.ccList = [...this.launch.recipients.ccList]
      this.recipients.push({
        userName: selectedList.userName,
        displayName: selectedList.fulName,
        userId: selectedList.EmpNo,
        userType: selectedList.userType,
        action: " ",
        recipientType: selectedList.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.prepareStepItems();
    }
    else {
      if (!this.existsInList(list)) {
        list.userType = 'LIST';
        list.actionType = 'CC';
        list.disabled = true;
        this.launch.recipients.ccList.push(selectedList);
        this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
        this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.ccList = [...this.launch.recipients.ccList]
        this.recipients.push({
          userName: selectedList.userName,
          displayName: selectedList.fulName,
          userId: selectedList.EmpNo,
          userType: selectedList.userType,
          action: " ",
          recipientType: selectedList.actionType,
          addStatus: "ADD",
          status: 'ACTIVE',
          wiRemarks: ""
        })
        this.prepareStepItems();
      }
    }
  }

  //Add CC from Default and Favorite Lists
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
      this.launch.recipients.ccList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.ccList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.recipients.push({
        userName: role.userName,
        displayName: role.fulName,
        userId: role.EmpNo,
        userType: role.userType,
        action: " ",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""

      })
      this.launch.recipients.ccList = [...this.launch.recipients.ccList]
      this.prepareStepItems();

    }
  }

  //Add Thru from Default List, Favorite List and Search User
  addToThruListFrom(role) {
    // console.log(role)
    this.showThru = true;
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'THRU';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'THRU';
        role.name = role.fulName;
      }
      role.disabled = true;
      // console.log(this.launch)
      this.launch.recipients.ThruList.push(role);
      this.launch.recipients.ThruList.map(v => Object.assign(v, { action: "Initial" }));
      this.launch.recipients.ThruList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.enableThruRadioButton = false
      //console.log(this.enableThruRadioButton)
      this.recipients.push({
        userName: role.userName,
        displayName: role.fulName,
        userId: role.EmpNo,
        userType: role.userType,
        action: "Initial",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
      this.prepareStepItems();
    }
  }
  //Add FROM from Default List, Favorite List and Search User
  addToFromListFrom(role) {
    //console.log(role)
    this.showFrom = true;
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.actionType = 'FROM';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.actionType = 'FROM';
        role.name = role.fulName;
      }
      role.disabled = true;
      if (this.launch.recipients.FromList.length < 1) {
        this.launch.recipients.FromList.push(role);
        this.launch.recipients.FromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.FromList.map(v => Object.assign(v, { wiRemarks: "" }));
        //console.log(this.launch.recipients.FromList)
        this.launch.recipients.FromList = [...this.launch.recipients.FromList]
        this.busy = true
        this.memoService.getValidateRoleMemberByCurrentUser(role.id).subscribe((res: any) => {
          if (res == 1) {
            this.Approver = true; this.Composer = false;
            if (this.launch.recipients.RevList && this.launch.recipients.RevList.length == 0) {
              //do nothing
            }
            else {
              this.launch.recipients.RevList[0].actionType = "REV";
              this.recipients = this.recipients.map((item, i) => {
                //console.log(item.userId, data.id, i)
                if (item.recipientType === "PREV") {
                  const data = {
                    action: item.action,
                    addStatus: item.addStatus,
                    id: item.id,
                    memoId: item.memoId,
                    orderId: item.orderId,
                    recipientType: "REV",
                    replyComments: item.replyComments,
                    userId: item.userId,
                    userName: item.userName,
                    status: 'ACTIVE',
                    userType: item.userType,
                    workflowId: item.workflowId,
                    workitemId: item.workitemId,
                    workitemStatus: item.workitemStatus
                  }
                  return data
                } else {
                  return item
                }
              });
            }
          } else {
            this.Approver = false; this.Composer = true;
            if (this.launch.recipients.RevList && this.launch.recipients.RevList.length == 0) {
              //do nothing
            }
            else {
              this.launch.recipients.RevList[0].actionType = "PREV";
              this.recipients = this.recipients.map((item, i) => {
                //console.log(item.userId, data.id, i)
                if (item.recipientType === "REV") {
                  const data = {
                    action: item.action,
                    addStatus: item.addStatus,
                    id: item.id,
                    memoId: item.memoId,
                    orderId: item.orderId,
                    recipientType: "PREV",
                    replyComments: item.replyComments,
                    userId: item.userId,
                    userName: item.userName,
                    status: 'ACTIVE',
                    userType: item.userType,
                    workflowId: item.workflowId,
                    workitemId: item.workitemId,
                    workitemStatus: item.workitemStatus
                  }
                  return data
                } else {
                  return item
                }
              });
            }
          }
          this.busy = false
        })
      } else if (this.launch.recipients.SubFromList.length < 2) {
        role.actionType = "SUB-FROM"
        this.launch.recipients.SubFromList.push(role);
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { action: "Signature" }));
        this.launch.recipients.SubFromList.map(v => Object.assign(v, { wiRemarks: "" }));
        this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only three user or role allowed in From'
        // });
        this.toastr.error('Only three user or role allowed in From', 'Warning');
        return;
      }
      this.recipients.push({
        userName: role.userName,
        displayName: role.fulName,
        userId: role.EmpNo,
        userType: role.userType,
        action: "Signature",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.prepareStepItems('1');
    }
  }
  //Add REV from Default List, Favorite List and Search User
  addToRevListFrom(role) {
    this.ShowRev = true;
    if (!this.existsInList(role)) {
      if (role.appRole === 'ROLE') {
        role.userType = 'ROLE';
        role.name = role.fulName;
      }
      if (role.appRole === 'USER') {
        role.userType = 'USER';
        role.name = role.fulName;
      }
      //role.actionType = this.Approver?'REV':'PREV';
      role.disabled = true;
      if (!this.Approver && this.launch.recipients.RevList.length < 1) {
        role.actionType = 'PREV';
        this.launch.recipients.RevList.push(role);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
      }
      else if (this.Approver) {
        role.actionType = 'REV';
        this.launch.recipients.RevList.push(role);
        this.launch.recipients.RevList.map(v => Object.assign(v, { action: "Comments" }));
        this.launch.recipients.RevList.map(v => Object.assign(v, { wiRemarks: "" }));
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Warning', detail: 'Only one reviewer allowed during preparation'
        // });
        this.toastr.error('Only one reviewer allowed during preparation', 'Warning');
        return;
      }
      this.recipients.push({
        userName: role.userName,
        displayName: role.fulName,
        userId: role.EmpNo,
        userType: role.userType,
        action: "Comments",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""

      })
      this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      this.prepareStepItems();
    }
  }

  //Add TO from Default and Favorite Lists
  addToToListFromList(role) {
    // console.log(role)
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
      this.launch.recipients.toList.map(v => Object.assign(v, { action: " " }));
      this.launch.recipients.toList.map(v => Object.assign(v, { wiRemarks: "" }));
      this.recipients.push({
        userName: role.userName,
        displayName: role.fulName,
        userId: role.EmpNo,
        userType: role.userType,
        action: " ",
        recipientType: role.actionType,
        addStatus: "ADD",
        status: 'ACTIVE',
        wiRemarks: ""
      })
      this.launch.recipients.toList = [...this.launch.recipients.toList]
      this.prepareStepItems();
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

    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial')
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
    [...this.launch.recipients.toList, ...this.launch.recipients.ccList, , ...this.launch.recipients.ThruList, ...this.launch.recipients.RevList, ...this.launch.recipients.FromList, ...this.launch.recipients.SubFromList].map(r => {
      if (r.name === role.name && r.id === role.id) {
        exists = true;
      }
    });
    role.disabled = exists;
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
    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial')
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
      isSignInit = 'Initial'
    }
    else {
      isSignInit = this.launch.documents.existing.model.actionType;
    }
    let searchQuery = {
      'userName': undefined, 'title': undefined, 'mail': undefined,
      'empNo': undefined, 'orgCode': undefined, 'phone': undefined,
      'userType': selectedType, 'filter': isSignInit
    };
    if (selectedType === 'USER') {
      searchQuery = Object.assign({}, this.userSearchQueary);
    } else {
      searchQuery = Object.assign({}, this.roleSearchQueary);
    }
    searchQuery.userType = selectedType;
    searchQuery.filter = isSignInit;

    let formValid = true;
    if ((searchQuery.userName !== undefined && searchQuery.userName !== '' && searchQuery.userName !== null) ||
      (searchQuery.title !== undefined && searchQuery.title !== '' && searchQuery.title !== null) ||
      (searchQuery.mail !== undefined && searchQuery.mail !== '' && searchQuery.mail !== null) ||
      (searchQuery.empNo !== undefined && searchQuery.empNo !== '' && searchQuery.empNo !== null) ||
      (searchQuery.orgCode !== undefined && searchQuery.orgCode !== '' && searchQuery.orgCode !== null) ||
      (searchQuery.phone !== undefined && searchQuery.phone !== '' && searchQuery.phone !== null)) {
    } else {
      formValid = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Warning', detail: 'Fill Any One Field To Search'
      // });
      this.toastr.error('Fill Any One Field To Search', 'Warning');
    }
    if (formValid) {
      if (searchQuery.userName === "") {
        delete searchQuery.userName;
      }
      if (searchQuery.orgCode === "") {
        delete searchQuery.orgCode;
      }
      this.busy = true;
      this.us.searchEcmUsers(searchQuery).subscribe(data => {
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
      this.us.getListUsers(0).subscribe((res: any) => {
        this.launch.recipients.list.selectedUserList.users = res;
        this.launch.recipients.list.selectedUserList.users2 = res;
      }, err => {
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
    }
  }

  onDocumentAdded(doc) {
    if (this.actionTypes === 'draftLaunch') {
      if (!(this.existsInAttachment(this.launch.workflow.model.attachments, doc))) {
        this.addToCart2_v2(doc);
      } else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Document Already Exists in Draft Attachment'
        // });
        this.toastr.error('Document Already Exists in Draft Attachment', 'Failure');
      }
    } else {
      this.addToCart2_v2(doc);

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
        docRecDate: 1452709800000
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
    workflow.priority = 2;
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
    if (workflow.workflow.date) {
      workflow.date = workflow.workflow.date;
      workflow.workflow.date = undefined;
    }
    if (workflow.workflow.selectedorgCode) {
      workflow.selectedorgCode = workflow.workflow.selectedorgCode;
      workflow.workflow.selectedorgCode = undefined;
    }
    if (workflow.workflow.messages) {
      workflow.messages = workflow.workflow.messages;
      workflow.workflow.messages = undefined;
    }
    if (workflow.workflow.refNo) {
      workflow.refNo = workflow.workflow.refNo;
      workflow.workflow.refNo = undefined;
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
    //console.log("launchAsDelegatedUser == type " + type);
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    //console.log("Launch ActionType == " + launchActionType);
    //console.log("Selected Cart Items == " + this.selectedCartItems);

    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)) {
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }
    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial') && launchActionType !== 'reLaunch') {
      if (this.checkDoc()) {
        return;
      }
    }

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
      localStorage.setItem('launchRefreshCounter', (count).toString());
      this.router.navigate(['/workflow/draft']);
      window.parent.postMessage('DraftSaveSuccess', '*');
    }
  }

  navigateToDashboard() {
    this.openConfirmationDialog = true;
    this.openTheConfirmationDialog = true;
    // console.log(this.editor);
    // console.log(this.editor.getData());

  }

  navigateToInboxForReview() {
    this.openReviewerConfirmationDialog = true;
    this.openTheReviewerConfirmationDialog = true;
  }

  sendforApprovalConfirmation() {
    this.isInfoButtonClicked = false;
    /* if (this.actionTypes === 'edit') {
      this.isConfirmationActionChecked = true;
    }
    if (this.isConfirmationActionChecked == false) {
      this.openConfirmationActionDialog = true;
      this.openTheConfirmationActionDialog = true;
    }
    else{ */
    if (this.launch.recipients.RevList && this.launch.recipients.RevList.length == 0)
      this.sendDataForApproval();
    else {
      this.openInformationDialog = true;
      this.openTheInformationDialog = true;
    }
    //}
  }

  cancelInfoDialogClick() {
    this.isInfoButtonClicked = true;
    this.openInformationDialog = false;
    this.openTheInformationDialog = false;
  }

  okInfoDialogClick() {
    //this.busy = true;
    this.isInfoButtonClicked = true;
    this.sendDataForApproval();

    this.openInformationDialog = false;
    this.openTheInformationDialog = false;
    //this.busy = false;
  }

  cancelReviewer() {
    this.openReviewerConfirmationDialog = false;
    this.openTheReviewerConfirmationDialog = false;
  }

  cancel() {
    this.openConfirmationDialog = false;
    this.openTheConfirmationDialog = false;
  }
  ok() {
    /* if (this.wiaAction ? this.wiaAction.id : null) {
      this.busy = true
      this.memoService.cancelMemo(this.wiaAction.id.toString()).subscribe((res: any) => {
        this.busy = false;
        //console.log(res)
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Memo Cancel Successful'
        });
        if (res) {
          this.busy = true;
          this.ds.deleteMemoDocument(this.wiaAction.memoDocId).subscribe(data => {
            this.busy = false;
            this.navigateToInbox();
          }, error => {
            this.busy = false;
            this.navigateToInbox();
            // this.growlService.showGrowl({
            //   severity: 'error',
            //   summary: 'Error', detail: 'Failed to Delete, please try manually'
            // });
          });
          
        }
      }, (err => {
        return;
      }))
    } else { */
    localStorage.removeItem('sentSelectedUserTab');
    localStorage.removeItem('navigateToDraft');
    if ((this.actionTypes === 'launch' || this.actionTypes === 'bulkLaunch') && !this.isRelaunch) {
      this.router.navigate(['/']);
      window.parent.postMessage('LoadDash', '*');
    }
    else {
      this.location.back();
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd)
        )
        .subscribe(e => this.identifyNavigateScreen(e));
    }
    //}
  }
  okAction() {
    this.openConfirmationActionDialog = false;
    this.openTheConfirmationActionDialog = false;
    this.openTheDialogLoaded = true;
    this.openTheDialog = true;
    this.RecipientUserIconSelection('FROM')
  }
  cancelAction() {
    this.openConfirmationActionDialog = false;
    this.openTheConfirmationActionDialog = false;
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'RefreshCart') {
      this.getDocumentCart();
    }
  }

  navigateToSent() {
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
      localStorage.setItem('launchRefreshCounter', (count).toString());
      this.bs.sentRefreshRequired.emit('sent-feature');
      this.router.navigate(['/workflow/sent']);
      window.parent.postMessage('ReplySuccess', '*');
    }
  }

  navigateToInbox() {
    this.bs.inboxRefreshRequired.emit('inbox-feature');
    this.router.navigate(['/workflow/inbox']);
    window.parent.postMessage('GoToInbox', '*');
  }


  launchByRoleId(roleId, type) {
    //console.log("launchByRoleId == roleId " + roleId);
    let role: any = null;
    this.currentUser.roles.map((r, i) => {
      if (r.id === roleId) {
        role = r;
      }
    });
    //console.log("launchByRoleId - Call launchAsRole == role " + role.id);
    this.launchAsRole(role, type);

  }


  launchAsRole(role, type) {
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)) {
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }

    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial') && launchActionType !== 'reLaunch') {
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

    let temp = role.name;
    if (!temp) {
      temp = this.currentUser.fulName;
    }
    this.ws.sentSelectedUserTab = (1 + this.currentUser.roles.indexOf(role)) + '@' + temp;
    this.launchWorkflow(workflow, type, false);
  }

  launchAsCurrentUser(type, id, draft, flag) {
    let launchActionType = (!this.launch.routeParams.actionType) ? "Empty" : this.launch.routeParams.actionType;
    if (!this.launch.routeParams.actionType && launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)) {
      let msg = "Please select at least one attachment."
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Attachment Required', detail: msg
      // });
      this.toastr.error(msg, 'Attachment Required');
      return;
    }

    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial') && launchActionType !== 'reLaunch') {
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
    //console.log("Launch ActionType == " + launchActionType);
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
      if (launchActionType !== 'reLaunch' && (!this.selectedCartItems || this.selectedCartItems.length == 0)) {
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


    if (workflow.workflow.instructions || workflow.workflow.instructions === "") {
      workflow.instructions = workflow.workflow.instructions;
      workflow.workflow.instructions = undefined;
    }
    if (workflow.workflow.date || workflow.workflow.date === "") {
      workflow.date = workflow.workflow.date;
      workflow.workflow.date = undefined;
    }
    if (workflow.workflow.selectedorgCode || workflow.workflow.selectedorgCode === "") {
      workflow.selectedorgCode = workflow.workflow.selectedorgCode;
      workflow.workflow.selectedorgCode = undefined;
    }
    if (workflow.workflow.messages || workflow.workflow.messages === "") {
      workflow.messages = workflow.workflow.messages;
      workflow.workflow.messages = undefined;
    }
    if (workflow.workflow.refNo || workflow.workflow.refNo === "") {
      workflow.refNo = workflow.workflow.refNo;
      workflow.workflow.refNo = undefined;
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
                          this.navigateToInbox();
                        }
                      }
                    }, error => {
                      this.busy = false;
                      // this.growlService.showGrowl({
                      //   severity: 'error',
                      //   summary: 'Failure', detail: error.message
                      // });
                      this.toastr.info(error.message, 'Failure');
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
          this.toastr.info('Minimum 2 documents  required in cart for bulk launch', 'Bulk Launch Not Allowed');
        }
      }
    });

    if ((this.launch.documents.existing.model.actionType === 'Signature' || this.launch.documents.existing.model.actionType === 'Initial') && launchActionType === 'reLaunch') {
      //console.log("Relaunch checkDocOtherActions");
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
            this.navigateToInbox();
          }
        }
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
    }
  }

  getECMNoForBulkLaunch(workflow, doc, cb?) {
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
    this.selectedCartItems.map((doc: any) => {
      if (this.launch.workflow.model.ECMNo === doc.ECMNo) {
        exist = true;
        exist
      }
    });
    return exist
  }

  assignCartItemsForLaunch(items, type) {
    //console.log(items)
    if (type == "Enclosures") {
      this.Enclosures = []
      this.Enclosures = items
    } else {
      this.attachment = []
      this.attachment = items
      //console.log(this.attachment)
    }
    this.selectedCartItems = items;
    if (this.launch.documents.cartItems.length == this.selectedCartItems.length) {
      this.allSelectedValues = ["selectedAll"];
    } else {
      this.allSelectedValues = [];
    }
  }

  populateWorkflowForm(item) {
    console.log("populateWorkflowForm :: " + item, "item")
    if (!this.subjectDisabled || this.launch.documents.existing.model.actionType === 'bulkLaunch') {
      this.assignDefaultForm(item);
    }
  }

  showDocPreview(item) {
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
      //console.log("assignDefaultForm ==> " + data.fileName);
      this.launch.workflow.model.subject = data.fileName;
    }
    else if (data && data.length > 0 && data[0].fileName) {
      //console.log("assignDefaultForm ==> " + data[0].fileName);
      this.launch.workflow.model.subject = data[0].fileName;
    }

    if (data.docTitle) {
      this.launch.workflow.model.subject = data.docTitle;
    }
    else if (data && data.length > 0 && data[0].docTitle) {
      //console.log("assignDefaultForm ==> " + data[0].fileName);
      this.launch.workflow.model.subject = data[0].docTitle;
    }
  }

  assignActionType(data) {
    console.log(data);
    this.memoWorkitemId = 0;
    if (data.params.actionType === 'edit') {
      this.actionId = data.params.id;
      this.memoId = data.params.id;
      this.actionTypes = data.params.actionType;
      if(data.params.workItemId && data.params.workItemId > 0)
        this.memoWorkitemId = data.params.workItemId;
    }
    else if (data.params.actionType === 'draftMemo') {
      console.log("draftMemo draftid = " + data.params.id);
      this.draftId = data.params.id;
      this.actionTypes = data.params.actionType;
      console.log("draftMemo - memoId = " + data.params.memoId?data.params.memoId:0);
      if(data.params.memoId && data.params.memoId > 0){
        this.actionId = data.params.memoId;
        this.memoId = data.params.memoId;
      }
      console.log("draftMemo - actionId" + this.actionId);
      console.log("draftMemo - workItemId = " + data.params.workItemId?data.params.workItemId:0);
      if(data.params.workItemId && data.params.workItemId > 0)
        this.memoWorkitemId = data.params.workItemId;
    }
    else if (data.params.actionType === 'memoMerge') {
      this.memoId = 0;
      this.memoWorkitemId = data.params.workItemId;
      this.memoSubject = data.params.subject;
      this.ECM_NO = data.params.ecmNo;
      this.workflowType = 'Memo';
    }

    //console.log(this.actionId)
    this.workItemId = data.params.workItemId;
    this.recipientRoleId = data.params.recipientRoleId;
    this.assignActionTypes(() => {
      if (data.params.actionType == 'edit') {
        this.busy = true;
        this.memoService.getMemoById(data.params.id).subscribe(res => {
          //console.log(res)
          this.busy = false;
          this.assignRecepients(res, false)
        }, err => {
          this.busy = false;
        });
        this.subjectDisabled = true;
        this.loadRecepients();
      }
      else if (data.params.actionType == 'draftMemo') {
        //console.log(data.params.actionType)
        this.busy = true;
        this.ws.getDrafts(this.currentUser.EmpNo, 'USER').subscribe(draftMemoData => {
          this.busy = false;
          draftMemoData.map((item, index) => {
            if (data.params.id == item.draftId) {
              this.draftWorkflow = item;
              console.log("inside memo id = " + this.draftWorkflow.memo.id);
              this.memoId = this.draftWorkflow.memo.id;
              this.actionId = this.memoId;
              this.assignRecepients(this.draftWorkflow.memo, true);
            }
          });
        }, err => {
          this.busy = false;
        });
        // this.actionTypes = 'launch'
      }
      else if (data.params.actionType === 'memoMerge') {
        this.busy = true;
        this.ws.getWorkitem(this.memoWorkitemId, this.currentUser.EmpNo, 0, 0).subscribe(res => {
          this.busy = false;
          this.assignDefaultMemoFields(res);
        }, err => {
          this.busy = false;
        });
      }
    })
  }
  // fromClicked() {
  //   this.give = this.launch.recipients.FromList;
  //   this.thisOne = "from"
  //   this.dataService.announceEvent("from")
  // }
  assignDefaultMemoFields(data) {
    this.launch.workflow.model.attachments = Object.assign([], data.attachments);
    this.launch.workflow.model.subject = data.subject ? data.subject : '';//---------------Draft change--------------
    this.launch.workflow.model.ECMNo = data.ECMNo;
    //this.memoDocTitle = (data.memoDocTitle && data.memoDocTitle !== null)? data.memoDocTitle : data.subject;
    this.ECM_NO = data.ECMNo;
    /* setTimeout(() => {
      this.timerStart();
    } , 1000); */
  }

  setMemoDocTitle() {
    this.memoDocTitle = (this.memoDocTitle && this.memoDocTitle !== null && this.memoDocTitle.length > 0) ? this.memoDocTitle : this.launch.workflow.model.subject.substring(0, 499);
  }

  maximumDate: any
  assignRecepients(data, fromDraft) {
    let self = this;
    //console.log("assignRecepients", data, data.deadline, fromDraft)
    this.launch.documents.existing.actionTypes = Object.assign([], [{ label: 'Default', value: 'Default' },
    { label: 'Signature', value: 'Signature' }, { label: 'Initial', value: 'Initial' }]);
    this.isFromDraft = fromDraft;
    this.launch.workflow.model.attachments = [];
    this.launch.workflow.model.Enclosuer = [];
    this.wiaAction = data;

    this.wiaAction.attachments.forEach((res) => {
      if (res.attach_type == 'ATTACHMENT') {
        this.launch.workflow.model.attachments.push(res)
      } else {
        this.launch.workflow.model.Enclosuer.push(res)
      }
    });
    this.launch.workflow.model.attachments.filter(res => {
      //console.log()
      if (res.attach_type == 'ATTACHMENT') {
        this.attachment.push(res)
      } else {
        this.Enclosures.push(res)
      }
    });
    this.launch.workflow.model.ECMNo = data.ECMNo;
    this.wiaReply.attachments = this.wiaAction.attachments;
    //console.log("Memo actionTypes :: " + this.actionTypes);
    if (this.actionTypes === 'edit' || this.actionTypes === 'draftMemo') {
      var orgData;
      var foldData;

      if (data.roleId != undefined && data.roleId > 0) {
        this.busy = true;
        // this.memoService.getValidateRoleMemberByCurrentUser(data.roleId).subscribe((res: any) => {
        if (this.Approver) {
          this.Approver = true;
          if (this.launch.recipients.RevList && this.launch.recipients.RevList.length != 0)
            this.launch.recipients.RevList[0].actionType = "REV";
          this.recipients = this.recipients.map((item, i) => {
            //console.log(item.userId, data.id, i)
            if (item.recipientType === "PREV") {
              const data = {
                action: item.action,
                addStatus: item.addStatus,
                id: item.id,
                memoId: item.memoId,
                orderId: item.orderId,
                recipientType: "REV",
                replyComments: item.replyComments,
                userId: item.userId,
                userName: item.userName,
                status: 'ACTIVE',
                userType: item.userType,
                workflowId: item.workflowId,
                workitemId: item.workitemId,
                workitemStatus: item.workitemStatus
              }
              return data
            } else {
              return item
            }
          });
        } else {
          this.Approver = false
          if (this.launch.recipients.RevList && this.launch.recipients.RevList.length != 0)
            this.launch.recipients.RevList[0].actionType = "PREV";
          this.recipients = this.recipients.map((item, i) => {
            //console.log(item.userId, data.id, i)
            if (item.recipientType === "REV") {
              const data = {
                action: item.action,
                addStatus: item.addStatus,
                id: item.id,
                memoId: item.memoId,
                orderId: item.orderId,
                recipientType: "PREV",
                replyComments: item.replyComments,
                userId: item.userId,
                userName: item.userName,
                status: 'ACTIVE',
                userType: item.userType,
                workflowId: item.workflowId,
                workitemId: item.workitemId,
                workitemStatus: item.workitemStatus
              }
              return data
            } else {
              return item
            }
          });
        }
        this.busy = false
        //});
      }

      this.busy = true
      this.memoService.getOrgUnitbyOrgCode(data.orgcode).subscribe(res => {
        this.busy = false
        orgData = res
        this.launch.workflow.model.selectedorgCode = orgData
        //console.log(typeof (this.launch.workflow.model.selectedorgCode))
      });
      //console.log(data)
      this.busy = true
      this.contentService.getFolderDetails(data.fileInFolder).subscribe(res => {
        this.busy = false
        foldData = res
        this.folderId = foldData.id;
        this.folderpath = foldData.path;
      });

      this.launch.workflow.model.isDeadlineEnabled = data.isDeadlineEnabled;
      this.launch.workflow.model.subject = data.subject;//? data.subject.replace('<br>', '\\r\\n'): '',
      this.ECM_NO = data.ecmNo,
      this.memoId = data.id;
      this.memoStepname = data.memoStepName,
	  this.launch.workflow.model.refNo = data.referenceNo,
	  this.launch.workflow.model.priority = data.priority,
	  this.memoType = { name: data.memoType, code: data.memoType },
	  this.memoLang = { name: data.memoLang, code: data.memoLang },
    
	  setTimeout(() => {
	    data.memoLang == "English" ? (self.editorEN.setData((data.memoLang == "English") ? data.message : null)) : (self.editorAR.setData((data.memoLang == "Arabic") ? data.message : null))
	  }, 500);
	  this.memoDocId = data.memoDocId;
      this.signUser2 = data.signUser2;
      this.launch.workflow.model.remarks = data.remarks;
      this.launch.workflow.model.instructions = data.instructions;
      this.setMemoType(data.memoType);
      this.launch.workflow.model.deadlineDate = new Date(data.deadline).toLocaleDateString(); //new Date(data.deadlineDate).toLocaleDateString(),
      this.maximumDate = new Date(this.launch.workflow.model.deadlineDate)
      this.launch.workflow.model.reminderDate = new Date(data.reminder).toLocaleDateString(); //new Date(data.reminderDate).toLocaleDateString(),
      this.date = new Date(moment(data.memoDate).format('MM-DD-YYYY'));
      this.memoDocTitle = (data.memoDocTitle && data.memoDocTitle !== null) ? data.memoDocTitle : data.subject;
      this.memoSubFontSize = { name: data.subFontSize, code: data.subFontSize };
      this.memoContract = (data.contractNo && data.contractNo !== null) ? data.contractNo : '';
      this.isOnBehalf = data.isOnBehalf?{ name: data.isOnBehalf, code: data.isOnBehalf }:{ name: 'No', code: 'No' };
      this.onBehalfUser = this.setOnBehalfUser(data.onBehalfUser);
      if (this.actionTypes === 'draftMemo')
        this.memoWorkitemId = data.workitemId;
      //moment(data.memoDate).format('DD-MM-YYYY');
      //console.log(this.maximumDate, this.launch.workflow.model.deadlineDate, this.launch.workflow.model.reminderDate, this.date);
      this.greeting = data.greeting ? data.greeting : '',
        this.address = data.address,
        this.designation = data.designation,
        this.suffix = data.suffix ? data.suffix : '',
        this.To = data.letterTo,
        this.recipients = data.recipients
      data.recipients.forEach(res => {
        const sender = { actionType: '', id: 0, name: '', userName: '', userType: '', action: '', wiRemarks: '' };
        //console.log(res.action)
        if (res.recipientType == "TO") {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.userType = res.userType;
          sender.action = res.action;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.toList.push(sender);
          //console.log(this.launch.recipients.toList)
          if (this.launch.recipients.toList) {
            var toInitialValue = this.launch.recipients.toList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
            if (toInitialValue) {
              this.enableToRadioButton = false
            } else {
              this.enableToRadioButton = true
            }
          }
        } else if (res.recipientType == "FROM") {
          if (this.launch.recipients.FromList.length == 0) {
            sender.id = res.userId;
            sender.name = res.displayName;
            sender.userName = res.userName;
            sender.userType = res.userType;
            sender.action = res.action;
            sender.actionType = res.recipientType;
            sender.wiRemarks = res.wiRemarks
            this.launch.recipients.FromList.push(sender);
          }
        }
        else if (res.recipientType == "SUB-FROM") {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.userType = res.userType;
          sender.action = res.action;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.SubFromList.push(sender);
          //console.log("SubFromList", this.launch.recipients.SubFromList)
        }
        else if (res.recipientType == "CC") {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.action = res.action;
          sender.userType = res.userType;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.ccList.push(sender);
          //console.log(this.launch.recipients.ccList)
        }
        else if (res.recipientType == "THRU") {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.action = res.action;
          sender.userType = res.userType;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.ThruList.push(sender);
          //console.log(this.launch.recipients.ThruList)
          if (this.launch.recipients.ThruList) {
            var thruInitialValue = this.launch.recipients.ThruList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
            if (thruInitialValue) {
              this.enableThruRadioButton = false
            } else {
              this.enableThruRadioButton = true
            }
          }
        }
        else if (res.recipientType == "REV") {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.userType = res.userType;
          sender.action = res.action;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.RevList.push(sender);
          //console.log(this.launch.recipients.ThruList)
        }
        else if (res.recipientType == "PREV" && !this.Approver) {
          sender.id = res.userId;
          sender.name = res.displayName;
          sender.userName = res.userName;
          sender.userType = res.userType;
          sender.action = res.action;
          sender.actionType = res.recipientType;
          sender.wiRemarks = res.wiRemarks
          this.launch.recipients.RevList.push(sender);
          //console.log(this.launch.recipients.ThruList)
        }
      })
      //this.memoDetailsTab = true;
      //this.recipientTab = false;
      this.launch.recipients.toList = [...this.launch.recipients.toList]
      this.launch.recipients.FromList = [...this.launch.recipients.FromList]
      this.launch.recipients.SubFromList = [...this.launch.recipients.SubFromList]
      this.launch.recipients.ccList = [...this.launch.recipients.ccList]
      this.launch.recipients.ThruList = [...this.launch.recipients.ThruList]
      this.launch.recipients.RevList = [...this.launch.recipients.RevList]
      this.launch.recipients.RevList = [...this.launch.recipients.RevList];
      //Commented by Abhishek 14/Jan/2024
      // if(this.actionTypes === 'draftMemo')
      //   this.getMemoReferenceListValues('1', data.referenceNo);
      // else if(this.actionTypes === 'edit')
      // {
          this.memoReferenceList = [];
          this.memoRefListData= [];
          this.isMemoRefValid = true;
      // }
      //Start time for memo preview
	   /*  setTimeout(() => {
        this.timerStart();
      } , 1000); */
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  goBack() {
    this.timerStop();
    this.intervalId = null;
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
    } else {
      for (var i = 0; i < this.deadLineTimes.length; i++) {
        this.deadLineTimes[i].disabled = false;
      }
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

  getActionOnBehalfOf(): any {
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
      this.toastr.error('Failed to Clea', 'Failure');
    });
  }

  step1TabChange(event) {
    //console.log("step1TabChange", event.index)
    this.step1TabIndex = event.index;
    // this.getDocumentCart()
    if (event.index === 2) {
      this.bs.getEntryTemplateForAddLazy.emit();
      let obj = { index: 0 };
      this.onTabOpen(obj)
    }
    if (event.index === 1) {
      // this.bs.getEntryTemplateForAddLazy.emit();
      // let obj = { index: 0 };
      this.addDocumentType = 'Enclosure';
      this.dataService.tabChangeEvent("Enclosuer")
      // this.onTabOpen(obj)
    } else {
      //console.log("Attachment")
      this.addDocumentType = 'Attachment';
      this.dataService.tabChangeEvent("Attachment")
    }
    if (this.launch.recipients.roles.roleTree.length === 0) {
      this.getOrgRole(true);
      //this.getUserLists();
    }
  }

  searchRL(roleSearchquery) {
    this.launch.recipients.roles.roleTree = this.launch.recipients.roles.roleTree2.filter(e => {
      if (e.data.name) {
        e.data.name.toUpperCase().indexOf(this.launch.recipients.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
    this.launch.recipients.list.selectedUserList.lists = this.launch.recipients.list.selectedUserList.lists2.filter(e => {
      if (e.name) {
        e.name.toUpperCase().indexOf(this.launch.recipients.search.roleSearchquery.toUpperCase()) !== -1
      }
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
    ////console.log(e);
    this.searchResultDocsSelected = e;
  }
  addToCartMulti(docs) {
    let postArray = { empNo: this.currentUser.EmpNo, docIds: [] };
    docs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.busy = true;
    if (this.addDocumentType == "Enclosure") {
      this.addToEncMulti(docs);
    }
    else {
      this.documentService.addToCartMulti(postArray).subscribe(res => {
        this.busy = false;
        this.addToCartSuccess(res, docs)
      }, error => {
        this.busy = false;
        this.addToCartFailure()
      });
    }
  }
  addToEncMulti(docs) {
    let postArray = { empNo: this.currentUser.EmpNo, docIds: [] };
    docs.map((doc, index) => {
      if (doc.format && doc.format.toLowerCase() == "application/pdf")
        postArray.docIds.push(doc.id);
      else
        alert("Only PDF documents supported for enclosure");
    });
    this.busy = true;
    this.documentService.addToEncMulti(postArray).subscribe(res => {
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

      if (this.addDocumentType == "Enclosure") {
        this.subscriptions.push(this.ds.getEnclosureCart(this.currentUser.EmpNo).subscribe((data) => {
          this.ds.refreshEnclosureCart(data);
        }));
      }
      else {
        this.bs.setCartSelection.emit(newarray);
        this.subscriptions.push(this.documentService.getCart(this.currentUser.EmpNo).subscribe((data) => {
          this.documentService.refreshCart(data);
          //this.setWorkflowSubject();
        }));
      }
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
        message = 'Document Added To ' + this.addDocumentType;
        break;
      case 'Exists':
        message = 'Document Already Exist in ' + this.addDocumentType;
        summary = 'Already Exist';
        severity = 'error';
        break;
      case 'Partial':
        window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
        message = 'Document Added To ' + this.addDocumentType;
        break;
    }
    // this.growlService.showGrowl({
    //   severity: severity,
    //   summary: summary,
    //   detail: message
    // });
    this.toastr.info(message, summary);

  }
  storeSubjectFontSize(event) {
    this.memoSubFontSize = event.value;
  }

  validateMemoRefNo(refNo, iFrom){
    let bReturn = false;
    //this.busy = true;
    this.memoService.validateMemoRefNo(refNo.trim()).subscribe(d => {
      //this.busy = false;
      if(d === 'yes'){
        this.isMemoRefValid = false;
        //this.memoReferenceNo = '';
        let msg = "The reference no# already exists. Type new to continue"
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Already exists!', detail: msg
          // });
          this.toastr.error(msg, 'Already exists!');
      }else{
        this.isMemoRefValid = true;
        if(iFrom == '1')
        {
          this.storeSelectedMemoRef(refNo);
        }
        else{
          //this.memoReferenceNo = '';
          //this.launch.workflow.model.refNo = refNo;
        }
      }
    }, (err) => {
      //this.busy = false;
    });
  }

  validateData(refNo, iFrom?){
    console.log("validateData RefNo :: " + refNo);
    if(refNo !== null && refNo.length >= 4)
    {
      this.validateMemoRefNo(refNo, iFrom);
    }
  }

  storeSelectedMemoRef(refNo){
    console.log("storeSelectedMemoRef :: " + refNo);
    if(refNo === "Enter Manually"){
      //this.memoReferenceList = [];
      this.isMemoReferenceList = false;
      this.launch.workflow.model.refNo = '';
    }
    else{
      this.memoReferenceNo = refNo;
      this.launch.workflow.model.refNo = refNo;
      this.memoRefListData.map(d => {
        if(d.refNo === this.memoReferenceNo)
          this.memoRefSetId = d.setId;
      });
    }
    console.log("storeSelectedMemoRef :: roleid = " + this.memoRoleId + " : RefSetId = " + this.memoRefSetId);
  }

  setMemoRefNo(value){
    this.memoReferenceNo = value;
    this.launch.workflow.model.refNo = value;
  }

  onChangeOnBehalf(event) {
    this.isOnBehalf = event.value;
  }
  addToCartFailure() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add To ' + this.addDocumentType + ' Failed'
    // });
    this.toastr.error('Add To ' + this.addDocumentType + ' Failed', 'Failure');
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
    this.roleTreeData.roles.roleTree = this.roleTreeData.roles.roleTree2.filter((e: any) => {
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
    !!exist;
  }

  selectRecipientsTab() {
    if (this.step1TabIndex != 2) {
      this.tabActiveIndex = [2];
      this.step1TabChange({ index: 2 });
    }
  }

  changeDeadlineDate(event) {
    //console.log(new Date(event));
  }

  onClick(disabled: boolean) {
    if (disabled) {
      event.stopPropagation();
    }
  }

  clearReminderDate() {
    this.launch.workflow.model.reminderDate = undefined;
  }


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
    console.log("Destroy Memo objects");
    this.documentService.checkedCartItems = [];
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
    this.subjectDisabled = false;
    this.isRelaunch = false;
    this.reminderRequired = false;
    this.showIframe = false;
    this.viewer = false;
    this.step1TabIndex = 0;
    this.tabActiveIndex = [0];
    Object.keys(this).map(k => {
      delete this[k];
    });
    this.onlinePreview = null;
    this.previewResponse = null;
    this.previewResponseForNewTab = null;
    this.timerStop();
    this.intervalId = null;
    this.isOnlinePreviewReady = false;
  }

  subfromClicked() {

  }

  cancelItem(data: any) {
    //console.log(data)
    // this.toDummy = this.toDummy.filter((item) => {
    //   //console.log(item)
    //   //console.log(item.fulName)
    //   //console.log(data.fulName)
    //   return item.id != data.id;
    // });
  }

  onRecipientRemoved(data: any) {
    //debugger;
    //console.log("onRecipientRemoved :: " + data + " || " + data.id);
    // .......................................................
    if (!this.actionId) {
      this.launch.recipients.FromList = this.launch.recipients.FromList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.toList = this.launch.recipients.toList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.ccList = this.launch.recipients.ccList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.RevList = this.launch.recipients.RevList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.ThruList = this.launch.recipients.ThruList.filter((item) => {
        return item.id != data.id;
      });
      this.recipients = this.recipients.filter((item) => {
        //console.log(item.userId, data.id)
        return item.userId != data.id
      })
      if (this.launch.recipients.ThruList) {
        var thruInitialValue = this.launch.recipients.ThruList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
        if (thruInitialValue) {
          this.enableThruRadioButton = false
        } else {
          this.enableThruRadioButton = true
        }
      }
      if (this.launch.recipients.toList) {
        var toInitialValue = this.launch.recipients.toList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
        if (toInitialValue) {
          this.enableToRadioButton = false
        } else {
          this.enableToRadioButton = true
        }
      }
    } else {
      this.launch.recipients.FromList = this.launch.recipients.FromList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.toList = this.launch.recipients.toList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.ccList = this.launch.recipients.ccList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.RevList = this.launch.recipients.RevList.filter((item) => {
        return item.id != data.id;
      });
      this.launch.recipients.ThruList = this.launch.recipients.ThruList.filter((item) => {
        return item.id != data.id;
      });
      this.recipients = this.recipients.map((item, i) => {
        //console.log(item.userId, data.id, i)
        if (item.userId == data.id) {
          const data = {
            action: item.action,
            addStatus: "REMOVE",
            id: item.id,
            memoId: item.memoId,
            orderId: item.orderId,
            recipientType: item.recipientType,
            replyComments: item.replyComments,
            userId: item.userId,
            userName: item.userName,
            status: 'ACTIVE',
            userType: item.userType,
            workflowId: item.workflowId,
            workitemId: item.workitemId,
            workitemStatus: item.workitemStatus
          }
          return data
        } else {
          return item
        }
      })
      if (this.launch.recipients.ThruList) {
        var thruInitialValue = this.launch.recipients.ThruList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
        if (thruInitialValue) {
          this.enableThruRadioButton = false
        } else {
          this.enableThruRadioButton = true
        }
      }
      if (this.launch.recipients.toList) {
        var toInitialValue = this.launch.recipients.toList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
        if (toInitialValue) {
          this.enableToRadioButton = false
        } else {
          this.enableToRadioButton = true
        }
      }
    }


  }

  orgUnitSelected(selected) {
    //console.log(selected)
    this.selectedOrgUnit = selected;
    if (this.roleData && this.roleData.roles)
      this.roleData.roles.selectedRole = { data: selected };

  }

  search(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResults = data;
    }, err => {
      this.busy = false;
    });
  }

  sendForApproval() {
    this.showApprover = true
  }

  storeValue(event) {
    //console.log(event.value)
    this.selectRecipientsTab()
    let self = this;
    setTimeout(() => {
      self.dataService.setDefaultMemoType(event.value.name)
    }, 1000);
    this.selectedPort = event.originalEvent.srcElement.innerText;
    this.memoType = event.value;
    this.setMemoType(event.value.name);
  }

  setMemoType(mType) {
    if (mType == "File Note") {
      this.fileNote = true
      this.letter = false
      this.memo = false
    }
    if (mType == "Letter") {
      this.letter = true
      this.memo = false
      this.fileNote = false
    }
    if (mType == "Memo") {
      this.memo = true
      this.letter = false
      this.fileNote = false
    }
  }

  storeSelectedLanguage(event) {
    this.memoLang = event.value;
    if (this.memoLang.name == "Arabic") {
      this.editorAR.setData(this.editorEN.getData())
      this.editorData = this.editorEN.getData() ? this.editorEN.getData() : this.editorData
      this.editorAR.setData(null)
    } else {
      this.editorEN.setData(this.editorAR.getData())
      this.editorData = this.editorAR.getData() ? this.editorAR.getData() : this.editorData
      this.editorAR.setData(null)
    }
  }
  storeSelectedFor(event) {
    this.selectedFor = event.value.name
  }

  finalValidationForMemoRef(routeMethod, isInitial?){
    let refNo = this.isMemoReferenceList?this.memoReferenceNo:this.launch.workflow.model.refNo;
    //this.validateMemoRefNo(refNo, 0);
    this.memoService.validateMemoRefNo(refNo.trim()).subscribe(d => {
      //this.busy = false;
      if(d === 'yes' && this.actionTypes !== 'edit' && this.memoId === 0){
        this.isMemoRefValid = false;
        //this.memoReferenceNo = '';
        let msg = "The Reference No# [" + refNo + "] already exists. Refresh or Type new to continue"
          /*this.growlService.showGrowl({
            severity: 'error',
            summary: 'Already exists!', detail: msg
          }); */
          this.toastr.error(msg, 'Already exists!');
      }else{
        this.isMemoRefValid = true;
        console.log("finalValidationForMemoRef isMemoRefValid :: " + this.isMemoRefValid);
        this.timerStop();
        if(this.isMemoRefValid && this.isMemoRefValid === true){
          switch (routeMethod) {
            case 'previewData':
              this.previewData();
              break;
            case 'saveDraftData':
              this.saveDraftData();
              this.updateMemoReferenceCounter();
              break;
            case 'submitMemoForReview':
              this.submitMemoForReview();
              this.updateMemoReferenceCounter();
              break;
            case 'submitMemoForPreReview':
              this.submitMemoForPreReview();
              this.updateMemoReferenceCounter();
              break;
            case 'sendforApprovalConfirmation':
              this.sendforApprovalConfirmation();
              this.updateMemoReferenceCounter();
              break;
            case 'signAndSubmitMemo':
              this.signAndSubmitMemo(isInitial);
              this.updateMemoReferenceCounter();
              break;
            default:
              let msg = "Error occurred, contact ECM Support";
              this.toastr.error(msg, 'Error!');
              break;
          }
        }
      }
    }, (err) => {
      //this.busy = false;
    });
 
  }

  previewData() {
    // if (this.actionTypes === 'edit') {
    //   this.isConfirmationActionChecked = true
    // }
    // if (this.isConfirmationActionChecked == false) {
    //   this.openConfirmationActionDialog = true;
    //   this.openTheConfirmationActionDialog = true;
    // } else {
        this.busy = true
        let data = this.memoData("Preview")
        if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
          delete data.isDraft
          //console.log(data)
        } else if (this.memoType.name == 'Letter') {
          delete data.isDraft
          delete data.greeting
        } else {
          delete data.isDraft
          delete data.greeting
          delete data.designation
          delete data.address
          delete data.suffix
          delete data.letterTo
        }
        
        this.memoService.previewMemo(data).subscribe(res => {
          this.blobToBase64(res).then(res => {
            this.busy = false
            this.previewResponseForNewTab = res
            this.previewResponse = this.transform(res);
            this.openThePreviewDialog = true;
            this.openTheDialogPreview = true
          })
        }, err => {
          this.busy = false;
        });
    //}

  }

  updateMemoPreview(){
    let data = this.memoData("Preview")
    //this.busy = true;
    this.memoService.previewMemo(data).subscribe(res => {
      this.blobToBase64(res).then(res => {
        //this.busy = false;
        this.onlinePreview = res;
        this.setMemoPreviewSource();
      })
    }, err => {
      this.busy = false;
    });
  }

  setMemoPreviewSource(){
    this.isOnlinePreviewReady = true;
    let element = <HTMLImageElement>document.getElementById("pdfIframe");
    element.src = 'pdfjs/web/memoView.html?file=' + this.onlinePreview;
  }
  
  openInNewTab() {
    this.openThePreviewDialog = false;
    this.openTheDialogPreview = false
    var win = window.open(this.previewResponseForNewTab);
    win.document.write('<iframe src="' + this.previewResponseForNewTab + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    win.history.replaceState('<iframe src="' + this.previewResponseForNewTab + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>', "Preview")
    win.document.title = "Preview"
  }

  blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };

  saveAsTemplate() {
    let data = this.memoData("saveAsTemplate")
    this.timerStop();
    //console.log(data)
    if (this.actionTypes === 'draftMemo') {
      data = Object.assign({ draftId: this.draftWorkflow.draftId }, data);
    }
    if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
    } else if (this.memoType.name == 'Letter') {
      delete data.greeting
    }
    else {
      delete data.greeting
      delete data.designation
      delete data.address
      delete data.suffix
      delete data.letterTo
    }
    this.busy = true;
    this.memoService.saveMemoAsTemplate(data).subscribe(res => {
      this.busy = false;
      this.navigateToDraft();
      //console.log(res)
    }, err => {
      this.busy = false;
    });
  }

  saveDraftData() {
    let data = this.memoData("saveDraftData")
    //console.log(data)
    if (this.actionTypes === 'draftMemo') {
      data = Object.assign({ draftId: this.draftWorkflow.draftId }, data);
	    data = Object.assign({ memoStepName: this.memoStepname }, data);
      data.id = this.memoId;
    }
    if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
    } else if (this.memoType.name == 'Letter') {
      delete data.greeting
    }
    else {
      delete data.greeting
      delete data.designation
      delete data.address
      delete data.suffix
      delete data.letterTo
    }
    this.busy = true;
    this.memoService.saveMemo(data).subscribe(res => {
      this.busy = false;
      this.navigateToDraft();
      //console.log(res)
    }, err => {
      this.busy = false;
    });
  }

  sendDataForApproval() {
    this.isConfirmationActionChecked = true;
    // if (this.actionTypes === 'edit') {
    //   this.isConfirmationActionChecked = true;
    // }
    // if (this.isConfirmationActionChecked == false) {
    //   this.openConfirmationActionDialog = true;
    //   this.openTheConfirmationActionDialog = true;
    // } else {
    this.busy = true;

    if (this.launch.recipients.RevList && this.launch.recipients.RevList.length == 0) {
      //do nothing
    }
    else {
      this.launch.recipients.RevList[0].actionType = "REV";
      this.recipients = this.recipients.map((item, i) => {
        //console.log(item.userId, data.id, i)
        if (item.recipientType === "PREV") {
          const data = {
            action: item.action,
            addStatus: item.addStatus,
            id: item.id,
            memoId: item.memoId,
            orderId: item.orderId,
            recipientType: "REV",
            replyComments: item.replyComments,
            userId: item.userId,
            userName: item.userName,
            status: 'ACTIVE',
            userType: item.userType,
            workflowId: item.workflowId,
            workitemId: item.workitemId,
            workitemStatus: item.workitemStatus
          }
          return data
        } else {
          return item
        }
      });
    }


    let data = this.memoData("sendDataForApproval")
    if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
      delete data.isDraft
    } else if (this.memoType.name == 'Letter') {
      delete data.greeting
      delete data.isDraft
    } else {
      delete data.isDraft
      delete data.greeting
      delete data.designation
      delete data.suffix
      delete data.address
      delete data.letterTo
    }
    data = Object.assign({ routeString: 'APPROVER' }, data);
    //console.log(data, this.date, moment(this.date).format("DD-MM-YYYY hh:mm a"))
    if (this.actionId) {
      let updatedMemoData: any = this.SignAndSubmitWorkFlowData()
      updatedMemoData.memo = data
      updatedMemoData.memo.id = this.wiaAction.id;
      updatedMemoData.memo = Object.assign({ memoDocId: this.wiaAction.memoDocId }, updatedMemoData.memo)
      updatedMemoData.memo = Object.assign({ createdDate: this.wiaAction.createdDate }, updatedMemoData.memo)
      updatedMemoData.memo = Object.assign({ modifiedDate: this.wiaAction.modifiedDate }, updatedMemoData.memo)
      updatedMemoData.memo = Object.assign({ draftId: this.wiaAction.draftId }, updatedMemoData.memo)
      //console.log(updatedMemoData)
      this.busy = true;
      this.memoService.submitForModifyMemo(updatedMemoData).subscribe(res => {
        this.busy = false;
        //console.log(res)
        this.navigateToInbox();
        //this.openInformationDialog = false;
        //this.openTheInformationDialog = false;

      }, err => {
        //this.isInfoButtonClicked = false;
        this.busy = false;
      });
    } else {
      //console.log(data)
      this.busy = true;
      this.memoService.createMemo(data).subscribe(res => {
        this.busy = false;
        //console.log(res)
        //this.router.navigate(['']);
        this.navigateToInbox();
        //this.openInformationDialog = false;
        //this.openTheInformationDialog = false;
      }, err => {
        //this.isInfoButtonClicked = false;
        this.busy = false;
      });
    }
    //}
    //this.busy = false;

  }
  submitMemoForReview() {
    if (this.actionTypes === 'edit') {
      this.isConfirmationActionChecked = true;
    }
    if (this.isConfirmationActionChecked == false) {
      this.openConfirmationActionDialog = true;
      this.openTheConfirmationActionDialog = true;
    } else {
      this.launch.recipients.RevList[0].actionType = "REV";
      /* this.recipients = this.recipients.map((item, i) => {
        //console.log(item.userId, data.id, i)
        if (item.recipientType === "PREV") {
          const data = {
            action: item.action,
            addStatus: item.addStatus,
            id: item.id,
            memoId: item.memoId,
            orderId: item.orderId,
            recipientType: "REV",
            replyComments: item.replyComments,
            userId: item.userId,
            userName: item.userName,
            status: 'ACTIVE',
            userType: item.userType,
            workflowId: item.workflowId,
            workitemId: item.workitemId,
            workitemStatus: item.workitemStatus
          }
          return data
        } else {
            return item
        }
      }); */
      let data = this.memoData("submitMemoForReview")
      if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
        delete data.isDraft
      } else if (this.memoType.name == 'Letter') {
        delete data.greeting
        delete data.isDraft
      } else {
        delete data.isDraft
        delete data.greeting
        delete data.designation
        delete data.suffix
        delete data.address
        delete data.letterTo

      }
      data = Object.assign({ routeString: 'REVIEWER' }, data);
      if (this.actionId) {
        let updatedMemoData: any = this.SignAndSubmitWorkFlowData()
        updatedMemoData.memo = data;
        updatedMemoData.memo.id = this.wiaAction.id;
        updatedMemoData.memo = Object.assign({ memoDocId: this.wiaAction.memoDocId }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ createdDate: this.wiaAction.createdDate }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ modifiedDate: this.wiaAction.modifiedDate }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ draftId: this.wiaAction.draftId }, updatedMemoData.memo)
        //console.log(updatedMemoData)
        this.busy = true;
        this.memoService.submitForModifyMemo(updatedMemoData).subscribe(res => {
          this.busy = false;
          //console.log(res)
          this.navigateToInbox();
        }, err => {
          this.busy = false;
        });
      } else {
        this.busy = true;
        this.memoService.createMemo(data).subscribe(res => {
          this.busy = false;
          //console.log(res)
          this.navigateToInbox();
        }, err => {
          this.busy = false;
        });
      }
    }
  }
  //submitMemoForPreReview
  submitMemoForPreReview() {
    if (this.actionTypes === 'edit') {
      this.isConfirmationActionChecked = true;
    }
    if (this.isConfirmationActionChecked == false) {
      this.openConfirmationActionDialog = true;
      this.openTheConfirmationActionDialog = true;
    } else {
      this.launch.recipients.RevList[0].actionType = "PREV";
      this.recipients = this.recipients.map((item, i) => {
        //console.log(item.userId, data.id, i)
        if (item.recipientType === "REV") {
          const data = {
            action: item.action,
            addStatus: item.addStatus,
            id: item.id,
            memoId: item.memoId,
            orderId: item.orderId,
            recipientType: "PREV",
            replyComments: item.replyComments,
            userId: item.userId,
            userName: item.userName,
            status: 'ACTIVE',
            userType: item.userType,
            workflowId: item.workflowId,
            workitemId: item.workitemId,
            workitemStatus: item.workitemStatus
          }
          return data;
        } else {
          return item;
        }
      });
      let data = this.memoData("submitMemoForReview");
      if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
        delete data.isDraft
      } else if (this.memoType.name == 'Letter') {
        delete data.greeting
        delete data.isDraft
      } else {
        delete data.isDraft
        delete data.greeting
        delete data.designation
        delete data.suffix
        delete data.address
        delete data.letterTo

      }

      data = Object.assign({ routeString: 'PREP_REVIEW' }, data);
      if (!this.Approver && !this.Composer)
        data = Object.assign({ routeString: 'PREP_REVIEW1' }, data);
      if (this.actionId) {
        let updatedMemoData: any = this.SignAndSubmitWorkFlowData()
        updatedMemoData.memo = data;
        updatedMemoData.memo.id = this.wiaAction.id;
        updatedMemoData.memo = Object.assign({ memoDocId: this.wiaAction.memoDocId }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ createdDate: this.wiaAction.createdDate }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ modifiedDate: this.wiaAction.modifiedDate }, updatedMemoData.memo)
        updatedMemoData.memo = Object.assign({ draftId: this.wiaAction.draftId }, updatedMemoData.memo)
        //console.log(updatedMemoData)
        this.busy = true;
        this.memoService.submitForModifyMemo(updatedMemoData).subscribe(res => {
          this.busy = false;
          //console.log(res)
          this.navigateToInbox();
        }, err => {
          this.busy = false;
        });
      } else {
        this.busy = true;
        this.memoService.createMemo(data).subscribe(res => {
          this.busy = false;
          //console.log(res)
          this.navigateToInbox();
        }, err => {
          this.busy = false;
        });
      }
    }
  }

  getWorkItemdetails(workitemId, memoStep) {
    //console.log("getWorkitemDetails :: " + workitemId + " : " + memoStep);
    //debugger;
    if (workitemId && workitemId > 0) {
      this.ws.getWorkitem(workitemId, this.currentUser.EmpNo, 0, 0).subscribe(data => {
        this.workitem = data;
        //console.log(this.workitem.memoStepname)
        // this.Approver = false
        //console.log("this.workitem")
        this.launch.workflow.model.attachments = [];
        //Attachment Change in Edit Memo #20001
        let attachFiltered: any[];
        console.log("attachFiltered before :: " + attachFiltered);
        attachFiltered = this.workitem.attachments.filter(e => e.isMemo !== 1);
        console.log("attachFiltered after :: " + attachFiltered);
        this.workitem.attachments = Object.assign([], attachFiltered);
        this.launch.workflow.model.attachments = Object.assign([], attachFiltered);
		this.memoStepname = this.workitem.memoStepname;
        if (this.workitem.memoStepname == 'COMPOSER') {
          this.Approver = false;
          this.Composer = true;
        } else if (this.workitem.memoStepname == 'PREP_REVIEW' || this.workitem.memoStepname == 'PREP_REVIEW1') {
          this.Approver = false;
          this.Composer = false;
        } else {
          this.Composer = false;
          this.Approver = true;
          //console.log(this.Approver)
        }
      });
    }

    if (memoStep != null && memoStep.length > 0) {
      if (memoStep === 'COMPOSER') {
        this.Approver = false;
        this.Composer = true;
      } else if (memoStep == 'PREP_REVIEW' || memoStep == 'PREP_REVIEW1') {
        this.Approver = false;
        this.Composer = false;
      } else {
        this.Composer = false;
        this.Approver = true;
      }
    }

  }
  SignAndSubmitWorkFlowData() {
    const user = this.us.getCurrentUser();
    let workFLowData
    return workFLowData = {
      EMPNo: user.EmpNo,
      actionDetails: '',
      actions: this.workitem.actions,
      deadline: null,
      draft: false,
      draftId: (this.draftWorkflow && this.draftWorkflow.draftId != null) ? this.draftWorkflow.draftId : 0,
      id: this.workitem.workitemId,
      workflowId: this.workitem.workflowId, ////WorkFlowId
      instructions: this.workitem.instructions,
      reminder: null,
      roleId: this.workitem.recipientRoleId,
      wiAction: 'Submit Memo',
      wiRemarks: this.workitem.wiRemarks,
      recipients: this.workitem.recipients,
      attachments: this.workitem.attachments,
      memo: '',
      workflow: {
        ECMNo: this.workitem.ECMNo,
        isMemo: 1,
        contractNo: 0,
        delEmpNo: 0,
        docDate: 1452364200000,
        docRecDate: 1452364200000,
        empNo: user.EmpNo,
        isDeadlineEnabled: false,
        keywords: '',
        priority: this.workitem.priority == 'Normal' ? 2 : 3,
        projNo: 0,
        refNo: 0,
        remarks: this.workitem.remarks,
        role: this.workitem.recipientRoleId,
        subject: this.workitem.subject,
      }
    }
  }
  signAndSubmitMemo(isInitial) {
    let data = this.memoData("signAndSubmitMemo")
    let isEsign = true;
    if (isInitial === 1)
      isEsign = false;
    if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
      delete data.isDraft
    } else if (this.memoType.name == 'Letter') {
      delete data.greeting
      delete data.isDraft
    } else {
      delete data.isDraft
      delete data.greeting
      delete data.designation
      delete data.address
      delete data.letterTo
    }

    this.wiaAction ? data.id = this.wiaAction.id : null
    this.busy = true;
    this.memoService.signAndSubmitMemo(data).subscribe(res => {
      this.busy = false;
      //console.log(res)
      this.openESignPage(res, data.roleId, isEsign);
    }, err => {
      this.busy = false;
    });
  }

  memoData(clickType: string) {
    //console.log(this.attachment, this.launch.workflow.model.attachments)
    if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
      for (let index = 0; index < this.launch.workflow.model.attachments.length; index++) {
        if (this.actionTypes === 'edit' && this.launch.workflow.model.attachments[index].isMemo && this.launch.workflow.model.attachments[index].isMemo === 1)
          continue;
        const exists = this.attachment.findIndex(element => element.docId == this.launch.workflow.model.attachments[index].docId) > -1
        if (!exists) {
          this.attachment.push(this.launch.workflow.model.attachments[index]);
        }
      }

      for (let index = 0; index < this.launch.workflow.model.Enclosuer.length; index++) {
        const exists = this.launch.documents.enclosureCartItems.findIndex(element => element.docId == this.launch.workflow.model.Enclosuer[index].docId) > -1
        if (!exists) {
          this.launch.documents.enclosureCartItems.push(this.launch.workflow.model.Enclosuer[index]);
        }
      }
      this.launch.workflow.model.isDeadlineEnabled = false;
      this.clearDeadline();
    }

    if (clickType === "saveDraftData") {
      if (this.launch.workflow.model.attachments && this.launch.workflow.model.attachments.length > 0) {
        for (let index = 0; index < this.launch.workflow.model.attachments.length; index++) {
          const exists = this.attachment.findIndex(element => element.docId == this.launch.workflow.model.attachments[index].docId) > -1
          if (!exists) {
            this.attachment.push(this.launch.workflow.model.attachments[index]);
          }
        }
      }
    }

    const user = this.us.getCurrentUser();
    let attachmentData: any[] = [];
    for (let i = 0; i < this.attachment.length; i++) {
      let checkDocId = this.attachment[i].docId || this.attachment[i].id;
      const exists = attachmentData.findIndex(element => element.docId == checkDocId) > -1;
      if (!exists) {
        attachmentData.push({
          id: 0,
          docId: this.attachment[i].docId || this.attachment[i].id,
          docTitle: this.attachment[i].fileName || this.attachment[i].docTitle,
          format: this.attachment[i].format,
          ecmNo: this.attachment[i].ecmNo || this.attachment[i].ECMNo,
          vsid: this.attachment[i].vsid,
          isSign: this.attachment[i].isSign,
          attach_type: "ATTACHMENT"
        })
      }
    }
    for (let i = 0; i < this.launch.documents.enclosureCartItems.length; i++) {
      let checkDocId = this.launch.documents.enclosureCartItems[i].docId || this.launch.documents.enclosureCartItems[i].id;
      const exists = attachmentData.findIndex(element => element.docId == checkDocId) > -1;
      if (!exists) {
        attachmentData.push({
          id: 0,
          docId: this.launch.documents.enclosureCartItems[i].docId || this.launch.documents.enclosureCartItems[i].id,
          docTitle: this.launch.documents.enclosureCartItems[i].fileName || this.launch.documents.enclosureCartItems[i].docTitle,
          format: this.launch.documents.enclosureCartItems[i].format,
          ecmNo: this.launch.documents.enclosureCartItems[i].ecmNo || this.launch.documents.enclosureCartItems[i].ECMNo,
          vsid: this.launch.documents.enclosureCartItems[i].vsid,
          attach_type: "ENCLOSURE"
        })
      }
    }
    
    let recipientsData;
    if (this.memoType.name == 'Letter' && this.memoLang.name == 'Arabic') {
      recipientsData = this.recipients.filter(word => word.recipientType != "CC" && word.recipientType != "TO");
      //console.log(recipientsData)
    } else {
      recipientsData = this.recipients
    }
    let data
    return data = {
      id: this.memoId,
      subject: this.launch.workflow.model.subject ? this.launch.workflow.model.subject.replace(/\n/g, '<br>') : '',
      ecmNo: this.ECM_NO,
      orgcode: this.launch.workflow.model.selectedorgCode.orgCode,
      referenceNo: this.isMemoReferenceList?this.memoReferenceNo:this.launch.workflow.model.refNo,
      message: this.editorEN.getData() ? this.editorEN.getData() : (this.editorAR.getData() ? this.editorAR.getData() : ''),
      priority: this.launch.workflow.model.priority,
      memoType: this.memoType.name,
      memoLang: this.memoLang.name,
      memoDocId: this.memoDocId,
      roleId: this.getMemoRoleId(),
      memoStepName: this.memoStepname,
      //(this.launch.recipients.FromList[0].appRole == "ROLE" || this.launch.recipients.FromList[0].userType == "ROLE") ? this.launch.recipients.FromList[0].EmpNo : 0,//from roleid
      createdBy: user.EmpNo,//current logged in user id
      modifiedBy: user.EmpNo,//current logged in user id
      remarks: this.launch.workflow.model.remarks,
      instructions: this.launch.workflow.model.instructions,
      forAction: this.selectedFor.name,
      deadline: this.launch.workflow.model.isDeadlineEnabled ? (moment(this.launch.workflow.model.deadlineDate).format("DD-MM-YYYY hh:mm a") || null) : null,
      reminder: this.launch.workflow.model.isDeadlineEnabled ? (moment(this.launch.workflow.model.reminderDate).format("DD-MM-YYYY hh:mm a") || null) : null,
      memoDate: this.getMemoDate(),
      isDraft: 1,//=1(only for save draft)
      draftId: (this.draftWorkflow && this.draftWorkflow.draftId != null) ? this.draftWorkflow.draftId : 0,
      greeting: this.greeting ? this.greeting : '',
      attachments: attachmentData,
      recipients: recipientsData,
      address: (this.address && this.address != null) ? this.address.replace(/\n/g, '<br>') : '',
      designation: this.designation,
      suffix: this.suffix ? this.suffix : '',
      letterTo: this.To,
      fileInFolder: this.folderId,
      isDeadlineEnabled: this.launch.workflow.model.isDeadlineEnabled,
      signUser2: this.signUser2,
      workitemId: this.memoWorkitemId,
      memoDocTitle: this.memoDocTitle ? this.memoDocTitle.replace(/\n/g, '') : '',
      contractNo: (this.memoContract && this.memoContract != '' && this.memoContract != null) ? this.memoContract.replace(/\n/g, '<br>') : '',
      subFontSize: this.memoSubFontSize ? this.memoSubFontSize.name : "14",
      isOnBehalf: this.isOnBehalf ? this.isOnBehalf.name : "No",
      onBehalfUser: this.onBehalfUser ? this.onBehalfUser.value : 0
    }
  }

  getMemoDate() {
    let mDate = null;
    let date_moment = moment(this.date);
    console.log("date_moment : " + date_moment);
    console.log("this.date  : " + this.date);
    if ((this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') && !date_moment.isValid())
      mDate = this.date + ' ' + '12:00' + ' ' + 'am';
    else
      mDate = moment(this.date).format("DD-MM-YYYY hh:mm a");

    console.log("mDate : " + mDate);
    return mDate;
  }

  getMemoRoleId() {
    let roleId = 0;
    if (this.launch.recipients.FromList && this.launch.recipients.FromList[0] && this.launch.recipients.FromList[0].appRole && this.launch.recipients.FromList[0].EmpNo) {
      roleId = (this.launch.recipients.FromList[0].appRole == "ROLE" || this.launch.recipients.FromList[0].userType == "ROLE") ? this.launch.recipients.FromList[0].EmpNo : 0;
    }
    else if (this.launch.recipients.FromList && this.launch.recipients.FromList[0] && this.launch.recipients.FromList[0].userType && this.launch.recipients.FromList[0].id) {
      roleId = (this.launch.recipients.FromList[0].userType == "ROLE") ? this.launch.recipients.FromList[0].id : 0;
    }

    if (roleId === 0) {
      var recipientsData = this.recipients.filter(word => word.recipientType == "FROM");
      if(recipientsData && recipientsData.length > 0 && recipientsData[0].userType == "ROLE")
        roleId = (recipientsData[0].id)?recipientsData[0].id:recipientsData[0].EmpNo;
    }

    return roleId;
  }

  openESignPage(doc, rId, isEsign) {
    this.busyEsign = true;
    this.roleId = (rId != null || rId != undefined) ? rId : 0;
    let flagInitial = 'Y';
    if (isEsign) {
      flagInitial = 'N';
    }

    const sysDateTime = new Date();
    const fulldatetime = sysDateTime.getTime();
    const browser = navigator.appName;
    if (browser === 'Microsoft Internet Explorer' || browser === 'netscape') {
      window.opener = self;
    }

    let workItemId = 10001;
    //console.log("getTokenURL::id=" + this.currentUser.KocId + ", rId= " + this.roleId + ", dId= " + doc + ", wItemId= " + workItemId);
    //getNewTokenUrl getTokenUrl
    this.ws.getNewTokenUrl(this.currentUser.KocId, this.roleId, doc, workItemId, flagInitial).subscribe(d =>
      this.assignesignUrl(doc, d, isEsign),
      err => {
        alert("Error connecting to eSign Server. Please try again or contact ECM Support team.");
        this.busyEsign = false;
      });
  }

  assignesignUrl(docId, data, isEsign) {

    let tokenurl = data.tokenUrl;
    let action = 'Initial';
    if (isEsign) {
      action = 'eSign';
    }
    let win = window.open(tokenurl, "", "menubar=0,location='',toolbar=0,scrollbars=yes,dialog=yes,resizable=yes,top=0,left=0,width=" + window.screen.width + ",height=" + window.screen.availHeight);
    var self = this;
    self.eSignDialog = true;
    let timer = setInterval(function () {
      self.isesignCancelDisabled = true;
      if (win && win.closed) {
        let workItemId = 10001;
        this.subscriptionEsign = self.ds.verifyESignStatusService(docId, workItemId, 0).subscribe((data) => {
          if (data && data === 'SIGNED') {

            clearInterval(timer);
            self.eSignDialog = false;
            self.growlService.showGrowl({
              severity: 'info',
              summary: 'Success', detail: 'eSign Successful'
            });

            self.submitMemoDialog = true;
            if (self.actionId) {
              let updatedMemoData: any = self.SignAndSubmitWorkFlowData();
              updatedMemoData.memo = self.wiaAction;
              updatedMemoData.memo.id = self.wiaAction.id;
              updatedMemoData.memo = Object.assign({ memoDocId: self.wiaAction.memoDocId }, updatedMemoData.memo)
              updatedMemoData.memo = Object.assign({ createdDate: self.wiaAction.createdDate }, updatedMemoData.memo)
              updatedMemoData.memo = Object.assign({ modifiedDate: self.wiaAction.modifiedDate }, updatedMemoData.memo)
              updatedMemoData.memo = Object.assign({ draftId: self.wiaAction.draftId }, updatedMemoData.memo)
              var fromExists = updatedMemoData.memo.recipients.some((res) => (res.recipientType == "FROM"));
              var subFromExists = updatedMemoData.memo.recipients.some((res) => (res.recipientType == "SUB-FROM"));
              var thruExists = updatedMemoData.memo.recipients.some((res) => (res.recipientType == "THRU"));
              var ToExists = updatedMemoData.memo.recipients.some((res) => (res.recipientType == "TO" && (res.action == "Signature" || res.action == "Initial")));

              //Abhishek Added 31-Jan-2023: To assign routeString based on the conditions.
              if (fromExists && !isEsign)
                updatedMemoData.memo = Object.assign({ routeString: 'APPROVER' }, updatedMemoData.memo);
              else if (subFromExists)
                updatedMemoData.memo = Object.assign({ routeString: 'SUB-FROM' }, updatedMemoData.memo);
              else if (thruExists)
                updatedMemoData.memo = Object.assign({ routeString: 'THRU' }, updatedMemoData.memo);
              else if (ToExists)
                updatedMemoData.memo = Object.assign({ routeString: 'TO' }, updatedMemoData.memo);
              else
                updatedMemoData.memo = Object.assign({ routeString: 'Distribute' }, updatedMemoData.memo);

              self.busy = true;
              self.submitMemoDialog = true;
              self.memoService.submitMemo(updatedMemoData).subscribe(res => {
                self.busy = false;
                self.submitMemoDialog = false;
                self.navigateToInbox();
              }, err => {
                self.busy = false;
                self.submitMemoDialog = false;
              });
            }
            else {
              self.busy = true;
              let newMemoData: any = self.wiaAction;
              var subFromExists = newMemoData.recipients.some((res) => (res.recipientType == "SUB-FROM"));
              var thruExists = newMemoData.recipients.some((res) => (res.recipientType == "THRU"));
              var ToExists = newMemoData.recipients.some((res) => (res.recipientType == "TO"));

              //Abhishek Added 31-Jan-2023: To assign routeString based on the conditions.
              if (subFromExists)
                newMemoData = Object.assign({ routeString: 'SUB-FROM' }, newMemoData);
              else if (thruExists)
                newMemoData = Object.assign({ routeString: 'THRU' }, newMemoData);
              else if (ToExists)
                newMemoData = Object.assign({ routeString: 'TO' }, newMemoData);
              else
                newMemoData = Object.assign({ routeString: 'Distribute' }, newMemoData);

              self.submitMemoDialog = true;
              self.busy = true;
              self.memoService.createMemo(newMemoData).subscribe(res => {
                //self.router.navigate(['']);
                self.busy = false;
                self.submitMemoDialog = false;
                self.navigateToInbox();
              }, err => {
                self.busy = false;
              });
            }
            self.busy = false;
            self.eSignDialog = false;
          } else if (data && data === 'FAILED') {
            self.growlService.showGrowl({
              severity: 'error',
              summary: 'Failure', detail: 'User ' + action + ' is Cancelled'
            });
            clearInterval(timer);
            self.eSignDialog = false;
          } else if (data && data === 'PENDING') {
            // self.eSignDialog = true;
            self.isesignCancelDisabled = false;
          }
        }, err => { });
      }
    }, 2000);
  }
  canceleSign() {
    this.eSignDialog = false;
    this.subscriptionEsign ? this.subscriptionEsign.unsubscribe() : '';
  }
  cancelMemoDialog() {
    this.submitMemoDialog = false;
  }
  RecipientUserIconSelection(recipientTypeName: string) {
    this.isConfirmationActionChecked = true
    this.recipientTypeName = recipientTypeName;
    if (this.recipientTypeName == "FROM") {
      //console.log(this.launch.recipients.FromList)
      this.from = true;
      this.rev = false;
      this.through = false;
      this.to = false;
      this.cc = false;
      this.subFrom = false;
      //console.log(this.launch.recipients.FromList[0].wiRemarks);
      this.fromWiRemarks = this.launch.recipients.FromList[0].wiRemarks
    }
    else if (this.recipientTypeName == "SUB-FROM") {
      this.from = false;
      this.rev = false;
      this.through = false;
      this.to = false;
      this.cc = false;
      this.subFrom = true;
      //console.log(this.launch.recipients.SubFromList[0].wiRemarks)
      this.sub_fromWiRemarks = this.launch.recipients.SubFromList[0].wiRemarks
    }
    else if (this.recipientTypeName == "THRU") {
      this.from = false
      this.rev = false;
      this.to = false;
      this.cc = false;
      this.subFrom = false;
      this.through = true;
      //console.log(this.launch.recipients.ThruList[0].wiRemarks)
      this.throughWiRemarks = this.launch.recipients.ThruList[0].wiRemarks
    }
    else if (this.recipientTypeName == "Reviewer") {
      this.from = false;
      this.through = false;
      this.to = false;
      this.cc = false;
      this.subFrom = false;
      this.rev = true;
      //console.log(this.launch.recipients.RevList[0].wiRemarks)
      this.reviewerWiRemarks = this.launch.recipients.RevList[0].wiRemarks
    }

    else if (this.recipientTypeName == "TO") {
      //console.log(this.launch.recipients.toList)
      this.rev = false;
      this.from = false;
      this.through = false;
      this.cc = false;
      this.subFrom = false;
      this.to = true;
      //console.log(this.launch.recipients.toList[0].wiRemarks)
      this.toWiRemarks = this.launch.recipients.toList[0].wiRemarks

    }
    else if (this.recipientTypeName == "CC") {
      this.to = false;
      this.rev = false;
      this.from = false;
      this.through = false;
      this.subFrom = false;
      this.cc = true;
      //console.log(this.launch.recipients.ccList[0].wiRemarks)
      this.ccWiRemarks = this.launch.recipients.ccList[0].wiRemarks

    }
  }
  onRecipientActionChange(ev, index) {
    //debugger;
    if (ev == '') ev = ' ';
    //console.log(this.recipientTypeName, ev)
    if (this.recipientTypeName == "FROM") {
      this.launch.recipients.FromList[index].action = ev
      this.launch.recipients.FromList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => (res.userId == this.launch.recipients.FromList[index].id) && (res.userType == this.launch.recipients.FromList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => (res.userId == this.launch.recipients.FromList[index].EmpNo) && (res.userType == this.launch.recipients.FromList[index].userType))
      }

      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
      //console.log(this.recipients)
    }
    else if (this.recipientTypeName == "SUB-FROM") {
      this.launch.recipients.SubFromList[index].action = ev;
      this.launch.recipients.SubFromList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => (res.userId == this.launch.recipients.SubFromList[index].id) && (res.userType == this.launch.recipients.SubFromList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => (res.userId == this.launch.recipients.SubFromList[index].EmpNo) && (res.userType == this.launch.recipients.SubFromList[index].userType))
      }
      //console.log(selectedRecipientIndex, this.launch.recipients.SubFromList[index].id)
      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
      //console.log(this.recipients)

    }
    else if (this.recipientTypeName == "THRU") {
      this.launch.recipients.ThruList[index].action = ev
      this.launch.recipients.ThruList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ThruList[index].id && (res.userType == this.launch.recipients.ThruList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ThruList[index].EmpNo && (res.userType == this.launch.recipients.ThruList[index].userType))
      }
      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
      //console.log(this.recipients)

    }
    else if (this.recipientTypeName == "Reviewer") {
      this.launch.recipients.RevList[index].action = ev;
      this.launch.recipients.RevList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.RevList[index].id && (res.userType == this.launch.recipients.RevList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.RevList[index].EmpNo && (res.userType == this.launch.recipients.RevList[index].userType))
      }
      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
      //console.log(this.recipients)

    }
    else if (this.recipientTypeName == "TO") {
      this.launch.recipients.toList[index].action = ev;
      this.launch.recipients.toList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.toList[index].id && (res.userType == this.launch.recipients.toList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.toList[index].EmpNo && (res.userType == this.launch.recipients.toList[index].userType))
      }
      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
      //console.log(this.recipients)
    }
    else if (this.recipientTypeName == "CC") {
      this.launch.recipients.ccList[index].action = ev;
      this.launch.recipients.ccList[index].addStatus = "UPDATE"
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ccList[index].id && (res.userType == this.launch.recipients.ccList[index].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ccList[index].EmpNo && (res.userType == this.launch.recipients.ccList[index].userType))
      }
      this.recipients[selectedRecipientIndex].action = ev;
      this.recipients[selectedRecipientIndex].addStatus = "UPDATE";
    }
  }

  closeSelectedList() {
    //debugger;
    if (this.recipientTypeName == "FROM") {
      this.launch.recipients.FromList[0].wiRemarks = this.fromWiRemarks;
      if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.FromList[0].id && (res.userType == this.launch.recipients.FromList[0].userType))
      } else {
        var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.FromList[0].EmpNo && (res.userType == this.launch.recipients.FromList[0].userType))
      }
      if (selectedRecipientIndex >= 0) {
        if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
          this.recipients[selectedRecipientIndex].wiRemarks = this.fromWiRemarks;
      }

      //console.log(this.recipients)
    }
    else if (this.recipientTypeName == "SUB-FROM") {
      for (let i = 0; i < this.launch.recipients.SubFromList.length; i++) {
        this.launch.recipients.SubFromList[i].wiRemarks = this.sub_fromWiRemarks;
        if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.SubFromList[i].id && (res.userType == this.launch.recipients.SubFromList[0].userType))
        } else {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.SubFromList[i].EmpNo && (res.userType == this.launch.recipients.SubFromList[0].userType))
        }

        if (selectedRecipientIndex >= 0) {
          if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
            this.recipients[selectedRecipientIndex].wiRemarks = this.sub_fromWiRemarks;
        }
      }
    }
    else if (this.recipientTypeName == "THRU") {
      for (let i = 0; i < this.launch.recipients.ThruList.length; i++) {
        this.launch.recipients.ThruList[i].wiRemarks = this.throughWiRemarks;
        if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ThruList[i].id && (res.userType == this.launch.recipients.ThruList[0].userType))
        } else {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ThruList[i].EmpNo && (res.userType == this.launch.recipients.ThruList[0].userType))
        }
        if (selectedRecipientIndex >= 0) {
          if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
            this.recipients[selectedRecipientIndex].wiRemarks = this.throughWiRemarks;
        }
        if (this.launch.recipients.ThruList) {
          var thruInitialValue = this.launch.recipients.ThruList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
          if (thruInitialValue) {
            this.enableThruRadioButton = false
          } else {
            this.enableThruRadioButton = true
          }
        }
      }
    }
    else if (this.recipientTypeName == "Reviewer") {
      for (let i = 0; i < this.launch.recipients.RevList.length; i++) {
        this.launch.recipients.RevList[i].wiRemarks = this.reviewerWiRemarks;
        if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.RevList[i].id && (res.userType == this.launch.recipients.RevList[0].userType))
        } else {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.RevList[i].EmpNo && (res.userType == this.launch.recipients.RevList[0].userType))
        }
        if (selectedRecipientIndex >= 0) {
          if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
            this.recipients[selectedRecipientIndex].wiRemarks = this.reviewerWiRemarks;
        }
        //console.log(this.recipients)
      }
    }
    else if (this.recipientTypeName == "TO") {
      for (let i = 0; i < this.launch.recipients.toList.length; i++) {
        this.launch.recipients.toList[i].wiRemarks = this.toWiRemarks;
        if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.toList[i].id && (res.userType == this.launch.recipients.toList[0].userType))
        } else {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.toList[i].EmpNo && (res.userType == this.launch.recipients.toList[0].userType))
        }
        if (selectedRecipientIndex >= 0) {
          if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
            this.recipients[selectedRecipientIndex].wiRemarks = this.toWiRemarks;
        }
        if (this.launch.recipients.toList) {
          var toInitialValue = this.launch.recipients.toList.some((res) => (res.action == "Initial") || (res.action == "Signature"))
          if (toInitialValue) {
            this.enableToRadioButton = false
          } else {
            this.enableToRadioButton = true
          }
        }
      }
    }
    else if (this.recipientTypeName == "CC") {
      for (let i = 0; i < this.launch.recipients.ccList.length; i++) {
        this.launch.recipients.ccList[i].wiRemarks = this.ccWiRemarks;
        if (this.actionTypes === 'draftMemo' || this.actionTypes === 'edit') {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ccList[i].id && (res.userType == this.launch.recipients.ccList[0].userType))
        } else {
          var selectedRecipientIndex = this.recipients.findIndex((res: any) => res.userId == this.launch.recipients.ccList[i].EmpNo && (res.userType == this.launch.recipients.ccList[0].userType))
        }
        if (selectedRecipientIndex >= 0) {
          if (this.recipients[selectedRecipientIndex].wiRemarks != null && this.recipients[selectedRecipientIndex].wiRemarks !== undefined)
            this.recipients[selectedRecipientIndex].wiRemarks = this.ccWiRemarks;
        }
        //console.log(this.recipients)
      }
    }
  }
  getRoleMembersIfRole(role) {
    if (role.id > 0 && (!role.members && role.members !== '') && ((role.appRole === 'ROLE' || role.userType === 'ROLE'))) {
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

  getListMembersIfList(list) {
    if (list.id > 0 && (!list.members && list.members !== '') && ((list.appRole === 'LIST' || list.userType === 'LIST'))) {
      let listNameString = '';
      // this.busy = true;
      this.us.getListUsers(list.id).subscribe((res: any) => {
        this.busy = false;
        list.users = res;
        for (const LName of res) {
          if (LName.fulName !== undefined) {
            listNameString = listNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + LName.fulName;
          }
        }
        list.members = listNameString.slice(1);
      }, err => {
        this.busy = false;
      });
    }
  }

  onSelectDateMethod(event) {
    let d = new Date(Date.parse(event));
    this.date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    //console.log(this.date)
  }
  openTreeDialog() {
    this.busy = true;
    this.cs.getTopFolders().subscribe(data => {
      //console.log(data)
      this.busy = false;
      this.getMainFolders(data);
      this.openTree = true;
    }, err => {
      this.busy = false;
    });
  }
  removeFolderPath() {
    this.folderId = "";
    this.folderpath = "";
    this.removeEnabled = false;
  }

  getMainFolders(data, isForDefaultFolderSelection?) {
    if (!isForDefaultFolderSelection) {
      if (data[0].id !== undefined) {
        localStorage.setItem('folderId', data[0].id);
      }
      const topFolder = [];
      data.map((d, i) => {
        if (d != null) {
          if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
            topFolder.push({
              label: d.name,
              data: d,
              'level': '1',
              'expandedIcon': 'fa fa-fw ui-icon-folder-open',
              'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
              'children': [],
              'leaf': false
            });
          }
          else {
            topFolder.push({
              label: d.name,
              data: d,
              'level': '1',
              'expandedIcon': 'fa fa-fw ui-icon-folder-open',
              'collapsedIcon': 'fa fa-fw ui-icon-folder',
              'children': [],
              'leaf': false
            });

          }
        }
      });
      this.folderList = topFolder;

      this.cs.getSubFolders(this.folderList[0].data.id).subscribe(data =>
        this.assignSubFoldersFor(this.folderList[0], data));
    }
    else {
      if (data && data.path && data.id) {
        this.folderpath = data.path;
        this.folderId = data.id;
        this.removeEnabled = true;
      }
      //console.log(this.folderId)
    }
  }
  assignSubFoldersFor(parent, data) {
    this.index++;
    const subFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'leaf': false
          });
        }
        else {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'leaf': false
          });

        }
      }
    });
    parent.children = subFolder;
  }
  nodeExpand(event) {
    this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data));
  }
  assignSubFolders(parent, data) {
    this.index++;
    const subFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'leaf': false
          });
        }
        else {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'leaf': false
          });

        }
      }
    });
    parent.children = subFolder;
  }
  nodeSelect(event) {
    // if (event.node.data.id === this.selectedFolder.data.id) {
    //   return;
    // }
    this.cs.validateFolderPermissions(event.node.data.id, 'ADD').subscribe(data => {
      this.folderPermission.folderSelected = true;
      if (data !== true) {
        this.folderPermission.permission = true;
      } else {
        this.folderPermission.permission = false;
        this.folderpath = event.node.data.path;
        this.folderId = event.node.data.id;
        //console.log(this.folderId)


        /*localStorage.setItem('folderId', event.node.data.id);
        localStorage.setItem('path', event.node.data.path);
        this.ds.savedFolderBrowse.folderPathSavedBrowse = event.node.data.path;*/
      }
    });
  }
  selectFolder() {
    this.openTree = false;
    this.removeEnabled = true;
  }

  onMemoTabOpen(e) {
    this.recipientTab = (e.index === 0);
  }


  onReadyCkEditorEN(language: string) {
    this.watchdog = new CKSource.EditorWatchdog();
    window['watchdog'] = this.watchdog;
    this.watchdog.setCreator((element, config) => {
      config.language = language;
      // Exclude the title plugin
      config.extraPlugins = (config.extraPlugins || '').replace(/(?:^|,)\s*title\s*(?:,|$)/, '');

      // Disable the title feature
      config.title = false;
      return CKSource.Editor
        .create(element, config)
        .then(editor => {
          document.querySelector('.document-editor__toolbar').appendChild(editor.ui.view.toolbar.element);
          document.querySelector('.ck-toolbar').classList.add('ck-reset_all');
          this.editorEN = editor;
          editor.model.document.on('change', (event, data) => {
            // Access data on change event
            this.launch.workflow.model.messages = editor.getData()
            console.log('Editor content changed:', this.launch.workflow.model.messages);
            // You can do something with the data here
          });
          return editor;
        });
    });
    this.watchdog
      .create(document.querySelector('.editor'), {
      })
      .catch();
  }

  onReadyCkEditorAR(language: string) {
    this.watchdog = new CKSource.EditorWatchdog();
    window['watchdog'] = this.watchdog;
    this.watchdog.setCreator((element, config) => {
      config.language = language;
      return CKSource.Editor
        .create(element, config)
        .then(editor => {
          document.querySelector('.document-editor__toolbar1').appendChild(editor.ui.view.toolbar.element);
          document.querySelector('.ck-toolbar').classList.add('ck-reset_all');
          this.editorAR = editor;
          editor.model.document.on('change', (event, data) => {
            // Access data on change event
            this.launch.workflow.model.arMessages = editor.getData()
            console.log('Editor content changed:', this.launch.workflow.model.arMessages);
            // You can do something with the data here
          });
          return editor;
        });
    });
    this.watchdog
      .create(document.querySelector('.editor1'), {
      })
      .catch();
  }
  getUserSuggestion(event) {
    if (event.query.length >= 3) {
      let searchQueary = { userName: undefined };
      searchQueary.userName = event.query;
      this.busy = true;
      this.us.searchEcmUsers(searchQueary).subscribe(res => {
        this.busy = false;
        let users = [];
        res.map((user) => {
          //users.push(user.id);
          //users.push(user.login+' ('+user.id+')');
          users.push({ value: user.id, label: user.fulName });
        });
        this.userSearchSuggestion = users;
      }, err => {
        this.busy = false;
      });
    }
  }

  setOnBehalfUser(userId: any) {
    let searchQueary = { empId: undefined };
    searchQueary.empId = userId;
    this.busy = true;
    this.us.searchEcmUsers(searchQueary).subscribe(res => {
      this.busy = false;
      let users = [];
      let userDetails: any = null;
      res.map((user) => {
        //users.push(user.id);
        //users.push(user.login+' ('+user.id+')');
        users.push({ value: user.id, label: user.fulName });
        if (userDetails && userDetails == null)
          userDetails = { value: user.id, label: user.fulName };
      });
      //this.userSearchSuggestion = users;
      this.onBehalfUser = userDetails;
      return userDetails;

    }, err => {
      this.busy = false;
      return null;
    });
  }

  usersSelected(event) {

  }

  clearSelection(event) {
  }
}
