import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../services/breadcrumb.service";
import * as globalv from "../../../global.variables";
import {DocumentInfoModel} from "../../../models/document/document-info.model";
import {ContentService} from "../../../services/content.service";
import {CoreService} from "../../../services/core.service";
import {AdminService} from "../../../services/admin.service";
import {GrowlService} from "../../../services/growl.service";
import { TreeNode} from "primeng/api";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  tabItems: any[];
  activeTab: any;
  activeTabName: any;
  emptyMessage: any;
  public quickDocs: DocumentInfoModel[];
  public video: DocumentInfoModel[];
  public colHeaders = [
    // {field: 'creator', header: 'Created By'},
    // {field: 'addOn', header: 'Added On', sortField: 'addOn2'},
    // {field: 'modOn', header: 'Modified On', sortField: 'modOn2'},
    // {field: 'modifier', header: 'Modified By'}
    ];
  public itemsPerPage = 15;
  public folderId:any;
  busy: boolean;
  index: any;
  videoList: TreeNode[];
  selectedVideo: any;
  constructor(private breadcrumbService: BreadcrumbService, public cs: ContentService, 
    private toastr:ToastrService,private coreService: CoreService,private as:AdminService,private growlService: GrowlService) {
  }

  ngOnInit() {
    this.activeTabName = 'Online Manuals';
    this.breadcrumbService.setItems([
      {label: 'Help'}
    ]);
    this.emptyMessage = globalv.no_doc_found;
    this.tabItems = [{
      label: 'Online Manuals', icon: 'ui-icon-live-help', command: (event) => {
        this.activeTabName = event.item.label;
        this.folderId = "{4078D55A-0000-CC17-985F-5F23349BA7FE}";
        this.getDocumentsToDisplay(this.folderId);
      }
    }, {
      label: 'Training Videos', icon: 'ui-icon-videocam', disabled: false, command: (event) => {
        this.activeTabName = event.item.label;
        this.folderId = "{0F2FE814-9E71-49F9-89EF-1331633A35E9}";
         this.getDocumentsToDisplay(this.folderId);
      }
    }];
    this.activeTab = this.tabItems[0];
    this.folderId = "{4078D55A-0000-CC17-985F-5F23349BA7FE}";//"{53DDDA30-67CD-4ACB-8B2C-98238C33A14F}";//{4078D55A-0000-CC17-985F-5F23349BA7FE}
    this.getDocumentsToDisplay(this.folderId);
    this.as.getECMHelp().subscribe(data => this.getMainItems(data));
    //let data=[{"category":"ECM Homepage","cbtdetails":[{"id":1,"cbtname":"ECM Dashboard","docurl":"No Data"}]},{"category":"ECM Settings","cbtdetails":[{"id":2,"cbtname":"General","docurl":"No Data"},{"id":3,"cbtname":"Favorite & Default List","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/FavoritesDefaultList.mp4"},{"id":4,"cbtname":"Distribution list","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/Distributionlist.mp4"},{"id":5,"cbtname":"Out of office - Delegate User","docurl":"No Data"},{"id":6,"cbtname":"Out of office - Delegate Role","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/OOO_DelegateRole.mp4"},{"id":7,"cbtname":"Out of office - Edit Delegation","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/OOO_EditDelegation.mp4"}]},{"category":"ECM Document Actions","cbtdetails":[{"id":8,"cbtname":"Add Document","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMAddDocument.mp4"},{"id":9,"cbtname":"Update Document","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMUpdateDocument.mp4"},{"id":10,"cbtname":"Favorite Documents","docurl":"No Data"},{"id":11,"cbtname":"View & Annotate Document","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ViewAnnotateDocument.mp4"},{"id":12,"cbtname":"Link Documents","docurl":"No Data"},{"id":13,"cbtname":"Mail To","docurl":"No Data"}]},{"category":"ECM Search","cbtdetails":[{"id":14,"cbtname":"Content Search","docurl":"No Data"},{"id":15,"cbtname":"Advance Search","docurl":"No Data"}]},{"category":"ECM Folders","cbtdetails":[{"id":16,"cbtname":"Favorite Folders","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMFavoritefolders.mp4"},{"id":17,"cbtname":"Search Folder","docurl":"No Data"}]},{"category":"ECM Workflow","cbtdetails":[{"id":18,"cbtname":"Launch Workflow","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMLaunchdefault.mp4"},{"id":19,"cbtname":"Bulk lauch","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/BulkLaunch.mp4"},{"id":20,"cbtname":"ECM Inbox","docurl":"No Data"},{"id":21,"cbtname":"ECM Outbox","docurl":"No Data"},{"id":22,"cbtname":"ECM Draft","docurl":"No Data"},{"id":23,"cbtname":"ECM Archive","docurl":"No Data"}]},{"category":"ECM Thumbnail/Shortcuts","cbtdetails":[{"id":24,"cbtname":"Thumbnail Preview","docurl":"No Data"},{"id":25,"cbtname":"ECM Shortcuts","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMShortcut.mp4"}]},{"category":"ECM eSignature/Initial","cbtdetails":[{"id":26,"cbtname":"Launch workflow for eSignature/Initial","docurl":"No Data"},{"id":27,"cbtname":"eSign and Validate","docurl":"No Data"}]},{"category":"ECM Reports","cbtdetails":[{"id":28,"cbtname":"ECM Reports","docurl":"http://mvcsecmtesticn:9082/ecmfnapp/CBTVideos/ECMReports.mp4"}]}];

  }

  getDocumentsToDisplay(folderId) {
    this.cs.getDocumentFolders(folderId).subscribe(data => this.assignFolderDocs(data));
  }

  assignFolderDocs(data) {
    data.map(d => {
      d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, null, '/') : ' ';
      d.modOn2 = d.modOn ? this.coreService.getTimestampFromDate(d.modOn, null, '/') : ' ';
      d.name = d.fileName ? d.fileName : ' ';
    });
    this.quickDocs = data;
  }
  refreshTable() {
   this.getDocumentsToDisplay(this.folderId);
  }
   assignSubItems(parent, data) {
    this.busy=false;
    this.index++;
    const subFolder = [];
    data.map((d, i) => {
        if (d != null) {
            subFolder.push({
              label: d.cbtname,
              data: d,
              'level': '2',
              'expandedIcon': 'ui-icon-theaters',
              'collapsedIcon': 'ui-icon-theaters',
              'leaf': true
            });


        }
    });
    parent.children = subFolder;
  }
   getMainItems(data) {
     let topFolder = [];
    data.map((d, i) => {
      if (d != null) {
          topFolder.push({
            label: d.category,
            data: d,
            'level': '1',
            'expandedIcon': 'ui-icon-movie',
            'collapsedIcon': 'ui-icon-movie',
            'children': [],
            'expanded':true,
            'leaf': false
          });

      }

    });
    this.videoList = topFolder;
    this.videoList.map((d, i)=>{
      this.assignSubItems(d, data[i].cbtdetails);
    })
  }
  nodeSelect(event){
    if(event.level==='1'){
      return;
    }
    if(event.level==='2' && event.data.docurl && event.data.docurl !=="No Data"){
      window.open(event.data.docurl);
    }
    else{
      //  this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'No video found', detail: 'Video to be uploaded soon'
      // });
      this.toastr.info('Video to be uploaded soon', 'No video found');
    }
  }

  ngOnDestroy() {
  }
}
