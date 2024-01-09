import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { Subscription } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user/user.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import * as globalv from '../../../global.variables';
import { CoreService } from '../../../services/core.service';
import { ContentService } from "../../../services/content.service";
import { GrowlService } from "../../../services/growl.service";
import { saveAs } from 'file-saver';
import * as _ from "lodash";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recents',
  templateUrl: './recents.component.html',
  styleUrls: ['./recents.component.css']
})
export class RecentsComponent implements OnInit {
  public selectedItem: any[] = [];
  public colHeaders: any[];
  public itemsPerPage: any;
  showpanel = true;
  emptyMessage: any;
  screen: any = 'Recents';
  public recDocuments: DocumentInfoModel[];
  @Output() showPanel = new EventEmitter();
  private subscription: Subscription[] = [];
  public user = new User();
  sideMenu: any;
  public busy: boolean;
  public exportFields: any[] = ['name', 'creator', 'addOn', 'modOn', 'modifier', 'format', 'verNo'];
  public gridItemsToExport: any[] = [];

  constructor(private breadcrumbService: BreadcrumbService, private ds: DocumentService, private us: UserService,private toastr:ToastrService,
    private coreService: CoreService, private cs: ContentService, private growlService: GrowlService) {
    this.user = this.us.getCurrentUser();
    this.emptyMessage = globalv.no_doc_found;
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
  }
  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'navigateToRec') {
      this.refreshTable();
    }
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  getData(data: any, sidemenu?):any {
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

  assignRecents(data) {
    data.map((d, i) => {
      d.name = d.fileName ? d.fileName : ' ';
      d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
      d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
      d.ECMNo = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
      d.referenceNo = d.props ? this.coreService.getPropValue(d.props, 'ReferenceNo') : ' ';
    });
    this.recDocuments = data;
    this.gridItemsToExport = _.cloneDeep(this.recDocuments);
    this.colHeaders = [
      { field: 'creator', header: 'Created By' },
      { field: 'ECMNo', header: 'ECM No' },
      { field: 'referenceNo', header: 'Reference No' },
      { field: 'addOn', header: 'Created On', sortField: 'addOn2' },
      { field: 'modOn', header: 'Modified On', sortField: 'modOn2' },
      { field: 'modifier', header: 'Modified By' }
    ];
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
    this.breadcrumbService.setItems([
      { label: 'My Recent Documents' }
    ]);
    this.busy = true;
    this.ds.getRecent(this.user.EmpNo).subscribe(data => {
      this.busy = false;
      this.assignRecents(data)
    }, error => {
      this.busy = false;
    });
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
    this.subscription.push(this.ds.getRecent(this.user.EmpNo)
      .subscribe(data => this.assignRecents(data)));
  }

  getRecUpdated(docs) {
    let loop = 0;
    docs.map((d, i) => {
      this.subscription.push(this.ds.removeFromFavorites(this.user.EmpNo, d.id)
        .subscribe(data => {
          loop++;
          if (loop === docs.length) {
            docs.splice(0, docs.length);
            this.subscription.push(this.ds.getRecent(this.user.EmpNo)
              .subscribe(val => this.assignRecents(val)));
            if (this.sideMenu.isOpened) {
              this.sideMenu.toggle();
            }
          }
        }));
    });
  }

  toggle() {
   // this.sideMenu.toggle();
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
    // this.coreService.exportToExcel(this.recDocuments, fileName, this.exportFields);
    const recDoc = JSON.parse(JSON.stringify(this.gridItemsToExport));
    recDoc.map((doc, index) => {
      delete doc.name;
      delete doc.addOn2;
      delete doc.modOn2;
      delete doc._$visited;
      delete doc.ECMNo;
    });
    this.busy = true;
    this.ds.exportFolderDocuments(recDoc, 'My Recent Documents').subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'My Recent Documents' + '-' + this.coreService.getDateTimeForExport() + '.xlsx';
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
              this.toastr.error('Document Already Exist In Destination Folder', 'Already Exist');
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
      this.toastr.info('User dont have permission to add', 'No Permission');
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
    this.recDocuments = [];
    this.user = undefined;
    this.colHeaders = [];
    this.destroyKeys();
  }
}
