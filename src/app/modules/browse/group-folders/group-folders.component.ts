// import {Component, Renderer} from '@angular/core';
// import {MenuItem, TreeNode} from 'primeng/primeng';
// import {ContentService} from '../../../services/content.service';
// import {DocumentService} from '../../../services/document.service';
// import {AppComponent} from '../../../app.component';
// import {DocumentInfoModel} from '../../../models/document/document-info.model';
// import {BrowserEvents} from '../../../services/browser-events.service';
// import {BreadcrumbService} from '../../../services/breadcrumb.service';
// import {Subscription} from 'rxjs/Rx';
// import * as global from '../../../global.variables';
// import {GrowlService} from '../../../services/growl.service';
// import {CoreService} from "../../../services/core.service";

// @Component({
//   selector: 'group-folders',
//   templateUrl: './group-folders.component.html',
//   providers: [ContentService],
// })
// export class GroupFoldersComponent {
//   folderList: TreeNode[];
//   public tableData: any[];
//   public selectedItem: any[] = [];
//   emptyMessage: any;
//   documentFolders: DocumentInfoModel[];
//   public colHeaders: any[];
//   public itemsPerPage: any;
//   screen: any = 'Browse';
//   loading: boolean;
//   public sideMenu: any;
//   folderPath: any;
//   public busy: Subscription;
//   private subscription: Subscription[] = [];
//   index: any;
//   favFolders = true;
//   cmItems: MenuItem[];
//   selectedFolder: TreeNode;

//   constructor(private breadcrumbService: BreadcrumbService, public cs: ContentService, public app: AppComponent,
//               public ds: DocumentService, private bs: BrowserEvents, private growlService: GrowlService,
//               private coreService:CoreService) {
//     this.breadcrumbService.setItems([
//       {label: 'Folders'},
//       {label: 'Group Folders'}
//     ]);
//   }

//   ngOnInit() {
//     this.emptyMessage = global.no_doc_found;
//     setTimeout(() => this.setPanelOverlay(), 0);
//     this.subscription.push(this.cs.getFavoriteFolders().subscribe(data => this.getFavFolders(data)));

//   }

//   setPanelOverlay() {
//     if (this.app.layoutStatic === true) {
//       this.app.layoutStatic = false;
//     }
//   }

//   getFavFolders(data) {
//     if (data.length > 0) {
//       if (data[0].path !== undefined) {
//         this.folderPath = data[0].path;
//       }
//       localStorage.setItem('folderId', data[0].id);
//       const favFolder = [];
//       this.cs.getDocumentFolders(data[0].id).subscribe(res => this.assignFolderDocs(res));
//       data.map((d, i) => {
//         if (d != null) {
//           if (d.type === 'Folder') {
//             favFolder.push({
//               label: d.name,
//               data: d,
//               'level': '1',
//               'expandedIcon': 'ui-icon-folder-open',
//               'collapsedIcon': 'ui-icon-folder',
//               'children': [],
//               'leaf': false
//             });
//           }
//           else {
//             favFolder.push({
//               label: d.name,
//               data: d,
//               'level': '1',
//               'expandedIcon': 'ui-icon-folder-open',
//               'collapsedIcon': 'ui-icon-folder-shared',
//               'children': [],
//               'leaf': false
//             });
//           }
//         }
//       });
//       this.folderList = favFolder;
//       this.loading = false;
//     }
//     else {
//       this.favFolders = false;
//       localStorage.removeItem('folderId');
//       this.documentFolders = [];
//       this.folderList = [];
//       this.loading = false;
//       this.folderPath = '';


//     }

//   }

//   assignFolderPath(data) {
//     this.folderPath = data;
//   }

//   assignFolderDocs(data) {
//     data.map(d=>{
//       d.name = d.props[0].mvalues ? d.props[0].mvalues : ' ';
//       d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
//       d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
//     });
//     this.documentFolders = data;
//     this.colHeaders = [
//       {field: 'creator', header: 'Created By'},
//       {field: 'addOn', header: 'Added On',sortField:'addOn2'},
//       {field: 'modOn', header: 'Modified On',sortField:'modOn2'},
//       {field: 'modifier', header: 'Modified By'}];
//     this.colHeaders.push();
//     this.itemsPerPage = 15;
//   }

//   getData(data: any, sidemenu: any) {
//     this.sideMenu = sidemenu;
//     this.selectedItem = data;
//     if (data !== undefined) {
//       if (data.length === 0 && sidemenu.isOpened) {
//         sidemenu.toggle();
//       }
//       if (data.length >= 1 && !sidemenu.isOpened) {
//         sidemenu.toggle();
//       }
//     }
//   }


//   refresh(docs) {
//     let loop = 0;
//     const folderId = localStorage.getItem('folderId');
//     if(localStorage.getItem('unfileClicked')==='true'){
//        this.busy=this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data));
//     }
//     else{
//       this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data));
//     }
//     docs.map((d, i) => {
//       loop++;
//       if (loop === docs.length) {
//         docs.splice(0, docs.length);
//         if (this.sideMenu.isOpened) {
//           this.sideMenu.toggle();
//         }

//       }
//     });

//   }

//   refreshTable() {
//     const folderId = localStorage.getItem('folderId');
//     this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data));
//   }

//   toggle() {
//     this.sideMenu.toggle();
//   }

//   getBrowseUpdated(docs) {
//     const folderId = localStorage.getItem('folderId');
//     let loop = 0;
//     docs.map((d, i) => {
//       this.subscription.push(this.cs.fileInFolder(folderId, d.id)
//         .subscribe(data => {
//           if (data.ok === true) {
//             this.growlService.showGrowl({
//               severity: 'info',
//               summary: 'Success', detail: 'Add To Folder Success'
//             });
//           }
//           else {
//             this.growlService.showGrowl({
//               severity: 'error',
//               summary: 'Failure', detail: 'Add To Folder  Failed'
//             });
//           }
//           loop++;
//           if (loop === docs.length) {
//             docs.splice(0, docs.length);

//           }
//         }));
//     });
//   }


//   nodeSelect(event) {
//     this.folderPath = event.node.data.path;
//     this.bs.folderPath.emit(this.folderPath);
//     localStorage.setItem('folderId', event.node.data.id);
//     this.busy = this.cs.getDocumentFolders(event.node.data.id).subscribe(data => this.assignFolderDocs(data));
//   }

//   nodeExpand(event) {
//     this.folderPath = event.node.data.path;
//     this.bs.folderPath.emit(this.folderPath);
//     this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data));
//   }

//   assignSubFolders(parent, data) {
//     this.index++;
//     const subFolder = [];
//     data.map((d, i) => {
//       if (d != null) {
//         if (d.type === 'Folder') {
//           subFolder.push({
//             label: d.name,
//             data: d,
//             'level': '2',
//             'expandedIcon': 'ui-icon-folder-open',
//             'collapsedIcon': 'ui-icon-folder',
//             'leaf': false
//           });
//         }
//         else {
//           subFolder.push({
//             label: d.name,
//             data: d,
//             'level': '2',
//             'expandedIcon': 'ui-icon-folder-open',
//             'collapsedIcon': 'ui-icon-folder-shared',
//             'leaf': false
//           });
//         }
//       }
//     });
//     parent.children = subFolder;
//     if (this.index === 1) {

//     }

//   }

//   onContextMenu(folder) {
//     this.cmItems = [
//       {label: 'Remove Favourites', icon: 'ui-icon-star-border', command: (event) => this.removeFolderFav(this.selectedFolder)},
//     ];

//   }

//   removeFolderFav(selectedFolder) {
//     this.cs.removeFolderFromFavorites(selectedFolder.data.id).subscribe(data => this.remFavSuccess(), error => this.remFavFailed());
//   }

//   remFavSuccess() {
//     this.growlService.showGrowl({
//       severity: 'info',
//       summary: 'Success', detail: 'Folder Removed From Favourites'
//     });
//     this.cs.getFavoriteFolders().subscribe(data => this.getFavFolders(data));
//   }

//   remFavFailed() {
//     this.growlService.showGrowl({
//       severity: 'error',
//       summary: 'Failure', detail: 'Failed To Remove From Favourites'
//     });
//   }

//   clearSubscriptions() {
//     this.subscription.map(s => {
//       s.unsubscribe();
//     });
//   }

//   ngOnDestroy() {
//     this.clearSubscriptions();
//     this.documentFolders = [];
//     this.folderList = [];
//     this.colHeaders = [];
//     this.cmItems = [];
//     this.app.layoutStatic = true;
//     localStorage.removeItem('folderId');
//     localStorage.removeItem('path');


//   }


// }
