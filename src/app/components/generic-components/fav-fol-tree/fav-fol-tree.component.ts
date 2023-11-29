
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as $ from 'jquery';
import { BrowserEvents } from '../../../services/browser-events.service';
import { DocumentService } from '../../../services/document.service';
import * as global from '../../../global.variables';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { WorkflowService } from "../../../services/workflow.service";
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-fav-fol-tree',
  templateUrl: './fav-fol-tree.component.html',
  styleUrls: ['./fav-fol-tree.component.css']
})
export class FavFolTreeComponent implements OnInit {
  folderPath: any;
  folderList: any[];
  selectedFolder: any;
  index: any;
  favFolders = true;
  busy: boolean = false;
  private subscriptions: any[] = [];
  changeView = true;
  clearSelectedDocs = false;

  constructor(
    public cs: ContentService,
    public ds: DocumentService,
    private bs: BrowserEvents,
    private coreService: CoreService,
    private growlService: GrowlService,
    private ws: WorkflowService
  ) { }

  ngOnInit() {
    this.busy = true;
    this.cs.getFavoriteFolders().subscribe(data => {
      this.busy = false;
      this.getFavFolders(data)
    }, err => {
      this.busy = false;
    });
    this.bs.clearFolderSelection.subscribe(d => {
      this.selectedFolder = [];
    })

  }
  getFavFolders(data) {
    if (data.length > 0) {
      localStorage.setItem('folderId', data[0].id);
      localStorage.setItem('folderIdForMove', data[0].id);
      const favFolder = [];
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

    }
    else {
      //  this.favFolders = false;
      localStorage.removeItem('folderId');
      // this.documentFolders = [];
      this.folderList = [];
      this.folderPath = '';
      this.ds.savedFolderFav.folderResultsSavedFav = [];
      this.ds.savedFolderFav.folderTreeSavedFav = [];
      this.ds.savedFolderFav.folderPathSavedFav = '';
      this.favFolders = false;


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
    let fold = global.fold;
    data.map((d, i) => {
      if (d.name === fold) {
        this.folderList[0].expanded = true;
        this.selectedFolder = parent.children[i];
        this.ds.notRootPath = true;
        this.bs.folderPath.emit(d.path);
        localStorage.setItem('folderId', d.id);
        localStorage.setItem('path', d.path);
        this.bs.isRootFolShown.emit(d.id);
        this.busy = true;
        this.cs.getDocumentFolders(d.id).subscribe(data => {
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
    });
  }

  assignFolderDoc(data) {
    this.bs.sendFolderDocs.emit(data);
  }

  nodeSelect(event) {
    localStorage.setItem('folderId', event.node.data.id);
    localStorage.setItem('path', event.node.data.path);
    if (this.clearSelectedDocs !== true) {
      this.bs.clearSelectedDocs.emit();
    }
    if (this.changeView === true) {
      this.bs.sendFolderDocs.emit([]);
      this.folderPath = event.node.data.path;
      this.bs.folderPath.emit(this.folderPath);
      this.busy = true;
      this.cs.getDocumentFolders(event.node.data.id).subscribe(data => {
        this.busy = false;
        this.assignFolderDoc(data)
      }, err => {
        this.busy = false;
      });
    }
  }

  nodeExpand(event) {
    this.cs.getSubFolders(event.node.data.id).subscribe(data => {
      this.assignSubFolders(event.node, data)
    });
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

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }


  ngOnDestroy() {
    this.clearSubscriptions();

  }


}


