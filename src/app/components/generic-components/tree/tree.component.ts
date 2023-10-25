import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrowserEvents } from '../../../services/browser-events.service';
import { DocumentService } from '../../../services/document.service';
import { MenuItem } from 'primeng/api';
import * as global from '../../../global.variables';
import { DocumentSecurityModel } from '../../../models/document/document-security.model';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { WorkflowService } from "../../../services/workflow.service";
import { ContentService } from '../../../services/content.service';
import * as _ from 'lodash';

@Component({
  selector: 'tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {
  cmItems: MenuItem[];
  folderPath: any;
  viewMoveTree: boolean;
  viewSecurity: boolean;
  folderList: any[];
  selectedFolder: any;
  folderTitle: any;
  index: any;
  privilage: any;
  busy: boolean;
  @Input() public clearSelectedDocs: any = false;
  @Input() public changeView = true;
  @Input() public isPopUp = false;
  @Input() public folderPermission: any;
  public folderSecurity: any;
  private subscriptions: any[] = [];
  public moveToFolderPermission = { usage: 'moveToFolder', folderSelected: false, permission: true };

  constructor(public cs: ContentService, public ds: DocumentService, private bs: BrowserEvents, private coreService: CoreService,
    private growlService: GrowlService, private ws: WorkflowService) {
  }

  ngOnInit() {
    if (this.ds.savedFolderBrowse.folderTreeSaved && this.ds.savedFolderBrowse.folderTreeSaved.length > 0 && !this.isPopUp) {
      this.folderList = this.ds.savedFolderBrowse.folderTreeSaved;
    } else {
      this.cs.getTopFolders().subscribe(data => this.getMainFolders(data));
    }
    if (this.ds.savedFolderBrowse.setSelectedFolder && !this.isPopUp) {
      this.selectedFolder = this.ds.savedFolderBrowse.setSelectedFolder;
      localStorage.setItem('folderId', this.ds.savedFolderBrowse.selectedFolderId);
    }
    this.viewSecurity = false;
    this.viewMoveTree = false;
    this.bs.clearFolderSelection.subscribe(d => {
      this.selectedFolder = [];
    })
  }

  showPrivilages(data) {
    this.cs.getAccessPrivileges(data.accessMask).subscribe(val => this.assignPrivilages(val))
  }

  assignPrivilages(data) {
    this.privilage = data;
  }

  addFolderFav(selectedFolder) {
    this.cs.addFolderToFavorites(selectedFolder.data.id).subscribe(data => this.addFavSuccess(data), error => this.addFavFailed());
  }

  addFavSuccess(data) {
    if (data.toLocaleLowerCase().trim() === 'ok') {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Folder Added To Favorites'
      });
      window.parent.postMessage('AddFavFolSuccess', '*');
    } else if (data.toLocaleLowerCase().trim() === 'exists') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'Folder already exists in Favorites'
      });
    } else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed To Add Folder To Favorites. Please Contact Administrator.'
      });
    }
  }

  addFavFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Add To Favorites'
    });
  }

  onContextMenu(folder) {
    localStorage.setItem('folderIdForMove', folder.node.data.id);
    if (folder.node.level === '1') {
      this.cmItems = [
        { label: 'Add To Favorites', icon: 'ui-icon-star', command: (event) => this.addFolderFav(this.selectedFolder) },
        { label: 'View Security', icon: 'ui-icon-https', command: (event) => this.viewSecurities(this.selectedFolder) }
      ];
    }
    else {
      let isDisabled = false;
      this.cs.validateFolderPermissions(folder.node.data.id, 'MOVE').subscribe(data => {
        isDisabled = !data;

        this.cmItems = [
          { label: 'Add To Favorites', icon: 'ui-icon-star', command: (event) => this.addFolderFav(this.selectedFolder) },
          // {
          //   label: 'Move To Folder',
          //   icon: 'ui-icon-open-in-browser', disabled: isDisabled,
          //   command: (event) => this.moveFolderToFolder(this.selectedFolder)
          // },
          { label: 'View Security', icon: 'ui-icon-https', command: (event) => this.viewSecurities(this.selectedFolder) }
        ];
      });
    }
  }

  viewSecurities(selectedFolder) {
    this.folderTitle = this.selectedFolder.data.name;
    this.viewSecurity = true;
    this.viewMoveTree = false;
    this.cs.getFolderPermissions(selectedFolder.data.id).subscribe(data => this.assignPermissions(data));
  }

  assignPermissions(data) {
    this.folderSecurity = data;
  }

  moveFolderToFolder(selectedFolder) {
    this.viewMoveTree = true;
    this.viewSecurity = false;
  }

  moveConfirm() {
    const source = localStorage.getItem('folderIdForMove');
    const target = localStorage.getItem('folderId');
    this.cs.moveFolderToFolder(source, target).subscribe(data => this.moveSuccess(), err => this.moveFailed())
  }

  moveSuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Move To Folder Success'
    });
    this.viewMoveTree = false;
    this.cs.getTopFolders().subscribe(data => this.getMainFolders(data));
  }

  moveFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Move To Folder Failed'
    });
  }

  getMainFolders(data) {
    if (data[0].id !== undefined) {
      localStorage.setItem('folderId', data[0].id);
    }
    if (localStorage.getItem('folderIdForMove') === null) {
      localStorage.setItem('folderIdForMove', data[0].id);
    }
    if (this.changeView === true) {
      this.folderPath = data[0].path;
      this.bs.folderPath.emit(this.folderPath);
    }
    let topFolder = [];
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
    let isDefaultFolderExistInTopFolder = false;
    this.folderList = _.sortBy(topFolder, function (item) {
      let folderName = _.cloneDeep(item.label);
      if (folderName.toUpperCase() === global.fold.toUpperCase()) {
        isDefaultFolderExistInTopFolder = true;
      }
      return (folderName.toUpperCase() === global.fold.toUpperCase()) ? 0 : 1;
    });
    //this.folderList = topFolder;
    if (global.fold && isDefaultFolderExistInTopFolder && !this.isPopUp) {
      this.cs.getSubFolders(this.folderList[0].data.id).subscribe(data =>
        this.assignSubFoldersFor(this.folderList[0], data));
    } else {
      this.ds.notRootPath = false;
      this.bs.isRootFolShown.emit();
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
    if (parent.data.name === global.fold) {
      parent.expanded = true;
      this.selectedFolder = parent;
      this.ds.notRootPath = true;
      //this.bs.folderPath.emit(parent.data.path);
      localStorage.setItem('folderId', parent.data.id);
      localStorage.setItem('path', parent.data.path);
      this.bs.isRootFolShown.emit(parent.data);
      this.busy = true;
      this.cs.getDocumentFolders(parent.data.id).subscribe(data => {
        this.busy = false;
        this.assignFolderDoc(data)
      }, err => {
        this.busy = false;
      });
    }
    else {
      this.ds.notRootPath = false;
      this.bs.isRootFolShown.emit();
    }
  }

  assignFolderDoc(data) {
    this.bs.sendFolderDocs.emit(data);
  }

  nodeSelect(event) {
    if ((this.ds.savedFolderBrowse.selectedFolderId === this.selectedFolder.data.id) && !this.isPopUp) {
      return;
    }
    if (this.folderPermission && this.folderPermission.usage === 'addDocument') {
      this._validateFolderPermission(event);
    } else {
      localStorage.setItem('folderId', event.node.data.id);
      localStorage.setItem('path', event.node.data.path);
      if (this.clearSelectedDocs !== true) {
        this.bs.clearSelectedDocs.emit();
      }
      if (this.changeView === true) {
        this.bs.sendFolderDocs.emit([]);
        this.folderPath = event.node.data.path;
        this.bs.folderPath.emit(this.folderPath);
        localStorage.setItem('folderIdForMove', event.node.data.id);
        localStorage.setItem('folderIdForMoveConfirm', event.node.data.id);
        this.busy = true;
        this.cs.getDocumentFolders(event.node.data.id).subscribe(data => {
          this.busy = false;
          this.assignFolderDoc(data)
        }, err => {
          this.busy = false;
        });
        this.ds.savedFolderBrowse.selectedFolderId = event.node.data.id;
        this.ds.savedFolderBrowse.folderPathSavedBrowse = this.folderPath;
      }
    }
  }

  _validateFolderPermission(event) {
    this.cs.validateFolderPermissions(event.node.data.id, 'ADD').subscribe(data => {
      this.folderPermission.folderSelected = true;
      if (data !== true) {
        this.folderPermission.permission = true;
      } else {
        this.folderPermission.permission = false;
      }
    });
  }

  nodeExpand(event) {
    if (this.changeView === true) {
      // this.folderPath = event.node.data.path;
      // this.bs.folderPath.emit(this.folderPath);
      //this.busy = this.cs.getDocumentFolders(event.node.data.id).subscribe(data => this.assignFolderDoc(data));
    }
    this.busy=true;
    this.cs.getSubFolders(event.node.data.id).subscribe(data =>
      this.assignSubFolders(event.node, data)
    );
  }

  assignSubFolders(parent, data) {
    this.busy=false;
    this.index++;
    const subFolder = [];
    data.map((d, i) => {
      //for(var i=0;i<5000;i++) {
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
     // }
    });
    parent.children = subFolder;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    if (!this.isPopUp) {
      this.ds.savedFolderBrowse.folderTreeSaved = this.folderList;
      this.ds.savedFolderBrowse.setSelectedFolder = this.selectedFolder;
    }
  }
}
