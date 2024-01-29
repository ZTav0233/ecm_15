import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { DocumentService } from '../../../services/document.service';
import { AppComponent } from '../../../app.component';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Router, ActivatedRoute } from '@angular/router'
import { Subscription } from "rxjs";
import { GrowlService } from '../../../services/growl.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { UserService } from "../../../services/user.service";
import { saveAs } from 'file-saver';
import * as _ from "lodash";
import {browser} from "protractor";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'browse-document',
  templateUrl: './browse-document.component.html',
  providers: [ContentService],
})
export class BrowseDocumentComponent implements OnInit, OnDestroy {
  public tableData: any[];
  //@ViewChild(TreeComponent) tree: TreeComponent;
  //@ViewChild(DataTable) dataTableComponent: DataTableComponent;
  public selectedItem: any[] = [];
  documentFolders: DocumentInfoModel[] = [];
  public colHeaders: any[];
  public busy: boolean;
  public itemsPerPage: any;
  private pageUrl: any;
  screen: any = 'Browse';
  sideMenu: any;
  folderPath: any;
  folderId: any;
  openDocVisible = false;
  emptyMessage: any;
  assignedPath: any;
  assignedId: any;
  private subscription: Subscription[] = [];
  private subscriptions: any[] = [];
  public gridItemsToExport: any[] = [];
  
  folderFilterInput:any='';
  public folderPermission = { usage: 'browseFolderView', permission: false };
  constructor(private breadcrumbService: BreadcrumbService, public router: Router, public cs: ContentService, public app: AppComponent,private toastr:ToastrService,
    public ds: DocumentService, public browserEvents: BrowserEvents, private actroute: ActivatedRoute, private growlService: GrowlService, public us: UserService,
    private coreService: CoreService) {
    this.pageUrl = router.url;
    this.subscriptions.push(this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    }));
    this.actroute.paramMap.subscribe((params: any) => {
      this.folderPath = params.params.folderPath;
      this.ds.navfolderPath = this.folderPath;
      this.folderId = params.params.folderId;
      this.ds.navfolderId = this.folderId;
    });
    this.colHeaders = [
      { field: 'creator', header: 'Created By' },
      { field: 'ECMNo', header: 'ECM No' },
      { field: 'referenceNo', header: 'Reference No' },
      { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
      { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
      { field: 'modifier', header: 'Modified By' }];
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.itemsPerPage = parseInt(d.val, 10);
          } else {
            this.itemsPerPage = 15;
          }

        }
      });

    }
    this.loadSavedDocuments();
  }

  loadSavedDocuments() {
    if (this.ds.savedFolderBrowse.folderResultsSavedBrowse) {
      this.documentFolders = this.ds.savedFolderBrowse.folderResultsSavedBrowse;
      this.gridItemsToExport = _.cloneDeep(this.documentFolders);
    }
  }

  checkRootFolder(data) {
    if (data) {
      this.assignFolderPath(data.path);
    }
    else {
      this.subscriptions.push(this.browserEvents.folderPath.subscribe(data => this.assignFolderPath(data)));
    }
  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Public Folders' }
    ]);
    //debugger;
    //console.log("Folderpath : " + this.folderPath);
    //console.log("navfolderPath : " + this.ds.navfolderPath);
    //console.log("FolderId : " + this.folderId);
    if (this.ds.savedFolderBrowse.folderPathSavedBrowse) {
      this.folderPath = this.ds.savedFolderBrowse.folderPathSavedBrowse;
    }
    else {
      this.folderPath = '/ECMRootFolder/Public Folders/';
    }
    this.subscriptions.push(this.browserEvents.isRootFolShown.subscribe(data => this.checkRootFolder(data)));
    localStorage.setItem('split-pane', null);
    this.emptyMessage = globalv.no_doc_found;
    setTimeout(() => this.setPanelOverlay(), 0);
    setTimeout(() => {
      this.subscriptions.push(this.browserEvents.sendFolderDocs.subscribe(data => this.assignFolderDocs(data)));
    }, 6);
    this.subscriptions.push(this.browserEvents.closeAddDocModel.subscribe(data => this.assignModelClose(data)));
  }

  assignModelClose(data) {
    if (data === 'close') {
      this.openDocVisible = false;
    }
  }

  setPanelOverlay() {
    if (this.app.layoutStatic === true) {
      this.app.layoutStatic = false;
    }
  }


  assignFolderPath(data) {
    this.folderPath = data;
    localStorage.setItem('path', data);
    this.assignedPath = data;
    this.assignedId = localStorage.getItem('folderId');
  }


  assignFolderDocs(data,noSave?) {
    this.subscriptions.push(this.browserEvents.folderPath.subscribe(val => this.assignFolderPath(val)));
    if (data && data.length > 0) {
      data.map(d => {
        d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
        d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
        d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
        d.referenceNo = d.props ? this.coreService.getPropValue(d.props, 'ReferenceNo') : ' ';
      });
    }
    if (this.folderPath === '/ECMRootFolder/Public Folders/') {
      this.documentFolders = [];
    } else if (data && data.length > 0) {
      this.documentFolders = data.slice();
    } else {
      this.documentFolders = [];
    }
    this.gridItemsToExport = _.cloneDeep(this.documentFolders);
    if (data) {
      data.map((d, i) => {
        d.name = d.fileName;
      });
    }
    if(!noSave){
      this.ds.savedFolderBrowse.folderResultsSavedBrowse = data;
      (<HTMLInputElement>document.getElementById("filterFol")).value='';
      this.folderFilterInput='';
    }


  }
    clearFilterText(){
     (<HTMLInputElement>document.getElementById("filterFol")).value='';
      this.folderFilterInput='';
      this.refreshTable();
  }

  getData(data: any, sidemenu?: any) {
    this.sideMenu = sidemenu;
    this.selectedItem = data;
    if (data !== undefined) {
      // if (data.length === 0 && sidemenu.isOpened) {
      //   sidemenu.toggle();
      // }
      // if (data.length >= 1 && !sidemenu.isOpened) {
      //   sidemenu.show();
      // }
    }
  }

  refresh(docs) {
    let loop = 0;
    docs.map((d, i) => {
      loop++;
      if (loop === docs.length) {
        docs.splice(0, docs.length);
        // if (this.sideMenu.isOpened) {
        //   this.sideMenu.toggle();
        // }
      }
    });
    const folderId = localStorage.getItem('folderId');
    if (localStorage.getItem('unfileClicked') === 'true') {
      this.busy = true;
      this.cs.getDocumentFolders(folderId).subscribe(data => {
        this.busy = false;
        this.assignFolderDocs(data)
      }, err => {
        this.busy = false;
      });
    }
    else {
      this.subscriptions.push(this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data)));
    }
    localStorage.removeItem('unfileClicked');
  }

  refreshTable() {
    const folderId = localStorage.getItem('folderId');
    this.busy = true;
    this.cs.getDocumentFolders(folderId).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data)
    }, err => {
      this.busy = false;
    });
  }

  toggle() {
    // if (this.sideMenu.isOpened !== false) {
    //   //this.sideMenu.toggle();
    // }
  }
  getRowTrackBy = (index, item) => {
    return item.id;
  };

  getBrowseUpdated(docs) {
    const folderId = this.ds.addToFolderId;
    this.subscriptions.push(this.cs.validateFolderPermissions(folderId, "ADD")
      .subscribe(data => this.checkFolderPermission(data, docs, folderId)));
  }

  checkFolderPermission(res, docs, folderId) {
    if (res === true) {
      let loop = 0;
      docs.map((d, i) => {
        this.subscription.push(this.cs.fileInFolder(folderId, d.id)
          .subscribe(data => {
            if (data === 'OK') {
              // this.growlService.showGrowl({
              //   severity: 'info',
              //   summary: 'Success', detail: 'Document Added To Folder'
              // });
              this.toastr.info('Document Added To Folder', 'Success');
              loop++;
              if (loop === docs.length) {
                docs.splice(0, docs.length);
              }
            }
            else if (data === 'Exists') {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Already Exist', detail: 'Document Already Exist In Destination Folder'
              // });
              this.toastr.info('Document Already Exist In Destination Folder', 'Already Exist');
            }
            else {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Failure', detail: 'Add To Folder Failed'
              // });
              this.toastr.error('Add To Folder Failed', 'Failure');
            }

          }));
      });
    }
    else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to add'
      // });
      this.toastr.error('User dont have permission to add', 'No Permission');
    }
  }


  addDocTrigger() {
    this.openDocVisible = true;
    this.browserEvents.addDocPath.emit(localStorage.getItem('path'));
    this.browserEvents.addDocId.emit(localStorage.getItem('folderId'));
  }

  onDocumentAdded() {
    this.browserEvents.closeAddDocModel.emit('close');
    this.busy = true;
    this.cs.getDocumentFolders(this.assignedId).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data)
    }, err => {
      this.busy = false;
    });
    this.folderPath = localStorage.getItem('path');
  }

  getFilteredItems(filteredItems) {
    this.gridItemsToExport = filteredItems;
  }

  exportToExcel() {
    // this.coreService.exportToExcel(this.documentFolders, fileName, this.exportFields);

    const docFolders = JSON.parse(JSON.stringify(this.gridItemsToExport));//this.documentFolders
    docFolders.map((doc, index) => {
      delete doc.name;
      delete doc.addOn2;
      delete doc.modOn2;
      delete doc.ECMNo;
    });
    this.busy = true;
    this.ds.exportFolderDocuments(docFolders, (this.folderPath.replace(/\//g, '-')).slice(1)).subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = (this.folderPath.replace(/\//g, '-')).slice(1) + '-' + this.coreService.getDateTimeForExport() + '.xlsx';
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
  destroyKeys() {
    Object.keys(this).map(k => {
      //this[k] = null;
      delete this[k];
    })
  }
  updateSearchInDatatable(){
    const folderId = localStorage.getItem('folderId');
    this.folderFilterInput = (<HTMLInputElement>document.getElementById("filterFol")).value;
    this.busy = true;
    this.cs.getDocumentFolders(folderId,this.folderFilterInput).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data,true)
    }, err => {
      this.busy = false;
    });
  }
  filterTextChanged(e){
    if(e.target.value==="" && e.target.value.length===0){
      this.refreshTable();
    }
  }


  ngOnDestroy() {
    this.clearSubscriptions();
    this.app.layoutStatic = true;
    localStorage.removeItem('folderId');
    localStorage.removeItem('folderIdForMove');
    this.folderFilterInput='';
    if(<HTMLInputElement>document.getElementById("filterFol") && (<HTMLInputElement>document.getElementById("filterFol")).value){
      (<HTMLInputElement>document.getElementById("filterFol")).value='';
    }
    //this.destroyKeys();
  }


}
