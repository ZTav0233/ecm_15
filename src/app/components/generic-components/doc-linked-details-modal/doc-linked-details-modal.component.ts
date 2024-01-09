import { Component, OnInit, Input,  OnDestroy, OnChanges } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { CoreService } from "../../../services/core.service";
import { saveAs } from 'file-saver';
import { GrowlService } from "../../../services/growl.service";
import { ContentService } from '../../../services/content.service';
import { BrowserEvents } from "../../../services/browser-events.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doc-linked-details-modal',
  templateUrl: './doc-linked-details-modal.component.html',
  styleUrls: ['./doc-linked-details-modal.component.css']
})
export class DocLinkedDetailsModalComponent implements OnInit, OnDestroy, OnChanges  {
  @Input() public docInfo: any;
  @Input() public docSysProp: any;
  @Input() public docVersion: any;
  @Input() public docSecurity: any;
  @Input() public linkedDocuments: any;
  @Input() public docHistory: any;
  @Input() public foldersFiledIn: any;
  @Input() public docTitle: any;
  @Input() public noLink: any;
  @Input() public docTrack: any;
  @Input() public linkedDocument: any;
  public tabActiveIndex: number = 0;
  public showIframe = false;
  public attach_url: any;
  public viewer = false;
  public headId: any;
  public selectedVersion: any = { props: [] };
  public privilage: any;
  private subscriptions: any[] = [];
  public busy: boolean = false;
  public isDocVersionsLoaded = false;
  public isDocLinkLoaded = false;
  public isDocHistoryLoaded = false;
  public isDocTrackLoaded = false;
  public docVersions: SelectItem[] = [];
  selectedVersionVal: any;
  constructor(private ds: DocumentService, private sanitizer: DomSanitizer, private confirmationService: ConfirmationService,private toastr:ToastrService,
    private contentService: ContentService, private coreService: CoreService, private growlService: GrowlService,
    private bs: BrowserEvents) {
    this.bs.docDetailsModelTabIndex.subscribe(() => {
      this.tabActiveIndex = 0;
    });
  }

  ngOnInit() {
      
  }

  ngOnChanges(){
    if(this.docSysProp && this.docSysProp.length > 0 ){
      console.log(this.docSysProp)
      // this.changeTab();
      this.assignDocLink(this.linkedDocument)
    }
  }

  viewDoc(doc, type) {
    //this.showIframe = true;
    if (type === 'link') {
      //this.docTitle = doc.desc;
      //this.attach_url = this.transform(this.ds.getViewUrl(doc.tail));
      window.parent.postMessage({ v1: 'openViewer', v2: doc.tail }, '*');
    } else {
      //this.attach_url = this.transform(this.ds.getViewUrl(doc.id));
      window.parent.postMessage({ v1: 'openViewer', v2: doc.id }, '*');
    }
    //this.viewer = true;
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  confirmRemoveLink(docLink) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmRemoveLink',
      accept: () => {
        this.removeLink(docLink);
      }
    });
  }

  removeLink(doc) {
    this.headId = doc.head;
    this.busy = true;
    this.ds.removeLink(doc.head, doc.tail).subscribe(data => {
      this.busy = false;
      if (data === 'OK') {
        this.successremoveLink();
      }
    }, error => {
      this.busy = false;
      this.removeLinkFailed(error)
    });
  }

  successremoveLink() {
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Remove Link Successful'
    // });
    this.toastr.info('Remove Link Successful', 'Success');
    this.busy = true;
    this.ds.getLinks(this.headId).subscribe(data => {
      this.busy = false;
      this.assignDocLink(data)
    }, err => {
      this.busy = false;
    });
  }

  removeLinkFailed(error) {
    //let errorJson = JSON.parse(error.error).responseMessage;
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: "No permissions to remove selected link"
    // });
    this.toastr.error('No permissions to remove selected link', 'Failure');
  }

  downloadDoc(doc) {
    //  window.location.assign(this.ds.downloadThisDocument(doc.id));
    //const fileName = this.docInfo[0].mvalues;
    let fileName;
    this.ds.downloadThisDoc(doc.id).subscribe(res => {
      let disposition = res.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      saveAs(res._body, decodeURIComponent(fileName));
    });
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
        this.selectedVersion.props.push({ prop: p.prop, value: p.value });
      });
    } else {
      this.busy = true;
      this.ds.getThisDocument(version.id).subscribe(res => {
        this.busy = false;
        res.props.map(p => {
          if (p.hidden === 'false') {
            props.push({ prop: p.desc, value: p.mvalues[0] });
          }
        });
        version.props = props;
        this.selectedVersion.props = props;
      }, err => {
        this.busy = false;
      });
    }
  }

  showPrivilages(data) {
    // this.busy = true;
    this.contentService.getAccessPrivileges(data.accessMask).subscribe(val => {
      // this.busy = false
      this.assignPrivilages(val)
    }, err => {
      // this.busy = false;
    });
  }

  assignPrivilages(data) {
    this.privilage = data;
  }

  closeViewPopUp() {
    this.showIframe = false;
  }

  changeTab() {
    this.tabActiveIndex = 1;
    this.busy = true;
    if (!this.isDocLinkLoaded) {
      
      this.ds.getLinks(this.docSysProp[0].id).subscribe(data => {
        this.busy = false;
        this.assignDocLink(data);
      }, err => {
        this.busy = false;
      });
    }
    this.busy = true;
      
  }

  assignDocVersions(data, type) {
    this.docVersion = data;
    let sortedData = data.slice().sort((a, b) => b.verNo - a.verNo);
    this.isDocVersionsLoaded = true;
    sortedData.map(versinData => {
      this.docVersions.push({
        label: versinData.verNo,
        value: versinData.id
      });
    });
    this.selectedVersionVal = this.docVersions[0].value;
    if (type == 'history') {
      this.busy = true;
      this.ds.getDocumentHistory(this.selectedVersionVal).subscribe(data => {
        this.busy = false;
        this.assignDocHistory(data);
      }, err => {
        this.busy = false;
      });
    }
  }

  assignDocLink(data) {
    if (data.length > 0) {
      this.linkedDocuments = data;
      this.noLink = false;
    } else {
      this.noLink = true;
    }
    this.isDocLinkLoaded = true;
  }

  assignDocHistory(data) {
    data.map(d => {
      d.timestamp2 = this.coreService.getTimestampFromDate(d.timestamp, null, '/');
    });
    this.docHistory = data;
    this.isDocHistoryLoaded = true;
  }

  changeVersion() {
    this.busy = true;
    this.ds.getDocumentHistory(this.selectedVersionVal).subscribe(data => {
      this.busy = false;
      this.assignDocHistory(data);
    }, err => {
      this.docHistory = [];
      this.busy = false;
    });
  }

  assignDocumentWorkflowHistory(data) {
    this.docTrack = data;
    this.isDocTrackLoaded = true;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
  exportDocHistoryToExcel() {
    let array = ['desc', 'user', 'timestamp'];
    this.coreService.exportToExcel(this.docHistory, 'Audit_Event' + this.docSysProp[0].id + '.xlsx', array)
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.isDocVersionsLoaded = false;
    this.isDocLinkLoaded = false;
    this.isDocHistoryLoaded = false;
    this.isDocTrackLoaded = false;
    this.docInfo = [];
    this.docSysProp = [];
    this.docVersion = [];
    this.docSecurity = [];
    this.linkedDocuments = [];
    this.docHistory = [];
    this.foldersFiledIn = [];
    this.docTitle = '';
    this.noLink = false;
    this.docTrack = [];
    this.tabActiveIndex = 0;
  }
}
