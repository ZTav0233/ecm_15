import {
  Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as _ from "lodash";
// services
import { UserService } from '../../../services/user.service';
import { DocumentService } from '../../../services/document.service';
import { ContentService } from '../../../services/content.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { Message, LazyLoadEvent, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

// models
import { User } from '../../../models/user/user.model';
import { WorkitemDetails } from '../../../models/workflow/workitem-details.model';
import { EntryTemplate } from '../../../models/document/entry-template.model';
import { EntryTemplateDetails } from '../../../models/document/entry-template-details.model';
import { BrowserEvents } from '../../../services/browser-events.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from "../../../services/core.service";
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { AdminService } from "../../../services/admin.service";
import * as global from "../../../global.variables";
import { ConfigurationService } from '../../../services/configuration.service';
import { ToastrService } from 'ngx-toastr';
//import * as jsonData from "../../../getDesignationValues.json";

@Component({
  selector: 'app-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.css'],
})
export class AddDocumentComponent implements OnInit, OnDestroy //, AfterViewInit
{
  @ViewChild('dt') dataTable!: Table;
  @Output() onAddSuccess = new EventEmitter();
  private subscriptions: Subscription[] = [];
  @Input() public assignedPath: any;
  @Input() public assignedId: any;
  @Input() public screen: any;
  @Input() public launchScreenStep1TabIndex = 0;
  @Output() onCancel = new EventEmitter();
  public currentUser: User;
  public entryTemplates: any[];
  public newClassDetails = new EntryTemplateDetails();
  public selectedEntryTemplate: any[];
  public entryTemplate: any[];
  public selectedClassName: any;
  public selectedEntryTemplateName: any;
  public selectedTemplateId: any;
  public showClassDetails = false;
  public newDocumentForm: FormGroup;
  public newDocFormData = new FormData();
  removeEnabled = false;
  uploadedFiles: any;
  msgs: Message[] = [];
  public scanners: TwainSource[] = [];
  DWObject = null;
  selectedTwainSource: TwainSource = null;
  CurrentPath = null;
  folderId: any;
  folderpath: any;
  errorJson: any;
  public loaded = false;
  public displayScannerSettings = false;
  public docFromScanner = false;
  public ecmNo;
  results: any;
  folderIdFromUrl: any;
  public desigVal:any
  index: any;
  public allowedExtensions = [".msg", ".csv", ".pdf", ".doc", ".zip", ".docx", ".xls", ".xlsx", ".msg", ".ppt", ".pptx", ".dib", ".webp",
    ".jpeg", ".svgz", ".gif", ".jpg", ".ico", ".png", ".svg", ".tif", ".xbm", ".bmp", ".jfif", ".pjpeg", ".pjp", ".tiff", ".txt",".doc",".bin",".pdf",".ppt",".rtf",".xls",".xla",".xlsb",
    ".xlsm",".msg",".ppt",".pot",".pptm",".mpp",".docm",".xps",".pptx",".ppsx",".xlsx",".docx",".dotx",".vsd",".xlsx",".xml",".bat",".pub",".mp4a",".mp3",".wav",".bmp",".gif",".jpg",".png",".tif",".dwg",".mdi",".ico",".eml",".dwf",".css",".html",".txt",".h",".xml",".mp4",".mpa",".gt",".flv",".avi",".wmv",".oth",".odm"];
  public allowedExtensionsString;
  public folderPermissionWarning = false;
  public openTree = false;
  public folderPermission = { usage: 'addDocument', folderSelected: false, permission: true };
  folderList: any[];
  selectedFolder: any;
  et_lookup: any;
  et_dependent_lookup: any;
  docToOrFrom: any;
  designation: any;
  selectedDesignation: any;
  totalRecords: number;
  datasource: any;
  showDesignation = false;
  isDocNameSet = false;
  @ViewChild('gb') searchInput: ElementRef;
  @ViewChild('dt') namelist: any;
  busy: boolean;
  public excepClassNames = global.excep_class_names;
  tempdocSelectEvent:any;
  clonedocSelectEvent:any;
  public isFileSizeCorrect:boolean = true;
  fileSizeConfiguration:any;
  //et_default_orgcode: any
  //et_default_date: any
  constructor(private cs: ContentService, private fb: FormBuilder, private breadcrumbService: BreadcrumbService, private as: AdminService,private toastr:ToastrService,
    private router: Router, private us: UserService, private coreService: CoreService, private configService: ConfigurationService,
    private ds: DocumentService, private bs: BrowserEvents, private growlService: GrowlService,
    private confirmationService: ConfirmationService) {
    this.entryTemplate = [];
    this.currentUser = this.us.getCurrentUser();
    this.newDocumentForm = fb.group({
      'DocumentTitle': [null, Validators.required],
    });
    this.allowedExtensionsString = this.allowedExtensions.join(',') + this.allowedExtensions.join(',').toUpperCase();
    this.bs.getEntryTemplateForAddLazy.subscribe(data => this.changeNewClass(true));
    this.et_lookup = global.et_lookup;
    this.et_dependent_lookup = global.et_dependent_lookup;
  }

  closeClick() {
    this.onCancel.emit();
    if (this.router.url.includes('add-doc')) {
      this.router.navigate(['']);
    }
  }

  loadLazy(event: LazyLoadEvent) {
    if (event.globalFilter.length > 0) {
      this.designation = this.datasource.filter(
        item => item.value ? item.value.toLowerCase().indexOf(event.globalFilter.toLowerCase()) != -1 : "");
      this.totalRecords = this.designation.length;
      //console.log(this.totalRecords);
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
    console.log(this.namelist);
    
    // this.namelist.onFilterKeyup('', 'data', 'contains');
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

  onSelectionChange(val, input) {
    console.log(val,input);
    console.log(this.newDocumentForm.get('DocumentTo'));
    
    if (input === 'Document To') {
      this.newDocumentForm.get('DocumentTo').setValue(val.value);
    }
    else {
      this.newDocumentForm.get('DocumentFrom').setValue(val.value);
    }
  }

  setEcmNo(isAfterAdd?, cb?) {
    this.as.getNextECMNo().subscribe(data => {
      this.ecmNo = data;
      if (isAfterAdd) {
        this.newClassDetails.props.forEach(control => {
          if (control.symName === 'ECMNo') {
            //control.mvalues[0] = this.ecmNo;
            this.newDocumentForm.get('ECMNo').setValue(this.ecmNo);
          }
        });
      }
      if (cb) {
        cb();
      }
    }, err => {
    });
  }

  setDefaultValues(isAfterAdd?){
    if (isAfterAdd) {
      this.newClassDetails.props.forEach(control => {
        if (control.symName === 'OrgCode') {
          if (global.et_default_orgcode && global.et_default_orgcode.indexOf(',') != -1) {
            let ets = global.et_default_orgcode.split(',');
            for (let i = 0; i < ets.length; i++) {
                let et_default = ets[i];
                
                if (et_default && et_default.indexOf(':') != -1) {
                  let etdefaultVals= et_default.split(':');

                  if (etdefaultVals[0] != "" && (this.selectedEntryTemplateName.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
                    if(etdefaultVals[1] != "")
                      this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
                  }
                } 
            }
          } else if (global.et_default_orgcode && global.et_default_orgcode.trim().length > 0) {
            let et_default = global.et_default_orgcode;
      
            if (et_default && et_default.indexOf(':') != -1) {
              let etdefaultVals= et_default.split(':');
              
              if (etdefaultVals[0] != "" && (this.selectedEntryTemplateName.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
                if(etdefaultVals[1] != "")
                  this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
              }
            } 
          }
        }
        else if (control.symName === 'DocumentDate') {
          if (global.et_default_date && global.et_default_date.indexOf(',') != -1) {
            let ets = global.et_default_date.split(',');
            for (let i = 0; i < ets.length; i++) {
                let et_default = ets[i];
                if (et_default != "" && (this.selectedEntryTemplateName.trim().toUpperCase() === et_default.trim().toUpperCase()))
                  this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
            }
          } else if (global.et_default_date && global.et_default_date.trim().length > 0) {
              if (this.selectedEntryTemplateName.trim().toUpperCase() === global.et_default_date.trim().toUpperCase())
                this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
          }
        }
      });
    }
    

    
  }

  getSecondPart(str) {
    return str.split('folder-id=')[1];
  }

  assignUrlPath(data) {
    this.folderpath = data.path;
    this.folderId = data.id;
  }
  assignDesignationData(desigData){
     if(desigData && desigData.length>0){
      this.designation = desigData;
      this.datasource = this.designation;
      this.totalRecords = this.datasource.length;
      this.designation = this.datasource//.slice(0, 10);

    }
    console.log(this.designation);
    

  }

  ngOnInit() {
    let desigData;
    if(this.as.designationValues && this.as.designationValues.length<=0){
      //AKV-getDesignationValues
       this.as.getDesignationData().subscribe(data => {
         //data=[{"id":2,"value":" AL GHUNAIM TRADING CO - شركة الغنيم التجارية المحدودة","action":""},{"id":3,"value":" MINISTRY OF SOCIAL AFFAIRS & LABOUR","action":""}];
         this.as.designationValues=data;
         this.as.designationValues.unshift({ id: "", value: null, action: "" });
        this.assignDesignationData(this.as.designationValues);
         //localStorage.setItem('designationJSON', JSON.stringify(data));
    },err=>{
         console.log(err);
       });
    }
    else{
      desigData = this.as.designationValues;
      this.assignDesignationData(desigData);
    }

    //this.setEcmNo();
    this.folderIdFromUrl = this.getSecondPart(this.router.url);
    if (this.folderIdFromUrl) {
      this.cs.getFolderDetails(this.folderIdFromUrl).subscribe(data => this.assignUrlPath(data));
    }
    this.bs.addDocPath.subscribe(data => this.assignPath(data));
    this.bs.addDocId.subscribe(data => this.assignId(data));
    //Combining getEntryTemplatesForSearch and getEntryTemplates API Call.
    //this.screen && this.screen === 'Launch' &&
    if (this.cs.entryTemplatesListForSearchAndAdd && this.cs.entryTemplatesListForSearchAndAdd.addList.length > 0) {
      let entryTemplatesFromMemory = this.cs.entryTemplatesListForSearchAndAdd.addList;
      this.entryTemplates = entryTemplatesFromMemory;
      for (let i = 0; i < entryTemplatesFromMemory.length; i++) {
        this.entryTemplate.push({ label: entryTemplatesFromMemory[i].symName, value: { 'id': entryTemplatesFromMemory[i].id, 'vsid': entryTemplatesFromMemory[i].vsid } });
      }
      if (this.entryTemplates.length > 0) {
        this.selectedEntryTemplate = this.entryTemplate[0].value;
        const displayName = _.cloneDeep(this.entryTemplate[0].label);
        if (global.et_folder && global.et_folder.indexOf('@') != -1 && this.screen && this.screen != 'BrowseModel') {
          let etFolders = global.et_folder.split('@');
          for (let i = 0; i < etFolders.length; i++) {
            if (etFolders[i] && etFolders[i].indexOf(':') != -1) {
              let defaultFolder = etFolders[i].split(':');
              if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
                this.selectDefaultFolder(defaultFolder[1]);
              } else {
                /*this.folderId="";
                this.folderpath="";*/
                this.removeFolderPath();
              }
            }
          }
        } else if (global.et_folder && global.et_folder.indexOf(':') != -1 && this.screen && this.screen != 'BrowseModel') {
            let defaultFolder = global.et_folder.split(':');
            //const displayName = _.cloneDeep(this.entryTemplate[0].label);
            if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
              this.selectDefaultFolder(defaultFolder[1]);
            } else {
              /*this.folderId="";
              this.folderpath="";*/
              this.removeFolderPath();
            }
        }
        this.setEcmNo(false, () => {
          this.changeNewClass();
        });
      }
    } else {
      this.busy = true;
      this.cs.getEntryTemplatesForSearchAndAdd().subscribe(data => {
        this.busy = false;
        this.cs.entryTemplatesListForSearchAndAdd.addList = data.addList;
        this.cs.entryTemplatesListForSearchAndAdd.searchList = data.searchList;
        this.cs.entryTemplatesListForSearchAndAdd.valueFetchedFromServer = true;
        this.entryTemplates = data.addList;
        for (let i = 0; i < this.entryTemplates.length; i++) {
          this.entryTemplate.push({ label: this.entryTemplates[i].symName, value: { 'id': this.entryTemplates[i].id, 'vsid': this.entryTemplates[i].vsid } });
        }
        if (this.entryTemplates.length > 0) {
          this.selectedEntryTemplate = this.entryTemplate[0].value;
          const displayName = _.cloneDeep(this.entryTemplate[0].label);
          if (global.et_folder && global.et_folder.indexOf('@') != -1 && this.screen && this.screen != 'BrowseModel') {
            let etFolders = global.et_folder.split('@');
            for (let i = 0; i < etFolders.length; i++) {
              if (etFolders[i] && etFolders[i].indexOf(':') != -1) {
                let defaultFolder = etFolders[i].split(':');
                if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
                  this.selectDefaultFolder(defaultFolder[1]);
                } else {
                  /*this.folderId="";
                  this.folderpath="";*/
                  this.removeFolderPath();
                }
              }
            }
          } else if (global.et_folder && global.et_folder.indexOf(':') != -1 && this.screen && this.screen != 'BrowseModel') {
              let defaultFolder = global.et_folder.split(':');
              //const displayName = _.cloneDeep(this.entryTemplate[0].label);
              if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
                this.selectDefaultFolder(defaultFolder[1]);
              } else {
                /*this.folderId="";
                this.folderpath="";*/
                this.removeFolderPath();
              }
          }
          this.setEcmNo(false, () => {
            this.changeNewClass();
          });
        }
      }, err => {
        this.busy = false;
      });
    }
    if (this.screen && this.screen === 'BrowseModel') {
      this.folderpath = this.assignedPath;
      this.folderId = this.assignedId;
      this.removeEnabled = true;
    }
    this.getMaxFileSizeConfigValue();
    // this.getETDefaultOrgCodeConfigValue();
    // this.getETDefaultDateConfigValue();
    //this.cs.getTopFolders().subscribe(data => this.getMainFolders(data));
  }

  getMaxFileSizeConfigValue(){
    this.configService.getAppConfigurationValue('MAXFILESIZE').subscribe(config => {
      this.fileSizeConfiguration = JSON.parse(config)
      console.log(this.fileSizeConfiguration)
     
    }, err => {
      this.busy = false;
    });
  }


  selectDefaultFolder(defaultFolderId) {
    this.cs.getFolderDetails(defaultFolderId).subscribe(data => this.getMainFolders(data, true));
  }

  nodeExpand(event) {
    this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data));
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

  nodeSelect(event) {
    // if (event.node.data.id === this.selectedFolder.data.id) {
    //   return;
    // }
    this.cs.validateFolderPermissions(event.node.data.id, 'ADD').subscribe(data => {
      this.folderPermission.folderSelected = true;
      if (data !== true) {
        this.folderPermission.permission = true;
      } else {
        this.folderPermission.permission = false;
        this.folderpath = event.node.data.path;
        this.folderId = event.node.data.id;
        // this.assignedId=this.folderId;
        // this.assignedPath=this.folderpath;
        /*localStorage.setItem('folderId', event.node.data.id);
        localStorage.setItem('path', event.node.data.path);
        this.ds.savedFolderBrowse.folderPathSavedBrowse = event.node.data.path;*/
      }
    });
  }

  getMainFolders(data, isForDefaultFolderSelection?) {
    if (!isForDefaultFolderSelection) {
      if (data[0].id !== undefined) {
        localStorage.setItem('folderId', data[0].id);
      }
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
      this.folderList = topFolder;

      this.cs.getSubFolders(this.folderList[0].data.id).subscribe(data =>
        this.assignSubFoldersFor(this.folderList[0], data));
    }
    else {
      /*data.map(d=>{
        if(d.name==='Employee'){
          this.folderpath = d.path;
          this.folderId=d.id;
        }
      });*/
      if (data && data.path && data.id) {
        this.folderpath = data.path;
        this.folderId = data.id;
        this.removeEnabled = true;
      }
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
  }

  assignPath(data) {
    this.folderpath = data;
  }

  assignId(data) {
    if (!this.folderIdFromUrl) {
      this.folderId = data;
    }
    else {
      this.folderId = this.folderIdFromUrl;
    }
  }

  noWhitespaceValidator(control: FormControl):any {
    if (typeof control.value !== 'number') {
      let isWhitespace = (control.value || '').trim().length === 0;
      let isValid = !isWhitespace;
      return isValid ? null : {'whitespace': true}
   }
  }

  changeNewClass(callAPI = false) {
    let template;
    template = _.find(this.cs.entryTemplatesListForSearchAndAdd.entryTemplateForAdd, (template) => {
      return template.template.id === this.selectedEntryTemplate['id'] && template.template;
    });
    if (template) {
      this._assignTemplateFromMemory(_.cloneDeep(template.template));
    } else {
      if (callAPI || !(this.screen === 'Launch' && this.launchScreenStep1TabIndex === 0))
        this._assignTemplateFromServer();
    }
  }

  _assignTemplateFromServer() {
    this.busy = true;
    if(this.selectedEntryTemplate['id']) {
      this.cs.getEntryTemplate(this.selectedEntryTemplate['id'], this.selectedEntryTemplate['vsid']).subscribe(data => {
         // data.props.map(d => {
         //    if (d.desc === "Ref #") {
         //      d.dtype = "INTEGER";
         //      d.lookups = undefined;
         //    }
         //  });
        this.busy = false;
        this.cs.entryTemplatesListForSearchAndAdd.entryTemplateForAdd.push({'template': _.cloneDeep(data)});
        this.newDocumentForm = this.fb.group({
          'DocumentTitle': [null, Validators.required],
        });
        if (data.name.trim().toUpperCase() === this.et_lookup.trim().toUpperCase()) {
          data.props.map(d => {
            if (d.desc === "Document Category") {
              d.dtype = "STRING";
              d.lookups = undefined;
            }
          });
        }
        this.newClassDetails = data;
        this.selectedClassName = data.symName;
        this.selectedEntryTemplateName = data.name;
        const displayName = _.cloneDeep(this.newClassDetails.name);
        if (global.et_folder && global.et_folder.indexOf('@') != -1 && this.screen && this.screen != 'BrowseModel') {
          let etFolders = global.et_folder.split('@');
          for (let i = 0; i < etFolders.length; i++) {
            if (etFolders[i] && etFolders[i].indexOf(':') != -1) {
              let defaultFolder = etFolders[i].split(':');
              if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
                this.selectDefaultFolder(defaultFolder[1]);
              } else {
                /*this.folderId="";
                this.folderpath="";*/
                this.removeFolderPath();
              }
            }
          }
        } else if (global.et_folder && global.et_folder.indexOf(':') != -1 && this.screen && this.screen != 'BrowseModel') {
          let defaultFolder = global.et_folder.split(':');
          //const displayName = _.cloneDeep(this.newClassDetails.name);
          if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
            this.selectDefaultFolder(defaultFolder[1]);
          } else {
            /*this.folderId="";
             this.folderpath="";*/
            this.removeFolderPath();
          }
        } else if (this.screen && this.screen === 'BrowseModel') {
            this.folderpath = this.assignedPath;
            this.folderId = this.assignedId;
        } else {
            /*this.folderId="";
            this.folderpath="";*/
            this.removeFolderPath();
        }
        this.selectedTemplateId = data.id;
        let ecmNoExists = false;
        var isXEmployee = false;
        this.newClassDetails.props.forEach(control => {
          if (control.symName === 'ECMNo') {
            //control.mvalues[0] = this.ecmNo;
            ecmNoExists = true;
          } else if (control.symName.toUpperCase() === 'FILLER1' && control.ltype === 2) {
            isXEmployee = true;
          }
          if (control.req === 'true' && control.hidden === 'false') {
            if (control.dtype === 'DATE') {
              this.newDocumentForm.addControl(control.symName, new FormControl(null, Validators.required));
            } else {
              this.newDocumentForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));

            }
          } else if (control.hidden === 'false') {
            this.newDocumentForm.addControl(control.symName, new FormControl(null, Validators.maxLength(400)));
          }

          if (control.symName === 'OrgCode') {
            if (control.lookups) {
              const removables = [];
              control.lookups.map((d, i) => {
                if (d.label.trim().length > 4) {
                  removables.push(i);
                }
              });
              removables.map((d, i) => {
                control.lookups.splice(d - i, 1);
              });
            }
            if (global.et_default_orgcode && global.et_default_orgcode.indexOf(',') != -1) {
              let ets = global.et_default_orgcode.split(',');
              for (let i = 0; i < ets.length; i++) {
                  let et_default = ets[i];
                  
                  if (et_default && et_default.indexOf(':') != -1) {
                    let etdefaultVals= et_default.split(':');
                    
                    if (etdefaultVals[0] != "" && (data.name.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
                      if(etdefaultVals[1] != "")
                        this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
                    }
                  } 
              }
            } else if (global.et_default_orgcode && global.et_default_orgcode.trim().length > 0) {
              let et_default = global.et_default_orgcode;

              if (et_default && et_default.indexOf(':') != -1) {
                let etdefaultVals= et_default.split(':');
                
                if (etdefaultVals[0] != "" && (data.name.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
                  if(etdefaultVals[1] != "")
                    this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
                }
              } 
            }
            
          }

          if (control.symName === 'DocumentDate') {
            if (global.et_default_date && global.et_default_date.indexOf(',') != -1) {
              let ets = global.et_default_date.split(',');
              for (let i = 0; i < ets.length; i++) {
                  let et_default = ets[i];
                  if (et_default != "" && (data.name.trim().toUpperCase() === et_default.trim().toUpperCase()))
                    this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
              }
            } else if (global.et_default_date && global.et_default_date.trim().length > 0) {
                if (data.name.trim().toUpperCase() === global.et_default_date.trim().toUpperCase())
                  this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
            }
            
          }

          if (!(this.excepClassNames.indexOf(this.newClassDetails.name.toLowerCase())> -1) && control.symName === 'DocumentFrom' && control.hidden === 'false') {
            if (control.lookups) {
              delete control.lookups;
            }
            // this.newDocumentForm.get('DocumentFrom').disable();
          }
          if (!(this.excepClassNames.indexOf(this.newClassDetails.name.toLowerCase())> -1) && control.symName === 'DocumentTo' && control.hidden === 'false') {
            if (control.lookups) {
              delete control.lookups;
            }
            // this.newDocumentForm.get('DocumentTo').disable();
          }
        });

        if (ecmNoExists)
          this.newDocumentForm.get('ECMNo').setValue(this.ecmNo);

        

        if (isXEmployee)
          this.newDocumentForm.get('Filler1').setValue('No');

        if (this.newClassDetails !== null) {
          this.showClassDetails = true;
        } else {
          this.showClassDetails = false;
        }
        if (this.newClassDetails['name'].trim().toUpperCase() === this.et_lookup.trim().toUpperCase()) {
          this.newDocumentForm.get('EmsSubject').disable();
        }
      }, error => {
        this.busy = false;
        this.showClassDetails = false
      });
    }
  }

  changeLookup(e, detail) {
    if (this.newClassDetails['name'].trim().toUpperCase() === this.et_lookup.trim().toUpperCase()) {
      if (detail.symName === "DeptDocType") {
        let cat = "";
        detail.lookups.map((d) => {
          if (d.value === e.value) {
            cat = d.category;
          }
        });
        this.newDocumentForm.get('EmsSubject').setValue(cat);
      }
    }
    //this.assignDependentLookup(e, detail);
  }

  assignDependentLookup(detail) {
    //debugger;
    // if ((this.newClassDetails['name'].trim().toUpperCase() === this.et_dependent_lookup.trim().toUpperCase()) && (detail.symName === "ReferenceNo")) {
    //   let mainListVal = this.newDocumentForm.get('DocType').value;
    //   if(mainListVal && mainListVal !== null){
    //     this.busy = true;
    //     this.as.getLookupDependentValues(0, mainListVal).subscribe(val => {
    //       this.busy = false;
    //       val.map(d => {
    //         d.label = d.label.replace("''", "'");
    //         d.value = d.value.replace("''", "'");
    //       });
    //       detail.lookups = val;
    //     }, err => {
    //       this.busy = false;
    //     });
    //   }
    // }
    
    if (this.et_dependent_lookup && this.et_dependent_lookup.indexOf(',') != -1) {
      let etdls = this.et_dependent_lookup.split(',');
      for (let i = 0; i < etdls.length; i++) {
        let et_dep_lkup = etdls[i];
        
        if (et_dep_lkup && et_dep_lkup.indexOf(':') != -1) {
          let etdeplkupVals= et_dep_lkup.split(':');

          if ((etdeplkupVals[0] != "" && this.newClassDetails['name'].trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            let mainListVal = this.newDocumentForm.get(etdeplkupVals[2]).value;
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
        
        if ((etdeplkupVals[0] != "" && this.newClassDetails['name'].trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            let mainListVal = this.newDocumentForm.get(etdeplkupVals[2]).value;
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
    if (this.et_dependent_lookup.trim().toUpperCase().indexOf(this.newClassDetails['name'].trim().toUpperCase()) != -1)
        this.assignDependentLookup(d);
    
    let exist = false;
    let obj = { id: -1, label: "", value: null, action: "" };
    d.lookups.map(d => {
      if (d.value === null) {
        exist = true;
      }
    });
    if (!exist) {
      d.lookups.unshift(obj);
    }

    
  }

  _assignTemplateFromMemory(data) {
    this.newDocumentForm = this.fb.group({
      'DocumentTitle': [null, Validators.required],
    });
    if (data.name.trim().toUpperCase() === this.et_lookup.trim().toUpperCase()) {
      data.props.map(d => {
        if (d.desc === "Document Category") {
          d.dtype = "STRING";
          d.lookups = undefined;
        }
      });
    }
    this.newClassDetails = data;
    this.selectedClassName = data.symName;
    this.selectedEntryTemplateName = data.name;
    const displayName = _.cloneDeep(this.newClassDetails.name);
    if (global.et_folder && global.et_folder.indexOf('@') != -1 && this.screen && this.screen != 'BrowseModel') {
      let etFolders = global.et_folder.split('@');
      for (let i = 0; i < etFolders.length; i++) {
        if (etFolders[i] && etFolders[i].indexOf(':') != -1) {
          let defaultFolder = etFolders[i].split(':');
          if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
            this.selectDefaultFolder(defaultFolder[1]);
          } else {
            /*this.folderId="";
            this.folderpath="";*/
            this.removeFolderPath();
          }
        }
      }
    } else if (global.et_folder && global.et_folder.indexOf(':') != -1 && this.screen && this.screen != 'BrowseModel') {
      let defaultFolder = global.et_folder.split(':');
      if (displayName.toUpperCase() === defaultFolder[0].toUpperCase()) {
        this.selectDefaultFolder(defaultFolder[1]);
      } else {
        /*this.folderId="";
        this.folderpath="";*/
        this.removeFolderPath();
      }
    } else if (this.screen && this.screen === 'BrowseModel') {
        this.folderpath = this.assignedPath;
        this.folderId = this.assignedId;
        this.removeEnabled = true;
    } else {
      /*this.folderId="";
      this.folderpath="";*/
      this.removeFolderPath();
    }
    this.selectedTemplateId = data.id;
    let ecmNoExists = false;
    var isXEmployee = false;
    this.newClassDetails.props.forEach(control => {
      if (control.symName === 'ECMNo') {
        ecmNoExists = true;
      }
      else if (control.symName.toUpperCase() === 'FILLER1' && control.ltype === 2) {
        isXEmployee = true;
      }
      if (control.req === 'true' && control.hidden === 'false') {
        if (control.dtype === 'DATE') {
          this.newDocumentForm.addControl(control.symName, new FormControl(null, Validators.required));
        } else {
          this.newDocumentForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));

        }
      } else if (control.hidden === 'false') {
        this.newDocumentForm.addControl(control.symName, new FormControl(null, Validators.maxLength(400)));
      }

      if (control.symName === 'OrgCode') {
        if (control.lookups) {
          const removables = [];
          control.lookups.map((d, i) => {
            if (d.label.trim().length > 4) {
              removables.push(i);
            }
          });
          removables.map((d, i) => {
            control.lookups.splice(d - i, 1);
          });
        }

        if (global.et_default_orgcode && global.et_default_orgcode.indexOf(',') != -1) {
          let ets = global.et_default_orgcode.split(',');
          for (let i = 0; i < ets.length; i++) {
              let et_default = ets[i];
              
              if (et_default && et_default.indexOf(':') != -1) {
                let etdefaultVals= et_default.split(':');
                
                if (etdefaultVals[0] != "" && (data.name.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
                  if(etdefaultVals[1] != "")
                    this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
                }
              } 
          }
        } else if (global.et_default_orgcode && global.et_default_orgcode.trim().length > 0) {
          let et_default = global.et_default_orgcode;

          if (et_default && et_default.indexOf(':') != -1) {
            let etdefaultVals= et_default.split(':');
            
            if (etdefaultVals[0] != "" && (data.name.trim().toUpperCase() === etdefaultVals[0].trim().toUpperCase())){
              if(etdefaultVals[1] != "")
                this.newDocumentForm.get('OrgCode').setValue(etdefaultVals[1]);
            }
          } 
        }
      }

      if (control.symName === 'DocumentDate') {
        if (global.et_default_date && global.et_default_date.indexOf(',') != -1) {
          let ets = global.et_default_date.split(',');
          for (let i = 0; i < ets.length; i++) {
              let et_default = ets[i];
              if (et_default != "" && (data.name.trim().toUpperCase() === et_default.trim().toUpperCase()))
                this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
          }
        } else if (global.et_default_date && global.et_default_date.trim().length > 0) {
            if (data.name.trim().toUpperCase() === global.et_default_date.trim().toUpperCase())
              this.newDocumentForm.get('DocumentDate').setValue(this.getTodaysDate());
        }
        
      }

      if (!(this.excepClassNames.indexOf(this.newClassDetails.name.toLowerCase())> -1) && control.symName === 'DocumentFrom' && control.hidden === 'false') {
        if (control.lookups) {
          delete control.lookups;
        }
        // this.newDocumentForm.get('DocumentFrom').disable();
      }
      if (!(this.excepClassNames.indexOf(this.newClassDetails.name.toLowerCase())> -1) && control.symName === 'DocumentTo' && control.hidden === 'false') {
        // this.newDocumentForm.get('DocumentTo').disable();
        if (control.lookups) {
          delete control.lookups;
        }
      }
    });
    if (ecmNoExists)
      this.newDocumentForm.get('ECMNo').setValue(this.ecmNo);

    if (isXEmployee)
      this.newDocumentForm.get('Filler1').setValue('No');

    if (this.newClassDetails !== null) {
      this.showClassDetails = true;
    } else {
      this.showClassDetails = false;
    }
    if (this.newClassDetails['name'].trim().toUpperCase() === this.et_lookup.trim().toUpperCase()) {
      this.newDocumentForm.get('EmsSubject').disable();
    }
  }

  docUpload(event) {

    if (this.docFromScanner) {
      this.confirmReplaceDocument(event);
    } else {
      this.onUpload(event);
    }
  }

 bytesToSize(bytes:any) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i:any = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i))  + ' ' + sizes[i];;
 }

  onUpload(event) {
    if (event.files && event.files.length) {
      
      let fileSize = event.files[0].size;
      if (fileSize <= Number(this.fileSizeConfiguration.value)) {
        this.isFileSizeCorrect = true  
        let name = event.files[0].name.toLowerCase(),
          extension = name.substr(name.lastIndexOf('.'));
        if (this.allowedExtensions.indexOf(extension) > -1) {
          this.uploadedFiles = event.files[0];
          console.log(this.uploadedFiles.type);
          const docTitle = this.uploadedFiles.name.split('.').slice(0, -1).join(".");
          if (!this.isDocNameSet) {
            this.newDocumentForm.get('DocumentTitle').setValue(docTitle);
          }
          if (!this.isDocNameSet && (this.newDocumentForm.get('DocumentTitle').value === null || this.newDocumentForm.get('DocumentTitle').value === '') ){
            this.newDocumentForm.get('DocumentTitle').setValue(docTitle);
          }
        }
      } else {
        this.isFileSizeCorrect = false
        console.log("Maximum File size allowed 800 MB!");
      }
    }
    else {
      console.log("File is not selected");
    }
  
  }

  confirmReplaceDocument(e) {
    var self=this;
    self.clonedocSelectEvent=e.files[0];
    this.confirmationService.confirm({
      header: 'Replace Confirmation?',
      message: 'Do you want to discard scanned document and proceed with selected document?',
      key: 'addDocConfirmKey',
      acceptVisible: true,
      rejectVisible: true,
      accept: () => {
        this.docFromScanner = false;
        let temp=self.clonedocSelectEvent;
        if (temp) {
        //if (temp && temp.length) {
          let name = temp.name.toLowerCase(),
            extension = name.substr(name.lastIndexOf('.'));
          if (this.allowedExtensions.indexOf(extension) > -1) {
            this.uploadedFiles =temp;
            const docTitle = this.uploadedFiles.name.split('.').slice(0, -1).join(".");
            if (!this.isDocNameSet) {
              this.newDocumentForm.get('DocumentTitle').setValue(docTitle);
            }
          }
        }
      },
      reject: () => {
        this.uploadedFiles = '';
        //this.newDocumentForm.get('DocumentTitle').setValue('Scanned_Document');
      }
    });

  }

  addDocument(event) {
    let format='application/pdf';
    if (!this.docFromScanner) {
      this.newDocFormData = new FormData();
      this.newDocFormData.append('document', this.uploadedFiles);
      format= this.uploadedFiles.type;
    }
    if ((Object.keys(this.newDocumentForm.controls)) &&
      (Object.keys(this.newDocumentForm.controls).length < 1)) {
    } else {
      const docInfo = {
        creator: this.currentUser.fulName,
        folder: this.folderId,
        docclass: this.selectedClassName,
        entryTemplate: this.selectedTemplateId,
        format:format,
        props: [{
          'name': 'Document Title', 'symName': 'DocumentTitle', 'dtype': 'STRING', 'mvalues': [''],
          'mtype': 'N', 'len': 255, 'rOnly': 'false', 'hidden': 'false', 'req': 'false'
        }],
        accessPolicies: []
      };

      for (const control of Object.keys(this.newDocumentForm.controls)) {
        if (control === 'DocumentTitle') {
          docInfo.props[0].mvalues = [this.newDocumentForm.get(control).value];
        } else if (this.getControlDataType(control) === 'DATE') {
          if (this.newDocumentForm.get(control).value !== null) {
            const prop = {
              'name': '',
              'symName': control,
              'dtype': 'DATE',
              'mvalues': [this.getFormatedDate(this.newDocumentForm.get(control).value)],
              'mtype': 'N',
              'len': 255,
              'rOnly': 'false',
              'hidden': 'false',
              'req': 'false'
            };
            docInfo.props.push(prop);
          } else {
            const prop = {
              'name': '',
              'symName': control,
              'dtype': 'DATE',
              'mvalues': [null],
              'mtype': 'N',
              'len': 255,
              'rOnly': 'false',
              'hidden': 'false',
              'req': 'false'
            };
            docInfo.props.push(prop);
          }
        }
        else {
          const prop = {
            'name': '', 'symName': control, 'dtype': 'STRING', 'mvalues': [this.newDocumentForm.get(control).value],
            'mtype': 'N', 'len': 255, 'rOnly': 'false', 'hidden': 'false', 'req': 'false'
          };
          /* if (prop.symName === 'ECMNo') {
            prop.mvalues[0] = this.ecmNo;
          } */
          docInfo.props.push(prop);
        }
      }

      this.newDocFormData.append('DocInfo', JSON.stringify(docInfo));
      let allRequiredFieldsFilled = true;
      this.newClassDetails.props.forEach(control => {
        if (control.req === 'true' && control.hidden === 'false') {
          if (control.dtype === 'DATE' || control.dtype === 'INTEGER') {
            if (this.newDocumentForm.get(control.symName).value === null || !this.folderpath) {
              allRequiredFieldsFilled = false;
            }
          } else {
            if (this.newDocumentForm.get(control.symName).value === null || this.newDocumentForm.get(control.symName).value === '' || this.newDocumentForm.get(control.symName).value.trim().length === 0 || !this.folderpath) {
              allRequiredFieldsFilled = false;
            }
          }
        }
      });
      if (allRequiredFieldsFilled === true) {
        this.busy = true;
        this.ds.addDocument(this.newDocFormData).subscribe((data) => {
          this.busy = false;
          this.addDocSuccess(data)
        }, (err) => {
          this.busy = false;
          this.addDocFailed(err)
        });
      } else if (allRequiredFieldsFilled === false) {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Fill Required', detail: 'Fill All Required Fields'
        // });
        this.toastr.error('Fill All Required Fields', 'Fill Required');
      }
    }
  }

  getControlDataType(control) {
    if ((this.newClassDetails != null) && (this.newClassDetails.props != null)) {
      for (const prop of this.newClassDetails.props) {
        if (prop.symName === control) {
          return prop.dtype;
        }
      }
    }
    return null;
  }

  getFormatedDate(value) {
    const date = new Date(value);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  getTodaysDate() {
    const date = new Date();
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  addDocSuccess(data) {
    // if (!this.router.url.includes('launch')) {
    //   window.parent.postMessage('AddDocLaunchSuccess', '*');
    // }
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Add Document Success'
    // });
    this.toastr.info('Add Document Success', 'Success');
    const newDocID = data;
    this.clearForm();
    this.uploadedFiles = '';
    this.docFromScanner = false;
    this.busy = true;
    this.isDocNameSet=false;
    this.ds.getDocument(newDocID).subscribe(doc => {
      this.busy = false;
      const document = doc;
      this.onAddSuccess.emit(document);
    }, err => {
      this.busy = false;
    });
  }

  addDocFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: this.errorJson
    // });
    this.toastr.error(this.errorJson, 'Failure');

  }

  selectFolder() {
    // this.folderpath = localStorage.getItem('path');
    //this.folderId = localStorage.getItem('folderId');
    this.openTree = false;
    this.removeEnabled = true;
  }

  clearForm() {
    for (const control of Object.keys(this.newDocumentForm.controls)) {
      if (this.getControlDataType(control) === 'DATE') {
        // this.newDocumentForm.patchValue({ control: null });
        this.newDocumentForm.get(control).setValue(null);
      } else {
        this.newDocumentForm.get(control).setValue(null);
      }
    }
    this.setEcmNo(true);
    this.setDefaultValues(true);
  }

  loadDynamsoft() {
    if (this.uploadedFiles) {
      this.confirmationService.confirm({
        header: 'Replace Confirmation?',
        message: 'Do you want to discard selected document and proceed with scanning?',
        key: 'addDocConfirmKey',
        acceptVisible: true,
        rejectVisible: true,
        accept: () => {
          this.uploadedFiles = '';
          Dynamsoft.DWT.Load();
          Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", () => {
            this.Dynamsoft_OnReady()
          });
          this.pageonload();
          this.displayScannerSettings = true;
        },
        reject: () => {
        }
      });
    } else {
      Dynamsoft.DWT.Load();
      Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", () => {
        this.Dynamsoft_OnReady()
      });
      this.pageonload();
      this.displayScannerSettings = true;
    }
  }

  saveScannedImages() {
    let imagedata = null;
    if (this.DWObject && this.DWObject.HowManyImagesInBuffer > 0) {
      this.DWObject.SelectedImagesCount = this.DWObject.HowManyImagesInBuffer;
      for (let i = 0; i < this.DWObject.HowManyImagesInBuffer; i++) {
        this.DWObject.SetSelectedImageIndex(i, i);
      }
      this.DWObject.GetSelectedImagesSize(4); // 4 for PDF
      imagedata = this.DWObject.SaveSelectedImagesToBase64Binary();
      this.newDocFormData = new FormData();
      this.newDocFormData.append('document', imagedata);
      if (!this.isDocNameSet) {
        this.newDocumentForm.get('DocumentTitle').setValue('Scanned_Document');//.pdf
      }
      this.docFromScanner = true;
      this.DWObject.RemoveAllImages();
      this.displayScannerSettings = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Document Saved Successfully'
      // });
      this.toastr.info('Document Saved Successfully', 'Success');
    } else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Failed To Save'
      // });
      this.toastr.error('Failed To Save', 'Failure');
    }
  }

  removeFolderPath() {
    this.folderId = "";
    this.folderpath = "";
    this.removeEnabled = false;
  }

  openTreeDialog() {
    this.busy = true;
    this.cs.getTopFolders().subscribe(data => {
      this.busy = false;
      this.getMainFolders(data);
      this.openTree = true;
    }, err => {
      this.busy = false;
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  getEmptyRow(rowData: any, index: any) {
    return rowData.value === null ? 'h-xl' : '';
  }

  browseButtonClick() {
    //console.log("Browse button clicked");
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.subscriptions = [];
    this.uploadedFiles = undefined;
    this.scanners = null;
    this.currentUser = undefined;
    this.entryTemplates = [];
    this.newClassDetails = undefined;
    this.selectedEntryTemplate = [];
    this.entryTemplate = [];
    this.selectedClassName = undefined;
    this.selectedEntryTemplateName = undefined;
    this.selectedTemplateId = undefined;
    this.showClassDetails = false;
    this.newDocumentForm = undefined;
    this.newDocFormData = undefined;
    this.msgs = [];
    this.CurrentPath = undefined;
    this.folderId = undefined;
    this.folderpath = undefined;
    this.loaded = false;
    this.scanners = [];
    this.DWObject = undefined;
    this.selectedTwainSource = undefined;
    this.displayScannerSettings = false;
    this.docFromScanner = undefined;
    if (typeof Dynamsoft !== 'undefined') {
      Dynamsoft.DWT.Unload();
    }
  }

  //DWObject: WebTwain;
  _strTempStr: string = '';
  DWTSourceCount: number;
  re: RegExp = /^\d+$/;
  EnumDWT_ConvertMode: any;
  _iLeft = 0;
  _iTop = 0;
  _iRight = 0;
  _iBottom = 0;

  appendMessage(strMessage: string): void {
    this._strTempStr += strMessage;
    let _divMessageContainer: HTMLElement = document.getElementById("DWTemessage");
    if (_divMessageContainer) {
      _divMessageContainer.innerHTML = this._strTempStr;
      _divMessageContainer.scrollTop = _divMessageContainer.scrollHeight;
    }
  }

  clearmessages(): void {
    this._strTempStr = '';
    let _divMessageContainer: HTMLElement = document.getElementById("DWTemessage");
    _divMessageContainer.innerHTML = this._strTempStr;
  }

  checkIfImagesInBuffer(): boolean {
    if (this.DWObject.HowManyImagesInBuffer == 0) {
      this.appendMessage("There is no image in buffer.<br />");
      return false;
    }
    else
      return true;
  }

  checkErrorStringWithErrorCode(errorCode: number, errorString: string, responseString?: string): boolean {
    if (errorCode == 0) {
      this.appendMessage("<span style='color:#cE5E04'><strong>" + errorString + "</strong></span><br />");
      return true;
    }
    if (errorCode == -2115) //Cancel file dialog
      return true;
    else {
      if (errorCode == -2003) {
        let ErrorMessageWin = window.open("", "ErrorMessage", "height=500,width=750,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
        ErrorMessageWin.document.writeln(responseString);
      }
      this.appendMessage("<span style='color:#cE5E04'><strong>" + errorString + "</strong></span><br />");
      return false;
    }
  }

  checkErrorString(): boolean {
    return this.checkErrorStringWithErrorCode(this.DWObject.ErrorCode, this.DWObject.ErrorString);
  }

  updatePageInfo(): void {
    let DW_TotalImage: HTMLInputElement = <HTMLInputElement>document.getElementById("DW_TotalImage");
    let DW_CurrentImage: HTMLInputElement = <HTMLInputElement>document.getElementById("DW_CurrentImage");
    if (DW_TotalImage)
      DW_TotalImage.value = (this.DWObject.HowManyImagesInBuffer).toString();
    if (DW_CurrentImage)
      DW_CurrentImage.value = (this.DWObject.CurrentImageIndexInBuffer + 1).toString();
  }

  Dynamsoft_OnTopImageInTheViewChanged = (index: number) => {
    this._iLeft = 0;
    this._iTop = 0;
    this._iRight = 0;
    this._iBottom = 0;
    this.DWObject.CurrentImageIndexInBuffer = index;
    this.updatePageInfo();
  };

  Dynamsoft_OnImageAreaSelected = (index: number, left: number, top: number, right: number, bottom: number) => {
    this._iLeft = left;
    this._iTop = top;
    this._iRight = right;
    this._iBottom = bottom;
  };

  Dynamsoft_OnMouseClick = (index: number) => {
    this.updatePageInfo();
  };

  Dynamsoft_OnPostTransfer = () => {
    this.updatePageInfo();
  };

  Dynamsoft_OnPostLoadfunction = (path, name, type) => {
    this.updatePageInfo();
  };

  Dynamsoft_OnPostAllTransfers = () => {
    this.DWObject.CloseSource();
    this.updatePageInfo();
    this.checkErrorString();
  };

  Dynamsoft_OnImageAreaDeselected = (index) => {
    this._iLeft = 0;
    this._iTop = 0;
    this._iRight = 0;
    this._iBottom = 0;
  };

  Dynamsoft_OnGetFilePath = (bSave: boolean, count: number, index: number, path: string, name: string) => {
  };

  source_onchange(): void {
    if (document.getElementById("divTwainType"))
      document.getElementById("divTwainType").style.display = "";
    if (document.getElementById("source")) {
      let cIndex = (<HTMLSelectElement>document.getElementById("source")).selectedIndex;
      if (Dynamsoft.Lib.env.bMac) {
        if (cIndex >= this.DWTSourceCount) {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "";
        } else {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "none";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "none";
        }
      }
      else if (this.DWObject)
        this.DWObject.SelectSourceByIndex(cIndex);
    }
  }

  showtblLoadImage_onclick(): boolean {
    switch (document.getElementById("tblLoadImage").style.visibility) {
      case "hidden":
        document.getElementById("tblLoadImage").style.visibility = "visible";
        document.getElementById("Resolution").style.visibility = "hidden";
        break;
      case "visible":
        document.getElementById("tblLoadImage").style.visibility = "hidden";
        document.getElementById("Resolution").style.visibility = "visible";
        break;
      default:
        break;
    }
    return false;
  }
Unl
  closetblLoadImage_onclick(): boolean {
    document.getElementById("tblLoadImage").style.visibility = "hidden";
    document.getElementById("Resolution").style.visibility = "visible";
    return false;
  }

  Dynamsoft_OnReady(): void {
    // if (typeof (EnumDWT_ConvertMode) != "undefined") {
    //   this.EnumDWT_ConvertMode = EnumDWT_ConvertMode;
    // }
    // else if (typeof (EnumDWT_ConverMode) != "undefined") {
    //   this.EnumDWT_ConvertMode = EnumDWT_ConverMode;
    // }
    let liNoScanner = document.getElementById("pNoScanner");
    this.DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    // If the ErrorCode is 0, it means everything is fine for the control. It is fully loaded.
    if (this.DWObject) {
      if (this.DWObject.ErrorCode == 0) {
        this.DWObject.LogLevel = 0;
        this.DWObject.IfAllowLocalCache = true;
        this.DWObject.ImageCaptureDriverType = 3;
        this.DWObject.RegisterEvent("OnMouseClick", this.Dynamsoft_OnMouseClick);
        this.DWObject.RegisterEvent("OnTopImageInTheViewChanged", this.Dynamsoft_OnTopImageInTheViewChanged);
        let twainsource = <HTMLSelectElement>document.getElementById("source");
        if (!twainsource) {
          twainsource = <HTMLSelectElement>document.getElementById("webcamsource");
        }

        let vCount = this.DWObject.SourceCount;
        this.DWTSourceCount = vCount;
        let vTWAINCount = 0;

        if (twainsource) {
          twainsource.options.length = 0;
          for (let i = 0; i < vCount; i++) {
            if (Dynamsoft.Lib.env.bMac) {
              twainsource.options.add(new Option("ICA_" + this.DWObject.GetSourceNameItems(i), i.toString()));
            }
            else {
              twainsource.options.add(new Option(this.DWObject.GetSourceNameItems(i), i.toString()));
            }
          }

          if (Dynamsoft.Lib.env.bMac) {
            this.DWObject.CloseSourceManager();
            this.DWObject.ImageCaptureDriverType = 0;
            this.DWObject.OpenSourceManager();
            vTWAINCount = this.DWObject.SourceCount;

            for (let j = vCount; j < vCount + vTWAINCount; j++) {
              twainsource.options.add(new Option(this.DWObject.GetSourceNameItems(j - vCount), j.toString()));
            }
          }
        }

        // If source list need to be displayed, fill in the source items.
        if ((vCount + vTWAINCount) == 0) {
          if (liNoScanner) {
            if (Dynamsoft.Lib.env.bWin) {

              liNoScanner.style.display = "block";
              liNoScanner.style.textAlign = "center";
            }
            else
              liNoScanner.style.display = "none";
          }
        }

        if ((vCount + vTWAINCount) > 0) {
          this.source_onchange();
        }

        if (Dynamsoft.Lib.env.bWin)
          this.DWObject.MouseShape = false;

        let btnScan = <HTMLInputElement>document.getElementById("btnScan");
        if (btnScan) {
          if ((vCount + vTWAINCount) == 0)
            btnScan.disabled = true;
          else {
            btnScan.disabled = false;
            btnScan.style.color = "#fff";
            btnScan.style.backgroundColor = "#607D8B"; //"#50a8e1";
            btnScan.style.cursor = "pointer";
          }
        }

        if (!Dynamsoft.Lib.env.bWin && vCount > 0) {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "none";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "none";
        }
        else {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "";
        }

        for (let i = 0; i < document.links.length; i++) {
          if (document.links[i].className == "ShowtblLoadImage") {
            document.links[i].onclick = this.showtblLoadImage_onclick;
          }
          if (document.links[i].className == "ClosetblLoadImage") {
            document.links[i].onclick = this.closetblLoadImage_onclick;
          }
        }
        if ((vCount + vTWAINCount) == 0) {
          if (Dynamsoft.Lib.env.bWin) {

            if (document.getElementById("aNoScanner") && window['bDWTOnlineDemo']) {
              if (document.getElementById("div_ScanImage").style.display == "")
                this.showtblLoadImage_onclick();
            }
            if (document.getElementById("Resolution"))
              document.getElementById("Resolution").style.display = "none";
          }
        }
        else {
          let divBlank = document.getElementById("divBlank");
          if (divBlank)
            divBlank.style.display = "none";
        }
        this.updatePageInfo();
        this.DWObject.RegisterEvent("OnPostTransfer", this.Dynamsoft_OnPostTransfer);
        this.DWObject.RegisterEvent("OnPostLoad", this.Dynamsoft_OnPostLoadfunction);
        this.DWObject.RegisterEvent("OnPostAllTransfers", this.Dynamsoft_OnPostAllTransfers);
        this.DWObject.RegisterEvent("OnImageAreaSelected", this.Dynamsoft_OnImageAreaSelected);
        this.DWObject.RegisterEvent("OnImageAreaDeSelected", this.Dynamsoft_OnImageAreaDeselected);
        this.DWObject.RegisterEvent("OnGetFilePath", this.Dynamsoft_OnGetFilePath);
      }
    }
  }

  /**
   * save image
   */
  saveUploadImage(type: string): void {
    if (type == 'local') {
      this.btnSave_onclick();
    } else if (type == 'server') {
      this.btnUpload_onclick()
    }
  }

  btnSave_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    let i, strimgType_save;
    //let NM_imgType_save = <HTMLSelectElement>document.getElementsByName("ImageType");
    let NM_imgType_save = document.getElementsByName("ImageType");
    for (i = 0; i < 5; i++) {
      if (NM_imgType_save.item(i)['checked'] == true) {
        strimgType_save = NM_imgType_save.item(i)['value'];
        break;
      }
    }
    this.DWObject.IfShowFileDialog = true;
    let _txtFileNameforSave = <HTMLInputElement>document.getElementById("txt_fileName");
    if (_txtFileNameforSave)
      _txtFileNameforSave.className = "";
    let bSave = false;

    let strFilePath = _txtFileNameforSave.value + "." + strimgType_save;

    let OnSuccess = () => {
      this.appendMessage('<strong>Save Image: </strong>');
      this.checkErrorStringWithErrorCode(0, "Successful.");
    };

    let OnFailure = (errorCode, errorString) => {
      this.checkErrorStringWithErrorCode(errorCode, errorString);
    };

    let _chkMultiPageTIFF_save = <HTMLInputElement>document.getElementById("MultiPageTIFF");
    let _chkMultiPagePDF_save = <HTMLInputElement>document.getElementById("MultiPagePDF");
    let vAsyn = false;
    if (strimgType_save == "tif" && _chkMultiPageTIFF_save && _chkMultiPageTIFF_save.checked) {
      vAsyn = true;
      if ((this.DWObject.SelectedImagesCount == 1) || (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)) {
        bSave = this.DWObject.SaveAllAsMultiPageTIFF(strFilePath, OnSuccess, OnFailure);
      }
      else {
        bSave = this.DWObject.SaveSelectedImagesAsMultiPageTIFF(strFilePath, OnSuccess, OnFailure);
      }
    }
    else if (strimgType_save == "pdf" && _chkMultiPagePDF_save.checked) {
      vAsyn = true;
      if ((this.DWObject.SelectedImagesCount == 1) || (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)) {
        bSave = this.DWObject.SaveAllAsPDF(strFilePath, OnSuccess, OnFailure);
      }
      else {
        bSave = this.DWObject.SaveSelectedImagesAsMultiPagePDF(strFilePath, OnSuccess, OnFailure);
      }
    }
    else {
      switch (i) {
        case 0: bSave = this.DWObject.SaveAsBMP(strFilePath, this.DWObject.CurrentImageIndexInBuffer); break;
        case 1: bSave = this.DWObject.SaveAsJPEG(strFilePath, this.DWObject.CurrentImageIndexInBuffer); break;
        case 2: bSave = this.DWObject.SaveAsTIFF(strFilePath, this.DWObject.CurrentImageIndexInBuffer); break;
        case 3: bSave = this.DWObject.SaveAsPNG(strFilePath, this.DWObject.CurrentImageIndexInBuffer); break;
        case 4: bSave = this.DWObject.SaveAsPDF(strFilePath, this.DWObject.CurrentImageIndexInBuffer); break;
      }
    }

    if (vAsyn == false) {
      if (bSave)
        this.appendMessage('<strong>Save Image: </strong>');
      if (this.checkErrorString()) {
        return;
      }
    }
  }

  /**
   * upload
   */
  btnUpload_onclick(): void {
    /*if (!this.checkIfImagesInBuffer()) {
      return;
    }
    let i, strHTTPServer, strActionPage, strImageType;

    let _txtFileName = <HTMLInputElement>document.getElementById("txt_fileName");
    if (_txtFileName)
      _txtFileName.className = "";
    let imageType = <HTMLSelectElement>document.getElementsByName("ImageType");
    for (i = 0; i < 5; i++) {
      if (imageType.item(i).checked == true) {
        strImageType = i;
        break;
      }
    }

    let fileName = _txtFileName.value;
    let replaceStr = "<";
    fileName = fileName.replace(new RegExp(replaceStr, 'gm'), '&lt;');
    let uploadfilename = fileName + "." + imageType.item(i).value;

    let _chkMultiPageTIFF_save = <HTMLInputElement>document.getElementById("MultiPageTIFF");
    let _chkMultiPagePDF_save = <HTMLInputElement>document.getElementById("MultiPagePDF");
    let _aryIndicesToUpload = [];
    let _EnumDWT_ImageTypeToUpload = EnumDWT_ImageType.IT_JPG;
    if (strImageType == 2 && _chkMultiPageTIFF_save.checked) {
      _EnumDWT_ImageTypeToUpload = EnumDWT_ImageType.IT_TIF;
      if ((this.DWObject.SelectedImagesCount == 1) || (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)) {
        for (let i = 0; i < this.DWObject.HowManyImagesInBuffer; i++)
          _aryIndicesToUpload.push(i);
      }
      else {
        for (let i = 0; i < this.DWObject.SelectedImagesCount; i++)
          _aryIndicesToUpload.push(this.DWObject.GetSelectedImageIndex(i));
      }
    }
    else if (strImageType == 4 && _chkMultiPagePDF_save.checked) {
      _EnumDWT_ImageTypeToUpload = EnumDWT_ImageType.IT_PDF;
      if ((this.DWObject.SelectedImagesCount == 1) || (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)) {
        for (let i = 0; i < this.DWObject.HowManyImagesInBuffer; i++)
          _aryIndicesToUpload.push(i);
      }
      else {
        for (let i = 0; i < this.DWObject.SelectedImagesCount; i++)
          _aryIndicesToUpload.push(this.DWObject.GetSelectedImageIndex(i));
      }
    }
    else {
      _EnumDWT_ImageTypeToUpload = <EnumDWT_ImageType>strImageType;

      _aryIndicesToUpload.push(this.DWObject.CurrentImageIndexInBuffer);
    }
    /!**
     * the upload method is called here
     *!/
    this.DWObject.ClearAllHTTPFormField();
    this.DWObject.SetHTTPFormField('filename', uploadfilename);
    this.DWObject.HTTPUpload(
      this.uploadUrl,
      _aryIndicesToUpload,
      _EnumDWT_ImageTypeToUpload,
      EnumDWT_UploadDataFormat.Binary,
      () => {
        if (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)
          this.DWObject.SelectedImagesCount = 1;
        this.appendMessage(uploadfilename + ' was <strong>uploaded successfully!</strong><br />');
      },
      (errcode, errstr, httppostresponsestring) => {
        this.checkErrorStringWithErrorCode(errcode, errstr, httppostresponsestring);
      }
    );*/
  }

  /**
   * Acquire Image
   */
  acquireImage(): void {
    let cIndex = (<HTMLSelectElement>document.getElementById("source")).selectedIndex;
    if (cIndex < 0)
      return;
    if (Dynamsoft.Lib.env.bMac) {
      this.DWObject.CloseSourceManager();
      this.DWObject.ImageCaptureDriverType = 3;
      this.DWObject.OpenSourceManager();
      if (cIndex >= this.DWTSourceCount) {
        cIndex = cIndex - this.DWTSourceCount;
        this.DWObject.CloseSourceManager();
        this.DWObject.ImageCaptureDriverType = 0;
        this.DWObject.OpenSourceManager();
      }
    }

    this.DWObject.SelectSourceByIndex(cIndex);
    this.DWObject.CloseSource();
    this.DWObject.OpenSource();
    this.DWObject.IfShowUI = (<HTMLInputElement>document.getElementById("ShowUI")).checked;

    let i;
    for (i = 0; i < 3; i++) {
      if ((<HTMLInputElement>document.getElementsByName("PixelType").item(i)).checked == true)
        this.DWObject.PixelType = i;
    }
    if (this.DWObject.ErrorCode != 0) {
      this.appendMessage('<strong>Error setting PixelType value: </strong>');
      this.appendMessage("<span style='color:#cE5E04'><strong>" + this.DWObject.ErrorString + "</strong></span><br />");
    }
    this.DWObject.Resolution = parseInt((<HTMLInputElement>document.getElementById("Resolution")).value);
    if (this.DWObject.ErrorCode != 0) {
      this.appendMessage('<strong>Error setting Resolution value: </strong>');
      this.appendMessage("<span style='color:#cE5E04'><strong>" + this.DWObject.ErrorString + "</strong></span><br />");
    }

    let bADFChecked = (<HTMLInputElement>document.getElementById("ADF")).checked;
    this.DWObject.IfFeederEnabled = bADFChecked;
    if (bADFChecked == true && this.DWObject.ErrorCode != 0) {
      this.appendMessage('<strong>Error setting ADF value: </strong>');
      this.appendMessage("<span style='color:#cE5E04'><strong>" + this.DWObject.ErrorString + "</strong></span><br />");
    }

    let bDuplexChecked = (<HTMLInputElement>document.getElementById("Duplex")).checked;
    this.DWObject.IfDuplexEnabled = bDuplexChecked;
    if (bDuplexChecked == true && this.DWObject.ErrorCode != 0) {
      this.appendMessage('<strong>Error setting Duplex value: </strong>');
      this.appendMessage("<span style='color:#cE5E04'><strong>" + this.DWObject.ErrorString + "</strong></span><br />");
    }
    if (Dynamsoft.Lib.env.bWin || (!Dynamsoft.Lib.env.bWin && this.DWObject.ImageCaptureDriverType == 0))
      this.appendMessage("Pixel Type: " + this.DWObject.PixelType + "<br />Resolution: " + this.DWObject.Resolution + "<br />");
    this.DWObject.IfDisableSourceAfterAcquire = true;
    this.DWObject.AcquireImage();
  }

  pageonload() {
    this.initCustomScan();
    let twainsource = <HTMLSelectElement>document.getElementById("source");
    if (typeof (twainsource) != "undefined") {
      twainsource.options.length = 0;
      twainsource.options.add(new Option("Looking for devices.Please wait.", "0"));
      twainsource.options[0].selected = true;
    }
    if (typeof ($) != "undefined") {
      $("ul.PCollapse li>div").click(function () {
        // if ($(this).next().css("display") == "none") {
        //   $(".divType").next().hide("normal");
        //   $(".divType").children(".mark_arrow").removeClass("expanded");
        //   $(".divType").children(".mark_arrow").addClass("collapsed");
        //   $(this).next().show("normal");
        //   $(this).children(".mark_arrow").removeClass("collapsed");
        //   $(this).children(".mark_arrow").addClass("expanded");
        // }
        if ($(this).next().css("display") === "none") {
          $(".divType").next().hide(400);
          $(".divType").children(".mark_arrow").removeClass("expanded");
          $(".divType").children(".mark_arrow").addClass("collapsed");
          $(this).next().show(400);
          $(this).children(".mark_arrow").removeClass("collapsed");
          $(this).children(".mark_arrow").addClass("expanded");
        }
        
      });
      $('#imgTypetiff').on('click', function () {
        let _chkMultiPageTIFF = <HTMLInputElement>document.getElementById("MultiPageTIFF");
        _chkMultiPageTIFF.disabled = false;
        _chkMultiPageTIFF.checked = false;

        let _chkMultiPagePDF = <HTMLInputElement>document.getElementById("MultiPagePDF");
        _chkMultiPagePDF.checked = false;
        _chkMultiPagePDF.disabled = true;
      });

      $('#imgTypepdf').on('click', function () {
        let _chkMultiPageTIFF = <HTMLInputElement>document.getElementById("MultiPageTIFF");
        _chkMultiPageTIFF.checked = false;
        _chkMultiPageTIFF.disabled = true;

        let _chkMultiPagePDF = <HTMLInputElement>document.getElementById("MultiPagePDF");
        _chkMultiPagePDF.disabled = false;
        _chkMultiPagePDF.checked = true;
      });
      let commonFun = function () {
        let _chkMultiPageTIFF = <HTMLInputElement>document.getElementById("MultiPageTIFF");
        _chkMultiPageTIFF.checked = false;
        _chkMultiPageTIFF.disabled = true;

        let _chkMultiPagePDF = <HTMLInputElement>document.getElementById("MultiPagePDF");
        _chkMultiPagePDF.checked = false;
        _chkMultiPagePDF.disabled = true;
      }
      $('#imgTypejpeg').on('click', commonFun);
      $('#imgTypepng').on('click', commonFun);
      $('#imgTypebmp').on('click', commonFun);
      //to disable save document div
      $('#saveDownload').on('click', function () {
        if ($(this).prop("checked") == true) {
          $("#divUpload").removeClass("disable-div");
        }
        else if ($(this).prop("checked") == false) {
          $("#divUpload").addClass("disable-div");
        }
      });
    }
    this.initiateInputs();
    this.setDefaultValue();

  }

  initCustomScan() {
    let ObjString = "";
    ObjString += "<ul id='divTwainType' style='list-style: none; margin:0; padding-left:0'> ";
    ObjString += "<li style='margin-top: 3px;'>";
    ObjString += "<label id ='lblShowUI' for = 'ShowUI' style='display: inline-block;margin: 0 15px 0 0;font-size: 12px;'><input type='checkbox' id='ShowUI' style='width: 15px;height: 15px;vertical-align: middle;' />Show UI&nbsp;</label>";
    ObjString += "<label for = 'ADF' style='display: inline-block;margin: 0 15px 0 0;font-size: 12px;'><input type='checkbox' id='ADF' style='width: 15px;height: 15px;vertical-align: middle;' />AutoFeeder&nbsp;</label>";
    ObjString += "<label for = 'Duplex' style='display: inline-block;margin: 0;font-size: 12px;'><input type='checkbox' id='Duplex' style='width: 15px;height: 15px;vertical-align: middle;'/>Duplex</label></li>";
    ObjString += "<li style='margin-top: 8px;'>Pixel Type:";
    ObjString += "<label for='BW' style='display: inline-block;margin: 0 15px 0 5px;font-size: 12px;'><input type='radio' id='BW' name='PixelType' style='width: 15px;height: 15px;vertical-align: middle;'/>B&amp;W </label>";
    ObjString += "<label for='Gray'style='display: inline-block;margin: 0 15px 0 0;font-size: 12px;'><input type='radio' id='Gray' name='PixelType' style='width: 15px;height: 15px;vertical-align: middle;'/>Gray</label>";
    ObjString += "<label for='RGB'style='display: inline-block;margin: 0;font-size: 12px;'><input type='radio' id='RGB' name='PixelType' style='width: 15px;height: 15px;vertical-align: middle;'/>Color</label></li>";
    ObjString += "<li style='margin-top: 8px;'>";
    ObjString += "<span>Resolution:</span><select size='1' id='Resolution' style='margin-left: 3px;width: 192px;height: 26px;'><option value = ''></option></select></li>";
    ObjString += "</ul>";

    if (document.getElementById("divProductDetail"))
      document.getElementById("divProductDetail").innerHTML = ObjString;
    let vResolution = <HTMLSelectElement>document.getElementById("Resolution");
    if (vResolution) {
      vResolution.options.length = 0;
      vResolution.options.add(new Option("100", "100"));
      vResolution.options.add(new Option("150", "150"));
      vResolution.options.add(new Option("200", "200"));
      vResolution.options.add(new Option("300", "300"));
      vResolution.options[3].selected = true;
    }
  }

  initiateInputs() {
    let allinputs = document.getElementById("dwtScanDemo").getElementsByTagName("input");
    for (let i = 0; i < allinputs.length; i++) {
      if (allinputs[i].type == "checkbox") {
        allinputs[i].checked = false;
      }
      else if (allinputs[i].type == "text") {
        allinputs[i].value = "";
      }
    }
    if (Dynamsoft.Lib.env.bIE == true && Dynamsoft.Lib.env.bWin64 == true) {
      let o = document.getElementById("samplesource64bit");
      if (o)
        o.style.display = "inline";

      o = document.getElementById("samplesource32bit");
      if (o)
        o.style.display = "none";
    }
    (<HTMLInputElement>document.getElementById("ADF")).checked=true;
  }

  setDefaultValue() {
    let vGray = <HTMLInputElement>document.getElementById("BW");
    if (vGray)
      vGray.checked = true;
    $("#divUpload").addClass("disable-div");
  }

  /**
   * edit features
   */
  btnShowImageEditor_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.ShowImageEditor();
  }

  btnRotateRight_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RotateRight(this.DWObject.CurrentImageIndexInBuffer);
    this.appendMessage('<strong>Rotate right: </strong>');
    if (this.checkErrorString()) {
      return;
    }
  }

  btnRotateLeft_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RotateLeft(this.DWObject.CurrentImageIndexInBuffer);
    this.appendMessage('<strong>Rotate left: </strong>');
    if (this.checkErrorString()) {
      return;
    }
  }

  btnRotate180_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Rotate(this.DWObject.CurrentImageIndexInBuffer, 180, true);
    this.appendMessage('<strong>Rotate 180: </strong>');
    if (this.checkErrorString()) {
      return;
    }
  }

  btnMirror_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Mirror(this.DWObject.CurrentImageIndexInBuffer);
    this.appendMessage('<strong>Mirror: </strong>');
    if (this.checkErrorString()) {
      return;
    }
  }

  btnFlip_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Flip(this.DWObject.CurrentImageIndexInBuffer);
    this.appendMessage('<strong>Flip: </strong>');
    if (this.checkErrorString()) {
      return;
    }
  }

  btnCrop_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    if (this._iLeft != 0 || this._iTop != 0 || this._iRight != 0 || this._iBottom != 0) {
      this.DWObject.Crop(
        this.DWObject.CurrentImageIndexInBuffer,
        this._iLeft, this._iTop, this._iRight, this._iBottom
      );
      this._iLeft = 0;
      this._iTop = 0;
      this._iRight = 0;
      this._iBottom = 0;
      this.appendMessage('<strong>Crop: </strong>');
      if (this.checkErrorString()) {
        return;
      }
      return;
    } else {
      this.appendMessage("<strong>Crop: </strong>failed. Please first select the area you'd like to crop.<br />");
    }
  }

  btnChangeImageSize_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    switch (document.getElementById("ImgSizeEditor").style.visibility) {
      case "visible":
        document.getElementById("ImgSizeEditor").style.visibility = "hidden";
        break;
      case "hidden":
        document.getElementById("ImgSizeEditor").style.visibility = "visible";
        break;
      default:
        break;
    }
    let iWidth = this.DWObject.GetImageWidth(this.DWObject.CurrentImageIndexInBuffer);
    if (iWidth != -1)
      (<HTMLInputElement>document.getElementById("img_width")).value = iWidth.toString();
    let iHeight = this.DWObject.GetImageHeight(this.DWObject.CurrentImageIndexInBuffer);
    if (iHeight != -1)
      (<HTMLInputElement>document.getElementById("img_height")).value = iHeight.toString();
  }

  btnCancelChange_onclick(): void {
    document.getElementById("ImgSizeEditor").style.visibility = "hidden";
  }

  btnChangeImageSizeOK_onclick(): void {
    document.getElementById("img_height").className = "";
    document.getElementById("img_width").className = "";
    if (!this.re.test((<HTMLInputElement>document.getElementById("img_height")).value)) {
      document.getElementById("img_height").className += " invalid";
      document.getElementById("img_height").focus();
      this.appendMessage("Please input a valid <strong>height</strong>.<br />");
      return;
    }
    if (!this.re.test((<HTMLInputElement>document.getElementById("img_width")).value)) {
      document.getElementById("img_width").className += " invalid";
      document.getElementById("img_width").focus();
      this.appendMessage("Please input a valid <strong>width</strong>.<br />");
      return;
    }
    this.DWObject.ChangeImageSize(
      this.DWObject.CurrentImageIndexInBuffer,
      parseInt((<HTMLInputElement>document.getElementById("img_width")).value),
      parseInt((<HTMLInputElement>document.getElementById("img_height")).value),
      (<HTMLSelectElement>document.getElementById("InterpolationMethod")).selectedIndex + 1
    );
    this.appendMessage('<strong>Change Image Size: </strong>');
    if (this.checkErrorString()) {
      document.getElementById("ImgSizeEditor").style.visibility = "hidden";
      return;
    }
  }

  /**
   * navigation
   */
  btnFirstImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = 0;
    this.updatePageInfo();
  }

  btnPreImage_wheel(): void {
    if (this.DWObject.HowManyImagesInBuffer != 0)
      this.btnPreImage_onclick()
  }

  btnNextImage_wheel(): void {
    if (this.DWObject.HowManyImagesInBuffer != 0)
      this.btnNextImage_onclick()
  }

  btnPreImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    else if (this.DWObject.CurrentImageIndexInBuffer == 0) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.CurrentImageIndexInBuffer - 1;
    this.updatePageInfo();
  }

  btnNextImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    else if (this.DWObject.CurrentImageIndexInBuffer == this.DWObject.HowManyImagesInBuffer - 1) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.CurrentImageIndexInBuffer + 1;
    this.updatePageInfo();
  }

  btnLastImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.HowManyImagesInBuffer - 1;
    this.updatePageInfo();
  }

  btnRemoveCurrentImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RemoveAllSelectedImages();
    if (this.DWObject.HowManyImagesInBuffer == 0) {
      (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = this.DWObject.HowManyImagesInBuffer.toString();
      (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "";
      return;
    }
    else {
      this.updatePageInfo();
    }
  }

  btnRemoveAllImages_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RemoveAllImages();
    (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = "0";
    (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "";
  }

  setlPreviewMode(): void {
    let varNum: number = (<HTMLSelectElement>document.getElementById("DW_PreviewMode")).selectedIndex + 1;
    let btnCrop = <HTMLImageElement>document.getElementById("btnCrop");
    if (btnCrop) {
      let tmpstr = btnCrop.src;
      if (varNum > 1) {
        tmpstr = tmpstr.replace('Crop.', 'Crop_gray.');
        btnCrop.src = tmpstr;
        btnCrop.onclick = () => {
        };
      }
      else {
        tmpstr = tmpstr.replace('Crop_gray.', 'Crop.');
        btnCrop.src = tmpstr;
        btnCrop.onclick = () => {
          this.btnCrop_onclick();
        };
      }
    }

    this.DWObject.SetViewMode(varNum, varNum);
    if (Dynamsoft.Lib.env.bMac || Dynamsoft.Lib.env.bLinux) {
      return;
    }
    else if ((<HTMLSelectElement>document.getElementById("DW_PreviewMode")).selectedIndex != 0) {
      this.DWObject.MouseShape = true;
    }
    else {
      this.DWObject.MouseShape = false;
    }
  }

  clearDocToFrom(detail) {
    event.stopPropagation();
    if (detail === 'DocumentTo') {
      this.newDocumentForm.get('DocumentTo').setValue('');
    }
    else {
      this.newDocumentForm.get('DocumentFrom').setValue('');
    }
  }

  setDocName() {
    this.isDocNameSet =this.newDocumentForm.get('DocumentTitle').value && this.newDocumentForm.get('DocumentTitle').value.trim().length>0 ;
  }
  isNumber(event){
    return (event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57
  }
  addValueAsText(input) {
    console.log("desigVal :: " + this.desigVal);
    if (input === 'Document To') {
      this.newDocumentForm.get('DocumentTo').setValue(this.desigVal);
    }
    else {
      this.newDocumentForm.get('DocumentFrom').setValue(this.desigVal);
    }
    this.desigVal=null
  }
  applyFilterGlobal($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  
}

declare var Dynamsoft;

export interface TwainSource {
  idx: number;
  name: string;
}

export interface IMyMarkedDates {
  dates: Array<Date>;
  color: string;
}

