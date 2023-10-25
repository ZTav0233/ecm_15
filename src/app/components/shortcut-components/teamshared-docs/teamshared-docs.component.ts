import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { Subscription } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user/user.model';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { ContentService } from "../../../services/content.service";
import { GrowlService } from "../../../services/growl.service";
import { saveAs } from 'file-saver';
import * as _ from "lodash";

@Component({
  selector: 'app-teamshared-docs',
  templateUrl: './teamshared-docs.component.html',
  styleUrls: ['./teamshared-docs.component.css']
})
export class TeamsharedDocsComponent implements OnInit {
  public selectedItem: any[] = [];
  public colHeaders: any[];
  public itemsPerPage: any;
  showpanel = true;
  screen: any = 'Team';
  emptyMessage: any;
  public user = new User();
  private subscription: Subscription[] = [];
  public teamDocs: DocumentInfoModel[];
  @Output() showPanel = new EventEmitter();
  public busy: boolean;
  sideMenu: any;
  public exportFields: any[] = ['name', 'creator', 'addOn', 'modOn', 'modifier', 'format', 'verNo'];
  public gridItemsToExport: any[] = [];

  constructor(private breadcrumbService: BreadcrumbService, private ds: DocumentService, private us: UserService, private coreService: CoreService,
    private cs: ContentService, private growlService: GrowlService) {
    this.user = this.us.getCurrentUser();
    this.emptyMessage = globalv.no_doc_found;
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToTeam') {
      this.refreshTable();
    }
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

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

  getData(data: any, sidemenu?:any) {
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

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Team Added Documents' }
    ]);
    this.busy = true;
    this.ds.getTeamDocuments(this.user.EmpNo).subscribe(data => {
      this.busy = false;
      this.assignTeamDocs(data)
    }, error => {
      this.busy = false;
    });
  }

  assignTeamDocs(data) {
    data.map((d, i) => {
      d.name = d.fileName ? d.fileName : ' ';
      d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
      d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
      d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
      d.referenceNo = d.props ? this.coreService.getPropValue(d.props, 'ReferenceNo') : ' ';
    });
    this.teamDocs = data;
    this.gridItemsToExport = _.cloneDeep(this.teamDocs);
    this.colHeaders = [
      { field: 'creator', header: 'Created By' },
      { field: 'ECMNo', header: 'ECM No' },
      { field: 'referenceNo', header: 'Reference No' },
      { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
      { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
      { field: 'modifier', header: 'Modified By' }];
    this.colHeaders.push();
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
    this.refreshTable();
  }

  refreshTable() {
  this.ds.getTeamDocuments(this.user.EmpNo)
      .subscribe(data => this.assignTeamDocs(data));
  }

  getTeamUpdated(docs) {
    let loop = 0;
    docs.map((d, i) => {
      this.ds.removeFromFavorites(this.user.EmpNo, d.id)
        .subscribe(data => {
          loop++;
          if (loop === docs.length) {
            docs.splice(0, docs.length);
            this.ds.getTeamDocuments(this.user.EmpNo)
              .subscribe(val => this.assignTeamDocs(val));
            if (this.sideMenu.isOpened) {
              this.sideMenu.toggle();
            }
          }
        });
    });
  }

  toggle() {
    //this.sideMenu.toggle();
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
    // this.coreService.exportToExcel(this.teamDocs, fileName, this.exportFields);
    const teamDoc = JSON.parse(JSON.stringify(this.gridItemsToExport));
    teamDoc.map((doc, index) => {
      delete doc.name;
      delete doc.addOn2;
      delete doc.modOn2;
      delete doc.ECMNo;
    });
    this.busy = true;
    this.ds.exportFolderDocuments(teamDoc, 'Team Added Documents').subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'Team Added Documents' + '-' + this.coreService.getDateTimeForExport() + '.xlsx';
      saveAs(file, fileName);
    }, error => {
      this.busy = false;
    });
  }

  getBrowseUpdated(docs) {
    const folderId = this.ds.addToFolderId;
    this.cs.validateFolderPermissions(folderId, "ADD").subscribe(data => this.checkFolderPermission(data, docs, folderId));
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
    }
    else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'No Permission', detail: 'User dont have permission to add'
      });
    }
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      //this[k] = null;
      delete this[k];
    })
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.teamDocs = [];
    this.user = undefined;
    this.colHeaders = [];
    this.destroyKeys();
  }
}
