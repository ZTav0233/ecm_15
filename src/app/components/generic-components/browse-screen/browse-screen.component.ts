import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { DocumentService } from '../../../services/document.service';
import { AppComponent } from '../../../app.component';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { GrowlService } from '../../../services/growl.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { UserService } from "../../../services/user.service";
import { DataService } from '../../../services/data.Service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-browse-screen',
  templateUrl: './browse-screen.component.html',
  providers: [ContentService],
})
export class BrowseScreenComponent implements OnInit, OnDestroy {
  currentUser;
  public tableData: any[];
  documentFolders: DocumentInfoModel[] = [];
  public colHeaders: any[];
  public busy: boolean = false;
  public itemsPerPage: any;
  screen: any = 'Browse';
  sideMenu: any;
  folderPath: any;
  emptyMessage: any;
  assignedPath: any;
  assignedId: any;
  private subscriptions: any[] = [];
  public gridItemsToExport: any[] = [];
  public folderPermission = { usage: 'browseFolderView', permission: false };
  @Output() refreshCart = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  public selectedItem: any[] = [];
  folderFilterInput: any = '';
  @Input() public fromEnclosure;
  constructor(private dataService: DataService, private breadcrumbService: BreadcrumbService, public cs: ContentService, public app: AppComponent,private toastr:ToastrService,
    public ds: DocumentService, public browserEvents: BrowserEvents, private growlService: GrowlService, public us: UserService,
    private coreService: CoreService) {
    this.currentUser = this.us.getCurrentUser();
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.colHeaders = [
      { field: 'creator', header: 'Created By' },
      { field: 'ECMNo', header: 'ECM No' },
      { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
      { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
      { field: 'modifier', header: 'Modified By' }];
  }
  tabChange(e) {
    this.initSelections();

  }
  initSelections() {
    this.documentFolders = [];
    this.folderPath = '';
    this.ds.savedFolderBrowseDialog.setSelectedFolder = [];
    this.browserEvents.clearFolderSelection.emit();
    localStorage.removeItem('folderId');
    this.ds.savedFolderBrowseDialog.selectedFolderId = '';
    this.ds.savedFolderBrowseDialog.folderPathSavedBrowse = '';
  }
  closeClick() {
    this.onCancel.emit();
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
  }



  ngOnInit() {
    console.log(this.fromEnclosure)
    this.dataService.eventTabChanged$.subscribe(res => {
      if (res) {
        this.fromEnclosure = res;
        console.log(this.fromEnclosure)
      }
    })
    this.initSelections();
    if (this.ds.savedFolderBrowseDialog.folderPathSavedBrowse) {
      this.folderPath = this.ds.savedFolderBrowseDialog.folderPathSavedBrowse;
    }
    else {
      this.folderPath = '/ECMRootFolder/Public Folders/';
    }
    this.emptyMessage = globalv.no_doc_found;
    setTimeout(() => {
      this.browserEvents.sendFolderDocs.subscribe(data => this.assignFolderDocs(data));
    }
      , 6);
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
  clearFilterText() {
    (<HTMLInputElement>document.getElementById("filterFol")).value = '';
    this.folderFilterInput = '';
    this.refreshTable();
  }


  assignFolderDocs(data, isSave?) {
    this.browserEvents.folderPath.subscribe(val => this.assignFolderPath(val));
    if (data && data.length > 0) {
      data.map(d => {
        d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
        d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
        d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
      });
    }
    if (this.folderPath === '/ECMRootFolder/Public Folders/') {
      this.documentFolders = [];
    } else if (data && data.length > 0) {
      this.documentFolders = data.slice();
    } else {
      this.documentFolders = [];
    }
    if (data) {
      data.map((d, i) => {
        d.name = d.fileName;
      });
    }
    if (!isSave) {
      this.ds.savedFolderBrowseDialog.folderResultsSavedBrowse = data;
      (<HTMLInputElement>document.getElementById("filterFol")).value = '';
      this.folderFilterInput = '';
    }
  }

  getData(data: any) {
    this.selectedItem = data;
  }


  refresh(docs) {
    let loop = 0;
    docs.map((d, i) => {
      loop++;
      if (loop === docs.length) {
        docs.splice(0, docs.length);
        if (this.sideMenu.isOpened) {
          this.sideMenu.toggle();
        }
      }
    });
    const folderId = localStorage.getItem('folderId');
    this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data));
  }

  refreshTable() {
    const folderId = localStorage.getItem('folderId');
    this.busy = true;
    this.cs.getDocumentFolders(folderId).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data);
    }, err => {
      this.busy = false;
    });
  }

  toggle() {
    // if (this.sideMenu.isOpened !== false) {
    //   //this.sideMenu.toggle();
    // }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  addToCartMulti(docs) {
    let postArray = { empNo: this.currentUser.EmpNo, docIds: [] };
    docs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.busy = true;
    if (this.fromEnclosure == "Enclosuer") {
      postArray = { empNo: this.currentUser.EmpNo, docIds: [] };  
      docs.map((doc, index) => {
        if(doc.format && doc.format.toLowerCase() == "application/pdf")
          postArray.docIds.push(doc.id);
        else
          alert("Only PDF documents supported for enclosure");
      });  
      this.ds.addToEncMulti(postArray).subscribe(val => {
        this.busy = false;
        this.Success(val, docs);
      }, error => {
        this.busy = false;
        this.addToCartFailure()
      });
    } else {
      this.ds.addToCartMulti(postArray).subscribe(val => {
        this.busy = false;
        this.Success(val, docs);
      }, error => {
        this.busy = false;
        this.addToCartFailure()
      });
    }

  }

  Success(res, docs) {
    if (res.status !== 'Exists') {
      let temp = [...docs];
      let newarray = [];
      newarray = this.ds.checkedCartItems;
      temp.map(d => {
        newarray.push(d);
      });
      if (this.fromEnclosure == "Enclosure") {
        this.subscriptions.push(this.ds.getEnclosureCart(this.currentUser.EmpNo).subscribe((data) => {
          this.ds.refreshEnclosureCart(data);
          // this.browserEvents.setWfSubject.emit();
        }));
      } else {
        this.browserEvents.setCartSelection.emit(newarray);
        this.subscriptions.push(this.ds.getCart(this.currentUser.EmpNo).subscribe((data) => {
          this.ds.refreshCart(data);
          this.browserEvents.setWfSubject.emit();
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
    if (this.fromEnclosure == "Enclosure") {
      switch (res.status) {
        case 'Success':
          window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
          message = 'Document Added To Enclosures';
          break;
        case 'Exists':
          message = 'Document Already Exist in Enclosures';
          summary = 'Already Exist';
          severity = 'error';
          break;
        case 'Partial':
          window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
          message = 'Document Added To Enclosures';
          break;
      }
      // this.growlService.showGrowl({
      //   severity: severity,
      //   summary: summary,
      //   detail: message
      // });
      this.toastr.info(message, summary);
    }else{
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
    }

    
  }

  addToCartFailure() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add To Cart Failed'
    // });
    this.toastr.error('Add To Cart Failed', 'Failure');

  }
  updateSearchInDatatable() {
    const folderId = localStorage.getItem('folderId');
    this.folderFilterInput = (<HTMLInputElement>document.getElementById("filterFol")).value;
    this.busy = true;
    this.cs.getDocumentFolders(folderId, this.folderFilterInput).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data, true)
    }, err => {
      this.busy = false;
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.folderFilterInput = '';
    if (<HTMLInputElement>document.getElementById("filterFol") && (<HTMLInputElement>document.getElementById("filterFol")).value) {
      (<HTMLInputElement>document.getElementById("filterFol")).value = '';
    }
  }
}
