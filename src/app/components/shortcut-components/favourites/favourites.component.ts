import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { DocumentService } from '../../../services/document.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/user.service';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { GrowlService } from '../../../services/growl.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { ContentService } from "../../../services/content.service";
import { saveAs } from 'file-saver';
import * as _ from "lodash";

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements OnInit, OnDestroy {
  public selectedItem: any[] = [];
  private subscription: Subscription[] = [];
  public itemsPerPage: any;
  emptyMessage: any;
  screen: any = 'Favourites';
  public user = new User();
  public sideMenu: any;
  public busy: boolean;
  public favDocuments: DocumentInfoModel[];
  @Output() showPanel = new EventEmitter();
  colHeaders: any[] = [
    { field: 'creator', header: 'Created By' },
    { field: 'ECMNo', header: 'ECM No' },
    { field: 'referenceNo', header: 'Reference No' },
    { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
    { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
    { field: 'modifier', header: 'Modified By' }];
  public exportFields: any[] = ['name', 'creator', 'addOn', 'modOn', 'modifier', 'format', 'verNo'];
  public gridItemsToExport: any[] = [];

  constructor(private breadcrumbService: BreadcrumbService, public ds: DocumentService, private us: UserService,
    private bs: BrowserEvents, private growlService: GrowlService, private coreService: CoreService,
    private cs: ContentService) {
    this.user = this.us.getCurrentUser();
    this.emptyMessage = globalv.no_doc_found;
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToFav') {
      this.refreshTable();
    }
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

  getRowTrackBy = (index, item) => {
    return item.id;
  };


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
      { label: 'My Favorite Documents' }
    ]);
    this.busy = true;
    this.ds.getFavourites(this.user.EmpNo).subscribe(data => {
      this.busy = false;
      this.assignFavourites(data)
    }, error => {
      this.busy = false;
    });
  }

  toggle() {
    //this.sideMenu.toggle();
  }

  assignFavourites(data) {
    data.map((d, i) => {
      d.name = d.fileName ? d.fileName : ' ';
      d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
      d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
      d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
      d.referenceNo = d.props ? this.coreService.getPropValue(d.props, 'ReferenceNo') : ' ';
    });
    this.favDocuments = data;
    this.gridItemsToExport = _.cloneDeep(this.favDocuments);
  }

  getFavUpdated(docs) {
    let postArray = { empNo: this.user.EmpNo, docIds: [] };
    docs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.busy = true;
    this.ds.removeFromFavMulti(postArray).subscribe(res => {
      this.busy = false;
      this.removeFromFavMessage(res, docs), error => this.removeFromFavMessageFailure()
    }, error => {
      this.busy = false;
    });
  }

  removeFromFavMessageFailure() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Remove From Favorites Failed'
    });
  }

  removeFromFavMessage(res, docs) {
    let message = '';
    let summary = 'Success';
    let severity = 'info';
    switch (res.status) {
      case 'Success':
        message = 'Document Removed From Favorites';
        break;
      case 'Partial':
        message = 'Document Removed From Favorites';
        break;
    }
    this.growlService.showGrowl({
      severity: severity,
      summary: summary,
      detail: message
    });
    this.refresh(docs);
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
    this.busy = true;
    this.ds.getFavourites(this.user.EmpNo).subscribe(res => {
      this.busy = false;
      this.assignFavourites(res)
    }, error => {
      this.busy = false;
    });
  }

  clearSubscriptions() {
    this.subscription.map(s => {
      s.unsubscribe();
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

  getFilteredItems(filteredItems) {
    this.gridItemsToExport = filteredItems;
  }

  exportToExcel() {
    // this.coreService.exportToExcel(this.favDocuments, fileName,this.exportFields);
    const favDoc = JSON.parse(JSON.stringify(this.gridItemsToExport));
    favDoc.map((doc, index) => {
      delete doc.name;
      delete doc.addOn2;
      delete doc.modOn2;
      delete doc.ECMNo;
    });
    this.busy = true;
    this.ds.exportFolderDocuments(favDoc, 'My Favorite Documents').subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'My Favorite Documents' + '-' + this.coreService.getDateTimeForExport() + '.xlsx';
      saveAs(file, fileName);
    }, error => {
      this.busy = false;
    });
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      delete this[k];
    })
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.favDocuments = [];
    this.user = undefined;
    this.colHeaders = [];
    this.destroyKeys();
  }

}
