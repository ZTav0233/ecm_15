import {Component, ElementRef, EventEmitter,DoCheck, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { BrowserEvents } from '../../../services/browser-events.service';
import { DocumentService } from '../../../services/document.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/user.service';
import { ConfirmationService, LazyLoadEvent, Message, SelectItem, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EntryTemplateDetails } from '../../../models/document/entry-template-details.model';
import { DocumentInfoModel } from '../../../models/document/document-info.model';
import { GrowlService } from '../../../services/growl.service';
import 'rxjs';
import { saveAs } from 'file-saver';
import { AdminService } from "../../../services/admin.service";
import { ContentService } from '../../../services/content.service';
import * as moment from 'moment';
import * as global from "../../../global.variables";
import {Attachment} from "../../../models/document/attachment.model";
import { ConfigurationService } from '../../../services/configuration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rightpanel',
  templateUrl: './rightpanel.component.html',
  styleUrls: ['./rightpanel.component.css'],
})
export class RightpanelComponent implements OnInit, OnDestroy, DoCheck {
  @Input() public currentScreen: any;
  @Input() public fileUploaded: any;
  @Output() sendUpdate = new EventEmitter();
  @Output() sendFolders = new EventEmitter();
  @Output() refreshScreen = new EventEmitter();
  @Output() togglePanel = new EventEmitter();
  @Output() toggleStrikeDeletedItem = new EventEmitter();
  //@Output() public fileChanged = new EventEmitter();
  public saveDocInfo = new DocumentInfoModel();
  @ViewChild('dt') dataTable!: Table;
  //public attachmentMail  = new Attachment();
  public docTemplateDetails = new EntryTemplateDetails();
  public docEditPropForm: FormGroup;
  public allowDownloads = false;
  public allowCheckin = false;
  public allowLaunch = false;
  public allowRemoveFav = false;
  public allowEmail = false;
  public allowLinks = false;
  public allowEditProp = false;
  public allowMove=false;
  public allowInfo = false;
  public allowDelete = false;
  public allowEditSec = false;
  public allowRemoveFol =false;
  public allowShowLinks = false;
  public allowShowTrack = false;
  public showFavFileIn = false;
  private subscriptions: Subscription[] = [];
  public showFileIn = false;
  public showMove = false;
  selectedDocs: any[];
  msgs: Message[] = [];
  public user = new User();
  private base_url: string;
  clickedFolder: any;
  folderId: any;
  folderList: TreeNode[];
  public entryTemp = false;
  public update = false;
  public fileselected = false;
  private dateselected: Object = {};
  private updateddDocuments = new FormData();
  public uploadedFile;
  public docSysProp: any;
  public edit = false;
  public editAttachment: boolean;
  public busy: boolean;
  public errorJson: any;
  removeFolderList: TreeNode[];
  moveFolderList: TreeNode[];
  addToFolderList: TreeNode[];
  moveToList: TreeNode[];
  selectedRemoveFolder: any;
  selectedMoveFromFolder: TreeNode;
  selectedAddFolder: any;
  showRemove = false;
  showMoveFrom = false;
  public ecmNo;
  accessPolicies: any[];
  showPermissionDialogue = false;
  selectedPolicy: any = { id: undefined, permissions: [] };
  newPermissions: any[];
  searchText: any;
  isRemoveDisable = true;
  accessLevelsMap = {
    'Full Control': 998903,
    'Author': 131575,
    'Viewer': 131217,
    'Owner': 933367
  };
  private tempPermissions: any[];
  public allowedExtensions = ['.msg', '.csv', '.pdf', '.doc', '.zip', '.docx', '.xls', '.xlsx', '.msg', '.ppt', '.pptx', '.dib', '.webp',
    '.jpeg', '.svgz', '.gif', '.jpg', '.ico', '.png', '.svg', '.tif', '.xbm', '.bmp', '.jfif', '.pjpeg', '.pjp', '.tiff', '.txt'];
  public allowedExtensionsString;
  public folderPermission = { usage: 'rightPanel', folderSelected: false, permission: true };
  public hasPermission = true;
  accessValueDoc: any;
  public isFullAccess: boolean;
  docToOrFrom: any;
  designation: any;
  selectedDesignation: any;
  et_dependent_lookup: any;
  totalRecords: number;
  datasource: any;
  showDesignation = false;
  selectedMoveToFolder: TreeNode;
  isButtonSaveDisabled=true;
  public excepClassNames = global.excep_class_names;
  public isFileSizeCorrect:boolean = true
  public dateDisableActions =global.date_disable_action;
  @ViewChild('gb') searchInput: ElementRef;
  @ViewChild('dt') namelist:any;
  fileSizeConfiguration:any;
  constructor(private bs: BrowserEvents, private ds: DocumentService, private us: UserService,private toastr:ToastrService,
    private router: Router, private cs: ContentService, private growlService: GrowlService,
    private confirmationService: ConfirmationService, private as: AdminService, private configService: ConfigurationService) {
    this.user = this.us.getCurrentUser();
    this.base_url = global.base_url;
    this.docEditPropForm = new FormGroup({
      DocumentTitle: new FormControl(null, [Validators.required, this.noWhitespaceValidator])
    });
    this.allowedExtensionsString = this.allowedExtensions.join(',') + this.allowedExtensions.join(',').toUpperCase();
    this.et_dependent_lookup = global.et_dependent_lookup;
  }

  ngDoCheck() {
    
  }

  loadLazy(event: LazyLoadEvent, table: Table) {
    if (event.globalFilter.length > 0) {
      this.designation = this.datasource.filter(
        item => item.value ? item.value.toLowerCase().indexOf(event.globalFilter.toLowerCase()) != -1 : "");
      this.totalRecords = this.designation.length;
    }
    else {
      setTimeout(() => {
        if (this.datasource) {
          this.designation = this.datasource//.slice(event.first, (event.first + event.rows));
          this.totalRecords = this.datasource.length;
        }
      }, 250);
    }
  }

  openListDialog(detail) {
    //console.log('namelist :' + this.namelist);
    this.applyOnLoadFilter();
    //this.namelist.onFilterKeyup('', 'data', 'contains');
    this.searchInput.nativeElement.value = '';
    this.showDesignation = true;
    this.selectedDesignation = [];
    if (detail === 'DocumentTo') {
      this.docToOrFrom = 'Document To';
    }
    else {
      this.docToOrFrom = 'Document From';
    }
  }

  applyFilterGlobal($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  applyOnLoadFilter(){
    this.dataTable.filterGlobal('','contains');
  }

  onSelectionChange(val:any, input) {
    if (input === 'Document To') {
      this.docEditPropForm.get('DocumentTo').setValue(val.value);
    }
    else {
      this.docEditPropForm.get('DocumentFrom').setValue(val.value);
    }
  }

  fileChanged(event) {
    this.fileselected = event.fileselected;
    this.fileUploaded = event.fileUploaded;
  }

  // onUpload(event) {

  //   if (event.files && event.files.length) {
  //     let fileSize = event.files[0].size;
  //     if (fileSize <= Number(this.fileSizeConfiguration.value)){
  //       this.isFileSizeCorrect = true
  //       let name = event.files[0].name.toLowerCase(),
  //       extension = name.substr(name.lastIndexOf('.'));
  //       if (this.allowedExtensions.indexOf(extension) > -1) {
  //         this.fileUploaded = event.files[0];
  //         if (this.fileUploaded !== undefined && this.entryTemp) {
  //           this.fileselected = true;
  //           this.fileChanged.emit({ fileselected: true, fileUploaded: this.fileUploaded })
  //         } else {
  //           this.fileselected = false;
  //           this.fileChanged.emit({ fileselected: false, fileUploaded: null })
  //         }
  //       }
  //     }
  //     else {
  //       this.isFileSizeCorrect = false
  //       console.log("Maximum File size allowed 800 MB!");
  //     }
  //   }
  //   else {
  //     console.log("File is not selected");
  //   }
  // }

  onModalHide() {
    this.docEditPropForm.reset();
    this.uploadedFile = undefined;
    this.docSysProp = [];
    //this.refresh();
    this.saveDocInfo = null;
    this.fileselected = false;
    this.entryTemp = false;
  }

  cancel() {
    this.onModalHide();
    this.update = false;
    this.refresh();
  }

  ngOnInit() {
    const ds = this.ds;
    this.busy = true;
    this.bs.docsSelected.subscribe(data => {
      this.busy = false;
      this.assignDocsSelected(data, ds);
    }, err => {
      this.busy = false;
    });
    let desigData;
     if(this.as.designationValues && this.as.designationValues.length<=0){
       //AKV-getDesignationValues
       this.as.getDesignationData().subscribe(data => {
        this.as.designationValues=data;
        this.as.designationValues.unshift({ id: "", value: null, action: "" });
        this.assignDesignationData(this.as.designationValues);
    },err=>{
         console.log(err)
       })
    }
    else{
       desigData = this.as.designationValues;
       this.assignDesignationData(desigData);
     }
     this.getConfigurationValue();
     //let desigData = JSON.parse(localStorage.getItem('designationJSON'));
    // this.as.getDesignationValues().subscribe(data => {
    //   data.unshift({ id: "", value: null, action: "" });
    //   this.designation = data;
    //   this.datasource = this.designation;
    //   this.totalRecords = this.datasource.length;
    //   this.designation = this.datasource//.slice(0, 10);
    // });
  }

  getConfigurationValue(){
    this.configService.getAppConfigurationValue('MAXFILESIZE').subscribe(config => {
      this.fileSizeConfiguration = JSON.parse(config)
      console.log(this.fileSizeConfiguration)
     
    }, err => {
      this.busy = false;
    });
  }


     assignDesignationData(desigData){
     if(desigData && desigData.length>0){
      this.designation = desigData;
      this.datasource = this.designation;
      this.totalRecords = this.datasource.length;
      this.designation = this.datasource//.slice(0, 10);

    }

  }

  confirmUnfile() {
    this.selectedRemoveFolder = [];
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      key: 'confirmKey',
      accept: () => {
        this.showRemove = true;
        this.removeFolderList = undefined;
        this.ds.getDocumentFolders(this.selectedDocs[0].id).subscribe(data => this.assignDocuments(data));
      }
    });
  }

  assignDocuments(docs) {
    const topFolder = [];
    docs.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'children': [],
            'leaf': true
          });
        }
        else {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'children': [],
            'leaf': true
          });
        }
      }
    });
    this.removeFolderList = topFolder;
  }

  // removeFromFolder() {
  //   localStorage.setItem('unfileClicked', 'true');
  //   this.folderId = localStorage.getItem('folderId');
  //   console.log(this.selectedRemoveFolder)
  //   //this.cs.validateFolderPermissions(this.folderId, "REMOVE").subscribe(data => this.checkFolderPermission(data));
  //
  // }
  onNodeSelectRemove(e) {
    this.hasPermission = true;
    this.isRemoveDisable = true;
    this.cs.validateFolderPermissions(e.node.data.id, "REMOVE").subscribe(data => this.checkFolderPermission(data, e.node.data));

  }

  checkFolderPermission(data, removeItem) {
    if (data === true) {
      this.isRemoveDisable = false;
      // for (const doc of this.selectedRemoveFolder) {
      //   this.cs.unfileFromFolder(doc.data.id, this.selectedDocs[0].id).subscribe(res => this.unfileSuccess(), Error => this.unfileFailed());
      // }
      // this.showRemove = false;
    }
    else {
      this.isRemoveDisable = true;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to remove'
      // });
      this.toastr.error('User dont have permission to remove', 'No Permission');
      this.selectedRemoveFolder.map((d, i) => {
        if (d.data.id === removeItem.id) {
          this.selectedRemoveFolder.splice(i, 1);
        }
      })
    }
  }

  removeFromFolderConfirm() {
    localStorage.setItem('unfileClicked', 'true');
    for (const doc of this.selectedRemoveFolder) {
      this.cs.unfileFromFolder(doc.data.id, this.selectedDocs[0].id).subscribe(res => this.unfileSuccess(), Error => this.unfileFailed());
    }
    this.showRemove = false;
  }
  checkDateForDisableActions(date){
    //console.log(moment((date), "DD/MM/YYYY").toDate()< moment((global.date_disable_action), "DD/MM/YYYY").toDate());
    //if(moment((date), "DD/MM/YYYY").toDate()< moment((global.date_disable_action), "DD/MM/YYYY").toDate())
      //return true;
      return false;
  }

  assignDocsSelected(data, ds) {
    let isPastDate=false;
    if(data.length>0){
      /*data.map(d=>{
         if(this.checkDateForDisableActions(d.addOn)){
            isPastDate=true;
          }
        }); */
        if(isPastDate){
          this.allowDownloads = false;this.allowLaunch = false;this.allowRemoveFav = false;this.allowCheckin = false;this.allowEmail = false;
          this.allowLinks = false;this.allowEditProp = false;this.allowEditSec = false;this.allowMove=false;this.allowDelete=false;
          this.selectedDocs = data;
          this.allowShowLinks = this.selectedDocs.length===1;
          this.allowShowTrack = this.selectedDocs.length===1;
          this.allowInfo =this.selectedDocs.length===1;
          return;
        }
        else{
        this.selectedDocs = data;
        if (this.selectedDocs.length > 0) {
          this.allowDownloads = true;
          this.allowLaunch = true;
          this.allowRemoveFav = true;
          this.allowCheckin = true;
          this.allowEmail = true;
          this.allowLinks = false;
        } else {
          this.allowDownloads = true;
          this.allowLaunch = false;
          this.allowCheckin = false;
          this.allowRemoveFav = false;
          this.allowEmail = false;
          this.allowShowLinks = false;
          this.allowShowTrack = false;
        }
        if (this.selectedDocs.length > 1) {
          this.allowLinks = true;
          this.allowCheckin = false;
          this.allowEmail = false;
          this.allowEditProp = false;
          this.allowMove=false;
          this.allowInfo=false;
          this.allowShowLinks = false;
          this.allowShowTrack = false;
          this.allowEditSec = false;
          this.allowDownloads = true;
          this.allowDelete = false;
        } else if (this.selectedDocs.length === 1) {
          this.allowEditProp = true;
          this.allowMove=true;
          this.allowInfo=true;
          this.allowShowLinks = false;
          this.allowShowTrack = false;
          this.allowLinks = false;
          if (this.ds == null) {
            this.busy = true;
            ds.validateDocumentPermissions(this.selectedDocs[0].id).subscribe(resp => this.validateForDocPermisssion(resp),
              err => this.validateDocPermissionFailure(err));
          } else {
            this.busy = true;
            this.ds.validateDocumentPermissions(this.selectedDocs[0].id).subscribe(resp => this.validateForDocPermisssion(resp),
              err => this.validateDocPermissionFailure(err));
          }
        } else if (this.selectedDocs.length < 1) {
          this.allowCheckin = false;
          this.allowLinks = false;
          this.allowEditProp = false;
          this.allowMove=false;
          this.allowInfo=false;
          this.allowShowLinks = false;
          this.allowShowTrack = false;
          this.allowEditSec = false;
        }
        if (this.selectedDocs.length > 2) {
          this.allowLinks = false;
        }
      }
    }

  }

  validateDocPermissionFailure(err) {
    this.busy = false;
    this.allowEditSec = false;
    this.allowCheckin = false;
    this.allowDelete = false;
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Get Permission Details'
    // });
    this.toastr.error('Failed To Get Permission Details', 'Failure');
  }

  validateForDocPermisssion(resp) {
    this.accessValueDoc = resp;
    let res = resp.toString().split("");
    this.allowEditSec = !!+res[0];
    this.allowCheckin = !!+res[1];
    this.allowDelete = !!+res[2];
    this.allowRemoveFol = !!+res[3];
    this.allowShowLinks = !!+res[4];
    this.allowShowTrack = !!+res[5];
    this.busy = false;
  }

  download() {
    this.busy = true;
    if (this.selectedDocs.length > 1) {
      const docIDs = [];
      for (const doc of this.selectedDocs) {
        docIDs.push(doc.id)
      }
     this.ds.downloadMultipleDocument(docIDs).subscribe(res => {
        const file = new Blob([res], { type: 'application/zip' });
        const fileName = 'Documents' + '.zip';
        saveAs(file, fileName);
        this.busy = false;
      });
    } else {
      window.location.assign(this.ds.downloadDocument(this.selectedDocs[0].id));
       this.busy = false;
      //window.location.assign(this.ds.downloadThisDocument(this.selectedDocs[0].id));
      // const fileName = this.selectedDocs[0].fileName;
      //let fileName;
      // this.ds.downloadDocumentPanel(this.selectedDocs[0].id).subscribe((res) => {
      //   let disposition = res.headers.get('Content-Disposition');
      //   if (disposition && disposition.indexOf('attachment') !== -1) {
      //     var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      //     var matches = filenameRegex.exec(disposition);
      //     if (matches != null && matches[1]) {
      //       fileName = matches[1].replace(/['"]/g, '');
      //     }
      //   }
      //   saveAs(res._body, decodeURIComponent(fileName));
      //   this.busy = false;
      // }, err => {
      //   this.busy = false;
      // });
    }
    this.refresh();
  }

  launch() {
    // this.confirmForSameDocName(() => {
    this.launch2();
    //});
  }

  launch2() {
    let postArray = { empNo: this.user.EmpNo, docIds: [] };
    this.selectedDocs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.busy = true;
    this.ds.addToCartMulti(postArray).subscribe(res => {
      this.busy = false;
      this.bs.skipDocLaunch.emit('skipdoc');
      this.router.navigate(['workflow/launch', { actionType: 'browseLaunch', docId: this.selectedDocs[0].id }]);
      window.parent.postMessage('GoToLaunch', '*');
      if (res.status !== 'Exists') {
        window.parent.postMessage({ v1: 'AddCartSuccess', v2: res.success }, '*');
      }
    }, error => {
      this.busy = false;
      this.addToCartFailure()
    });
  }

  confirmForSameDocName(postFn) {
    this.busy = true;
    //this.documentService.getCart(this.user.EmpNo).subscribe(docs => {
    this.ds.getCart(this.user.EmpNo).subscribe((data) => {
      this.busy = false;
      this.ds.refreshCart(data);
      this.afterCheckCart(postFn);
    }, (err) => {
      this.busy = false;
    });
    // })
  }

  afterCheckCart(postFn) {
    let exists = false;
    for (const doc of this.selectedDocs) {
      if (this.ds.checkForSameNameDoc(this.ds.cartItems, doc.fileName, doc.id)) {
        exists = true;
      }
    }
    if (!exists) {
      postFn();
    } else {
      this.confirmationService.confirm({
        message: 'Document with same name already exists in Cart, do you want to continue?',
        key: 'addToCartConfirmation',
        accept: () => {
          postFn();
        }
      });
    }
  }

  addCart() {
    // this.confirmForSameDocName(() => {
    this.addCart2();
    // });
  }

  addCart2() {
     this.busy = true;
    let postArray = { empNo: this.user.EmpNo, docIds: [] };
    this.selectedDocs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.ds.addToCartMulti(postArray).subscribe(res => {
      this.busy = false;
      this.addToCartSuccess(res)
    }, error => {
      this.busy = false;
      this.addToCartFailure()
    });
  }

  addToCartSuccess(res) {
    let message = '';
    let summary = 'Success';
    let severity = 'info';
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
    this.subscriptions.push(this.ds.getCart(this.user.EmpNo).subscribe((data) => {
      this.ds.refreshCart(data);
    }));
    this.refresh();
  }

  addToCartFailure() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Add To Cart Failed'
    // });
    this.toastr.error('Add To Cart Failed', 'Failure');
  }

  removeFav() {
    this.sendUpdate.emit(this.selectedDocs);
  }

  refresh() {
    this.refreshScreen.emit(this.selectedDocs);
  }

  mailTo() {
    // let title;
    // let urls;
    // let htmlString = '';
    // let subjectString = '';
    // this.selectedDocs.map((d, i) => {
    //   subjectString += d.fileName;
    //   title = d.fileName;
    //   urls = this.base_url + 'DocumentService/' + 'downloadDocument?id=' + d.id + "%0D%0A";
    //   htmlString += "<html><head></head><body><a href='" + urls + "'><span style=color:#336699>" + title + "</span></a></body></html>";
    //   if (this.selectedDocs.length > i + 1) {
    //     htmlString += '<br>';
    //     subjectString += ',';
    //
    //   }
    // });
    // let htmlString2 = '<textarea id="textbox" style="width: 300px; height: 600px;">\n' +
    //   'Subject:' + subjectString + '\n' +
    //   'X-Unsent: 1\n' +
    //   'Content-Type: text/html;charset=UTF-8\n' +
    //   '\n' +
    //   htmlString +
    //   '</textarea> <br>';
    // var textFile;
    // var data = new Blob([htmlString2], { type: 'text/plain' });
    // if (textFile !== null) {
    //   window.URL.revokeObjectURL(textFile);
    // }
    // textFile = window.URL.createObjectURL(data);
    // saveAs(data, "mailto.eml");
    let postdata=[];
     this.selectedDocs.map((d, i) => {
       let attachmentMail  = new Attachment();
       attachmentMail.docTitle=d.fileName;
       attachmentMail.docId=d.id;
       attachmentMail.format=d.format;
       postdata.push(attachmentMail)
     });

     this.busy = true;
     this.ds.emailDocuments(postdata).subscribe(d=>{
      const file = new Blob([d], { type: 'text/plain' });
      saveAs(file, "mailto.eml");
      this.busy = false;
    }, error => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Error Occurred', detail: 'Please try again!'
      // });
      this.toastr.error('Please try again!', 'Error Occurred');
    });
     }


  linkDocs() {
    this.subscriptions.push(this.ds.linkDocuments(this.selectedDocs[0].id, this.selectedDocs[1].id)
      .subscribe(data => this.successLink(data), error => this.errorLink()));
  }

  showLinkedDocs() {
    this.selectedDocs[0].islinked = true;
    this.selectedDocs[0].isDocTrack = false;
    this.bs.openDocInfoPanel.emit(this.selectedDocs);
  }

  showDocTrack() {
    this.selectedDocs[0].isDocTrack = true;
    this.selectedDocs[0].islinked = false;
    this.bs.openDocInfoPanel.emit(this.selectedDocs);
  }

  successLink(data) {
    let msg='Linked Docs Successfully';
    if(data.toLowerCase()==='exists'){
      msg='Link already exists';
    }
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: msg
    // });
    this.toastr.info(msg, 'Success');
    this.refresh();
  }

  errorLink() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Link Docs'
    // });
    this.toastr.error('Failed To Link Docs', 'Failure');
  }

  addFavourites() {
    this.busy = true;
    let postArray = { empNo: this.user.EmpNo, docIds: [] };
    this.selectedDocs.map((doc, index) => {
      postArray.docIds.push(doc.id);
    });
    this.ds.addToFavoritesMulti(postArray).subscribe(data => {
      this.busy = false;
      this.addToFavSuccess(data)
    }, error => {
      this.busy = false;
      this.addToFavFailure()
    });
  }

  addToFavSuccess(res) {
    let message = '';
    let summary = 'Success';
    let severity = 'info';
    switch (res.status) {
      case 'Success':
        message = 'Document Added To Favorites';
        break;
      case 'Exists':
        message = 'Document Already Exist in Favorites';
        summary = 'Already Exist';
        severity = 'error';
        break;
      case 'Partial':
        message = 'Document Added To Favorites';
        break;
    }
    // this.growlService.showGrowl({
    //   severity: severity,
    //   summary: summary,
    //   detail: message
    // });
    this.toastr.info(message, summary);
    this.refresh();
  }

  addToFavFailure() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Add To Favorites'
    // });
    this.toastr.error('Failed To Add To Favorites', 'Failure');
  }

  openEditDoc() {
    this.toggleSidePanel();
    this.ds.verifyDocOCRStatus(this.selectedDocs[0].id).subscribe(d=>{
      if(d === 'True'){
       this.busy = true;
       this.ds.getDocument(this.selectedDocs[0].id).subscribe(data => {
         this.update = true;
         this.busy = false;
         if (data.entryTemplate) {
           this.assignFieldsForEditDoc(data);
         } else {
           this.entryTemp = false;
           this.saveDocInfo = null;
         }
       }, err => {
         this.busy = false;
         if (err.statusText === 'OK') {
          //  this.growlService.showGrowl({
          //    severity: 'error',
          //    summary: 'Invalid Document', detail: 'This Document is either deleted or not found'
          //  });
           this.toastr.error('This Document is either deleted or not found', 'Invalid Document');
         }
       });
      }
      else{
        this.update = false;
      //   this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Try again later', detail: 'The document conversion process is in progress, please try after a while '
      // });
      this.toastr.error('The document conversion process is in progress, please try after a while ', 'Try again later');
      }
    });
  }

 /*  assignFieldsForEditDoc(data) {
    this.saveDocInfo = data;
    this.busy = true;
    this.cs.getEntryTemplate(data.entryTemplate).subscribe(data2 => {
      this.busy = false;
      this.entryTemp = true;
      this.docTemplateDetails = data2;
      this.docTemplateDetails.props.forEach(control => {
        if (control.req === 'true') {
          if (control.dtype === 'DATE') {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.required));
          } else {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));
          }
        } else {
          this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.maxLength(400)));
        }
        // if (control.symName === 'OrgCode') {
        //   if (control.lookups) {
        //     const removables = [];
        //     control.lookups.map((d, i) => {
        //       if (d.label.trim().length > 4) {
        //         removables.push(i);
        //       }
        //     });
        //     removables.map((d, i) => {
        //       control.lookups.splice(d - i, 1);
        //     });
        //   }
        // }
        if (!(this.excepClassNames.indexOf(this.docTemplateDetails.name.toLowerCase())> -1) && control.symName === 'DocumentFrom' && control.hidden === 'false') {
          this.docEditPropForm.get('DocumentFrom').disable();
        }
        if (!(this.excepClassNames.indexOf(this.docTemplateDetails.name.toLowerCase())> -1) && control.symName === 'DocumentTo' && control.hidden === 'false') {
          this.docEditPropForm.get('DocumentTo').disable();
        }
      });
      for (const prop of this.saveDocInfo.props) {
        if (prop.dtype === 'DATE' && prop.mvalues[0] !== null) {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        } else if(prop.ltype === 2 && prop.mvalues[0] !== null) {
              if(prop.lookups){
               prop.lookups.map((d, i) => {
                   if (prop.mvalues[0]===d.label) {
                     this.docEditPropForm.get(prop.symName).setValue(d.value);
                   }
            });
              }
        }
        else{
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        }
      }
    }, err => {
      this.busy = false;
      this.update = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'User dont have permission'
      // });
      this.toastr.error('User dont have permission', 'Failure');
    });
    this.as.getNextECMNo().subscribe(data => {
      this.ecmNo = data;
    }, err => {
    });
  } */

  assignFieldsForEditDoc(data) {
    this.saveDocInfo = data;
    this.busy = true;
    this.cs.getEntryTemplate(data.entryTemplate).subscribe(data1 => {
      this.busy = false;
      this.entryTemp = true;
      this.docTemplateDetails = data1;
      this.docTemplateDetails.props.forEach(control => {
        // if (control.hidden === 'false'){
        if (control.req === 'true') {
          if (control.dtype === 'DATE') {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.required));
          } else {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));
          }
        } else {
          this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.maxLength(400)));
        }
        // if (control.symName === 'OrgCode') {
        //   if (control.lookups) {
        //     const removables = [];
        //     control.lookups.map((d, i) => {
        //       if (d.label.trim().length > 4) {
        //         removables.push(i);
        //       }
        //     });
        //     removables.map((d, i) => {
        //       control.lookups.splice(d - i, 1);
        //     });
        //   }
        // }
        // }
      });
      for (const prop of this.saveDocInfo.props) {
        // if (prop.hidden === 'false') {
        if (prop.dtype === 'DATE' && prop.mvalues[0] !== null) {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        } else if (prop.ltype === 2 && prop.mvalues[0] !== null) {
          if (prop.lookups) {
            prop.lookups.map((d, i) => {
              if (prop.mvalues[0] === d.label) {
                this.docEditPropForm.get(prop.symName).setValue(d.value);
              }
            });
          }
        }
        else {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        }
        // }
      }
    }, err => {
      this.busy = false;
    });
  }

  noWhitespaceValidator(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  toggleSidePanel() {
    this.togglePanel.emit();
  }

  editprop() {
    this.toggleSidePanel();
  }

  assignFolderSelected(data) {
    this.clickedFolder = data;
  }

  unfileFolder() {
    localStorage.setItem('unfileClicked', 'true');
    this.folderId = localStorage.getItem('folderId');
    for (const doc of this.selectedDocs) {
      this.cs.unfileFromFolder(this.folderId, doc.id).subscribe(data => this.unfileSuccess(), Error => this.unfileFailed());
    }
  }

  unfileSuccess() {
    setTimeout(() => {
      this.refresh();
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Document Removed From Folder '
      // });
      this.toastr.info('Document Removed From Folder', 'Success');
    }, 900);

  }

  unfileFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Remove'
    // });
    this.toastr.error('Failed To Remove', 'Failure');
  }

  fileIn() {
    this.showFileIn = false;
    this.showFavFileIn = false;
    this.ds.addToFolderId = this.selectedAddFolder.data.id;
    this.sendFolders.emit(this.selectedDocs);
  }
  openClassifySubTree(){
    this.showFileIn=false;
    //this.toggleSidePanel();
    this.showFavFileIn=true;
    this.busy = true;
    this.cs.getClassifySubFolders().subscribe(data => {
      this.busy = false;
      this.assignTreeFolders(data, true)
    }, err => {
      this.busy = false;
    });
  }

  openSubTreePop() {
    this.showFavFileIn=false;
    this.showFileIn = true;
    this.busy = true;
    this.cs.getTopFolders().subscribe(data => {
      this.busy = false;
      this.assignTreeFolders(data, true)
    }, err => {
      this.busy = false;
    });
  }

  callValidateFolpermFrom(folderIdFrom, type, moveToFolder, folderIdTo, docs) {
    this.cs.validateFolderPermissions(folderIdFrom, type).subscribe(data => this.validateFolderPermFrom(folderIdFrom, data, moveToFolder, folderIdTo, docs));
  }

  callValidateFolpermTo(folderIdFrom, type, moveToFolder, folderIdTo, docs) {
    this.cs.validateFolderPermissions(folderIdTo, type).subscribe(data => this.validateFolderPermConfirm(folderIdFrom, data, moveToFolder, folderIdTo, docs));
  }
  validateFolderPermFrom(folderIdFrom, data, moveToFolder, folderIdTo, docs) {
    if (data === true) {
      this.callValidateFolpermTo(folderIdFrom, "ADD", moveToFolder, folderIdTo, docs);
    } else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to move from this folder'
      // });
      this.toastr.error('User dont have permission to move from this folder', 'No Permission');
    }
  }

  validateFolderPermConfirm(folderIdFrom, data, moveToFolder, folderIdTo, docs) {
    if (data === true) {
      if (folderIdFrom === folderIdTo) {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Cant Move', detail: 'Source and Destination are same'
        // });
        this.toastr.error('Source and Destination are same', 'Cant Move');
      } else {
        this.busy = true;
        this.ds.moveMultipleDocuments(moveToFolder).subscribe(res => {
          this.busy = false;
          if (res === 'OK') {
            // this.growlService.showGrowl({
            //   severity: 'info',
            //   summary: 'Success', detail: 'Document Moved To Folder'
            // });
            this.toastr.info('Document Moved To Folder', 'Success');
            const folderId = localStorage.getItem('folderIdForMove');
            docs.splice(0, docs.length);
          } else {
            // this.growlService.showGrowl({
            //   severity: 'error',
            //   summary: 'Failure', detail: 'Move To Folder Failed'
            // });
            this.toastr.error('Move To Folder Failed', 'Failure');
          }
        }, err => {
          this.busy = false;
        });
      }
    } else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to move to this folder'
      // });
      this.toastr.error('User dont have permission to move to this folder', 'No Permission');
    }
  }

  moveToFolder() {
    this.showMove = false;
    if (!this.router.url.includes('browse')) {
      //this.sendMoveToFolder.emit(this.selectedDocs);
      let folderIdFrom;
      if (localStorage.getItem('folderIdForMoveConfirm') === undefined) {
        folderIdFrom = localStorage.getItem('folderIdForMove');
      } else {
        this.ds.getDocumentFolders(this.selectedDocs[0].id).subscribe(data => this.assignMoveDocFrom(data, this.selectedDocs));
      }
    }
    else {
      this.callValidateFolpermMove(localStorage.getItem('folderId'), "ADD", this.selectedDocs);
    }
  }
  assignMoveDocFrom(data, docs) {
    let folderIdFrom;
    if (data.length === 1) {
      folderIdFrom = data[0].id;
    } else {
      folderIdFrom = localStorage.getItem('folderIdForMoveConfirm');
    }
    const folderIdTo = this.selectedMoveToFolder.data.id;
    const moveToFolder = { 'sourceFolder': folderIdFrom, 'targetFolder': folderIdTo, 'docIds': [] };
    docs.map((d, i) => {
      moveToFolder.docIds.push(d.id);
    });
    this.callValidateFolpermFrom(folderIdFrom, "REMOVE", moveToFolder, folderIdTo, docs);
  }

  callValidateFolpermMove(id, type, docs) {
    this.cs.validateFolderPermissions(id, type).subscribe(data => this.validateFolderPerms(data, docs));
  }

  validateFolderPerms(data, docs) {
    if (data === true) {
      let folderIdFrom;
      if (!this.selectedMoveFromFolder) {
        folderIdFrom = localStorage.getItem('folderIdForMove');
      }
      else {
        folderIdFrom = this.selectedMoveFromFolder.data.id;
      }
      const folderIdTo = this.selectedMoveToFolder.data.id;
      const moveToFolder = { 'sourceFolder': folderIdFrom, 'targetFolder': folderIdTo, 'docIds': [] };
      docs.map((d, i) => {
        moveToFolder.docIds.push(d.id);
      });
      if (folderIdFrom === folderIdTo) {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Cant Move', detail: 'Source and Destination are same'
        // });
        this.toastr.error('Source and Destination are same', 'Cant Move');
      }
      else {
        this.busy = true;
        this.ds.moveMultipleDocuments(moveToFolder).subscribe(data => {
          this.busy = false;
          if (data === 'OK') {
            // this.growlService.showGrowl({
            //   severity: 'info',
            //   summary: 'Success', detail: 'Document Moved To Folder'
            // });
            this.toastr.info('Document Moved To Folder', 'Success');
            this.refresh();
          }
          else if (data === 'Partial Fail') {
            // this.growlService.showGrowl({
            //   severity: 'info',
            //   summary: 'Success', detail: 'Only Some Documents Moved'
            // });
            this.toastr.info('Only Some Documents Moved', 'Success');
            this.refresh();
          }
          else {
            // this.growlService.showGrowl({
            //   severity: 'error',
            //   summary: 'Failure', detail: 'Move To Folder Failed'
            // });
            this.toastr.error('Move To Folder Failed', 'Failure');
          }
        }, err => {
          this.busy = false;
        });
      }
    } else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to move to this folder'
      // });
      this.toastr.error('User dont have permission to move to this folder', 'No Permission');
    }
  }

  openSubTree() {
    this.toggleSidePanel();
    this.showFileIn = true;
    this.busy = true;
    this.cs.getTopFolders().subscribe(data => {
      this.busy = false;
      this.assignTreeFolders(data, true)
    }, err => {
      this.busy = false;
    });
  }

  hideTree() {
    this.selectedMoveFromFolder = undefined;
    this.selectedMoveToFolder = undefined;
  }

  openMoveTree() {
    this.toggleSidePanel();
    this.selectedMoveFromFolder = undefined;
    this.selectedMoveToFolder = undefined;
    this.cs.getTopFolders().subscribe(data => this.getMainFolders(data));
    this.busy = true;
    this.ds.getDocumentFolders(this.selectedDocs[0].id).subscribe(data => {
      this.busy = false;
      this.assignTreeFolders(data, false)
    }, err => {
      this.busy = false;
    });
  }

  getMainFolders(data) {
    const topFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'children': [],
            'leaf': false
          });
        }
        else {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'children': [],
            'leaf': false
          });

        }
      }
    });
    this.moveToList = topFolder;
  }

  selectFolderMove() {
    let movefolder = this.selectedMoveFromFolder.data.id;
    localStorage.setItem('folderIdForMoveConfirm', movefolder);
    this.callValidateFolperm(movefolder, "REMOVE");
  }

  callValidateFolperm(id, type) {
    this.cs.validateFolderPermissions(id, type).subscribe(data => this.validateFolderPerm(data));
  }

  validateFolderPerm(data) {
    if (data !== true) {
      //this.showMoveFrom=false;
      this.showMove = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to move'
      // });
      this.toastr.error('User dont have permission to move', 'No Permission');
    }
  }

  assignTreeFolders(data, isAddToFolder) {
    const topFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-shared',
            'children': [],
            'leaf': false
          });
        }
        else if (d.type === 'ECMClassifyFolder' || d.type === 'ECMClassifyFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder-special',
            'children': [],
            'leaf': false
          });
        }
        else {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw ui-icon-folder',
            'children': [],
            'leaf': false
          });

        }
      }
    });
    if (isAddToFolder) {
      this.addToFolderList = topFolder;
      this.cs.getSubFolders(this.addToFolderList[0].data.id).subscribe(data => this.assignSubFolders(this.addToFolderList[0], data));
    }
    else {
      this.moveFolderList = topFolder;
      if (data.length > 1 && this.selectedDocs.length === 1) {
        this.showMoveFrom = true;
      }
      else {
        this.showMove = true;
      }
    }
  }

  nodeExpand(event) {
    this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data));
  }

  assignSubFolders(parent, data) {
    //this.index++;
    const subFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa f-fw ui-icon-folder-shared',
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

  closePopUp() {
    //this.refresh();
    this.docEditPropForm.reset();
  }

  cancelEdit() {
    this.edit = false;
    this.docEditPropForm.reset();
  }

  selectFile(event) {
    if (event.files && event.files.length) {
      let fileSize = event.files[0].size;
      if (fileSize <= Number(this.fileSizeConfiguration.value)){
        this.isFileSizeCorrect = true
        let name = event.files[0].name.toLowerCase(),
        extension = name.substr(name.lastIndexOf('.'));
        if (this.allowedExtensions.indexOf(extension) > -1) {
          for (const file of event.files) {
            this.uploadedFile = file;
          }
          if (this.uploadedFile !== undefined && this.entryTemp) {
            this.fileselected = true;
          } else {
            this.fileselected = false;
          }
          this.updateddDocuments = new FormData();
          this.updateddDocuments.append('document', this.uploadedFile);
        }
      }
      else {
        this.isFileSizeCorrect = false
        console.log("Maximum File size allowed 800 MB!");
      }
      
    }
  }

  removeSelectedFile() {
    this.fileselected = false;
    this.uploadedFile = undefined;
    this.fileUploaded = undefined;
    //this.fileChanged.emit({ fileselected: false, fileUploaded: null })
  }

  updatedAttachment() {
    this.busy = true;
    this.ds.checkOut(this.saveDocInfo.id).subscribe(data => {
      this.busy = false;
      this.checkoutSuccess(data)
    }, Error => {
      this.busy = false;
      this.updateFailed(Error)
    });
    for (const prop of this.saveDocInfo.props) {
      if (prop.dtype === 'DATE') {
        prop.mvalues = [];
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          let datetemp= moment(this.docEditPropForm.get(prop.symName).value, "DD/MM/YYYY").toDate();
          prop.mvalues = [this.getFormatedDate(datetemp)];
        }
      } else if (prop.dtype !== 'DATE') {
        prop.mvalues = [this.docEditPropForm.get(prop.symName).value];
      }
    }
    this.saveDocInfo.format = undefined;
    this.updateddDocuments.append('DocInfo', JSON.stringify(this.saveDocInfo));
  }

  getFormatedDate(value) {
    const date = new Date(value);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }


  checkoutSuccess(data) {
    this.busy = true;
    this.ds.checkIn(this.updateddDocuments).subscribe(data2 => {
      this.busy = false;
      this.updateSuccess(data2)
    }, Error => {
      this.busy = false;
      this.updateDocCheckInFailed(Error)
    });
  }

  updateSuccess(data) {
    this.docSysProp = [];
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Document Updated Successfully'
    // });
    this.toastr.info('Document Updated Successfully', 'Success');
    this.editAttachment = false;
    this.fileselected = false;
    this.update = false;
    this.refresh();
    this.onModalHide();
  }

  updateFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: this.errorJson
    // });
    this.toastr.error( this.errorJson, 'Failure');
  }

  updateDocCheckInFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: this.errorJson
    // });
    this.toastr.error(this.errorJson, 'Failure');
    this.ds.cancelCheckOut(this.saveDocInfo.id).subscribe();
  }

  updateEdits() {
    for (const prop of this.saveDocInfo.props) {
      if (prop.dtype === 'DATE') {
        prop.mvalues = [];
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          let datetemp= moment(this.docEditPropForm.get(prop.symName).value, "DD/MM/YYYY").toDate();
          
          prop.mvalues = [this.getFormatedDate(datetemp)];
        }
      } else if (prop.dtype !== 'DATE') {
        prop.mvalues = [this.docEditPropForm.get(prop.symName).value];
      }
    }
    this.busy = true;
    this.ds.updateProperties(this.saveDocInfo).subscribe(data => {
      this.busy = false;
      this.updateSuccess(data)
    }, Error => {
      this.busy = false;
      this.updateFailed(Error)
    });
  }

  // updatesuccessprop() {
  //   this.growlService.showGrowl({
  //     severity: 'info',
  //     summary: 'Success', detail: 'Properties Updated Successfully'
  //   });
  //   this.edit = false;
  //   this.refresh();
  // }

  // updatepropfail() {
  //   this.growlService.showGrowl({
  //     severity: 'error',
  //     summary: 'Failure', detail: 'Edit Properties Failed'
  //   });
  // }

  openDoc() {
    this.selectedDocs[0].islinked = false;
    this.selectedDocs[0].isDocTrack = false;
    this.bs.openDocInfoPanel.emit(this.selectedDocs);
  }

  openEditSecurity() {
    this.getDocPermissions();
  }

  openEditSecurityPopUp() {
    this.bs.openEditSecurityModel.emit({ action: 'open' });
  }

  closeEditSecurity() {
    this.newPermissions = [];
    this.refresh();
  }
  isSaveButtonDisabled(event){
    this.isButtonSaveDisabled=event;
  }

  getDocPermissions() {
    this.selectedPolicy.permissions = [];
    this.busy = true;
    this.ds.getDocumentAdhocPermissions(this.selectedDocs[0].id).subscribe(res => {
      this.busy = false;
      this.bs.isFullAccessForDoc.emit(res);
      this.selectedPolicy.id = this.selectedDocs[0].id;
      this.tempPermissions = res;
      res.map((r, i) => {
        r.id = i;
        if (r.inheritDepth === -2 || r.inheritDepth === -3) {
          this.selectedPolicy.permissions.push(Object.assign({}, r));
        }
      });
      this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
      this.showPermissionDialogue = true;
    }, err => {
      this.busy = false;
      this.addNewPermission();
      this.showPermissionDialogue = true;
    });
  }

  accessTypeChanged(permission) {
    permission.action = 'ADD';
  }

  permissionChanged(permission) {
    permission.action = 'ADD';
    permission.accessMask = this.accessLevelsMap[permission.accessLevel];
  }

  savePermissions() {
    const newPermissions = [];
    const selectedPolicy = Object.assign({}, this.selectedPolicy);
    selectedPolicy.permissions.map((p, i) => {
      if (p.action === 'ADD') {
        const oldP = Object.assign({}, p);
        oldP.accessLevel = this.tempPermissions[p.id].accessLevel;
        oldP.id = undefined;
        oldP.accessMask = this.accessLevelsMap[oldP.accessLevel];
        oldP.action = 'REMOVE';
        oldP.accessType = this.tempPermissions[p.id].accessType ? this.tempPermissions[p.id].accessType : 'ALLOW';
        //oldP.accessType = 'ALLOW';
        selectedPolicy.permissions.splice(i, 1, oldP);
        newPermissions.push(p);
      }
      p.id = undefined;
    });
    if(this.newPermissions && this.newPermissions.length>0){
      let temp=[];
     this.newPermissions.map((d,i)=>{
       if(!(d.Isexist)){
        temp.push(d);
       }
     });
     this.newPermissions=[...temp];
    }
    selectedPolicy.permissions = selectedPolicy.permissions.concat(newPermissions);
    if (this.newPermissions) {
      this.newPermissions.map(newPermission => {
        if (newPermission.granteeName) {
          const newPermissionObj: any = {};
          newPermissionObj.accessType = newPermission.accessType;
          newPermissionObj.action = 'ADD';
          newPermissionObj.depthName = '';
          newPermissionObj.inheritDepth = -3;
          newPermissionObj.permissionSource = 'DIRECT';
          newPermissionObj.granteeName = newPermission.granteeName.login;
          newPermissionObj.granteeType = newPermission.granteeType;
          newPermissionObj.accessLevel = newPermission.accessLevel;
          newPermissionObj.accessMask = this.accessLevelsMap[newPermission.accessLevel];
          selectedPolicy.permissions.push(newPermissionObj);
        }
      });
    }
    const successMsg = 'Permission Updated Successfully';
    const errorMsg = 'Error In Updating Permission';
    this.busy = true;
    const subscription = this.ds.setDocumentAdhocPermissions(selectedPolicy).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: successMsg
      // });
      this.toastr.info(successMsg, 'Success');
      this.showPermissionDialogue = false;
      this.newPermissions = [];
      this.refresh();
    }, err => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Error', detail: errorMsg
      // });
      this.toastr.error(errorMsg, 'Error');
    });
  }

  addNewPermission() {
    this.isFullAccess = this.accessValueDoc === '111';
    this.bs.openEditSecurityModel.emit({ action: 'add', isFullAccess: this.isFullAccess });
    if (!this.newPermissions) {
      this.newPermissions = [];
    }
    if (!this.isFullAccess) {
      this.newPermissions = [...this.newPermissions, {
        granteeType: 'USER',
        accessLevel: 'Owner',
        accessType: 'ALLOW'
      }];
    }
    else {
      this.newPermissions = [...this.newPermissions, {
        granteeType: 'USER',
        accessLevel: 'Full Control',
        accessType: 'ALLOW'
      }];
    }
  }

  getGranteesSuggestion(event) {
    if (event.np.granteeType === 'USER') {
      if (event.event.query.length >= 3) {
        this.busy = true;
        this.as.searchLDAPUsers(event.event.query).subscribe(res => {
          this.busy = false;
          event.np.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    } else {
      if (event.event.query.length >= 3) {
        this.busy = true;
        const subscription = this.as.searchLDAPGroups(event.event.query).subscribe(res => {
          this.busy = false;
          event.np.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    }
  }

  addPermission(permission) {
    this.selectedPolicy.permissions.map((p, i) => {
      if (p === permission) {
        p.action = 'READ';
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
      }
    });
  }

  removePermission(permission) {
    this.selectedPolicy.permissions.map((p, i) => {
      if (p === permission) {
        p.action = 'REMOVE';
        this.selectedPolicy.permissions = [...this.selectedPolicy.permissions];
      }
    });
  }

  removeNewPermission(permission) {
    this.newPermissions.map((p, i) => {
      if (p === permission) {
        this.newPermissions.splice(i, 1);
        this.newPermissions = [...this.newPermissions];
      }
    });
  }

  confirmDelete() {
    
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete - ' + this.selectedDocs[0].fileName,
      key: 'confirmKey',
      accept: () => {
        this.busy = true;
        this.ds.deleteDocuments([this.selectedDocs[0].id]).subscribe(data => {
          this.busy = false;
          this.showDeleteConfirmation(data);
          // this.growlService.showGrowl({
          //   severity: 'info',
          //   summary: 'Success', detail: 'Deleted Successfully'
          // });
          if (this.currentScreen === 'Advanced Search' || this.currentScreen === 'Simple Search') {
            this.toggleStrikeDeletedItem.emit(this.selectedDocs[0].id);
          }
          this.refresh();
        }, error => {
          this.busy = false;
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Error', detail: 'Failed to Delete, Try again or contact ECM Support'
          // });
          this.toastr.error('Failed to Delete, Try again or contact ECM Support', 'Error');
        });
      }
    });
  }

  showDeleteConfirmation(data){
    //console.log("data -- " + data);
    var docReason = "";
    var detailMsg = "Deleted Successfully";
    if(data && data.length > 0){
      data.map((d) => {
        //console.log("doc Title -- " + d.docTitle);
        if(docReason === "")
        docReason = d.reason
        else
        docReason = '\n' + d.reason
      });
    }
    
    console.log("docReason -- " + docReason);
    if(docReason && docReason.length > 0){
      //detailMsg = "Insufficient permissions or not allowed to delete: " + '\n' + " [" + documentTitles + "] " + '\n' + "Contact ECM Support Team";
      if(docReason === 'DELETE')
      {
        detailMsg = "Latest update (version) of document is deleted successfully";
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: detailMsg
        });
        this.toastr.info(detailMsg, 'Success');
      }
      else if(docReason === 'SOFT')
      {
        detailMsg = "Document is deleted successfully";
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: detailMsg
        // });
        this.toastr.info(detailMsg, 'Success');
      }
      else if(docReason !== 'SOFT' && docReason !== 'DELETE')
      {
        detailMsg = "Not permitted to delete this document, please contact ECM Support Team";
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: detailMsg
        // });
        this.toastr.error(detailMsg, 'Failure');
      }
      else{
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: detailMsg
        // }); 
        this.toastr.info(detailMsg, 'Success');
      }
    }
    else{
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: detailMsg
      // }); 
      this.toastr.info(detailMsg, 'Success');
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
    this.destroyKeys();
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      this[k] = null;
      //delete this[k];
    })
  }

  getEmptyRow(rowData: any, index: any) {
    return rowData.value === null ? 'h-xl' : '';
  }

  clearDocToFrom(info) {
    event.stopPropagation();
    if (info === 'DocumentTo') {
      this.docEditPropForm.get('DocumentTo').setValue('');
    }
    else {
      this.docEditPropForm.get('DocumentFrom').setValue('');
    }
  }
  

  ngOnDestroy() {
    this.clearSubscriptions();
    this.showRemove = false;
    this.selectedRemoveFolder = undefined;
    this.selectedMoveFromFolder = undefined;
    this.selectedMoveToFolder = undefined;
  }


  assignDependentLookup(detail) {
    //debugger;
    
    if (this.et_dependent_lookup && this.et_dependent_lookup.indexOf(',') != -1) {
      let etdls = this.et_dependent_lookup.split(',');
      for (let i = 0; i < etdls.length; i++) {
        let et_dep_lkup = etdls[i];
        
        if (et_dep_lkup && et_dep_lkup.indexOf(':') != -1) {
          let etdeplkupVals= et_dep_lkup.split(':');

          if ((etdeplkupVals[0] != "" && this.docTemplateDetails['name'].trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            let mainListVal = this.docEditPropForm.get(etdeplkupVals[2]).value;
            if(mainListVal && mainListVal !== null){
              this.busy = true;
              this.as.getLookupDependentValues(0, mainListVal).subscribe(val => {
                this.busy = false;
                val.map(d => {
                  d.label = d.label.replace("''", "'");
                  d.value = d.value.replace("''", "'");
                });
                detail.lookups = val;
              }, err => {
                this.busy = false;
              });
            }
            else{
              this.busy = true;
              if(detail.lkpId > 0){
                this.as.getLookupValues(detail.lkpId).subscribe(val => {
                  this.busy = false;
                  val.map(d => {
                    d.label = d.label.replace("''", "'");
                    d.value = d.value.replace("''", "'");
                  });
                  detail.lookups = val;
                }, err => {
                  this.busy = false;
                });
              }
            }
          }
        } 
      }
    } else if (this.et_dependent_lookup && this.et_dependent_lookup.trim().length > 0) {
      let et_dependent = this.et_dependent_lookup;

      if (et_dependent && et_dependent.indexOf(':') != -1) {
        let etdeplkupVals= et_dependent.split(':');
        
        if ((etdeplkupVals[0] != "" && this.docTemplateDetails['name'].trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            let mainListVal = this.docEditPropForm.get(etdeplkupVals[2]).value;
            if(mainListVal && mainListVal !== null){
              this.busy = true;
              this.as.getLookupDependentValues(0, mainListVal).subscribe(val => {
                this.busy = false;
                val.map(d => {
                  d.label = d.label.replace("''", "'");
                  d.value = d.value.replace("''", "'");
                });
                detail.lookups = val;
              }, err => {
                this.busy = false;
              });
            }
            else{
              this.busy = true;
              if(detail.lkpId > 0){
                this.as.getLookupValues(detail.lkpId).subscribe(val => {
                  this.busy = false;
                  val.map(d => {
                    d.label = d.label.replace("''", "'");
                    d.value = d.value.replace("''", "'");
                  });
                  detail.lookups = val;
                }, err => {
                  this.busy = false;
                });
              }
            }
          }
      } 
    }
  }

  onClickLookup(d) {
    //debugger;
    //alert("New change");
    if (this.et_dependent_lookup.trim().toUpperCase().indexOf(this.docTemplateDetails.name.trim().toUpperCase()) != -1)
        this.assignDependentLookup(d);
    
    /* let exist = false;
    let obj = { id: -1, label: "", value: null, action: "" };
    d.lookups.map(d => {
      if (d.value === null) {
        exist = true;
      }
    });
    if (!exist) {
      d.lookups.unshift(obj);
    } */

    
  }
}
