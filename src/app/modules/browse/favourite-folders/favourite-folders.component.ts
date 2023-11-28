import { Component, Input, OnDestroy} from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContentService } from '../../../services/content.service';
import { DocumentService } from '../../../services/document.service';
import { AppComponent } from '../../../app.component';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Subscription } from 'rxjs';
import * as globalv from '../../../global.variables';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from "../../../services/core.service";
import { UserService } from "../../../services/user.service";
import { saveAs } from 'file-saver';
import * as _ from "lodash";

@Component({
  selector: 'favourite-folders',
  templateUrl: './favourite-folders.component.html',
  providers: [ContentService],
})
export class FavouriteFoldersComponent implements OnDestroy {
  folderList: TreeNode[];
  public tableData: any[];
  public selectedItem: any[] = [];
  emptyMessage: any;
  documentFolders: DocumentInfoModel[];
  public colHeaders: any[];
  public itemsPerPage: any;
  screen: any = 'Browse';
  loading: boolean;
  public sideMenu: any;
  folderPath: any;
  public busy: boolean;
  private subscription: Subscription[] = [];
  index: any;
  favFolders = true;
  cmItems: MenuItem[];
  selectedFolder: any;
  viewMoveTree = false;
  openDocVisible = false;
  assignedPath: any;
  assignedId: any;
  @Input() public clearSelectedDocs: any = false;
  public folderPermission = { usage: 'rightPanel', folderSelected: false, permission: true };
  public gridItemsToExport: any[] = [];
  folderFilterInput:any='';
  constructor(private breadcrumbService: BreadcrumbService, public cs: ContentService, public app: AppComponent,
    public ds: DocumentService, private bs: BrowserEvents, private growlService: GrowlService, public us: UserService,
    private coreService: CoreService) {
    this.subscription.push(this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    }));
    this.colHeaders = [
      { field: 'creator', header: 'Created By' },
      { field: 'ECMNo', header: 'ECM No' },
      { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
      { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
      { field: 'modifier', header: 'Modified By' }];
    this.colHeaders.push();
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
   // this.loadSavedDocuments()
  }

  loadSavedDocuments() {
    if (this.ds.savedFolderFav.folderResultsSavedFav) {
      this.documentFolders = this.ds.savedFolderFav.folderResultsSavedFav;
      this.gridItemsToExport = _.cloneDeep(this.documentFolders);
    }
  }
  getRowTrackBy = (index, item) => {
    return item.id;
  };

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Favorite Folders' }
    ]);
    // if (this.ds.savedFolderFav.setSelectedFolder) {
    //   this.selectedFolder = this.ds.savedFolderFav.setSelectedFolder;
    //   localStorage.setItem('folderId', this.ds.savedFolderFav.selectedFolderId);
    // }
    localStorage.setItem('split-pane', null);
    this.emptyMessage = globalv.no_doc_found;
    setTimeout(() => this.setPanelOverlay(), 0);
    // if (this.ds.savedFolderFav.folderTreeSavedFav && this.ds.savedFolderFav.folderTreeSavedFav.length > 0) {
    //   this.folderList = this.ds.savedFolderFav.folderTreeSavedFav;
    //   if (this.ds.savedFolderFav.folderPathSavedFav) {
    //     this.folderPath = this.ds.savedFolderFav.folderPathSavedFav;
    //   }
    // } else {
      this.busy = true;
      this.cs.getFavoriteFolders().subscribe(data => {
        this.busy = false;
        this.getFavFolders(data)
      }, err => {
        this.busy = false;
      });
    //}
    // this.busy = true;
    this.bs.closeAddDocModel.subscribe(data => {
      // this.busy = false;
      this.assignModelClose(data)
    }, err => {
      // this.busy = false;
    });
  }

  assignModelClose(data) {
    if (data === 'close') {
      this.openDocVisible = false;
    }
  }

  addDocTrigger() {
    this.openDocVisible = true;
    this.bs.addDocPath.emit(localStorage.getItem('path'));
    this.bs.addDocId.emit(localStorage.getItem('folderId'));
  }

  setPanelOverlay() {
    if (this.app.layoutStatic === true) {
      this.app.layoutStatic = false;
    }
  }

  getFavFolders(data) {
    if (data.length > 0) {
      // if (this.ds.folderPathSavedFav) {
      //   this.folderPath = this.ds.folderPathSavedFav;
      // }
      // else {
      if (data[0].path !== undefined) {
        //this.folderPath = data[0].path;
      }
      // }

      localStorage.setItem('folderId', data[0].id);
      localStorage.setItem('folderIdForMove', data[0].id);
      const favFolder = [];
      // const subscription = this.cs.getDocumentFolders(data[0].id).subscribe(res => this.assignFolderDocs(res));
      data.map((d, i) => {
        if (d != null) {
          if (d.type === 'Folder') {
            favFolder.push({
              label: d.name,
              data: d,
              'level': '1',
              'expandedIcon': 'fa fa-fw ui-icon-folder-open',
              'collapsedIcon': 'fa fa-fw ui-icon-folder',
              'children': [],
              'leaf': false
            });
          }
          else {
            favFolder.push({
              label: d.name,
              data: d,
              'level': '1',
              'expandedIcon': 'fa fa-fw ui-icon-folder-open',
              'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
              'children': [],
              'leaf': false
            });
          }
        }
      });
      this.folderList = favFolder;
      this.loading = false;

    }
    else {
      this.favFolders = false;
      localStorage.removeItem('folderId');
      this.documentFolders = [];
      this.folderList = [];
      this.loading = false;
      this.folderPath = '';
      this.ds.savedFolderFav.folderResultsSavedFav = [];
      this.ds.savedFolderFav.folderTreeSavedFav = [];
      this.ds.savedFolderFav.folderPathSavedFav = '';


    }

  }

  // assignFolderPath(data) {
  //   this.folderPath = data;
  //   this.assignedPath=data;
  //   localStorage.setItem('path', data);
  //   this.assignedId=localStorage.getItem('folderId');
  //   console.log(this.assignedId);
  // }
  onDocumentAdded() {
    this.bs.closeAddDocModel.emit('close');
    this.busy = true;
    this.cs.getDocumentFolders(this.assignedId).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data)
    }, err => {
      this.busy = false;
    });
    this.folderPath = localStorage.getItem('path');
  }

  assignFolderDocs(data,isSave?) {
    data.map(d => {
      d.name = d.fileName ? d.fileName : ' ';
      d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
      d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
      d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
    });
    this.documentFolders = data;
    this.gridItemsToExport = _.cloneDeep(this.documentFolders);
    if(!isSave){
      (<HTMLInputElement>document.getElementById("filterFol")).value='';
      this.folderFilterInput='';
    }
   // this.ds.savedFolderFav.folderResultsSavedFav = data;
  }
   clearFilterText(){
     (<HTMLInputElement>document.getElementById("filterFol")).value='';
      this.folderFilterInput='';
      this.refreshTable();
  }

  getData(data: any, sidemenu?: any) {
    this.sideMenu = sidemenu;
    this.selectedItem = data;
    if (data !== null && data !== undefined) {
      if (data.length === 0 && sidemenu.isOpened) {
        sidemenu.toggle();
      }
      if (data.length >= 1 && !sidemenu.isOpened) {
        sidemenu.show();
      }
    }
  }


  refresh(docs) {
    let loop = 0;
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
      this.subscription.push(this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data)));
    }
    docs.map((d, i) => {
      loop++;
      if (loop === docs.length) {
        docs.splice(0, docs.length);
        if (this.sideMenu.isOpened) {
          this.sideMenu.toggle();
        }

      }
    });
    localStorage.removeItem('unfileClicked');
  }

  refreshTable() {
    const folderId = localStorage.getItem('folderId');
    this.subscription.push(this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data)));
  }

  toggle() {
    //this.sideMenu.toggle();
  }

  getBrowseUpdated(docs) {
    const folderId = this.ds.addToFolderId;
    this.subscription.push(this.cs.validateFolderPermissions(folderId, "ADD")
      .subscribe(data => this.checkFolderPermission(data, docs, folderId)));
  }

  checkFolderPermission(res, docs, folderId) {
    if (res === true) {
      let loop = 0;
      docs.map((d, i) => {
        this.subscription.push(this.cs.fileInFolder(folderId, d.id)
          .subscribe(data => {
            if (data === 'OK') {
              this.growlService.showGrowl({
                severity: 'info',
                summary: 'Success', detail: 'Document Added To Folder'
              });
              loop++;
              if (loop === docs.length) {
                docs.splice(0, docs.length);

              }
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

          }));
      });
    } else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'No Permission', detail: 'User dont have permission to add'
      });
    }

  }


  nodeSelect(event) {
    if (this.ds.savedFolderFav.selectedFolderId === this.selectedFolder.data.id) {
      return;
    }
    this.folderPath = event.node.data.path;
    this.ds.savedFolderFav.folderPathSavedFav = this.folderPath;
    this.bs.folderPath.emit(this.folderPath);
    localStorage.setItem('folderId', event.node.data.id);
    localStorage.setItem('folderIdForMove', event.node.data.id);
    localStorage.setItem('folderIdForMoveConfirm', event.node.data.id);
    this.assignedPath = event.node.data.path;
    localStorage.setItem('path', event.node.data.path);
    this.assignedId = event.node.data.id;
    if (this.clearSelectedDocs !== true) {
      this.bs.clearSelectedDocs.emit();
    }
    this.busy = true;
    this.cs.getDocumentFolders(event.node.data.id).subscribe(data => {
      this.busy = false;
      this.assignFolderDocs(data)
    }, err => {
      this.busy = false;
    });
    this.ds.savedFolderFav.selectedFolderId = event.node.data.id;
  }

  nodeExpand(event) {
    // this.folderPath = event.node.data.path;
    // this.bs.folderPath.emit(this.folderPath);
    this.subscription.push(this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data)));
  }

  assignSubFolders(parent, data) {
    this.index++;
    const subFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'Folder') {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'leaf': false
          });
        }
        else {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'leaf': false
          });
        }
      }
    });
    parent.children = subFolder;
    if (this.index === 1) {

    }

  }

  onContextMenu(folder) {
    localStorage.setItem('folderIdForMove', folder.node.data.id);
    if (folder.node.level === '1') {
      this.cmItems = [
        {
          label: 'Remove Favorites',
          icon: 'ui-icon-star-border',
          command: (event) => this.removeFolderFav(this.selectedFolder)
        },
      ];
    }
    else {
      this.cmItems = [
        // {
        //   label: 'Move To Folder',
        //   icon: 'ui-icon-open-in-browser',
        //   command: (event) => this.moveFolderToFolder(this.selectedFolder)
        // },
        // {
        //   label: 'Remove Favourites',
        //   icon: 'ui-icon-star-border',
        //   command: (event) => this.removeFolderFav(this.selectedFolder)
        // },
      ];
    }

  }

  moveFolderToFolder(selectedFolder) {
    this.viewMoveTree = true;
  }

  moveConfirm() {
    const source = localStorage.getItem('folderIdForMove');
    const target = localStorage.getItem('folderId');
    this.subscription.push(this.cs.moveFolderToFolder(source, target).subscribe(data => this.moveSuccess(), err => this.moveFailed()));
  }

  moveSuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Move To Folder Success'
    });
    this.viewMoveTree = false;
    this.subscription.push(this.cs.getFavoriteFolders().subscribe(data => this.getFavFolders(data)));
  }

  moveFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Move To Folder Failed'
    });
  }

  removeFolderFav(selectedFolder) {
    this.subscription.push(this.cs.removeFolderFromFavorites(selectedFolder.data.id)
      .subscribe(data => this.remFavSuccess(), error => this.remFavFailed()));
  }

  remFavSuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Folder Removed From Favorites'
    });
    this.documentFolders = [];
    this.subscription.push(this.cs.getFavoriteFolders().subscribe(data => this.getFavFolders(data)));
    this.gridItemsToExport=[];
  }

  remFavFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Remove From Favorites'
    });
  }

  clearSubscriptions() {
    this.subscription.map(s => {
      s.unsubscribe();
    });
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

  destroyKeys() {
    Object.keys(this).map(k => {
      delete this[k];
    })
  }

  refreshTree() {
    this.busy = true;
    this.cs.getFavoriteFolders().subscribe(data => {
      this.busy = false;
      this.getFavFolders(data)
    }, err => {
      this.busy = false;
    });
    this.documentFolders = [];
    this.ds.savedFolderFav.folderResultsSavedFav = [];
    this.ds.savedFolderFav.selectedFolderId = '';
    this.folderPath = '';
    localStorage.removeItem('folderId');
    localStorage.removeItem('path');
    localStorage.removeItem('folderIdForMove');
    this.assignedPath = '';
    this.assignedId = '';
    this.gridItemsToExport=[];
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

  ngOnDestroy() {
    this.clearSubscriptions();
    this.documentFolders = [];
    this.colHeaders = [];
    this.cmItems = [];
    this.app.layoutStatic = true;
    localStorage.removeItem('folderId');
    localStorage.removeItem('path');
    localStorage.removeItem('folderIdForMove');
    this.viewMoveTree = false;
    //this.ds.savedFolderFav.folderTreeSavedFav = this.folderList;
    this.ds.savedFolderFav.setSelectedFolder = this.selectedFolder;
    this.destroyKeys();
    this.folderFilterInput='';
    if(<HTMLInputElement>document.getElementById("filterFol") && (<HTMLInputElement>document.getElementById("filterFol")).value){
      (<HTMLInputElement>document.getElementById("filterFol")).value='';
    }
  }


}
