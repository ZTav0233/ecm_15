import {
  Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, OnChanges
} from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { Subscription } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { BrowserEvents } from '../../../services/browser-events.service';
import { DocumentSecurityModel } from '../../../models/document/document-security.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { WorkflowService } from '../../../services/workflow.service';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/user.service';
import { CoreService } from "../../../services/core.service";
import { GrowlService } from "../../../services/growl.service";
import { WorkitemDetails } from "../../../models/workflow/workitem-details.model";
import { ContentService } from '../../../services/content.service';
import { Table } from 'primeng/table';
import * as _ from 'lodash';
interface Column {
  field: string;
  header: string;
  hidden:boolean;
  sortField:string;
}
@Component({
  selector: 'data-table',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})

export class DataTableComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dt') dataTable!: Table;
  @Input() public tableData: any[];
  @Input() public colHeaders: any[];
  @Input() public showInfoIcon: any;
  @Input() public showDownloadIcon: any = false;
  @Input() public showCount: any = false;
  @Input() public showAddCartIcon: any = false;
  @Input() public showCheckBox: any = true;
  @Input() public itemsPerPage: any;
  @Input() public rowExpandable: any;
  @Input() public totalRecords: any;
  @Input() public totalCount: any;
  @Input() public showProgressBtn = false;
  @Input() public lazy = false;
  @Input() public emptyMessage: any;
  @Input() public activePage: any;
  @Input() public userType: any;
  @Input() public userId: any;
  @Input() public selectedRows: any;
  @Input() public rowGroupMode: any;
  @Input() public groupField: any;
  @Input() public defaultSortField: string;
  @Input() public rowTrackBy: any;
  @Input() public tabNameIdentifier: any;
  @Input() public sortOrder: number = -1;
  @Input() public expandedRowsGroups: string[];
  @Input() public expandedRowsGroupsSubTotal = [];
  @Input() public workflowFilter = false;
  @Input() public isSelectedRoleInActive: any = false;
  @Input() public isLoadButtonDisabled: any = false;
  @Output() sendData = new EventEmitter();
  @Output() addToCart = new EventEmitter();
  @Output() download = new EventEmitter();
  @Output() toggleProgressDialogue = new EventEmitter();
  @Output() toggleTrackSentitem = new EventEmitter();
  @Output() sendSortPagination = new EventEmitter();
  @Output() filteredGridItemsToExport = new EventEmitter();
  @Output() sendPaginationInfoSearch = new EventEmitter();
  /*private sortOrder: number = -1;*/
  public docInfo: DocumentInfoModel[];
  public docVersion: DocumentInfoModel[];
  public docHistory: DocumentInfoModel[];
  public linkedDocuments: DocumentInfoModel[];
  public docSecurity: DocumentSecurityModel[];
  public linkedDocument = []
  public docSysProp: any;
  private noLink = false;
  public selectedVersion: any = { props: [] };
  viewDocTitle: any;
  headId: any;
  foldersFiledIn: any;
  public attach_url: SafeResourceUrl;
  // public selectedRows: any;
  public rowSelectionMode: string;
  public resizableColumns: boolean;
  public reorderableColumns: boolean;
  public enableGlobalFilter = true;
  private subscriptions: Subscription[] = [];
  private pageUrl: any;
  viewer = false;
  displayinfo = false;
  islinked = false;
  isDocTrack = false;
  notWorkflow = false;
  docTitle: any;
  public user = new User();
  public fromPage: any;
  isViewerClick = false;
  showIframe = false;
  @Output() refreshScreen = new EventEmitter();
  @Output() viewDraftItems = new EventEmitter();
  public sentitemWorkitems: any;
  public docTrack: any[] = [];
  public showTrack = false;
  public workitemHistory: any;
  public trackWorkitemDetails: WorkitemDetails;
  public trackColHeaders: any[];
  public busy: boolean;
  first: any = 0;
  public showDelegationInactiveDialog = false;
  public reportPage = false;
  @ViewChild('dt') unGroupedTableRef: ElementRef;
  @ViewChild('gdt') groupedTableRef: ElementRef;
  @ViewChild('infoDialog') infoDialogRef: ElementRef;
  @ViewChild('infoLinkedDialog') infoLinkedDialog: ElementRef;
  @ViewChild('infoTrackDialog') infoTrackDialog: ElementRef;
  @ViewChild('viewerDialog') viewerDialogRef: ElementRef;
  @ViewChild('showTrackDialog') showTrackDialogRef: ElementRef;
  @ViewChild('delegationMsgDialog') delegationMsgDialogRef: ElementRef;
  @ViewChild('gb') searchInput: ElementRef;
  selectedDraftId: any
  public pages = [];
  public goToPage = 1;
  filterInput: any;
  isFlag: boolean = false;
  displayBasic: boolean;
  cols!: Column[];
  constructor(private ds: DocumentService, private sanitizer: DomSanitizer, public router: Router, private bs: BrowserEvents,
    private us: UserService, private coreService: CoreService,
    private ws: WorkflowService, private confirmationService: ConfirmationService, private contentService: ContentService,
    private growlService: GrowlService) {
    if (this.router.url.includes('report')) {
      this.showCheckBox = false;
      this.reportPage = true;
    }
    this.rowSelectionMode = 'multiple';
    this.resizableColumns = true;
    this.reorderableColumns = true;
    this.enableGlobalFilter = true;
    this.docSysProp = [];
    //this.selectedRows = [];
    this.docInfo = [];
    this.pageUrl = this.router.url;
    /*this.pageUrl = this.router.parseUrl(this.router.url).root.children['primary'].segments.map(it => it.path).join('/');
    if(this.pageUrl.substring(0,1) !== '/'){
      this.pageUrl = '/' + this.pageUrl;
    }*/
    this.user = this.us.getCurrentUser();
    this.fromPage = this.pageUrl.slice(this.pageUrl.indexOf('#/workflow') + 11);
    this.trackColHeaders = [
      { field: 'senderName', header: 'Sender Name', hidden: false },
      { field: 'recipientName', header: 'Recipient', hidden: false },
      { field: 'sentOn', header: 'Sent On', hidden: false, sortField: 'sentOn2' },
      { field: 'actionUser', header: 'Action By', hidden: false },
      { field: 'status', header: 'Status', hidden: false }];
    this.rowGroupMode = this.rowGroupMode || null;
    this.groupField = this.rowGroupMode && this.groupField ? this.groupField : null;
  }

  rowSelected(event: any, isCheck?) {
    if (this.pageUrl.includes('help') && !isCheck) {
      window.open(this.ds.validateDocument(event.data.docId));
      return;
    }
    if (!(this.pageUrl.includes('workflow'))) {
      this.notWorkflow = true;
      if (this.isViewerClick) {
        this.sendData.emit(this.selectedRows);
        this.viewer = true;
        this.viewDoc(event.data);
      }
    }
  }

  mToggleProgressDialogue(workitemId, $event?) {
    this.toggleProgressDialogue.emit(workitemId);
    if ($event) {
      $event.stopPropagation();
    }
  }

  showSentWorkitems(event) {
    if (this.activePage === 'sent') {
      if (this.fromPage === 'sent' || this.fromPage === 'actioned' || this.reportPage) {
        this.busy = true;
        this.ws.getSentItemsWorkitems(event.data.workitemId, event.data.senderId, 'ACTIVE').subscribe(data => {
          this.busy = false;
          this.assignSentitemWorkitem(data, event.data)
        }, err => {
          this.busy = false;
        });
      } else if (this.fromPage === 'archive') {
        this.busy = true;
        this.ws.getSentItemsWorkitems(event.data.workitemId, event.data.senderId, 'ARCHIVE').subscribe(data => {
          this.busy = false;
          this.assignSentitemWorkitem(data, event.data)
        }, err => {
          this.busy = false;
        });
      }
    }
  }
 

  assignSentitemWorkitem(data, selectedItem) {
    this.sentitemWorkitems = data;
    if (data.length < 1) {
      this.noWorkitemFound(selectedItem);
    }
  }

  noWorkitemFound(selectedItem) {
    if (selectedItem.status === 'RECALL') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'No Workitem Found for Recalled item'
      });
    } else if (selectedItem.status === 'ARCHIVE') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'No Workitem Found for Archived item'
      });
    } else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'No Workitem Found'
      });
    }
  }

  ngOnChanges() {
    this._setGoToPageOptions(this.itemsPerPage, this.totalRecords);

  }
  

  ngOnInit() {
    console.log(this.activePage);
    console.log(this.showInfoIcon);
    
    
    this.cols=this.colHeaders
    
    this.bs.setPageNoOnLoadMore.subscribe(d => {
      this.first = d;
    });
    this.displayinfo = false;
    this.showDelegationInactiveDialog = false;
    this.viewer = false;
    this.showTrack = false;
    this.isDocTrack = false;
    this.islinked = false;
    this._setGoToPageOptions(this.itemsPerPage, this.totalRecords);
    /*if (this.activePage === 'inbox' || this.activePage === 'sent') {
      if (this.ws.first) {
        this.first = this.ws.first;
      }
    }*/
    // if(this.ws.pageNoSelected > 0 && this.ws.pageNoSelected !== undefined){
    //     this.first = this.ws.pageNoSelected;
    // }
    // if(localStorage.getItem('openWkItem')){
    //   this.selectedRows=JSON.parse(localStorage.getItem('openWkItem'));
    //   //this.checked();
    // }
    const sd = this.sendData;
    this.bs.clearSelectedDocs.subscribe(data => {
      this.assignDocsSelected(sd);
    });
    const ds = this.ds;
    const user = this.user;
    const cs = this.coreService;
    this.bs.openDocInfoPanel.subscribe(data => {
      this.assignDocInfoSelected(data, ds, user, cs);
    });

    /* this.bs.openDocTrackPanel.subscribe(data => {
      this.assignDocInfoSelected(data, ds, user, cs);
    }); */

    this.bs.clearFilterAfterSearch.subscribe(d => {
      if (this.searchInput) {
        this.searchInput.nativeElement.value = '';
      }
    });
  }

  assignDocInfoSelected(data, ds, user, cs) {
    if (data.length == 1) {
      if (data[0].islinked == true && this.islinked == false) {

        this.islinked = true;
        this.isDocTrack == false;
        // this.ds.getLinks(this.docSysProp[0].id).subscribe(result => {
        // this.linkedDocument = result
        this.openDocInfo(data[0], ds, user, cs);

        // }, err => {
        // });

      } else if (data[0].isDocTrack == true && this.isDocTrack == false) {
        this.isDocTrack = true;
        this.islinked == false;
        this.displayinfo = false;
        // this.ds.getLinks(this.docSysProp[0].id).subscribe(result => {
        // this.linkedDocument = result
        this.openDocInfo(data[0], ds, user, cs);

        // }, err => {
        // });

      } else {
        this.displayinfo = true;
        this.openDocInfo(data[0], ds, user, cs);
      }
    } else if (this.displayinfo === false) {
      this.displayinfo = true;
      this.isDocTrack = false;
      this.islinked == false;
      this.openDocInfo(data[0], ds, user, cs);
    }
  }

  assignDocsSelected(sd) {
    this.selectedRows = [];
    if (this.sendData == null) {
      sd.emit(this.selectedRows);
    } else {
      this.sendData.emit(this.selectedRows);
    }
  }

  checked(event?:any) {
    console.log(this.selectedRows);
    
    this.selectedRows.map((row, index) => {
      if (row.hasOwnProperty('isDeleted') && row.isDeleted) {
        this.selectedRows.splice(index, 1);
      }
    });
    
    this.sendData.emit(this.selectedRows);
    this.bs.docsSelected.emit(this.selectedRows);
  }

  removeDraft(item) {
    // this.confirmationService.confirm({
    //   header: 'Confirmation',
    //   message: 'Are you sure that you want to remove this draft item?',
    //   key: 'confirmRemoveDraft',
    //   accept: () => {
    //     this.removeDraftItemConfirm(item);
    //   }
    // });
    this.selectedDraftId = item
    this.displayBasic = true
  }
  ok() {
    this.removeDraftItemConfirm(this.selectedDraftId);
  }
  cancel(){
    this.displayBasic = false
  }
  removeDraftItemConfirm(item) {
    this.bs.removeDraft.emit(item.draftId);
    this.displayBasic = false

  }

  unchecked(event:any) {
    this.sendData.emit(this.selectedRows);
    this.bs.docsSelected.emit(this.selectedRows);
  }

  mAddToCart(doc) {
    this.addToCart.emit(doc);
  }

  mDownload(doc) {
    this.download.emit(doc);
  }

  goToTaskDetails(event, from, subjects) {
    if (subjects) {
      if (this.activePage === 'sent') {
        this.ws.validateSentItem(subjects.sentitemId).subscribe(res1 => {
          if (res1 === 'INACTIVE' && this.activePage !== 'draft') {
            this.confirmationService.confirm({
              header: 'Confirmation',
              message: 'This sentitem is no longer available...Click OK to refresh',
              key: 'confirmNavigateTaskDetails' + this.tabNameIdentifier,
              accept: () => {
                this.refresh();
              }
            });
          } else {
            this.isValidNavigateToTaskDetails(subjects.sentitemId, from, subjects);
          }
        });
      } else {
        this.ws.validateWorkitem(subjects.workitemId).subscribe(res1 => {
          if (res1 === 'INACTIVE' && this.activePage !== 'draft') {
            this.confirmationService.confirm({
              header: 'Confirmation',
              message: 'This workitem is no longer available...Click OK to refresh',
              key: 'confirmNavigateTaskDetails' + this.tabNameIdentifier,
              accept: () => {
                this.refresh();
              }
            });
          } else {
            this.isValidNavigateToTaskDetails(subjects.workitemId, from, subjects);
          }
        });
      }
    }
  }

  updateFlag(record) {
    if (this.activePage != 'sent') {

      let url = '/WorkflowService/unFlagWorkitem'
      if (record.isFlag) {
        url = '/WorkflowService/flagWorkitem'
      }
      //  url = url + '?witmid='+ie11_polyfill(JSON.stringify(record.id))+'&empNo='+ie11_polyfill(JSON.stringify(this.user.EmpNo))+'&sysdatetime='+this.coreService.getSysTimeStamp();
      // this.ws.updateFlag(url,record).subscribe(res1 => {
      //   this.growlService.showGrowl({
      //     severity: 'info',
      //     summary: 'Success',
      //     detail: 'Flag Updated Successfully'
      //   });
      //   this.refresh();
      // });
    }
  }


  isValidNavigateToTaskDetails(event, from, subjects) {
    if ((this.fromPage === 'inbox' || this.fromPage === 'inbox-new') || (this.fromPage === 'archive' && this.activePage === 'inbox') || this.fromPage === 'draft') {
      this.ws.openedWorkItem = { userType: 'inbox', 'userId': this.userId, 'row': subjects };
      if (this.pageUrl.indexOf('workflow') !== -1) {
        if (from === 'hyperlink') {
          if (this.activePage === 'draft') {
            this.viewDraftItem(subjects);
          } else {
            // console.log("elseeeeeeeeeeeeeeeeeee>>>>>>>>");
            
            if (!!this.ws.delegateId) {
              this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
                if (res === 'INACTIVE') {
                  this.showDelegationInactiveDialog = true;
                } else {
                  //this.router.navigateByUrl(`${this.pageUrl}/taskdetail/${subjects.workitemId}`);
                  this.router.navigate([this.pageUrl + '/taskdetail', {
                    wiId: subjects.workitemId,
                    type: this.userType
                  }]);
                }
              });
            } else {
              //this.router.navigateByUrl(`${this.pageUrl}/taskdetail/${subjects.workitemId}`);
              // console.log(this.pageUrl,subjects.workitemId,this.userType);
              
              this.router.navigate([this.pageUrl + '/taskdetail', {
                wiId: subjects.workitemId,
                type: this.userType
              }]);
            }
          }
        } else if (this.activePage !== 'draft') {
          if (!!this.ws.delegateId) {
            this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
              if (res === 'INACTIVE') {
                this.showDelegationInactiveDialog = true;
              } else {
                this.router.navigate([this.pageUrl + '/taskdetail', {
                  wiId: subjects.workitemId,
                  type: this.userType
                }]);
              }
            });
          } else {
            this.router.navigate([this.pageUrl + '/taskdetail', {
              wiId: event,
              type: this.userType
            }]);
          }
        }
      }
    } else if (this.activePage === 'sent') {
      this.ws.openedWorkItem = { userType: 'sent', userId: this.userId, row: subjects };
      this.openSentWorkitem(subjects.workflowId, subjects.sentitemId, subjects.senderId)
    }
  }

  openSentWorkitem(workflowId, sentitemId?, senderId?) {
    if (this.pageUrl.indexOf('workflow') !== -1) {
      if (!!this.ws.delegateId) {
        this.us.validateDelegation(this.ws.delegateId).subscribe(res => {
          if (res === 'INACTIVE') {
            this.showDelegationInactiveDialog = true;
          } else {
            //this.router.navigateByUrl(`${this.pageUrl}/taskdetail/${workitemId}`);
            this.router.navigate([this.pageUrl + '/taskdetail', {
              wfId: workflowId,
              siId: sentitemId,
              senderId: senderId,
              type: this.userType
            }]);
          }
        });
      } else {
        //this.router.navigateByUrl(`${this.pageUrl}/taskdetail/${workitemId}`);
        this.router.navigate([this.pageUrl + '/taskdetail', {
          wfId: workflowId,
          siId: sentitemId,
          senderId: senderId,
          type: this.userType
        }]);
      }
    }
  }

  openDocInfo(doc, ds?, user?, cs?) {
    this.docInfo = [];
    /*let subscription = this.ds.getDocument(doc.id)
      .subscribe(data => this.assignDocInfo(data));
    this.addToSubscriptions(subscription);*/
    this.busy = true;
    if (this.ds == null) {
      ds.getDocumentDetails(doc.id, user.EmpNo).subscribe(data => {
        this.busy = false;
        this.assignDocInfo(data, cs)
      }, err => {
        this.busy = false;
      });
    } else {
      this.ds.getDocumentDetails(doc.id, this.user.EmpNo).subscribe(data => {
        this.busy = false;
        this.assignDocInfo(data, cs)
      }, err => {
        this.busy = false;
      });
    }

    this.busy = false;

    // subscription = this.ds.getDocumentVersions(doc.id)
    //   .subscribe(data => this.assignDocVersions(data));
    // this.addToSubscriptions(subscription);
    /*subscription = this.ds.getDocumentPermissions(doc.id)
      .subscribe(data => this.assignDocSecurity(data));
    this.addToSubscriptions(subscription);*/
    // subscription = this.ds.getLinks(doc.id)
    //   .subscribe(data => this.assignDocLink(data));
    // this.addToSubscriptions(subscription);
    // subscription = this.ds.getDocumentHistory(doc.id)
    //   .subscribe(data => this.assignDocHistory(data));
    // this.addToSubscriptions(subscription);
    /*subscription = this.ds.getDocumentFolders(doc.id)
      .subscribe(data => this.assignDocumentFolders(data));
    this.addToSubscriptions(subscription);*/
    // subscription = this.ds.getDocumentWorkflowHistory(doc.id)
    //   .subscribe(data => this.assignDocumentWorkflowHistory(data));
    // this.coreService.progress = {busy: subscription, message: ''};
  }

  assignDocInfo(data, cs) {
    this.docSysProp = [];
    this.busy = true;
    data.document.props.map(p => {
      if (p.hidden === 'false') {
        this.docInfo.push(p);
      }
    });

    if (this.coreService == null) {
      this.viewDocTitle = cs.getPropValue(data.document.props, 'DocumentTitle') + " " + "(" + data.document.docclass + ")";
    } else {
      this.viewDocTitle = this.coreService.getPropValue(data.document.props, 'DocumentTitle') + " " + "(" + data.document.docclass + ")";
    }
    this.docSysProp.push(data.document);

    if (this.islinked) {
      this.ds.getLinks(this.docSysProp[0].id).subscribe(result => {
        this.linkedDocument = result;
        this.busy = false;
        // this.openDocInfo(data[0], ds, user, cs);
      }, err => {
        this.busy = false;
      });
    }


    if (this.isDocTrack) {
      this.busy = true;
      this.ds.getDocumentWorkflowHistory(this.docSysProp[0].id, this.docSysProp[0].vsid).subscribe(result => {
        this.docTrack = result;
        this.busy = false;
        //this.assignDocumentWorkflowHistory(result);
      }, err => {
        this.busy = false;
      });
    }

    this.assignDocSecurity(data.permissions);
    this.assignDocumentFolders(data.fileInFolders);
    this.busy = false;
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

  assignDocumentFolders(data) {
    this.foldersFiledIn = data;
  }

  assignDocumentWorkflowHistory(data) {
    this.docTrack = data;
  }

  closeModal() {
    this.docSysProp = [];
    this.displayinfo = false;
    this.isDocTrack = false;
    this.islinked = false;
    this.viewDocTitle = '';
    this.docTrack = [];
  }

  closeViewPopUp() {
    this.showIframe = false;
    this.isViewerClick = false;
  }

  downloadDoc(doc) {
    window.location.assign(this.ds.downloadThisDocument(doc.id));
  }

  openView(e, names) {
    //this.isViewerClick = true;
    //this.docTitle = names.name;
    //this.viewDoc(names);
    window.parent.postMessage({ v1: 'openViewer', v2: names.id }, '*');
    e.stopPropagation();
  }

  viewDoc(doc) {
    this.showIframe = true;
    this.busy = true;
    this.ds.getDocumentInfo(doc.id, 0).subscribe(data => {
      this.busy = false;
      this.assignDocIdForView(data)
    }, err => {
      this.busy = false;
    });
  }

  assignDocIdForView(data) {
    this.attach_url = this.transform(this.ds.getViewUrl(data.id));
    this.viewer = true
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  refresh(table?) {
    this.goToPage = 1;
    console.log(this.dataTable);
    
    this.dataTable.reset();
    if (!table) {
      table = this.rowGroupMode ? this.groupedTableRef : this.unGroupedTableRef;
    }
    if (this.activePage === 'inbox') {
      table.sortField = 'receivedDate2';
      table.sortOrder = -1;
    } else if (this.activePage === 'sent') {
      table.sortField = 'lastItemSentOn2';
      table.sortOrder = -1;
    }
    this.refreshScreen.emit(this.selectedRows);
  }

  private _loadLazy(event) {
    this.sendSortPagination.emit(event);
  }

  onLazyLoad(event, fromTabName) {
    console.log(event,fromTabName);
    
    let activeTabName = '';
    // if request coming from page with tab, get active tabName by active page
    if (this.fromPage === 'inbox' || this.fromPage === 'inbox-new') {
      activeTabName = this.ws.inboxSelectedUserTab;
    } else if (this.fromPage === 'sent') {
      activeTabName = this.ws.sentSelectedUserTab;
    } else if (this.fromPage === 'archive') {
      activeTabName = this.ws.archiveSelectedUserTab;
    }
    // request coming from page with tab will have fromTabName and activeTabName
    // otherwise, request come from normal page with one grid
    if (fromTabName && activeTabName) {
      if (fromTabName === activeTabName) {
        this._loadLazy(event);
      }
    } else {
      this._loadLazy(event);
    }
  }

  onPaging(event) {
    this.ws.pageNoSelected = (event.first / event.rows) + 1;
    this.ws.first = event.first;
    this.goToPage = (event.first / event.rows) + 1;
  }

  onSorting(event) {
    this.goToPage = 1;
    if (this.activePage === 'favorites' || this.activePage === 'recents' || this.activePage === 'teamshared' ||
      this.activePage === 'browse' || this.activePage === 'favoriteFolders' || this.activePage === 'advanceSearch' || this.activePage === 'simpleSearch') {
      let table = this.rowGroupMode ? this.groupedTableRef : this.unGroupedTableRef;
      if (table) {
        this.filteredGridItemsToExport.emit(table['value']);
      }
    }
  }

  clearCheckedItems() {
    this.selectedRows = Object.assign([], []);
    this.sendData.emit(this.selectedRows);
  }

  onFiltering(event) {
    this.goToPage = 1;
    if (!this.lazy) {
      if (event.filteredValue) {
        this.totalCount = event.filteredValue.length;
        this.filteredGridItemsToExport.emit(event.filteredValue);
      }
    }
    this.clearCheckedItems();
    this.bs.changeFilterText.emit(this.selectedRows);
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

  viewDraftItem(event) {
    this.viewDraftItems.emit(event);
  }

  resetFirst() {
    this.first = 0;
    this.goToPage = 1;
  }

  previewTrackSentitem(workflowId, $event?) {
    this.toggleTrackSentitem.emit(workflowId);
    if ($event) {
      $event.stopPropagation();
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      if (s) {
        s.unsubscribe();
      }
    });
    this.destroyKeys();
  }

  reloadApp() {
    this.showDelegationInactiveDialog = false;
    //window.location.reload(true);
    window.parent.postMessage('DelegationEndReload', '*');
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      this[k] = null;
    })
  }

  hideAllDialog() {
    if (this.infoDialogRef) {
      this.infoDialogRef['hide']();
      this.displayinfo = false;
    }
    if (this.infoLinkedDialog) {
      this.infoLinkedDialog['hide']();
      this.islinked = false;
    }
    if (this.infoTrackDialog) {
      this.infoTrackDialog['hide']();
      this.isDocTrack = false;
    }
    if (this.viewerDialogRef) {
      this.viewerDialogRef['hide']();
      this.viewer = false;
    }
    if (this.showTrackDialogRef) {
      this.showTrackDialogRef['hide']();
      this.showTrack = false;
    }
    if (this.delegationMsgDialogRef) {
      this.delegationMsgDialogRef['hide']();
      this.showDelegationInactiveDialog = false;
    }
  }

  _setGoToPageOptions(pageSize, totalRecords) {
    this.pages = [];
    let noOfPages = Math.ceil(totalRecords / pageSize);
    /*if (pageSize%totalRecords > 0)
      noOfPages = noOfPages+1;*/
    for (let i = 0; i < noOfPages; i++) {
      this.pages.push({ label: (i + 1).toString(), value: i });
    }
  }

  goToPageChanged(event) {
    let goToPageCopy = _.cloneDeep(this.goToPage);
    let enteredPageExists = _.find(this.pages, function (page) {
      return page.label == goToPageCopy;
    });
    if ((event.charCode === 13 || event.code === "Enter" || event.code === "NumpadEnter" || event.key === 'Enter' || event.keyCode === 13)) {
      if (enteredPageExists) {
        this.first = (this.itemsPerPage * (goToPageCopy - 1));
      } else {
        if (this.pages.length > 0 && goToPageCopy > this.pages[this.pages.length - 1].value) {
          this.goToPage = (this.pages[this.pages.length - 1].value) + 1;
          this.first = (this.itemsPerPage * (this.pages[this.pages.length - 1].value));
        } else {
          this.goToPage = 1;
          this.first = 0;
        }
      }
    }
    //this.first = this.itemsPerPage*parseInt(event.value, 10);
  }

  lookupRowStyleClass(rowData: any, index: any) {
    return rowData.hasOwnProperty('isDeleted') && rowData.isDeleted ? 'disable-dt-row' : '';
  }
  loadMoreSearchData() {
    this.sendPaginationInfoSearch.emit(this.ws.pageNoSelected);
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.displayinfo = false;
    this.showDelegationInactiveDialog = false;
    this.showTrack = false;
    this.viewer = false;
  }
}


