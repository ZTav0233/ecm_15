import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { CoreService } from "../../../services/core.service";
import { GrowlService } from "../../../services/growl.service";
import { ContentService } from '../../../services/content.service';
import { BrowserEvents } from "../../../services/browser-events.service";

@Component({
  selector: 'app-doc-track-details-modal',
  templateUrl: './doc-track-details-modal.component.html',
  styleUrls: ['./doc-track-details-modal.component.css']
})
export class DocTrackDetailsModalComponent implements OnInit, OnDestroy, OnChanges  {
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
  public isDocTrackLoaded = false;
  public docVersions: SelectItem[] = [];
  selectedVersionVal: any;
  constructor(private ds: DocumentService, private sanitizer: DomSanitizer, private confirmationService: ConfirmationService,
    private contentService: ContentService, private coreService: CoreService, private growlService: GrowlService,
    private bs: BrowserEvents) {
    this.bs.docDetailsModelTabIndex.subscribe(() => {
      this.tabActiveIndex = 0;
    });
  }

  ngOnInit() {
    this.busy = true;
  }

  ngOnChanges(){
    if(this.docSysProp && this.docSysProp.length > 0 ){
      console.log(this.docSysProp)
      //this.changeTab();
      this.assignDocumentWorkflowHistory(this.docTrack)
    }
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  viewWorkItem(track){

    //this.busy = true;
    console.log("ViewWorkitem - Track :: " + track);
    window.parent.postMessage({ 'v1': 'openWorkitem', 'v2': track.docId, 'v3': track.docVsId, 'v4': track.workflowId, 'v5': track.empNo }, '*');


    // var docId = e.data.v2;
		// 						var vsid = e.data.v3;
		// 						var wfid = e.data.v4;
		// 						var empno = e.data.v5;

   /*  this.ds.getDocumentWorkItemDetails(track.workflowId).subscribe(data => {
      this.busy = false;
      //this.assignDocumentWorkflowHistory(data);
    }, err => {
      this.busy = false;
    }); */

  }

  closeViewPopUp() {
    this.showIframe = false;
    this.docTitle = '';
    this.docTrack = [];
  }

  changeTab() {
    this.tabActiveIndex = 1;
    this.busy = true;
    if (!this.isDocTrackLoaded) {
      this.busy = true;
      this.ds.getDocumentWorkflowHistory(this.docSysProp[0].id, this.docSysProp[0].vsid).subscribe(data => {
        this.assignDocumentWorkflowHistory(data);
        this.busy = false;
      }, err => {
        this.busy = false;
      });
    }
    this.busy = false;
      
  }

  assignDocumentWorkflowHistory(data) {
    this.busy = true;
    this.docTrack = data;
    this.isDocTrackLoaded = true;
    this.busy = false;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
 
  ngOnDestroy() {
    this.clearSubscriptions();
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
