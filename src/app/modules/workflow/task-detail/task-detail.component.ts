import {
  Component, OnInit, AfterViewInit,
  OnDestroy, ViewChildren, QueryList, ViewChild
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// import { Message, TreeNode } from 'primeng/primeng';
// import { ConfirmationService } from 'primeng/primeng';
// services
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import { DocumentService } from '../../../services/document.service';
import { ContentService } from '../../../services/content.service';
import { Observable, Subscription } from 'rxjs';
import * as $ from 'jquery';
import * as globalv from '../../../global.variables';
import 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// models
import { User } from '../../../models/user/user.model';
import { WorkitemDetails } from '../../../models/workflow/workitem-details.model';
import { WorkflowDetails } from '../../../models/workflow/workflow-details.model';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { DocumentSecurityModel } from '../../../models/document/document-security.model';
import { EntryTemplateDetails } from '../../../models/document/entry-template-details.model';
import { Recall } from '../../../models/workflow/recall.model';
import { WorkItemAction } from '../../../models/workflow/workitem-action.model';
import { Recipients } from '../../../models/user/recipients.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from "../../../services/core.service";
import * as _ from "lodash";
import { DocDetailsModalComponent } from "../../../components/generic-components/doc-details-modal/doc-details-modal.component";
import { saveAs } from 'file-saver';
import * as global from "../../../global.variables";
import * as moment from 'moment';
import { MemoService } from '../../../services/memo.service';
import { ConfirmationService, Message, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import {Attachment} from "../../../models/document/attachment.model";

interface Column {
  field: string;
  header: string;
  hidden: boolean;
  sortField: string;
}
@Component({
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('idt') dataTable!: Table;
  public currentUser = new User();
  pdfSrc: Object;
  private pageUrl: any;
  public workitem: any;
  public memoDetails: any;
  public memoReviewerList: any[] = [];
  public memoReviewerExist: boolean = false;
  public memoStepIndex: String = "";
  public memoReviewers: string;
  private subscription: Subscription[] = [];
  public isMemoDateChange: boolean = false;
  public displayIframe = false;
  public current_url: SafeResourceUrl = null;
  public curVerMemoDocId: string;
  public wiReferenceVisible = false;
  private attach_url: SafeResourceUrl;
  public memoReference: String;
  // private esignInitialUrl: SafeResourceUrl = null;
  public workitemHistory: any;
  public selectedRows: any;
  public colHeaders: any[] = [];
  public memoRefDocId: String;
  public trackColHeaders: any[] = [
    { field: 'senderName', header: 'Sender Name', hidden: true },
    { field: 'recipientName', header: 'Recipient', hidden: true },
    { field: 'sentOn', header: 'Sent On', hidden: true, sortField: 'sentOn2' },
    { field: 'actionUser', header: 'Action By', hidden: true },
    { field: 'status', header: 'Status', hidden: true },
    { field: 'actionFor', header: 'For', hidden: true }
  ];

  public replyRecipients: any = {
    toList: []
  };
  public esignEnabled = false;
  public empNo: any;
  public roleId: any;
  public flagInitial: string;
  public docId: string;
  public docInfo: DocumentInfoModel[];
  public docVersion: DocumentInfoModel[];
  public docHistory: DocumentInfoModel[];
  public linkedDocuments: DocumentInfoModel[];
  public signDocCount = 0;
  public signedDocCount = 0;
  public docSecurity: DocumentSecurityModel[];
  public docSysProp: any;
  private noLink = false;
  viewDocTitle: any;
  headId: any;
  public docVsId: String;
  public fileselected = false;
  private updateddDocuments = new FormData();
  public fileUploaded: any = undefined;
  public saveDocInfo = new DocumentInfoModel();
  public docTemplateDetails = new EntryTemplateDetails();
  public docEditPropForm: FormGroup;
  msgs: Message[] = [];
  public fromPage: any;
  public editAttachment: boolean;
  public editProperties: boolean;
  public entryTemp = false;
  public to: string[];
  foldersFiledIn: any;
  private breadCrumbPath: any[] = [];
  private recallmodel = new Recall();
  public addUserRecipients = [];
  addUser: any = {
    documents: { existing: {}, new: {}, cartItems: [] },
    recipients: { roles: {}, list: {}, search: { result: [] }, toList: [], ccList: [] },
    workflow: { model: {} }
  };
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  public distList = { 'id': 1, 'empNo': 1002, 'name': 'Distribution List', lists: [] };
  public defaultList = { 'id': -1, 'empNo': 1002, 'name': 'Default List' };
  public globalList = { 'id': 1, 'empNo': 1002, 'name': 'Global List', lists: [] };
  roleTreeSelection: any;
  private filteredRoles: any[];
  public AddUserDialog = false;
  public busy: boolean;
  public busyEsign: boolean;
  public trackWorkitemDetails: any;
  public selectedVersion: any = { props: [] };
  public toRecipients: any[] = [];
  public ccRecipients: any[] = [];
  public docTrack: any[] = [];
  private tmpRoleTree = [];
  public workitemProgress: any[];
  private errorJson: any;
  public displayProgress = false;
  public remarksHistory = false
  public wiRemarksVisible = false
  public wiRemarksVisibleForReturn = false;  
  public editRemarksVisible = false;  
  public overrideRemarksVisible = false;
  public remarksHistoryData: any
  public ESignedAttachments: any[] = [];
  public recipientsTab = false;
  public eSignDialog = false;
  public isReturnButtonDisabled = false;
  public showDelegationInactiveDialog = false;
  public showRecallInactiveDialog = false;
  public showRecallActionedDialog = false;
  public showMemoRecallSelectOneDialog = false;
  public isesignverified = false;
  displayinfo = false;
  strikeIndex: any;
  attachment: any;
  userType: any;
  workflowTrack: any = [];
  workflowId: any;
  sentItemId: any;
  senderId: any;
  isWiSender = true;
  isTrack = false;
  selectedWi: any[] = [];
  public selectedColumns: string[] = [];
  public wiActionForReviewer: string
  public columns: any[] = [
    { label: 'Sender Name', value: 'senderName' },
    { label: 'Recipient', value: 'recipientName' },
    { label: 'Sent On', value: 'sentOn' },
    { label: 'Action By', value: 'actionUser' },
    { label: 'Status', value: 'status' },
    { label: 'For', value: 'actionFor' }
  ];
  public checkAll = false;
  public checkAllDisabled = true;
  public isAllRecalled;
  public progressObj = {};
  addToFolderList: TreeNode[];
  selectedAddFolder: any;
  @ViewChildren(DocDetailsModalComponent) docDetailsModalComponent: QueryList<DocDetailsModalComponent>;
  public inactiveDialogMessage = 'Delegated user access has ended';
  selectedAddDocument: any;
  public isWorkItemRecalled = false;
  public isWiSenderTotalCount = 0;
  public isRoleActive = 'ACTIVE';
  showFileIn = false;
  public isAllActionsDisabled = false;
  public isesignCancelDisabled = true;
  public subscriptionEsign: any;
  public openConfirmationDialog = false;
  public openTheConfirmationDialog = false;
  public submitConfirmationDialog = false;
  public submitTheConfirmationDialog = false;
  cols!: Column[];
  // showeSigninitialPopup=false;
  //showeSigninitialPrepare=false;
  constructor(
    private memoService: MemoService,
    public router: Router, private breadcrumbService: BreadcrumbService, private workflowService: WorkflowService,
    private sanitizer: DomSanitizer, private us: UserService, private ds: DocumentService, private cs: ContentService,
    private bs: BrowserEvents, private coreService: CoreService, private route: ActivatedRoute,
    private fb: FormBuilder, private confirmationService: ConfirmationService, private growlService: GrowlService,
    private location: Location) {
    this.pageUrl = router.url;
    this.sanitizer = sanitizer;
    this.workitem = new WorkitemDetails();
    this.currentUser = this.us.getCurrentUser();
    //this.workitem.workitemId = this.pageUrl.slice(this.pageUrl.indexOf('taskdetail/') + 11);
    this.fromPage = (this.pageUrl.slice(this.pageUrl.indexOf('workflow/') + 9)).split('/');
    this.route.paramMap.subscribe((params: any) => {
      if ((this.fromPage[0] === 'inbox' || this.fromPage[0] === 'inbox-new' || this.fromPage[0] === 'archive') && params.params.wiId && params.params.type) {
        this.workitem.workitemId = parseInt(params.params.wiId, null);
        this.userType = params.params.type;
        this.isTrack = false;
      } else if ((this.fromPage[0] === 'sent' || this.fromPage[0] === 'actioned' || this.fromPage[0] === 'archive') &&
        params.params.wfId && params.params.siId && params.params.senderId && params.params.type) {
        this.workflowId = parseInt(params.params.wfId, null);
        this.sentItemId = parseInt(params.params.siId, null);
        this.senderId = parseInt(params.params.senderId, null);
        this.userType = params.params.type;
        this.isTrack = true;
      } else {
        this.workitem.workitemId = params.params.wiId;
        this.userType = params.params.type;
        this.isTrack = false;
      }
    });
    this.docEditPropForm = new FormGroup({
      DocumentTitle: new FormControl(null, [Validators.required, this.noWhitespaceValidator])
    });
    this.recallmodel.items = [];
    this.initAdduser();
  }

  ngOnInit() {
    this.selectedColumns = ['senderName', 'recipientName', 'sentOn', 'actionFor', 'actionUser', 'status'];
    this.columnSelectionChanged(null);
    if ((this.fromPage[0] === 'inbox' || this.fromPage[0] === 'inbox-new' || this.fromPage[0] === 'archive') && this.workitem.workitemId) {
      let delNo = this.workflowService.delegateEmpNo && this.workflowService.delegateEmpNo > 0 ? this.workflowService.delegateEmpNo : 0;
      this.busy = true;
      this.workflowService.getWorkitem(this.workitem.workitemId, this.currentUser.EmpNo, delNo, 1).subscribe(data => {
        this.busy = false;
        data.priority = this.coreService.getPriorityString(data.priority);
        this.workitem = data;
        // this.workitem.memoStepname = "REVIEWER"
        // this.workitem.actions = "Initial"
        // console.log(this.workitem)
        let userId = this.workitem.recipientEMPNo;
        let userType = "USER";
        if (this.workitem.recipientRoleId !== 0) {
          userId = this.workitem.recipientRoleId;
          userType = "ROLE";
        }

        this.isAllActionsDisabled = this.checkDateForDisableActions(this.workitem.createdOn);

        if (this.workitem.isMemo && this.workitem.isMemo === 1) {
          this.memoService.getMemoById(this.workitem.memoId.toString()).subscribe(res => {
            this.memoDetails = res;
            this.memoDetails.recipients.forEach((res) => {
              // console.log(res.recipientType == "REV")
              if (res.recipientType == "REV") {
                this.memoReviewerExist = true;
                this.memoReviewerList.push(res.displayName);
                //console.log(this.memoReviewerList[0]);
              }
            });
            this.memoReviewers = this.memoReviewerList.join(', ');
            //console.log("memoReviewers ::" + this.memoReviewers);

            //Abhishek 30-May-2023 :: Auto-eSign Updates
            let rType = "CC";
            if (this.workitem.memoStepname == "APPROVER") {
              rType = "FROM";
              this.memoStepIndex = (this.memoDetails && this.memoDetails.memoType === "Letter") ? "From" : "From1";
            } else if (this.workitem.memoStepname == "REVIEWER") {
              rType = "REV";
            } else if (this.workitem.memoStepname == "SUB-FROM") {
              rType = "SUB-FROM";
              this.memoStepIndex = "From" + (this.findMemoRecipientIndex(rType, userId, userType) + 1);
            } else if (this.workitem.memoStepname == "THRU") {
              rType = "THRU";
              this.memoStepIndex = "Thru"
            } else if (this.workitem.memoStepname == "TO") {
              rType = "TO";
              this.memoStepIndex = "To";
            }

            if (this.workitem.memoId && this.workitem.memoId > 0 && rType != "CC") {
              // console.log(this.workitem.memoId, this.workitem.workflowId, rType);
              this.memoService.getMemoLockStatus(this.workitem.memoId, this.workitem.workflowId, rType, userType, userId).subscribe(res => {
                // console.log(res)
                if (res == 0) {
                  this.memoService.lockMemo(this.workitem.memoId, this.workitem.workflowId, rType, userType, userId).subscribe(res => {
                  });
                } else {
                  this.isAllActionsDisabled = true;
                }
              });
            }

            if (this.memoDetails && this.memoDetails.memoDocId && this.memoDetails.memoDocId.length > 0) {
              this.ds.getDocumentInfo(this.memoDetails.memoDocId, 0).subscribe(data => {
                this.docVsId = (data.vsid != undefined && data.vsid != null && data.vsid.length > 0) ? data.vsid : "";
                this.curVerMemoDocId = data.id;
              });
            }
          }, err => {
            this.busy = false;
          });



        }

        // console.log(this.isAllActionsDisabled);
        this.breadCrumbPath = [
          { label: 'Workflow' }
        ];
        if (this.fromPage[0] === 'inbox' || this.fromPage[0] === 'inbox-new') {
          this.breadCrumbPath.push({ label: 'Inbox', routerLink: ['/workflow/' + this.fromPage[0]] });
          if (this.workitem.recipientName) {
            this.breadCrumbPath.push({ label: this.workitem.recipientName });
          } else {
            this.breadCrumbPath.push({ label: this.workitem.recipientRoleName });
          }
        } else if (this.fromPage[0] === 'archive') {
          this.breadCrumbPath.push({ label: 'Archive', routerLink: ['/workflow/' + this.fromPage[0]] });
          if (this.workitem.recipientName) {
            this.breadCrumbPath.push({ label: this.workitem.recipientName + ' Inbox' });
          } else if (this.workitem.recipientRoleName) {
            this.breadCrumbPath.push({ label: this.workitem.recipientRoleName + ' Inbox' });
          }
        }
        this.breadCrumbPath.push({ label: this.workitem.subject });
        this.breadcrumbService.setItems(this.breadCrumbPath);
        this.workflowId = this.workitem.workflowId;
        this.getWorkflowTrack();
        //console.log("workitem.actions : " +this.workitem.actions + " | currentUser.iseSignAllowed : " +this.currentUser.iseSignAllowed + " | workitem.isMemo : " +this.workitem.isMemo)
        if (this.workitem.actions === 'Signature' || this.workitem.actions === 'Initial' || this.workitem.actions === 'MultiSign') {
          this.esignEnabled = true;
          if (this.workitem.actions === 'Signature') {
            this.flagInitial = 'N';
            this.workitem.attachments.map((attachment, index) => {
              //console.log("attachment.docId : " +attachment.isSign + " | attachment.isSign : " +attachment.isSign);
              if (attachment.isSign && attachment.isSign == 1) {
                this.signDocCount++;
                this.callAddMissingPermissions(cb => {
                  this.subscription.push(this.ds.verifyESign(attachment.docId, this.workitem.workitemId, this.flagInitial).subscribe(res => {
                    if (res && res === 'True') {
                      this.signedDocCount++;
                      this.isesignverified = true;
                      this.ESignedAttachments[attachment.docId] = true;
                    } else {
                      this.ESignedAttachments[attachment.docId] = false;
                      this.isesignverified = false;
                    }
                  }));
                });
              }
            });
          } else if (this.workitem.actions === 'MultiSign') {
            this.esignEnabled = false;
            this.workitem.attachments.map((attachment, index) => {
              this.callAddMissingPermissions(cb => {
                this.subscription.push(this.ds.verifyMultiSign(attachment.docId, this.workitem.workitemId, attachment.vsid).subscribe(res => {
                  if (res && res === 'True') {
                    this.isesignverified = true;
                    this.ESignedAttachments[attachment.docId] = true;
                  } else {
                    this.ESignedAttachments[attachment.docId] = false;
                    this.isesignverified = false;
                  }
                }));
              });
            });

          }
        } else {
          this.esignEnabled = false;
        }
        this.populateRecipients();
      }, err => {
        this.busy = false;
      });
    } else if ((this.fromPage[0] === 'sent' || this.fromPage[0] === 'archive' || this.fromPage[0] === 'actioned') &&
      this.workflowId && this.sentItemId && this.senderId && this.userType) {
      this.getFirstWorkitemDetails();
      this.getWorkflowTrack();
      /*const subscription1 = this.workflowService.getWorkflowAttachments(this.workflowId).subscribe(res => {
        this.workitem.attachments = res;
      });
      this.coreService.progress = {busy: subscription1, message: ''};
      this.addToSubscriptions(subscription1);*/
    }
    //this.getWorkitemProgress();
    /*setTimeout(() => {
      this.workflowService.updateInboxCount();
    }, 1000);*/
    if (this.workflowService.openedWorkItem && this.workflowService.openedWorkItem.userId && this.userType === 'ROLE') {
      this.us.getRoleById(this.workflowService.roleId, '').subscribe(d => {
        this.isRoleActive = d.status;
      })
    }
    else {
      this.isRoleActive = 'ACTIVE';
    }

    //console.log("2 workitem.actions : " +this.workitem.actions + " | currentUser.iseSignAllowed : " +this.currentUser.iseSignAllowed + " | workitem.isMemo : " +this.workitem.isMemo)

  }

  checkDateForDisableActions(date) {
    let tempdate = (moment(date).format("DD/MM/YYYY"));
    return moment((tempdate), "DD/MM/YYYY").toDate() < moment((global.date_disable_action), "DD/MM/YYYY").toDate();
  }
  /*  filterAttachments(){
    let otherAttachments: Attachment[];
    
    if (this.workitem.isMemo && this.workitem.isMemo === 1) {
      if(!this.memoDetails)
      {
        this.memoService.getMemoById(this.workitem.memoId.toString()).subscribe(res => {
          this.memoDetails = res;
          otherAttachments = this.getOtherAttachments(this.memoDetails);
        });
      }
      else if (this.memoDetails && this.memoDetails.memoDocId && this.memoDetails.memoDocId.length > 0){
        otherAttachments = this.getOtherAttachments(this.memoDetails);
      }
      else{
        otherAttachments.push(this.workitem.attachments[0]);
      }
    }
    else
      otherAttachments = this.workitem.attachments;


    return otherAttachments;
  }

  getOtherAttachments(memo: any){
    let otherAttachments: Attachment[];
    if(memo && memo.memoDocId && memo.memoDocId.length > 0){
      this.ds.getDocumentInfo(memo.memoDocId, 0).subscribe(data => {
        this.docVsId = (data.vsid != undefined && data.vsid != null && data.vsid.length > 0)?data.vsid:"";
        this.curVerMemoDocId = data.id;
        this.workitem.attachments.map((attachment, index) => {
          if (attachment.docId !== memo.memoDocId && attachment.docId !== this.curVerMemoDocId)
            otherAttachments.push(attachment);
        });
      });
    }
    return otherAttachments;
  } */
  findMemoRecipientIndex(rType, userId, userType) {
    //return this.memoDetails.recipients.findIndex((res) => (res.recipientType == rType && res.userId==userId && res.userType==userType));
    let indexVal = 2;

    let cnt = 0;
    this.memoDetails.recipients.forEach((res) => {
      // console.log(res.recipientType == "REV")
      if (res.recipientType === rType) {
        cnt += 1;
        console.log("Sub-From Count :: " + cnt + ", User :: " + userId + ", userType :: " + userType);
        if (res.userId == userId && res.userType == userType)
          indexVal = cnt;
      }
    });

    return indexVal;
  }

  populateRecipients() {
    this.toRecipients = [];
    this.ccRecipients = [];
    this.workitem.recipients.map((user, index) => {
      if (user.actionType === 'to' || user.actionType === 'TO' || user.actionType === 'Reply-TO') {
        this.toRecipients.push(user);
      } else if (user.actionType === 'cc' || user.actionType === 'CC' || user.actionType === 'Reply-CC') {
        this.ccRecipients.push(user);
      }
    });
  }
  multiSignDocument(doc) {
    this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.processMultiSign(data.id), err => this.noDocFound(doc));
  }

  processMultiSign(docId) {
    this.busy = true;
    if (this.workitem.recipientRoleId !== 0) {
      this.roleId = this.workitem.recipientRoleId;
    } else {
      this.roleId = 0;
    }
    this.workflowService.multiSignDocument(this.currentUser.KocId, docId, this.workitem.workitemId, this.roleId).subscribe(data => {
      this.busy = false;
      this.multiSignSuccess(data, docId);
    }, Error => {
      this.busy = false;
      this.multiSignFailed();
    });
  }

  multiSignSuccess(data, docId) {
    if (data == "SIGNED") {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Cancelled', detail: 'Document is already Signed'
      });
    }
    else if (data == "FAILED") {
      this.multiSignFailed();
    }
    else if (data) {
      this.ESignedAttachments[docId] = true;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Document is Signed Successfully'
      });
    } else {
      this.updateFailed('error');
    }
  }

  multiSignFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: "Please upload sign image in settings and try again or contact ECM Support"
    });
  }

  ngAfterViewInit() {
    $('#workitemProgressTab>p-accordionTab>div>a').attr('href', 'javascript:;');
  }

  mailToAll(curWorkitem) {
    this.busy = true;
    let postdata=[];
    curWorkitem.attachments.map((d, i) => {
       let attachmentMail  = new Attachment();
       attachmentMail.docTitle=d.docTitle;
       attachmentMail.docId=d.docId;
       attachmentMail.format=d.format;
       postdata.push(attachmentMail);
    });

    this.ds.emailDocuments(postdata).subscribe(d=>{
      const file = new Blob([d], { type: 'text/plain' });
      saveAs(file, "mailtoall.eml");
      this.busy = false;
    }, error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error Occurred', detail: 'Please try again!'
      });
    });
  }

  openDocInfo(doc) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data !== 'INACTIVE') {
        this.callAddMissingPermissions(cb => {
          if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
            this.assignSecurityForDelegate(cb => {
              this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.validDoc(data), error => this.noDocFound(doc))
            });
          } else {
            this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.validDoc(data), error => this.noDocFound(doc))
          }
        });
      }
    });
  }

  noWhitespaceValidator(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  validDoc(data) {
    this.bs.docDetailsModelTabIndex.emit();
    this.displayinfo = true;
    /*this.subscription.push(this.ds.getDocument(data.id)
      .subscribe(data => this.assignDocInfo(data)));*/
    this.subscription.push(this.ds.getDocumentDetails(data.id, this.currentUser.EmpNo)
      .subscribe(data => this.assignDocInfo(data)));
    // this.subscription.push(this.ds.getDocumentVersions(data.id)
    //   .subscribe(data => this.assignDocVersions(data)));
    /*this.subscription.push(this.ds.getDocumentPermissions(data.id)
      .subscribe(data => this.assignDocSecurity(data)));*/
    // this.subscription.push(this.ds.getLinks(data.id)
    //   .subscribe(data => this.assignDocLink(data)));
    // this.subscription.push(this.ds.getDocumentHistory(data.id)
    //   .subscribe(data => this.assignDocHistory(data)));
    /*this.subscription.push(this.ds.getDocumentFolders(data.id)
      .subscribe(data => this.assignDocumentFolders(data)));*/
    // this.subscription.push(this.ds.getDocumentWorkflowHistory(data.id)
    //   .subscribe(data => this.assignDocumentWorkflowHistory(data)));
  }

  openEditDoc(doc) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data !== 'INACTIVE') {
        this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => {
          this.ds.verifyDocOCRStatus(doc.docId).subscribe(d => {
            if (d === 'True') {
              this.callAddMissingPermissions(cb => {
                if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
                  this.assignSecurityForDelegate(cb => {
                    this.busy = true;
                    this.ds.getDocument(doc.docId).subscribe(data => {
                      this.busy = false;
                      this.editAttachment = true;
                      this.fileUploaded = undefined;
                      if (data.entryTemplate) {
                        this.assignFieldsForEditDoc(data);
                      } else {
                        this.entryTemp = false;
                      }
                    }, err => {
                      this.busy = false;
                      if (err.statusText === 'OK') {
                        this.growlService.showGrowl({
                          severity: 'error',
                          summary: 'Invalid Document',
                          detail: 'This document is either deleted or you dont have permission'
                        });
                        this.editAttachment = false;
                      }
                    });
                    this.editAttachment = true
                  });
                } else {
                  this.busy = true;
                  this.ds.getDocument(doc.docId).subscribe(data => {
                    this.busy = false;
                    this.editAttachment = true;
                    this.fileUploaded = undefined;
                    if (data.entryTemplate) {
                      this.assignFieldsForEditDoc(data);
                    } else {
                      this.entryTemp = false;
                    }
                  }, err => {
                    this.busy = false;
                    if (err.statusText === 'OK') {
                      this.growlService.showGrowl({
                        severity: 'error',
                        summary: 'Invalid Document',
                        detail: 'This document is either deleted or you dont have permission'
                      });
                      this.editAttachment = false;
                    }
                  });
                  this.editAttachment = true;
                }
              });
            }
            else {
              this.editAttachment = false;
              this.growlService.showGrowl({
                severity: 'error',
                summary: 'Try again later',
                detail: 'The document conversion process is in progress, please try after a while '
              });
            }
          });
        }, err => this.noDocFound(doc));
      }
    });
  }

  getWorkitemProgress(workitemId) {
    this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.busy = true;
        this.workflowService.getWorkitemProgress(workitemId).subscribe(res => {
          this.busy = false;
          res.map(r => {
            if (r.empNo === this.currentUser.EmpNo) {
              r.from = true;
            }
          });
          this.workitemProgress = res;
        }, err => {
          this.busy = false;
        });
        this.displayProgress = true;
        this.progressObj = {};
      }
    });
  }

  addWorkitemProgress(event) {
    this.busy = true;
    this.workflowService.addWorkitemProgress(event.message,
      this.currentUser.EmpNo, this.workitem.workitemId)
      .subscribe(res => {
        this.busy = false;
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Workitem Progress Added Successfully'
        });
        event.message = undefined;
        this.getWorkitemProgress(this.workitem.workitemId);
        this.bs.inboxRefreshRequired.emit('task-detail-read-action');
      }, err => {
        this.busy = false;
      });
  }

  removeWorkitemProgress(id) {
    this.confirmationService.confirm({
      header: 'Remove Confirmation',
      message: 'Are you sure that you want to perform this action?',
      key: 'taskDetailConfirmation',
      accept: () => {
        this.deleteWorkitemProgress2(id);
      }
    });
  }

  deleteWorkitemProgress2(id) {
    this.busy = true;
    this.workflowService.removeWorkitemProgress(id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Workitem Progress Removed Successfully'
      });
      this.getWorkitemProgress(id);
      this.bs.inboxRefreshRequired.emit('task-detail-read-action');
    }, err => {
      this.busy = false;
    });
  }

  assignDocInfo(data) {
    this.docSysProp = [];
    this.docInfo = [];
    data.document.props.map(p => {
      if (p.hidden === 'false') {
        this.docInfo.push(p);
      }
    });
    this.viewDocTitle = this.coreService.getPropValue(data.document.props, 'DocumentTitle') + " " + "(" + data.document.docclass + ")";
    this.docSysProp.push(data.document);
    this.assignDocSecurity(data.permissions);
    this.assignDocumentFolders(data.fileInFolders);
  }

  assignFieldsForEditDoc(data) {
    this.saveDocInfo = data;
    this.busy = true;
    this.cs.getEntryTemplate(data.entryTemplate).subscribe(data1 => {
      this.busy = false;
      this.entryTemp = true;
      this.docTemplateDetails = data1;
      this.docTemplateDetails.props.forEach(control => {
        // if (control.hidden === 'false'){
        if (control.req === 'true') {
          if (control.dtype === 'DATE') {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.required));
          } else {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));
          }
        } else {
          this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.maxLength(400)));
        }
        // if (control.symName === 'OrgCode') {
        //   if (control.lookups) {
        //     const removables = [];
        //     control.lookups.map((d, i) => {
        //       if (d.label.trim().length > 4) {
        //         removables.push(i);
        //       }
        //     });
        //     removables.map((d, i) => {
        //       control.lookups.splice(d - i, 1);
        //     });
        //   }
        // }
        // }
      });
      for (const prop of this.saveDocInfo.props) {
        // if (prop.hidden === 'false') {
        if (prop.dtype === 'DATE' && prop.mvalues[0] !== null) {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        } else if (prop.ltype === 2 && prop.mvalues[0] !== null) {
          if (prop.lookups) {
            prop.lookups.map((d, i) => {
              if (prop.mvalues[0] === d.label) {
                this.docEditPropForm.get(prop.symName).setValue(d.value);
              }
            });
          }
        }
        else {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        }
        // }
      }
    }, err => {
      this.busy = false;
    });
  }

  assignDocVersions(data) {
    this.docVersion = data;
  }

  assignDocSecurity(data) {
    this.docSecurity = data;
  }

  assignDocLink(data) {
    if (data.length > 0) {
      this.linkedDocuments = data;
      this.noLink = false;
    } else {
      this.noLink = true;
    }
  }

  assignDocHistory(data) {
    this.docHistory = data;
  }

  assignDocumentWorkflowHistory(data) {
    this.docTrack = data;
  }

  closeModal() {
    if (this.docDetailsModalComponent) {
      this.docDetailsModalComponent.forEach(docDetailsComponent => {
        docDetailsComponent.ngOnDestroy();
      });
    }
    this.docSysProp = [];
  }

  closeEditAttModal() {
    this.docEditPropForm.reset();
    this.saveDocInfo = null;
    this.fileselected = false;
    this.entryTemp = false;
    this.fileUploaded = undefined;
    this.updateddDocuments = new FormData();
  }

  cancel() {
    this.closeEditAttModal();
    this.editAttachment = false;
  }

  fileChanged(event) {
    this.fileselected = event.fileselected;
    this.fileUploaded = event.fileUploaded;
  }

  viewAttachmentLink(doc: any, flag?: any) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data !== 'INACTIVE') {
        this.callAddMissingPermissions(cb => {
          if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
            this.assignSecurityForDelegate(cb => {
              this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => {
                window.parent.postMessage({ v1: 'openViewer', v2: data.id }, '*');

              }, err => this.noDocFound(doc));
            });
          } else {
            this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => {
              window.parent.postMessage({ v1: 'openViewer', v2: data.id }, '*');

            }, err => this.noDocFound(doc));
          }
        });
      }
    });
  }

  //view,edit,info,esign
  assignSecurityForDelegate(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.workitem.actions;
    // wia.actionDetails = this.workitem.actionName
    wia.attachments = this.workitem.attachments;
    wia.deadline = this.workitem.deadline;
    wia.id = this.workitem.workitemId;
    wia.instructions = this.workitem.instructions;
    wia.recipients = this.workitem.recipients;
    wia.reminder = this.workitem.reminder;
    wia.EMPNo = this.currentUser.EmpNo;
    wia.workflow = new WorkflowDetails();
    wia.workflow.delEmpNo = this.workflowService.delegateEmpNo;
    this.busy = true;
    this.workflowService.addSecurityForDelegate(wia).subscribe(data => {
      this.busy = false;
      cb();
    }, err => {
      this.busy = false;
    });
  }

  callAddMissingPermissions(cb?) {
    const wia = new WorkItemAction();
    wia.actions = this.workitem.actions;
    // wia.actionDetails = this.workitem.actionName
    wia.attachments = this.workitem.attachments;
    wia.deadline = this.workitem.deadline;
    wia.id = this.workitem.workitemId;
    wia.instructions = this.workitem.instructions;
    wia.recipients = this.workitem.recipients;
    wia.reminder = this.workitem.reminder;
    wia.EMPNo = this.currentUser.EmpNo;
    wia.workflow = new WorkflowDetails();
    wia.workflow.delEmpNo = this.workflowService.delegateEmpNo;
    this.busy = true;
    this.workflowService.addMissingPermissions(wia).subscribe(data => {
      this.busy = false;
      cb();
    }, err => {
      this.busy = false;
    });
  }

  assignDocIdForView(data) {
    this.displayIframe = true;
    this.current_url = this.transform(this.ds.getViewUrl(data.id));
  }

  noDocFound(doc) {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Invalid Document', detail: 'This document is either deleted or you dont have permission'
    });
    this.workitem.attachments.map((d, i) => {
      if (doc.docId === d.docId) {
        this.strikeIndex = i;
      }
    });
  }

  confirmRemoveLink(docLink) {
    this.confirmationService.confirm({
      header: 'Remove Link Confirmation',
      message: 'Are you sure that you want to perform this action?',
      key: 'taskDetailConfirmation',
      accept: () => {
        this.removeLink(docLink)
      }
    });
  }

  closeViewer(event) {
    this.displayIframe = false;
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  downloadDoc(doc) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data !== 'INACTIVE') {
        this.callAddMissingPermissions(cb => {
          if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
            this.assignSecurityForDelegate(cb => {
              this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.assignDocIdForDownload(data), err => this.noDocFound(doc));
            });
          } else {
            this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.assignDocIdForDownload(data), err => this.noDocFound(doc));
          }
        });
      }
    });
  }

  assignDocIdForDownload(data) {
    window.location.assign(this.ds.downloadDocument(data.id));
  }

  eSign(doc, isInitial, isAuto?) {
    //console.log(this.workitem.attachments[0])
    this.ds.getDocumentInfo(doc.docId, 0).subscribe(doccurver => {
      this.validateWorkitemForAttachementActions().then((data: any) => {
        if (data !== 'INACTIVE') {
          this.callAddMissingPermissions(cb => {
            this.ds.verifyDocOCRStatus(doc.docId).subscribe(d => {
              if (d === 'True') {
                if (this.workitem.actions === 'Signature' && isInitial == 0) {
                  this.flagInitial = 'N';
                  this.ds.verifyESign(doc.docId, this.workitem.workitemId, this.flagInitial).subscribe(res => {
                    if (res && res === 'True') {
                      this.growlService.showGrowl({
                        severity: 'error',
                        summary: 'Warning', detail: 'You have already signed this document'
                      });
                      this.ESignedAttachments[doc.docId] = true;
                      this.isesignverified = true;
                      this.signedDocCount++;
                      let attachment = _.find(this.workitem.attachments, ['docId', doccurver.id]);
                      if (attachment) {
                        attachment.format = 'application/pdf';
                      }
                    } else if (res && res === 'False') {
                      this.isesignverified = false;
                      this.openESignPage(doccurver.id, true, doc.docId, isAuto, 0, 0);
                    }
                  }, err => {
                  });
                } else if (this.workitem.actions === 'Initial' || isInitial == 1) {
                  this.flagInitial = 'Y';
                  this.openESignPage(doccurver.id, false, doc.docId, isAuto, 0, 0);
                }
              }
              else {
                this.growlService.showGrowl({
                  severity: 'error',
                  summary: 'Try again later',
                  detail: 'The document conversion process is in progress, please try after a while '
                });
              }
            });
          });
        }
      });
    });
  }
  //Abhishek - Added for Date Auto Update - 31.May.2023
  eSignForDate(doc, memoDate, memoId, isAuto?) {
    //console.log(this.workitem.attachments[0])
    // this.validateWorkitemForAttachementActions().then((data: any) => {
    //   if (data !== 'INACTIVE') {
    this.memoService.updateMemoDate(memoId, memoDate).subscribe(cb => {
      this.flagInitial = 'N';
      this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => this.openESignPage(data.id, true, data.id, 1, 1, 0), err => this.noDocFound(doc));
    });
    //   }
    // });
  }

  updateMemoReference(doc){
    this.memoRefDocId = doc.docId;
    //if(!this.memoReference || this.memoReference == null || this.memoReference == undefined || this.memoReference == '' )
    this.wiReferenceVisible = true;
  }
  
  OkMemoReference(){
    this.wiReferenceVisible = false;
    this.eSignForReference(this.memoRefDocId, 1);
  }

  eSignForReference(docId, isAuto?) {
    //console.log(this.workitem.attachments[0])
    
    /*this.confirmationService.confirm({
        message: 'Are you sure to proceed for Submit with Auto-eSign of memo attachment and date update?',
        header: 'Submit Confirmation',
        icon: 'ui-icon-help',
        key: 'taskDetailConfirmation',
        accept: () => {
          
        },
        reject: () => { }
      });*/
    
    console.log('eSign for Memo Ref :: ' + this.memoReference);
    if(this.memoReference && this.memoReference != '')
    {
      this.validateWorkitemForAttachementActions().then((data: any) => {
        if (data !== 'INACTIVE') {
          this.callAddMissingPermissions(cb => {
              this.flagInitial = 'N';
              this.ds.getDocumentInfo(docId, 0).subscribe(data => this.openESignPage(data.id, true, data.id, 1, 0, 1), err => this.noDocIdFound(docId));
          });
        }
      });
    }
    else{
      console.log('Memo Ref is not valid ---> ' + this.memoReference);
    }
  }

  openESignPage(signDocCurId, isEsign, signAttachId, isAuto?, isDate?, isRef?) {
    this.busyEsign = true;
    this.empNo = this.currentUser.EmpNo;
    if (this.workitem.recipientRoleId !== 0) {
      this.roleId = this.workitem.recipientRoleId;
    } else {
      this.roleId = 0;
    }

    let workitemId = this.workitem.workitemId;
    this.docId = signDocCurId;
    const sysDateTime = new Date();
    const fulldatetime = sysDateTime.getTime();
    const browser = navigator.appName;
    if (browser === 'Microsoft Internet Explorer' || browser === 'netscape') {
      window.opener = self;
    }
    //Abhishek 30-May-2023 :: Auto-eSign Updates
    if (isAuto === 1) {
      let userType = this.memoStepIndex, refNo = "", mDate = "";
      let memoId = this.memoDetails ? this.memoDetails.id : "9999999";
      if (this.memoDetails && this.memoStepIndex.startsWith("From") && isDate === 1) {
        refNo = this.memoReference && this.memoReference != null ? this.memoReference : this.memoDetails.referenceNo;
        mDate = moment(sysDateTime).format('DD-MM-YYYY').toString();
        userType = "Date";
        workitemId = 10002;
      }
      else if (this.memoDetails && this.memoStepIndex.startsWith("From") && isRef === 1) {
        refNo = this.memoReference && this.memoReference != null ? this.memoReference : this.memoDetails.referenceNo;
        mDate = moment(sysDateTime).format('DD-MM-YYYY').toString();
        userType = "Ref";
        workitemId = 10003;
      }

      //console.log("Auto esign :: userType : " + userType + ", refNo : " + refNo + ", mDate : " + mDate + ", memoId : " + memoId);
      this.workflowService.getAutoSignUrl(this.currentUser.KocId, this.roleId, this.docId, workitemId, this.flagInitial, userType, refNo, mDate, memoId).subscribe(d =>
        this.assignesignUrl(this.docId, d, isEsign, isDate, isRef, signAttachId),
        err => {
          console.log("esign error :: err.status  : " + err.status + ", err.message : " + err.message);
          if (err.status == 500 || err.status == 400) {
            if (err.message && err.message.includes('Not a valid memo document to modify date')) {
              alert("Not a valid document to modify date.");
            }
            else {
              alert("Error connecting to eSign Server. Please try again or contact ECM Support team.");
            }
          }
          else {
            alert("Error connecting to eSign Server. Please try again or contact ECM Support team.");
          }
          this.busyEsign = false;
        });
    }
    else {
      //getNewTokenUrl getTokenUrl
      this.workflowService.getNewTokenUrl(this.currentUser.KocId, this.roleId, this.docId, this.workitem.workitemId, this.flagInitial).subscribe(d =>
        this.assignesignUrl(this.docId, d, isEsign, 0, 0, signAttachId),
        err => {
          alert("Error connecting to eSign Server. Please try again or contact ECM Support team.");
          this.busyEsign = false;
        });
    }
  }

  assignesignUrl(docId, data, isEsign, isDate, isRef, signAttachId) {
    let tokenurl = data.tokenUrl;
    let action = 'Initial';
    let workitemId = this.workitem.workitemId;
    //console.log("AssignEsignURL witemId :: " + workitemId + " - isEsign : " + isEsign + " - isDate : " + isDate + " - isRef : " + isRef);
    if (isEsign)
      action = 'eSign';
    if (isDate === 1) {
      action = 'Date Update';
      workitemId = 10002;
    }
    else if (isRef === 1) {
      action = 'Reference No. Update';
      workitemId = 10003;
    }

    //console.log("curr workitemId :: " + workitemId);

    let win = window.open(tokenurl, "", "menubar=0,location='',toolbar=0,scrollbars=yes,dialog=yes,resizable=yes,top=0,left=0,width=" + window.screen.width + ",height=" + window.screen.availHeight);
    var self = this;
    self.eSignDialog = true;
    let timer = setInterval(function () {
      self.isesignCancelDisabled = true;
      if (win && win.closed) {
        console.log("Verify workitemId :: " + workitemId);
        this.subscriptionEsign = self.ds.verifyESignStatusService(docId, workitemId, self.flagInitial).subscribe((data) => {
          if (data && data === 'SIGNED') {
            if (isEsign && (isDate === 0) && (isRef === 0)) {
              self.isesignverified = true;
              self.ESignedAttachments[signAttachId] = true;
              self.signedDocCount++;
            }
            self.growlService.showGrowl({
              severity: 'info',
              summary: 'Success', detail: action + ' Successful'
            });

            let attachment = _.find(self.workitem.attachments, ['docId', signAttachId]);
            if (attachment) {
              attachment.format = 'application/pdf';
            }

            // let signDocCount = 0;
            // let signedDocCount = 0;
            // self.workitem.attachments.map(file => {
            //   if (file.isSign == 1) {
            //     signDocCount++;
            //     self.ds.verifyESignStatusService(file.docId, workitemId, self.flagInitial).subscribe((data) => {
            //       if (data && data === 'SIGNED') {
            //         signedDocCount++;
            //       }
            //     })
            //   }
            // });


            let senderName;
            if (self.workitem.senderRoleName) {
              senderName = self.workitem.senderRoleName;
            } else {
              senderName = self.workitem.senderName;
            }

            if (self.workitem.isMemo != 1) {
              self.confirmationService.confirm({
                message: action + ' successful. Would you like to reply to ' + senderName,
                header: action + ' Confirmation',
                icon: 'ui-icon-help',
                key: 'taskDetailConfirmation',
                accept: () => {
                  self.replyWorkitem(self.workitem);
                },
                reject: () => { }
              });
            }

            clearInterval(timer);
            self.eSignDialog = false;
            self.isReturnButtonDisabled = true;
          } else if (data && data === 'FAILED') {
            self.growlService.showGrowl({
              severity: 'error',
              summary: 'Failure', detail: 'User ' + action + ' is Cancelled'
            });
            clearInterval(timer);
            self.eSignDialog = false;
          } else if (data && data === 'PENDING') {
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
  addFavourites(doc) {
    this.busy = true;
    let userEmpNo = this.currentUser.EmpNo;
    this.ds.addToFavorites(userEmpNo,doc.docId).subscribe(data => {
      this.busy = false;
      this.addToFavSuccess(data)
    }, error => {
      this.busy = false;
      this.addToFavFailure()
    });
  }
  addToFavSuccess(res) {
    let message = '';
    let summary = 'Success';
    let severity = 'info';
    switch (res) {
      case 'OK':
        message = 'Document Added To Favorites';
        break;
      case 'Exists':
        message = 'Document Already Exist in Favorites';
        summary = 'Already Exist';
        severity = 'error';
        break;
      case '':
        message = 'Document Added To Favorites';
        break;
    }
    this.growlService.showGrowl({
      severity: severity,
      summary: summary,
      detail: message
    });
  }

  addToFavFailure() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Add To Favorites'
    });
  }
  mailTo(doc) {
    this.busy = true;
    let postdata=[];
    let attachmentMail  = new Attachment();
    attachmentMail.docTitle=doc.docTitle;
    attachmentMail.docId=doc.docId;
    attachmentMail.format=doc.format;
    postdata.push(attachmentMail)

    this.ds.emailDocuments(postdata).subscribe(d=>{
      const file = new Blob([d], { type: 'text/plain' });
      saveAs(file, "mailto.eml");
      this.busy = false;
    }, error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Error Occurred', detail: 'Please try again!'
      });
    });
  }

  updatedAttachment() {
    this.updateddDocuments = new FormData();
    this.updateddDocuments.append('document', this.fileUploaded);
    this.busy = true;
    this.ds.checkOut(this.saveDocInfo.id).subscribe(data => {
      this.busy = false;
      this.checkoutSuccess(data)
    }, Error => {
      this.busy = false;
      this.updateFailed(Error)
    });
    for (const prop of this.saveDocInfo.props) {
      if (prop.dtype === 'DATE') {
        prop.mvalues = [];
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          let datetemp = moment(this.docEditPropForm.get(prop.symName).value, "DD/MM/YYYY").toDate();
          prop.mvalues = [this.getFormatedDate(datetemp)];
        }
      } else if (prop.dtype !== 'DATE') {
        prop.mvalues = [this.docEditPropForm.get(prop.symName).value];
      }
    }
    this.saveDocInfo.format = undefined;
    this.updateddDocuments.append('DocInfo', JSON.stringify(this.saveDocInfo));
  }

  getFormatedDate(value) {
    const date = new Date(value);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  checkoutSuccess(data) {
    this.busy = true;
    this.ds.checkIn(this.updateddDocuments).subscribe(data1 => {
      this.busy = false;
      this.updateSuccess(data1)
    }, Error => {
      this.busy = false;
      this.updateDocCheckInFailed(Error)
    });
  }

  updateSuccess(data) {
    this.docSysProp = [];
    if (data) {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Document Updated Successfully'
      });
      this.editAttachment = false;
      this.closeEditAttModal();
    } else {
      this.updateFailed('error');
    }
    this.fileselected = false;
    this.ngOnInit();
  }

  updateFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: this.errorJson
    });
  }

  updateDocCheckInFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: this.errorJson
    });
    this.ds.cancelCheckOut(this.saveDocInfo.id).subscribe();
  }

  updateEdits() {
    for (const prop of this.saveDocInfo.props) {
      if (prop.dtype === 'DATE') {
        prop.mvalues = [];
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          let datetemp = moment(this.docEditPropForm.get(prop.symName).value, "DD/MM/YYYY").toDate();
          prop.mvalues = [this.getFormatedDate(datetemp)];
        }
      } else if (prop.dtype !== 'DATE') {
        prop.mvalues = [this.docEditPropForm.get(prop.symName).value];
      }
    }
    this.busy = true;
    this.ds.updateProperties(this.saveDocInfo).subscribe(data => {
      this.busy = false;
      this.updateSuccess(data)
    }, err => {
      this.busy = false;
    });
  }

  // editSuccess(data) {
  //   this.docSysProp = [];
  //   if (data) {
  //     this.growlService.showGrowl({
  //       severity: 'info',
  //       summary: 'Success', detail: 'Edited Successful'
  //     });
  //     this.editProperties = false;
  //   } else {
  //     this.editFailed('error');
  //   }
  //   this.ngOnInit();
  // }

  // editFailed(error) {
  //   this.errorJson=JSON.parse(error.error).responseMessage;
  //   this.growlService.showGrowl({
  //     severity: 'error',
  //     summary: 'Failure', detail: this.errorJson
  //   });
  // }
  reset() {
    this.dataTable.reset()
  }
  recallWorkitemConfirmation(event) {
    this.workflowService.validateSentItem(this.sentItemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.confirmationService.confirm({
          message: 'Please note that all sub workitems will be recalled, do you want to recall this workitem?',
          header: 'Recall Confirmation',
          icon: 'ui-icon-help',
          key: 'taskDetailConfirmation',
          accept: () => {
            if (!!this.workflowService.delegateId) {
              this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
                if (res === 'INACTIVE') {
                  this.inactiveDialogMessage = 'Delegated user access has ended';
                  this.showDelegationInactiveDialog = true;
                } else {
                  this.recallWorkitem();
                }
              });
            } else if (!!this.workflowService.roleId) {
              this.us.validateRole(this.workflowService.roleId).subscribe(res => {
                if (res === 'INACTIVE') {
                  this.inactiveDialogMessage = 'Role access has ended';
                  this.showDelegationInactiveDialog = true;
                } else {
                  this.recallWorkitem();
                }
              });
            }
            else {
              this.recallWorkitem();
            }
          },
          reject: () => {
          }
        });
      }
    });
  }

  recallMemoWorkitemConfirmation(event) {
    let selectedWorkitemIds: any[] = [];
    let selectWItemId = 0;

    if (this.fromPage[0] === 'sent' || this.fromPage[0] === 'actioned') {
      this.selectedWi.map((item) => {
        selectedWorkitemIds.push(item.workitemId);
      });
    }
    else
      selectedWorkitemIds[0] = this.workitem.workitemId;
    
    console.log("Memo Recall :: " + selectedWorkitemIds.length + " : " + selectedWorkitemIds[0]);
    if(selectedWorkitemIds && selectedWorkitemIds.length > 1 && !this.showMemoRecallSelectOneDialog )
      this.showMemoRecallSelectOneDialog = true;
    else 
    {
      if(selectedWorkitemIds && selectedWorkitemIds.length == 1)
        selectWItemId = selectedWorkitemIds[0];
      else
        selectWItemId = this.workitem.workitemId;

      this.workflowService.validateWorkitem(selectWItemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else if (res1 === 'ACTIONED' && this.workitem.isMemo === 1) {
          this.showRecallActionedDialog = true;
        } else {
          this.confirmationService.confirm({
            message: 'Please confirm to recall this workitem?',
            header: 'Recall Confirmation',
            icon: 'ui-icon-help',
            key: 'taskDetailConfirmation',
            accept: () => {
              if (!!this.workflowService.delegateId) {
                this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
                  if (res === 'INACTIVE') {
                    this.inactiveDialogMessage = 'Delegated user access has ended';
                    this.showDelegationInactiveDialog = true;
                  } else {
                    this.recallWorkitem();
                  }
                });
              } else if (!!this.workflowService.roleId) {
                this.us.validateRole(this.workflowService.roleId).subscribe(res => {
                  if (res === 'INACTIVE') {
                    this.inactiveDialogMessage = 'Role access has ended';
                    this.showDelegationInactiveDialog = true;
                  } else {
                    this.recallWorkitem();
                  }
                });
              }
              else {
                this.recallWorkitem();
              }
            },
            reject: () => {
            }
          });
        }
      });
    }
  }

  recallProceedAfterAddDelegate() {
    this.recallmodel.empNo = this.currentUser.EmpNo;
    if (this.currentUser.roles.length > 0) {
      this.recallmodel.roleId = this.currentUser.roles[0].id;
    }
    if (this.fromPage[0] === 'sent' || this.fromPage[0] === 'actioned') {
      this.selectedWi.map((item) => {
        this.recallmodel.items.push(item.workitemId);
      });
    } else {
      this.recallmodel.items[0] = this.workitem.workitemId;
    }
    this.busy = true;
    this.workflowService.recallWorkitem(this.recallmodel).subscribe(data => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Recalled Successfully'
      });
      if (this.checkAll || this.isAllItemsChecked()) {
        this.isWorkItemRecalled = true;
        this.previousPage('');
      } else {
        this.getFirstWorkitemDetails();
        this.refresh(event);
        this.isWorkItemRecalled = true;
      }
    }, err => {
      this.busy = false;
    });
    this.recallmodel = new Recall();
  }

  recallWorkitem() {
    if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
      this.assignSecurityForDelegate(cb => {
        this.recallProceedAfterAddDelegate();
      });
    } else {
      this.recallProceedAfterAddDelegate();
    }
  }

  isAllItemsChecked() {
    if (this.selectedWi.length >= this.isWiSenderTotalCount) {
      return true;
    }
    return false;
  }

  resetRouterStrategy() {
    // setTimeout(function(){ this.bs.inboxRefreshRequired.emit('task-detail'); }, 1000);
    // this.router.routeReuseStrategy.shouldReuseRoute = function(){
    //   return false;
    // };
  }

  finishWorkitem(event) {
    this.confirmationService.confirm({
      message: 'Do you want to Finish this workitem?',
      header: 'Finish Confirmation',
      key: 'taskDetailConfirmation',
      accept: () => {
        if (!!this.workflowService.delegateId) {
          this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Delegated user access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              this.validateWorkitemForFinish();
            }
          });
        } else if (!!this.workflowService.roleId) {
          this.us.validateRole(this.workflowService.roleId).subscribe(res => {
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
        // this.bs.inboxRefreshRequired.emit('task-detail');
      },
      reject: () => { }
    });
  }

  validateWorkitemForFinish() {
    this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.busy = true;
        this.workflowService.finishWorkitem(this.workitem.workitemId).subscribe(data => {
          this.busy = false;
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'Finished Successfully'
          });
          this.bs.inboxRefreshRequired.emit('task-detail');
          this.router.navigateByUrl('/workflow/' + this.fromPage[0]);
        }, err => {
          this.busy = false;
        });
        //window.parent.postMessage('FinishSuccess', '*');
      }
    });
  }

  archiveWorkflowConfirmation(event) {
    this.workflowService.validateSentItem(this.sentItemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        this.confirmationService.confirm({
          message: 'Do you want to Archive this Item?',
          header: 'Archive Confirmation',
          key: 'taskDetailConfirmation',
          icon: 'ui-icon-help',
          accept: () => {
            if (!!this.workflowService.delegateId) {
              this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
                if (res === 'INACTIVE') {
                  this.inactiveDialogMessage = 'Delegated user access has ended';
                  this.showDelegationInactiveDialog = true;
                } else {
                  this.archiveWorkflow();
                }
              });
            } else if (!!this.workflowService.roleId) {
              this.us.validateRole(this.workflowService.roleId).subscribe(res => {
                if (res === 'INACTIVE') {
                  this.inactiveDialogMessage = 'Role access has ended';
                  this.showDelegationInactiveDialog = true;
                } else {
                  this.archiveWorkflow();
                }
              });
            } else {
              this.archiveWorkflow();
            }
          },
          reject: () => {
          }
        });
      }
    });
  }

  archiveWorkflow() {
    this.busy = true;
    this.workflowService.archiveSentitem(this.sentItemId).subscribe(data => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Archived Successfully'
      });
      if (this.fromPage[0] === 'inbox' || this.fromPage[0] === 'inbox-new') {
        const selectedInboxTab = this.workflowService.inboxSelectedUserTab.split('@');
        const inboxTabIndex = parseInt(selectedInboxTab[0], 10);
        this.workflowService.archiveSelectedUserTab = inboxTabIndex * 2 + '@' + selectedInboxTab[1] + 'Inbox';
      } else if (this.fromPage[0] === 'sent') {
        const selectedSentTab = this.workflowService.sentSelectedUserTab.split('@');
        const sentTabIndex = parseInt(selectedSentTab[0], 10);
        this.workflowService.archiveSelectedUserTab = (sentTabIndex * 2) + 1 + '@' + selectedSentTab[1] + 'Sent';
      }
      this.workflowService.openedWorkItem = undefined;
      //this.router.navigateByUrl('/workflow/archive');
      //window.parent.postMessage('ArchiveSuccess', '*');
      this.bs.sentRefreshRequired.emit('task-detail');
      this.router.navigateByUrl('/workflow/' + this.fromPage[0]);
    }, err => {
      this.busy = false;
    });
  }

  adduserWorkitem() {
    const wia = new WorkItemAction();
    wia.actions = this.workitem.actions;
    // wia.actionDetails = this.workitem.actionName
    wia.attachments = this.workitem.attachments;
    wia.deadline = this.workitem.deadline;
    wia.id = this.workitem.workitemId;
    wia.instructions = this.workitem.instructions;
    wia.wiRemarks = this.workitem.remarks;
    wia.recipients = this.workitem.recipients;
    wia.workflow = new WorkflowDetails();
    if (!!this.workflowService.delegateId) {
      wia.workflow.delEmpNo = this.currentUser.EmpNo;
    }
    else {
      wia.workflow.delEmpNo = undefined;
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
        if (!this.alreadyExistInRecp(this.workitem.recipients, user)) {
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
        if (!this.alreadyExistInRecp(this.workitem.recipients, user)) {
          wia.recipients.push(user);
        }
      }
    }
    wia.reminder = this.workitem.reminder;
    wia.EMPNo = this.currentUser.EmpNo;
    if (this.currentUser.roles.length > 0) {
      wia.roleId = this.currentUser.roles[0].id
    } else {
      wia.roleId = 0
    }
    // wia.wiAction = this.workitem.actionId
    this.busy = true;
    this.workflowService.addUserWorkitem(wia).subscribe(data => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Added User Successfully'
      });
      //this.populateRecipients();
      this.getFirstWorkitemDetails();
      this.getWorkflowTrack();
    }, err => {
      this.busy = false;
    });
    this.AddUserDialog = false;
    this.addUser.recipients.toList = [];
    this.addUser.recipients.ccList = [];
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

  prepareAdduser(event) {
    console.log(this.workflowService)
    if (!!this.workflowService.delegateId) {
      this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          //this.getOrgRole(true);
          //this.getUserLists();
        }
      });
    } else if (!!this.workflowService.roleId) {
      this.us.validateRole(this.workflowService.roleId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Role access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          //this.getOrgRole(true);
          //this.getUserLists();
        }
      });
    } else {
      //this.getOrgRole(true);
      //this.getUserLists();
      this.workflowService.validateSentItem(this.sentItemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
          this.AddUserDialog = false;
        } else {
          this.AddUserDialog = true;
          // this.router.navigate(['/workflow/launch', 'forward', {id: this.workitem.workitemId}]);
        }
      });
    }
    if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
      this.assignSecurityForDelegate(cb => {
      });
    } else { }
  }

  prepareStepItems() {
    this.userExist(this.addUser.recipients);
  }

  closeAddUserModel() {
    this.addUser.recipients.toList = [];
    this.addUser.recipients.ccList = [];
  }

  cancelAddUserModel() {
    this.AddUserDialog = false;
    this.closeEditAttModal();
  }

  getOrgRole(init) {
    this.tmpRoleTree = [];
    this.addUser.recipients.roles.roleTree = [];
    //const subscription = this.us.getTopRolesList().subscribe(res => {
    //added on 02042019 for showing role list
    this.busy = true;
    this.us.getRolesByType(1, 0).subscribe(res => {
      this.busy = false;
      res.map((head) => {
        this.tmpRoleTree.push({
          label: head.name,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false
        });
      });
      //this.getSubOrgRoles(this.tmpRoleTree[0], init);
      this.addUser.recipients.roles.roleTree = this.tmpRoleTree;
      this.addUser.recipients.roles.roleTree2 = this.tmpRoleTree;
    }, err => {
      this.busy = false;
    });
  }

  searchRoleList() {
    this.addUser.recipients.roles.roleTree = this.addUser.recipients.roles.roleTree2.filter(e => {
      if (e.data.name) {
        e.data.name.toUpperCase().indexOf(this.addUser.recipients.search.roleSearchquery.toUpperCase()) !== -1
      }
    });
  }

  getUserLists() {
    this.distList.lists = [];
    this.busy = true;
    this.us.getUserLists(true).subscribe(res => {
      this.busy = false;
      const remainings = [];
      res.map((l, i) => {
        if (l.id > 1 && l.isGlobal === 'N') {
          this.distList.lists.push(l);
        } else if (l.id > 1 && l.isGlobal === 'Y') {
          this.globalList.lists.push(l);
        } else {
          remainings.push(l);
        }
      });
      this.addUser.recipients.list.userList = remainings;
      this.addUser.recipients.list.userList.push(this.defaultList);
      this.addUser.recipients.list.userList.push(this.distList);
      this.addUser.recipients.list.userList.push(this.globalList);
    }, err => {
      this.busy = false;
    });
  }

  getSubOrgRoles(parent, init) {
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

  getUserSupervisorTree(tmpRoleTree) {
    this.busy = true;
    this.us.getUserSupervisorTree(this.currentUser.EmpNo).subscribe(res => {
      this.busy = false;
      if (res.length > 1) {
        this.setChildren(this.tmpRoleTree[0], res, 1);
      } else {
        this.addUser.recipients.roles.roleTree = tmpRoleTree;
      }
    }, err => {
      this.busy = false;
    });
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
      this.addUser.recipients.roles.roleTree = this.tmpRoleTree;
    }
  }

  forwardWorkitem(event) {
    if (!!this.workflowService.delegateId) {
      this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForForward();
        }
      });
    } else if (!!this.workflowService.roleId) {
      this.us.validateRole(this.workflowService.roleId).subscribe(res => {
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
    window.parent.postMessage('GoToLaunch', '*');
  }

  validateWorkitemForForward() {
    this.callAddMissingPermissions(cb => {
      this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          //this.bs.launchRefreshRequired.emit('Workitem-Action');
          this.router.navigate(['/workflow/launch', 'forward', { id: this.workitem.workitemId }]);
        }
      });
    });
  }

  relaunchProceedAfterAddDelegate() {
    this.callAddMissingPermissions(cb => {
      if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
        this.assignSecurityForDelegate(cb => {
          this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.workitem.workitemId }]);
        });
      } else {
        this.router.navigate(['/workflow/launch', 'reLaunch', { id: this.workitem.workitemId }]);
      }
    });
  }

  relaunchWorkItem(event) {
    this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
      if (res1 === 'INACTIVE') {
        this.showRecallInactiveDialog = true;
      } else {
        if (!!this.workflowService.delegateId) {
          this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Delegated user access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              //this.bs.launchRefreshRequired.emit('Workitem-Action');
              this.relaunchProceedAfterAddDelegate();
            }
          });
        } else if (!!this.workflowService.roleId) {
          this.us.validateRole(this.workflowService.roleId).subscribe(res => {
            if (res === 'INACTIVE') {
              this.inactiveDialogMessage = 'Role access has ended';
              this.showDelegationInactiveDialog = true;
            } else {
              //this.bs.launchRefreshRequired.emit('Workitem-Action');
              this.relaunchProceedAfterAddDelegate();
            }
          });
        } else {
          this.workflowService.validateSentItem(this.sentItemId).subscribe(res1 => {
            if (res1 === 'INACTIVE') {
              this.showRecallInactiveDialog = true;
            } else {
              //this.bs.launchRefreshRequired.emit('Workitem-Action');
              this.relaunchProceedAfterAddDelegate();

            }
          });
          //this.router.navigate(['/workflow/launch', 'reLaunch', {id: this.workitem.workitemId}]);
        }
        window.parent.postMessage('GoToLaunch', '*');
      }
    });
  }

  replyAllWorkitem(event) {
    if (!!this.workflowService.delegateId) {
      this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReplyAll();
        }
      });
    } else if (!!this.workflowService.roleId) {
      this.us.validateRole(this.workflowService.roleId).subscribe(res => {
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
    window.parent.postMessage('GoToLaunch', '*');
  }

  validateWorkitemForReplyAll() {
    this.callAddMissingPermissions(cb => {
      this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          //this.bs.launchRefreshRequired.emit('Workitem-Action');
          this.router.navigate(['/workflow/launch', 'replyAll', { id: this.workitem.workitemId }]);
        }
      });
    });
  }

  replyWorkitem(event) {
    if (!!this.workflowService.delegateId) {
      this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.validateWorkitemForReply();
        }
      });
    } else if (!!this.workflowService.roleId) {
      this.us.validateRole(this.workflowService.roleId).subscribe(res => {
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
    window.parent.postMessage('GoToLaunch', '*');
  }

  validateWorkitemForReply() {
    this.callAddMissingPermissions(cb => {
      this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
        if (res1 === 'INACTIVE') {
          this.showRecallInactiveDialog = true;
        } else {
          //this.bs.launchRefreshRequired.emit('Workitem-Action');
          this.router.navigate(['/workflow/launch', 'reply', { id: this.workitem.workitemId }]);
        }
      });
    });
  }


  editMemo() {
    this.editRemarksVisible = false;
    this.router.navigate(['/workflow/memo', 'edit', { id: this.workitem.memoId, workItemId: this.workitem.workitemId, recipientRoleId: this.workitem.recipientRoleId, memoStep: this.workitem.memoStepname}]);
  }
  // validateWorkitemForAttachementActions(){
  //   let response;
  //  this.workflowService.validateWorkitem(this.workitem.workitemId).subscribe(res1 => {
  //     // res1='ACTIVE';
  //     //    if(res1 === 'INACTIVE'){
  //     //      this.showRecallInactiveDialog = true;
  //     //    }
  //    response=res1;
  //  });
  //  return response;
  //
  // }

  validateWorkitemForAttachementActions() {
    return new Promise(resolve => {
      this.workflowService.validateWorkitem(this.workitem.workitemId)
        .subscribe(
          (data: any) => {
            if (data === 'INACTIVE') {
              this.showRecallInactiveDialog = true;
            }
            resolve(data);
          })
    })
  }

  previousPage(workitem) {
    /*    this.workflowService.validateWorkitem(workitem.workitemId).subscribe(res => {
          if (res === 'INACTIVE') {
            this.showRecallInactiveDialog = true;
          } else {*/
    if (this.workflowService.delegateId && this.workflowService.delegateId > 0) {
      this.us.validateDelegation(this.workflowService.delegateId).subscribe(res => {
        if (res === 'INACTIVE') {
          this.inactiveDialogMessage = 'Delegated user access has ended';
          this.showDelegationInactiveDialog = true;
        } else {
          this.navigateToPreviousPage();
        }
      });
    } else {
      this.navigateToPreviousPage();
    }
    /*      }
        });*/
  }

  navigateToPreviousPage() {
    if ((this.fromPage[0] === 'inbox' || this.fromPage[0] === 'inbox-new') && this.workitem.status && this.workitem.status.includes('New')) {
      this.bs.inboxRefreshRequired.emit('task-detail-read-action');
    } else if (this.fromPage[0] === 'sent' && this.isWorkItemRecalled) {
      this.bs.sentRefreshRequired.emit('sent-feature');
    }
    this.router.navigateByUrl('/workflow/' + this.fromPage[0]);
    //this.location.back();
    this.workflowService.updateInboxCount();
  }

  assignDocumentFolders(data) {
    this.foldersFiledIn = data;
  }

  removeLink(doc) {
    this.headId = doc.head;
    this.busy = true;
    this.ds.removeLink(doc.head, doc.tail).subscribe(data => {
      this.busy = false;
      this.successremoveLink()
    }, err => {
      this.busy = false;
    });
  }

  successremoveLink() {
    this.busy = true;
    this.ds.getLinks(this.headId).subscribe(data => {
      this.busy = false;
      this.assignDocLink(data)
    }, err => {
      this.busy = false;
    });
  }

  showTrackWorkitem(event) {
    if (event.data.details !== 'Launch') {
      this.busy = true;
      this.workflowService.getWorkitem(event.data.workitemId, this.currentUser.EmpNo).subscribe(data => {
        this.busy = false;
        data.priority = this.coreService.getPriorityString(data.priority);
        this.trackWorkitemDetails = data
        console.log(this.trackWorkitemDetails);

      }, err => {
        this.busy = false;
      });
    }
  }

  selectVersion(version) {
    if (this.selectedVersion.id === version.id) {
      this.selectedVersion.id = undefined;
      return;
    }
    const props = [];
    this.selectedVersion.id = version.id;
    this.selectedVersion.props = [];
    if (version.props) {
      version.props.map(p => {
        this.selectedVersion.props.push({ prop: p.desc, value: p.mvalues[0] })
      })
    } else {
      this.busy = true;
      this.ds.getDocument(version.id).subscribe(res => {
        this.busy = false;
        version.props = res.props;
        version.props.map(p => {
          props.push({ prop: p.desc, value: p.mvalues[0] })
        });
        this.selectedVersion.props = props;
      }, err => {
        this.busy = false;
      });
    }
  }

  userExist(recipients) {
    let exist = false;
    if (recipients.toList.length > 0 || recipients.ccList.length > 0) {
      this.workitem.recipients.map((recUser) => {
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
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'User Already Exist'
      });
    }
  }

  getRoleMembers(role) {
    if (!role.members) {
      let RoleNameString = '';
      this.busy = true;
      this.us.getRoleMembers(role.id).subscribe((res: any) => {
        this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        this.busy = false;
      });
    }
  }

  getFirstWorkitemDetails() {
    this.busy = true;
    this.workflowService.getWorkitemDetailsBySentItem(this.sentItemId).subscribe(res => {
      this.busy = false;
      res.priority = this.coreService.getPriorityString(res.priority);
      this.workitem = res;
      // this.workitem.attachments.map(data => {
      //   data.isSign = 1;
      // })
      this.isAllActionsDisabled = this.checkDateForDisableActions(this.workitem.receivedDate);
      this.breadCrumbPath = [{ label: 'Workflow' }];
      if (this.fromPage[0] === 'sent') {
        this.breadCrumbPath.push({ label: 'Outbox', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.workitem.senderRoleName) {
          this.breadCrumbPath.push({ label: this.workitem.senderRoleName });
        } else {
          this.breadCrumbPath.push({ label: this.workitem.senderName });
        }
      } else if (this.fromPage[0] === 'archive') {
        this.breadCrumbPath.push({ label: 'Archive', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.workitem.senderRoleName) {
          this.breadCrumbPath.push({ label: this.workitem.senderRoleName + ' Outbox' });
        } else if (this.workitem.senderName) {
          this.breadCrumbPath.push({ label: this.workitem.senderName + ' Outbox' });
        }
      } else if (this.fromPage[0] === 'actioned') {
        this.breadCrumbPath.push({ label: 'Actioned', routerLink: ['/workflow/' + this.fromPage[0]] });
        if (this.workitem.senderRoleName) {
          this.breadCrumbPath.push({ label: this.workitem.senderRoleName });
        } else {
          this.breadCrumbPath.push({ label: this.workitem.senderName });
        }
      }
      this.breadCrumbPath.push({ label: this.workitem.subject });
      this.breadcrumbService.setItems(this.breadCrumbPath);
    }, err => {
      this.busy = false;
    });
  }

  getWorkflowTrack() {
    this.checkAllDisabled = true;
    this.isAllRecalled = true;
    this.isWiSenderTotalCount = 0;
    this.busy = true;
    this.workflowService.getWorkflowTrack(this.workflowId, this.userType).subscribe(data => {
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

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  columnSelectionChanged(event: any) {
    for (const tableHead of this.trackColHeaders) {
      tableHead.hidden = true;
    }
    for (const column of this.selectedColumns) {
      for (const tableHead of this.trackColHeaders) {
        if (tableHead.field === column) {
          tableHead.hidden = false;
        }
      }
    }
  }

  refresh(event) {
    event.preventDefault();
    event.stopPropagation();
    this.checkAll = false;
    this.selectedWi = [];
    this.getWorkflowTrack();
  }

  headerCheckBoxChecked(event) {
    /*console.log(event);
    console.log(this.selectedRows);
    this.selectedRows.map((item)=>{
      if(!item.isWiSender){
        this.selectedRows.splice(this.selectedRows.indexOf(item),1);
      };
    });*/
  }

  checkboxChecked(event) {
    /*if(!event.data.isWiSender){
      event.originalEvent.checked = false;
      this.selectedRows.splice(this.selectedRows.indexOf(event.data),1);
    }
    console.log(event);
    console.log(this.selectedRows);*/
  }

  checkboxUnchecked(event) {
  }

  rowSelected(event: any) {
    /*if(!event.data.isWiSender){
      event.originalEvent.checked = false;
      this.selectedRows.splice(this.selectedRows.indexOf(event.data),1);
    }*/
  }

  checkBoxChecked(event, action, row?) {
    console.log(event, action, row);

    if (action === 'all') {
      this.selectedWi = [];
      this.workflowTrack.map((item) => {
        item.checked = event ? this.senderId === item.senderId && item.status !== 'Recalled' : false;
        if (event && item.checked) {
          this.selectedWi.push(item);
        }
      });
      if (!event) {
        this.selectedWi = [];
      }
    } else {
      row.checked = event ? this.senderId === row.senderId && row.status !== 'Recalled' : false;
      if (event) {
        this.selectedWi.push(row);
      } else {
        this.selectedWi.splice(this.selectedWi.indexOf(row), 1);
        if (this.checkAll) {
          this.checkAll = false;
        }
      }
    }
    console.log(this.selectedWi);

  }

  reloadApp() {
    this.showDelegationInactiveDialog = false;
    this.showRecallInactiveDialog = false;
    //this.router.navigate(['/workflow']);
    window.parent.postMessage('DelegationEndReload', '*');
  }

  openDocInValidate(att) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data === 'ACTIVE') {
        this.ds.getDocumentInfo(att.docId, 0).subscribe(data => {
          window.open(this.ds.validateDocument(data.id));
        }, err => this.noDocFound(att));
      }
    });
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      //this[k] = null;
      delete this[k];
    })
  }

  openSubTree(doc) {
    this.validateWorkitemForAttachementActions().then((data: any) => {
      if (data === 'ACTIVE') {
        this.callAddMissingPermissions(cb => {
          this.ds.getDocumentInfo(doc.docId, 0).subscribe(data => {
            this.showFileIn = true;
            this.selectedAddDocument = doc;
            this.busy = true;
            this.cs.getTopFolders().subscribe(data => {
              this.busy = false;
              this.assignTreeFolders(data)
            }, err => {
              this.busy = false;
            });
          }, err => this.noDocFound(doc));
        });
      }
    });
  }

  assignTreeFolders(data) {
    const topFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'ui-icon-folder-open',
            'collapsedIcon': 'ui-icon-folder-shared',
            'children': [],
            'leaf': false
          });
        }
        else {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'ui-icon-folder-open',
            'collapsedIcon': 'ui-icon-folder',
            'children': [],
            'leaf': false
          });

        }
      }
    });
    this.addToFolderList = topFolder;
    this.cs.getSubFolders(this.addToFolderList[0].data.id).subscribe(data => this.assignSubFolders(this.addToFolderList[0], data));
  }

  assignSubFolders(parent, data) {
    const subFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'ui-icon-folder-open',
            'collapsedIcon': 'ui-icon-folder-shared',
            'leaf': false
          });
        }
        else {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'ui-icon-folder-open',
            'collapsedIcon': 'ui-icon-folder',
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

  fileIn() {
    this.cs.validateFolderPermissions(this.selectedAddFolder.data.id, "ADD").subscribe(data => this.checkFolderPermission(data, this.selectedAddDocument, this.selectedAddFolder.data.id));
  }

  checkFolderPermission(res, doc, folderId) {
    if (res === true) {
      this.busy = true;
      this.cs.fileInFolder(folderId, doc.docId).subscribe(data => {
        this.busy = false;
        if (data === 'OK') {
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success', detail: 'Document Added To Folder'
          });
        }
        else if (data === 'Exists') {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Already Exist', detail: 'Document Already Exist In Destination Folder'
          });
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Failure', detail: 'Add To Folder Failed'
          });
        }
      }, err => {
        this.busy = false;
      });
    }
    else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'No Permission', detail: 'User dont have permission to add'
      });
    }
  }

  getMemoRemarksById() {
    this.remarksHistory = true
    this.busy = true
    this.memoService.getMemoRemarksById(this.workitem.memoId.toString()).subscribe((res) => {
      this.busy = false
      this.remarksHistory = true
      this.remarksHistoryData = res
    })
  }
  submitForOthers() {
    if (this.workitem.actions == "Comment") {
      this.wiRemarksVisible = true
    } else {
      this.signAndSubmitMemoAsReviewer()
    }
  }

  submitForPreReviewers() {
    console.log("submitForPreReviewers");
    if (this.workitem.actions == "Comments") {
      this.wiRemarksVisible = true
    } else {
      this.signAndSubmitMemoAsReviewer();
    }
  }

  signAndSubmitMemoAsReviewer() {
    var data = this.SignAndSubmitWorkFlowData()
    data.wiRemarks = this.wiActionForReviewer;
    var subFromExists = data.memo.recipients.some((res) => (res.recipientType == "SUB-FROM"));
    var thruExists = data.memo.recipients.some((res) => (res.recipientType == "THRU"));
    var ToExists = data.memo.recipients.some((res) => (res.recipientType == "TO"));

    if (this.workitem.memoStepname == "REVIEWER") {
      data.memo = Object.assign({ routeString: 'APPROVER' }, data.memo);
    }
    else if (this.workitem.memoStepname == "APPROVER") {
      if (subFromExists)
        data.memo = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
      else if (thruExists)
        data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
      else if (ToExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);

      /*   for (let index = 0; index < data.memo.recipients.length; index++) {
          console.log(data.memo.recipients[index].recipientType)
          if (data.memo.recipients[index].recipientType == "FROM")
            continue;
          if (data.memo.recipients[index].recipientType == "SUB-FROM") {
            data.memo = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
            break;
          } else if (data.memo.recipients[index].recipientType == "THRU") {
            data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
            break;
          } else if (data.memo.recipients[index].recipientType == "TO") {
            data.memo = Object.assign({ routeString: 'TO' }, data.memo);
            break;
          } else {
            data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
          }
        } */
    }
    else if (this.workitem.memoStepname == "SUB-FROM") {
      if (thruExists)
        data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
      else if (ToExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);

      /*  for (let index = 0; index < data.memo.recipients.length; index++) {
         console.log(data.memo.recipients[index].recipientType)
         if (data.memo.recipients[index].recipientType == "THRU") {
           data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
           break;
         } else if (data.memo.recipients[index].recipientType == "TO") {
           data.memo = Object.assign({ routeString: 'TO' }, data.memo);
           break;
         } else {
           data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
         }
       } */
    }
    else if (this.workitem.memoStepname == "THRU") {
      var ToActionExists = data.memo.recipients.some((res) => (res.recipientType == "TO" && ((res.action == "Initial") || (res.action == "Signature"))));
      if (ToActionExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
      /* for (let index = 0; index < data.memo.recipients.length; index++) {
        console.log(data.memo.recipients[index].recipientType)
        if (data.memo.recipients[index].recipientType == "TO") {
          data.memo = Object.assign({ routeString: 'TO' }, data.memo);
          break;
        } else {
          data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
        }
      } */
    }
    else if (this.workitem.memoStepname == "TO") {
      data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
    }
    if (this.workitem.actions == 'Signature' || this.workitem.actions == 'Initial') {
      console.log(this.workitem.attachments[0].isSign)
      if (this.workitem.attachments[0].isSign == 1) {
        this.subscription.push(this.ds.verifyESign(this.workitem.attachments[0].docId, this.workitem.workitemId, this.flagInitial).subscribe(res => {
          if (res && res === 'True') {
            this.isesignverified = true;
            this.ESignedAttachments[this.workitem.attachments[0].docId] = true;
            if (this.workitem.actions) {
              this.wiRemarksVisible = true
            } else {
              this.memoService.submitMemo(data).subscribe(res => {
                this.navigateToInbox()
              })
            }
          } else {
            console.log("else")
            this.wiRemarksVisible = false
            this.ESignedAttachments[this.workitem.attachments[0].docId] = false;
            this.isesignverified = false;
            this.openConfirmationDialog = true;
            this.openTheConfirmationDialog = true;
            // this.eSign(this.workitem.attachments[0])
          }
        }));
      }
    }
    else {
      if (this.workitem.actions) {
        this.wiRemarksVisible = true
      } else {
        this.memoService.submitMemo(data).subscribe(res => {
          this.navigateToInbox()
        })
      }
    }

  }
  noDocIdFound(docId) {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Invalid Document', detail: 'This document is either deleted or you dont have permission. Try again!'
    });
    this.workitem.attachments.map((d, i) => {
      if (docId === d.docId) {
        this.strikeIndex = i;
      }
    });
  }
  getTodaysDate() {
    const date = new Date();
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }
  checkDateForUpdateMemo(date) {
    let tempdate = (moment(date).format("DD/MM/YYYY"));
    return moment((tempdate), "DD/MM/YYYY").toDate() < moment(this.getTodaysDate(), "DD/MM/YYYY").toDate();
  }
  viewMemoAttachment(docId: any) {
    this.ds.getDocumentInfo(docId, 0).subscribe(data => {
      window.parent.postMessage({ v1: 'openViewer', v2: data.id }, '*');

    }, err => this.noDocIdFound(docId));
  }
  signAndSubmitMemoAsOthers() {
    console.log("signAndSubmitMemoAsOthers");
    var mdata = this.SignAndSubmitWorkFlowData();
    mdata.wiRemarks = this.wiActionForReviewer? this.wiActionForReviewer: ' ';
    var subFromExists = mdata.memo.recipients.some((res) => (res.recipientType == "SUB-FROM"));
    var thruExists = mdata.memo.recipients.some((res) => (res.recipientType == "THRU"));
    var ToExists = mdata.memo.recipients.some((res) => (res.recipientType == "TO" && (res.action == "Signature" || res.action == "Initial")));
    let isDistribute = false;

    if (this.workitem.memoStepname == "REVIEWER" || this.workitem.memoStepname=='PREP_REVIEW' || this.workitem.memoStepname=='PREP_REVIEW1') {
      mdata.memo = Object.assign({ routeString: 'APPROVER' }, mdata.memo);
    }
    else if (this.workitem.memoStepname == "APPROVER") {
      if(subFromExists)
        mdata.memo = Object.assign({ routeString: 'SUB-FROM' }, mdata.memo);
      else if(thruExists)
        mdata.memo = Object.assign({ routeString: 'THRU' }, mdata.memo);
      else if(ToExists)
        mdata.memo = Object.assign({ routeString: 'TO' }, mdata.memo);
      else{
        isDistribute = true;
        mdata.memo = Object.assign({ routeString: 'Distribute' }, mdata.memo);
      }
    }
    else if (this.workitem.memoStepname == "SUB-FROM") {
      if(thruExists)
        mdata.memo = Object.assign({ routeString: 'THRU' }, mdata.memo);
      else if(ToExists)
        mdata.memo = Object.assign({ routeString: 'TO' }, mdata.memo);
      else{
        isDistribute = true;
        mdata.memo = Object.assign({ routeString: 'Distribute' }, mdata.memo);
      }
    }
    else if (this.workitem.memoStepname == "THRU") {
      var ToActionExists = mdata.memo.recipients.some((res) => (res.recipientType == "TO" && ((res.action == "Initial") || (res.action == "Signature"))));
      if(ToActionExists)
        mdata.memo = Object.assign({ routeString: 'TO' }, mdata.memo);
      else{
        isDistribute = true;
        mdata.memo = Object.assign({ routeString: 'Distribute' }, mdata.memo);
      }
    }
    else if (this.workitem.memoStepname == "TO") {
      isDistribute = true;
      mdata.memo = Object.assign({ routeString: 'Distribute' }, mdata.memo);
    }

    if (this.workitem.actions == 'Signature' || this.workitem.actions == 'Initial') {
      
      this.isMemoDateChange = this.checkDateForUpdateMemo(mdata.memo.memoDate);
      var memoAttachmentIndex = -1;

      this.ds.getDocumentInfo(mdata.memo.memoDocId, 0).subscribe(data => {
        this.docVsId = data.vsid;
        this.curVerMemoDocId = data.id;
        console.log("getDocumentInfo MemoDocId :: " + this.curVerMemoDocId);
      
        if(!this.curVerMemoDocId || this.curVerMemoDocId == null || this.curVerMemoDocId == undefined)
          this.curVerMemoDocId = '123';
        console.log("cur Ver MemoDocId :: " + this.curVerMemoDocId);
        this.workitem.attachments.map((d, i) => {
            if (d.docId === mdata.memo.memoDocId || d.docId === this.curVerMemoDocId) {
              memoAttachmentIndex = i;
            } 
          });
  
        if(memoAttachmentIndex < 0)
          memoAttachmentIndex= this.workitem.attachments.findIndex((res: any) => (res.docId == mdata.memo.memoDocId || res.docId === this.curVerMemoDocId));
  
        if(memoAttachmentIndex < 0)
          memoAttachmentIndex = 0;
        
        console.log("First attachment isSign :: " + this.workitem.attachments[0].isSign);
        console.log("memoAttachmentIndex :: " + memoAttachmentIndex );
        if (this.workitem.attachments[memoAttachmentIndex].isSign == 1) {
          var eSigndocId = this.workitem.attachments[memoAttachmentIndex].docId;
          this.callAddMissingPermissions(cb => {
            this.subscription.push(this.ds.verifyESign(eSigndocId, this.workitem.workitemId, this.flagInitial).subscribe(res => {
              if (res && res === 'True') {
                this.isesignverified = true;
                this.ESignedAttachments[this.workitem.attachments[memoAttachmentIndex].docId] = true;
                this.confirmationService.confirm({
                  message: 'Please confirm to proceed for Submit with Auto-eSign of memo attachment and date update?',
                  header: 'Submit Confirmation',
                  icon: 'ui-icon-help',
                  key: 'taskDetailConfirmation',
                  accept: () => {
                    if(this.isMemoDateChange){
                      mdata.memo.memoDate = moment(new Date()).format("DD-MM-YYYY hh:mm a");
                      this.eSignForDate(this.workitem.attachments[memoAttachmentIndex], mdata.memo.memoDate, mdata.memo.id, 1);
                    }
                    this.busy = true;

                    if(this.signDocCount > this.signedDocCount)
                    {
                      this.openConfirmationDialog = true;
                      this.openTheConfirmationDialog = true;
                    }
                    else{
                      var self = this;
                      setTimeout(() => {
                        self.busy = true;
                        self.memoService.getMemoById(self.workitem.memoId.toString()).subscribe(res => {
                          self.memoDetails = res;
                          self.callAddMissingPermissions(cb => {
                            self.memoService.submitMemo(mdata).subscribe(res => {
                              self.busy = false;
                              self.confirmationService.confirm({
                                message: 'To view signed memo document, click Yes',
                                header: 'Successfully Completed',
                                icon: 'ui-icon-help',
                                key: 'taskDetailConfirmation',
                                accept: () => {
                                  self.viewMemoAttachment(eSigndocId);
                                  setTimeout(() => {
                                    self.navigateToInbox();
                                  }, 3000);
                                },
                                reject: () => { 
                                  self.navigateToInbox();
                                }
                              });
                            }, error => {
                              self.busy = false;
                            });
                          });
                        }, error => {
                          self.busy = false;
                        });
                      }, 4000);
                    }
                  },
                  reject: () => { }
                });
              } else {
                this.wiRemarksVisible = false;
                this.ESignedAttachments[this.workitem.attachments[memoAttachmentIndex].docId] = false;
                this.isesignverified = false;
                this.confirmationService.confirm({
                  message: 'Please confirm to proceed for Submit with Auto-eSign of memo attachment and date update?',
                  header: 'Submit Confirmation',
                  icon: 'ui-icon-help',
                  key: 'taskDetailConfirmation',
                  accept: () => {
                    this.eSign(this.workitem.attachments[memoAttachmentIndex], 0, 1);
                    var self = this;
                    let timer = setInterval(function () {
                      var docId = self.workitem.attachments[memoAttachmentIndex].docId;
                      self.eSignDialog = true;
                      self.isesignCancelDisabled = true;
                      self.subscriptionEsign = self.ds.verifyESignStatusService(docId, self.workitem.workitemId, self.flagInitial).subscribe((data) => {
                          if (data && data === 'SIGNED') {
                            clearInterval(timer);
                            self.eSignDialog = false;
                            this.signedDocCount++;
                            if(self.isMemoDateChange){
                              mdata.memo.memoDate = moment(new Date()).format("DD-MM-YYYY hh:mm a");
                              self.eSignForDate(self.workitem.attachments[memoAttachmentIndex], mdata.memo.memoDate, mdata.memo.id, 1);
                            }
                            if(this.signDocCount > this.signedDocCount)
                            {
                              this.openConfirmationDialog = true;
                              this.openTheConfirmationDialog = true;
                            }
                            else
                            {
                              self.busy = true;
                              setTimeout(() => {
                                self.busy = true;
                                self.memoService.getMemoById(self.workitem.memoId.toString()).subscribe(res => {
                                  self.memoDetails = res;
                                  self.callAddMissingPermissions(cb => {
                                    self.memoService.submitMemo(mdata).subscribe(res => {
                                      self.busy = false;
                                      self.confirmationService.confirm({
                                        message: 'To view signed memo document, click Yes',
                                        header: 'Successfully Completed',
                                        icon: 'ui-icon-help',
                                        key: 'taskDetailConfirmation',
                                        accept: () => {
                                          self.viewMemoAttachment(eSigndocId);
                                          setTimeout(() => {
                                            self.navigateToInbox();
                                          }, 3000);
                                        },
                                        reject: () => { 
                                            this.navigateToInbox();
                                        }
                                      });
                                    }, error => {
                                      self.busy = false;
                                    });
                                  });
                                }, error => {
                                  self.busy = false;
                                });
                                
                              }, 3000);
                            }
                          } else if (data && data === 'FAILED') {
                              self.growlService.showGrowl({
                                severity: 'error',
                                summary: 'Failure', detail: 'Cancelled or Error while signing'
                              });
                              clearInterval(timer);
                              self.eSignDialog = false;
                          } else if (data && data === 'PENDING') {
                              self.isesignCancelDisabled = false;
                          }
                        }, err => { });
        
                      }, 2000);
                  },
                  reject: () => { }
                });
                //this.openConfirmationDialog = true;
                //this.openTheConfirmationDialog = true;
              }
            }));
          });
        }
      });
    }
    else {
      if (this.workitem.actions) {
        this.wiRemarksVisible = true;
      } else {
        this.busy = true;
        this.callAddMissingPermissions(cb => {
          this.memoService.submitMemo(mdata).subscribe(res => {
            this.navigateToInbox();
          }, error => {
            this.busy = false;
          });
        });
        this.busy = false;
      }
    }
   
  }
  submitAfterEsign(type: any) {
    var data = this.SignAndSubmitWorkFlowData()
    data.wiRemarks = this.wiActionForReviewer;

    var subFromExists = data.memo.recipients.some((res) => (res.recipientType == "SUB-FROM"));
    var thruExists = data.memo.recipients.some((res) => (res.recipientType == "THRU"));
    var ToExists = data.memo.recipients.some((res) => (res.recipientType == "TO"));

    if (this.workitem.memoStepname == "REVIEWER") {
      data.memo = Object.assign({ routeString: 'APPROVER' }, data.memo);
    }
    else if (this.workitem.memoStepname == "APPROVER") {

      if (subFromExists)
        data.memo = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
      else if (thruExists)
        data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
      else if (ToExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);

      /*   for (let index = 0; index < data.memo.recipients.length; index++) {
          console.log(data.memo.recipients[index].recipientType)
          if (data.memo.recipients[index].recipientType == "FROM")
            continue;
          if (data.memo.recipients[index].recipientType == "SUB-FROM") {
            data.memo = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
            break;
          } else if (data.memo.recipients[index].recipientType == "THRU") {
            data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
            break;
          } else if (data.memo.recipients[index].recipientType == "TO") {
            data.memo = Object.assign({ routeString: 'TO' }, data.memo);
            break;
          } else {
            data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
          }
        } */
    }
    else if (this.workitem.memoStepname == "SUB-FROM") {

      if (thruExists)
        data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
      else if (ToExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);

      /*  for (let index = 0; index < data.memo.recipients.length; index++) {
         console.log(data.memo.recipients[index].recipientType)
         if (data.memo.recipients[index].recipientType == "THRU") {
           data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
           break;
         } else if (data.memo.recipients[index].recipientType == "TO") {
           data.memo = Object.assign({ routeString: 'TO' }, data.memo);
           break;
         } else {
           data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
         }
       } */
    }
    else if (this.workitem.memoStepname == "THRU") {
      if (ToExists)
        data.memo = Object.assign({ routeString: 'TO' }, data.memo);
      else
        data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
      /* for (let index = 0; index < data.memo.recipients.length; index++) {
        console.log(data.memo.recipients[index].recipientType)
        if (data.memo.recipients[index].recipientType == "TO") {
          data.memo = Object.assign({ routeString: 'TO' }, data.memo);
          break;
        } else {
          data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
        }
      } */
    }
    else if (this.workitem.memoStepname == "TO") {
      data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
    }
    /* if (this.workitem.memoStepname == "REVIEWER") {
      data.memo = Object.assign({ routeString: 'APPROVER' }, data.memo);
    } 
    else if (this.workitem.memoStepname == "APPROVER") {
      for (let index = 0; index < data.memo.recipients.length; index++) {
        console.log(data.memo.recipients[index].recipientType)
        if (data.memo.recipients[index].recipientType == "SUB-FROM") {
          data.memo = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
          break;
        } else if (data.memo.recipients[index].recipientType == "THRU") {
          data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
          break;
        } else if (data.memo.recipients[index].recipientType == "TO") {
          data.memo = Object.assign({ routeString: 'TO' }, data.memo);
          break;
        } else {
          data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
        }
      }
    }
    else if (this.workitem.memoStepname == "SUB-FROM") {
      for (let index = 0; index < data.memo.recipients.length; index++) {
        console.log(data.memo.recipients[index].recipientType)
        if (data.memo.recipients[index].recipientType == "THRU") {
          data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
          break;
        } else if (data.memo.recipients[index].recipientType == "TO") {
          data.memo = Object.assign({ routeString: 'TO' }, data.memo);
          break;
        } else {
          data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
        }
      }
    }
    else if (this.workitem.memoStepname == "THRU") {
      for (let index = 0; index < data.memo.recipients.length; index++) {
        console.log(data.memo.recipients[index].recipientType)
        if (data.memo.recipients[index].recipientType == "TO") {
          data.memo = Object.assign({ routeString: 'TO' }, data.memo);
          break;
        } else {
          data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
        }
      }
    }
    else if (this.workitem.memoStepname == "TO") {
      data.memo = Object.assign({ routeString: 'Distribute' }, data.memo);
    } */

    if (type == "eSign") {
      if (this.workitem.actions) {
        this.wiRemarksVisible = true
      } else {
        this.memoService.submitMemo(data).subscribe(res => {
          this.navigateToInbox();
        })
      }
    } else {
      this.memoService.submitMemo(data).subscribe(res => {
        this.navigateToInbox();
      })
    }
  }

  signAndSubmitMemo() {
    console.log("signAndSubmitMemo");
    var mdata = this.SignAndSubmitWorkFlowData();
    //console.log(data)
    var routeString;
    var subFromExists = mdata.memo.recipients.some((res) => (res.recipientType == "SUB-FROM"));
    var thruExists = mdata.memo.recipients.some((res) => (res.recipientType == "THRU"));
    var ToExists = mdata.memo.recipients.some((res) => (res.recipientType == "TO" && (res.action == "Signature" || res.action == "Initial")));

    if (this.workitem.memoStepname == "APPROVER") {
      if(subFromExists)
        routeString = 'SUB-FROM';
      else if(thruExists)
        routeString = 'THRU'
      else if(ToExists)
        routeString = 'TO'
      else
        routeString = 'Distribute'
    }
    mdata.memo = Object.assign({ routeString: routeString }, mdata.memo);

    this.isMemoDateChange = this.checkDateForUpdateMemo(mdata.memo.memoDate);
  
    var memoAttachmentIndex = -1;
    //console.log("Input MemoDocId :: " + mdata.memo.memoDocId);
    //this.getDocumentDetails(mdata.memo.memoDocId);
    this.ds.getDocumentInfo(mdata.memo.memoDocId, 0).subscribe(data => {
      this.docVsId = data.vsid;
      this.curVerMemoDocId = data.id;
     // console.log("getDocumentInfo MemoDocId :: " + this.curVerMemoDocId);
      if(!this.curVerMemoDocId || this.curVerMemoDocId == null || this.curVerMemoDocId == undefined)
        this.curVerMemoDocId = '123';
      //console.log("cur Ver MemoDocId :: " + this.curVerMemoDocId);
      this.workitem.attachments.map((d, i) => {
          if (d.docId === mdata.memo.memoDocId || d.docId === this.curVerMemoDocId) {
            memoAttachmentIndex = i;
          } /* else if(d.isSign == 1 && memoAttachmentIndex == -1){
            memoAttachmentIndex = i;
          } */
        });

      if(memoAttachmentIndex < 0)
        memoAttachmentIndex= this.workitem.attachments.findIndex((res: any) => (res.docId == mdata.memo.memoDocId || res.docId === this.curVerMemoDocId));

      if(memoAttachmentIndex < 0)
        memoAttachmentIndex = 0;
      
      console.log("First attachment isSign :: " + this.workitem.attachments[0].isSign);
      console.log("memoAttachmentIndex :: " + memoAttachmentIndex );

      if (this.workitem.attachments[memoAttachmentIndex].isSign == 1) {
        var eSigndocId = this.workitem.attachments[memoAttachmentIndex].docId;
        this.callAddMissingPermissions(cb => {
          this.subscription.push(this.ds.verifyESign(eSigndocId, this.workitem.workitemId, this.flagInitial).subscribe(res => {
            if (res && res === 'True') {
              this.isesignverified = true;
              this.ESignedAttachments[eSigndocId] = true;
              this.confirmationService.confirm({
                message: 'Please confirm to proceed for Submit with Auto-eSign of memo attachment and date update?',
                header: 'Submit Confirmation',
                icon: 'ui-icon-help',
                key: 'taskDetailConfirmation',
                accept: () => {
                  if(this.isMemoDateChange){
                    mdata.memo.memoDate = moment(new Date()).format("DD-MM-YYYY hh:mm a");
                    this.eSignForDate(this.workitem.attachments[memoAttachmentIndex], mdata.memo.memoDate, mdata.memo.id, 1);
                  }

                  if(this.signDocCount > this.signedDocCount)
                  {
                    this.openConfirmationDialog = true;
                    this.openTheConfirmationDialog = true;
                  }
                  else{
                    this.busy = true;
                    var self = this;
                    setTimeout(() => {
                      self.busy = true;
                      self.memoService.getMemoById(self.workitem.memoId.toString()).subscribe(res => {
                        self.memoDetails = res;
                        self.callAddMissingPermissions(cb => {
                          self.memoService.submitMemo(mdata).subscribe(res => {
                            self.busy = false;
                            self.confirmationService.confirm({
                              message: 'To view signed memo document, click Yes',
                              header: 'Successfully Completed',
                              icon: 'ui-icon-help',
                              key: 'taskDetailConfirmation',
                              accept: () => {
                                self.viewMemoAttachment(eSigndocId);
                                setTimeout(() => {
                                  self.navigateToInbox();
                                }, 3000);
                              },
                              reject: () => { 
                                self.navigateToInbox();
                              }
                            });
                          }, error => {
                            self.busy = false;
                          });
                        });
                      }, error => {
                        self.busy = false;
                      });
                    }, 4000);
                  }
                  // if (this.workitem.actions) {
                  //   this.wiRemarksVisible = true;
                  // } else {
                  //   this.busy = true;
                  //   this.memoService.submitMemo(data).subscribe(res => {
                  //     this.busy = false;
                  //     this.navigateToInbox();
                  //   }, error => {
                  //     this.busy = false;
                  //   });
                  // }
                },
                reject: () => { }
              });
              
            } else {
              this.wiRemarksVisible = false;
              this.ESignedAttachments[this.workitem.attachments[memoAttachmentIndex].docId] = false;
              this.isesignverified = false;
              //this.openConfirmationDialog = true;
              //this.openTheConfirmationDialog = true;
              
              //this.eSign(this.workitem.attachments[0])
              //Abhishek 20.July.2023
              //this.submitConfirmationDialog = true;
              //this.submitTheConfirmationDialog = true;
              this.confirmationService.confirm({
                message: 'Please confirm to proceed for Submit with Auto-eSign of memo attachment and date update?',
                header: 'Submit Confirmation',
                icon: 'ui-icon-help',
                key: 'taskDetailConfirmation',
                accept: () => {
                  this.eSign(this.workitem.attachments[memoAttachmentIndex], 0, 1);
                  var self = this;
                  let timer = setInterval(function () {
                    var docId = self.workitem.attachments[memoAttachmentIndex].docId;
                    self.eSignDialog = true;
                    self.isesignCancelDisabled = true;
                    self.subscriptionEsign = self.ds.verifyESignStatusService(docId, self.workitem.workitemId, self.flagInitial).subscribe((data) => {
                        if (data && data === 'SIGNED') {
                          clearInterval(timer);
                          self.eSignDialog = false;
                          this.signedDocCount++;
                          if(self.isMemoDateChange){
                            mdata.memo.memoDate = moment(new Date()).format("DD-MM-YYYY hh:mm a");
                            self.eSignForDate(self.workitem.attachments[memoAttachmentIndex], mdata.memo.memoDate, mdata.memo.id, 1);
                          }

                          if(this.signDocCount > this.signedDocCount)
                          {
                            this.openConfirmationDialog = true;
                            this.openTheConfirmationDialog = true;
                          }
                          else{
                            self.busy = true;
                            setTimeout(() => {
                              self.busy = true;
                              self.memoService.getMemoById(self.workitem.memoId.toString()).subscribe(res => {
                                self.memoDetails = res;
                                self.callAddMissingPermissions(cb => {
                                  self.memoService.submitMemo(mdata).subscribe(res => {
                                    self.busy = false;
                                    self.confirmationService.confirm({
                                      message: 'To view signed memo document, click Yes',
                                      header: 'Successfully Completed',
                                      icon: 'ui-icon-help',
                                      key: 'taskDetailConfirmation',
                                      accept: () => {
                                        self.viewMemoAttachment(eSigndocId);
                                        setTimeout(() => {
                                          self.navigateToInbox();
                                        }, 3000);
                                      },
                                      reject: () => { 
                                          this.navigateToInbox();
                                      }
                                    });
                                  }, error => {
                                    self.busy = false;
                                  });
                                });
                              }, error => {
                                self.busy = false;
                              });
                              
                            }, 3000);
                          }
                          /* if (self.workitem.actions) {
                            self.wiRemarksVisible = true;
                          } else {
                            self.busy = true;
                            self.callAddMissingPermissions(cb => {
                              self.memoService.submitMemo(data).subscribe(res => {
                                self.busy = false;
                                self.navigateToInbox();
                              }, error => {
                                self.busy = false;
                              });
                            });
                          } */
                        } else if (data && data === 'FAILED') {
                            self.growlService.showGrowl({
                              severity: 'error',
                              summary: 'Failure', detail: 'Cancelled or Error while signing'
                            });
                            clearInterval(timer);
                            self.eSignDialog = false;
                        } else if (data && data === 'PENDING') {
                            self.isesignCancelDisabled = false;
                        }
                      }, err => { });
      
                    }, 2000);
                },
                reject: () => { }
              });
            }
          }));
        });
      }
      else{
        if (this.workitem.actions) {
          this.wiRemarksVisible = true;
        } else {
          this.busy = true;
          this.callAddMissingPermissions(cb => {
            this.memoService.submitMemo(mdata).subscribe(res => {
              this.busy = false;
              this.navigateToInbox();
            }, error => {
              this.busy = false;
            });
          });
        }
      }
    });  
  }
  ok() {
    this.openConfirmationDialog = false;
    this.openTheConfirmationDialog = false;
  }
  navigateToInbox() {
    this.bs.inboxRefreshRequired.emit('inbox-feature');
    this.router.navigate(['/workflow/inbox']);
    window.parent.postMessage('GoToInbox', '*');
  }
  cancelSignAndSubmit() {
    this.openConfirmationDialog = false;
    this.openTheConfirmationDialog = false;
  }
  submitForReview() {
    var data: any = this.SignAndSubmitWorkFlowData()
    data = Object.assign({ memo: this.memoDetails }, data);
    this.busy = true;
    data.memo = Object.assign({ routeString: 'Reviewer' }, data.memo);
    console.log(data)
    this.memoService.submitMemo(data).subscribe(res => {
      console.log(res)
      this.busy = false;
      this.navigateToInbox();
    })
  }
  SignAndSubmitWorkFlowData(isReply?) {
    const user = this.us.getCurrentUser();
    let replyAttachmentData: any[] = [];
    if (isReply) {
      const sender = { actionType: 'TO', id: 0, name: '', userName: '', userType: '' };
      if (this.workitem.senderName) {
        sender.id = this.workitem.senderEMPNo;
        sender.name = this.workitem.senderName;
        sender.userName = this.workitem.senderLoginName;
        sender.userType = 'USER';

      } else if (this.workitem.senderRoleName) {
        sender.id = this.workitem.senderRoleId;
        sender.name = this.workitem.senderRoleName;
        sender.userName = this.workitem.senderRoleADName;
        sender.userType = 'ROLE';
      }

      this.workitem.actions = 'Signature';
      this.replyRecipients.toList.push(sender);

      console.log("Reply memo docid = " + this.memoDetails.memoDocId);
      this.workitem.attachments.map((d, i) => {
        console.log("Reply workitem docid = " + d.docId + " || Count i = " + i);
        if (d.docId === this.memoDetails.memoDocId) {
          d.isSign = 1;
        }
        replyAttachmentData.push({
          id: d.id,
          docId: d.docId,
          docTitle: d.docTitle,
          format: d.format,
          ecmNo: d.ecmNo,
          vsid: d.vsid,
          isSign: d.isSign,
          wfId: d.wfId,
          witemId: d.witemId
        })
      });
    }

    let workFLowData
    return workFLowData = {
      EMPNo: user.EmpNo,
      actionDetails: '',
      actions: this.workitem.actions,
      deadline: null,
      draft: false,
      draftId: 0,
      id: this.workitem.workitemId,
      workflowId: this.workitem.workflowId, ////WorkFlowId
      instructions: this.workitem.instructions,
      priority: this.workitem.priority == 'Normal' ? 2 : 3,
      reminder: null,
      roleId: this.workitem.recipientRoleId,
      wiAction: 'Submit Memo',
      wiRemarks: this.workitem.wiRemarks,
      recipients: (isReply ? this.replyRecipients.toList : this.workitem.recipients),
      attachments: (isReply ? replyAttachmentData : this.workitem.attachments),
      memo: this.memoDetails,
      workflow: {
        ECMNo: this.workitem.ECMNo,
        isMemo: 1,
        contractNo: 0,
        delEmpNo: 0,
        docDate: 1452364200000,
        docRecDate: 1452364200000,
        empNo: user.EmpNo,
        isDeadlineEnabled: false,
        memoId: this.workitem.memoId,
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
  addWiAction() {
    this.submitAfterEsign("wiAction");
  }
  addWiActionForReturn() {
    var data = this.SignAndSubmitWorkFlowData(true);
    console.log(data)
    data.wiRemarks = this.wiActionForReviewer
    if (this.workitem.memoStepname == 'APPROVER') {
      data.memo = Object.assign({ routeString: 'COMPOSER' }, data.memo);
    }
    else if (this.workitem.memoStepname == 'REVIEWER') {
      data.memo = Object.assign({ routeString: 'APPROVER' }, data.memo);
    }
    else if (this.workitem.memoStepname == 'SUB-FROM') {
      data.memo = Object.assign({ routeString: 'REVIEWER' }, data.memo);
    }
    else if (this.workitem.memoStepname == 'THRU') {
      data = Object.assign({ routeString: 'SUB-FROM' }, data.memo);
    }
    else if (this.workitem.memoStepname == 'TO') {
      data.memo = Object.assign({ routeString: 'THRU' }, data.memo);
    }
    this.memoService.returnMemo(data).subscribe(res => {
      this.busy = false;
      this.replysuccess()
    }, error => {
      this.busy = false;
      this.replyfailed()
    });
  }
  replysuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Reply Success'
    });
    this.navigateToInbox();
  }
  replyfailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Reply Failed - Please check attachments or recipients are valid'
    });
  }
  ngOnDestroy() {
    let rType = "CC";
    if (this.workitem.memoStepname == "APPROVER") {
      rType = "FROM"
    } else if (this.workitem.memoStepname == "REVIEWER") {
      rType = "REV"
    } else if (this.workitem.memoStepname == "SUB-FROM") {
      rType = "SUB-FROM"
    } else if (this.workitem.memoStepname == "THRU") {
      rType = "THRU"
    } else if (this.workitem.memoStepname == "TO") {
      rType = "TO"
    }

    let userId = this.workitem.recipientEMPNo;
    let userType = "USER";
    if (this.workitem.recipientRoleId !== 0) {
      userId = this.workitem.recipientRoleId;
      userType = "ROLE";
    }

    if (this.workitem.memoId && this.workitem.memoId > 0 && rType != "CC") {
      this.memoService.unLockMemo(this.workitem.memoId, this.workitem.workflowId, rType, userType, userId).subscribe(res => {

      })
    }

    for (let subs of this.subscription) {
      subs.unsubscribe();
    }
    this.subscription = null;
    this.esignEnabled = false;
    this.attach_url = null;
    this.current_url = null;
    this.displayIframe = false;
    this.workitemHistory = [];
    this.workitem = null;
    this.empNo = null;
    this.roleId = null;
    this.flagInitial = null;
    this.docId = null;
    this.docInfo = [];
    this.docVersion = [];
    this.docHistory = [];
    this.linkedDocuments = [];
    this.docSecurity = [];
    this.docSysProp = null;
    this.noLink = false;
    this.saveDocInfo = null;
    this.fileselected = false;
    this.fileUploaded = null;
    this.trackWorkitemDetails = undefined;
    this.displayProgress = false;
    this.ESignedAttachments = [];
    this.eSignDialog = false;
    this.showDelegationInactiveDialog = false;
    this.showRecallInactiveDialog = false;
    this.AddUserDialog = false;
    this.editAttachment = false;
    this.isesignverified = false;
    this.displayinfo = false;
    this.checkAll = false;
    this.checkAllDisabled = true;
    this.destroyKeys();
    this.isWorkItemRecalled = false;
    this.isAllActionsDisabled = false;
    this.isesignCancelDisabled = true;
    this.showFileIn = false;

  }
}