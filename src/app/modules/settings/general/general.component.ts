import { Component, OnDestroy, OnInit} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {Subscription} from 'rxjs';
import {ContentService} from "../../../services/content.service";
import {WorkflowService} from '../../../services/workflow.service';
import {UserService} from '../../../services/user.service';
import {EntryTemplate} from '../../../models/document/entry-template.model';
import {GeneralSettings} from '../../../models/general/general-settings.model';
import {GrowlService} from '../../../services/growl.service';
import {CoreService} from '../../../services/core.service';
import {BreadcrumbService} from '../../../services/breadcrumb.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit, OnDestroy {
  templates: SelectItem[];
  actions: SelectItem[];
  pageSize: SelectItem[];
  showInactiveRole: SelectItem[];
  defaultTab: SelectItem[] = [];
  datasettings: any = {};
  private subscriptions: Subscription[] = [];
  private user: any;
  public entryTemplates = [];
  generalSettings: GeneralSettings[];
  defaultNo: any;
  selectedActions: string;
  selectedTemplate: string;
  selectedTab: string;
  selShowInactiveRole: string;
  themes: any[] = [];
  isTheme = false;
  isShowRole = false;
  isDefaultView = false;
  defaultViews: any[] = [];
  busy: boolean;
  folderId: any;
  folderpath: any;
  isFolderChanged = false;
  removeEnabled = false;
  public openTree = false;
  folderList: any[];
  index: any;
  public folderPermission = { usage: 'addDocument', folderSelected: false, permission: true };
  selectedFolder: any;

  constructor(
    private wfs: WorkflowService, 
    public userService: UserService, 
    private growlService: GrowlService,
    private coreService: CoreService, 
    private breadcrumbService: BreadcrumbService, 
    private contentService: ContentService) {
    this.templates = [];
    this.actions = [];
    this.pageSize = [];
    this.showInactiveRole = [];
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit() {
    //this.templates.push({label:"", value:""});
    this.pageSize.push({label: '5', value: '5'});
    this.pageSize.push({label: '10', value: '10'});
    this.pageSize.push({label: '15', value: '15'});
    this.pageSize.push({label: '20', value: '20'});
    this.pageSize.push({label: '50', value: '50'});
    this.showInactiveRole.push({label: 'Yes', value: 'Yes'});
    this.showInactiveRole.push({label: 'No', value: 'No'});
    this.themes = [
      // {label: 'Pink - Amber',value: 'pink:cityscape'},
      {label: 'Deep Purple - Orange', value: 'deeppurple:storm'},
      {label: 'Blue - Reflection', value: 'blue:reflection'},
      {label: 'BlueGrey - Flatiron', value: 'bluegrey:flatiron'},
      {label: 'BlueGrey - Moody', value: 'bluegrey:moody'},
      {label: 'Cyan - Palm', value: 'cyan:palm'},
      {label: 'Teal - Cloudy', value: 'teal:cloudy'},
      {label: 'Teal - Moody', value: 'teal:moody'},
      {label: 'Teal - Flatiron', value: 'teal:flatiron'},
      {label: 'Orange - CityScape', value: 'orange:cityscape'}
    ];
    this.defaultViews = [{label: 'Dashboard', value: 'dashboard'}, {label: 'Workflow', value: 'workflow'},
      {label: 'Folders', value: 'folders'}];
    this.busy = true;
    this.contentService.getEntryTemplates().subscribe(data => {
      this.busy = false;
      this.assignTemplates(data)
    }, err => {
      this.busy = false;
    });
    this.busy = true;
    this.wfs.getActions(this.user.EmpNo).subscribe(data => {
      this.busy = false;
      this.assignActions(data)
    }, err => {
      this.busy = false;
    });
    // this.userService.getUserDe
    this.userService.logIn(this.user.userName,this.user.password).subscribe(data => {
    // this.defaultTab.push({label :'',value:''},)
    // console.log(data);
    this.defaultTabAction(data);

    }, err => {
      this.busy = false;
    });
  }

  assignActions(data) {
    this.actions.push({label:"", value:""});
    for (let i = 0; i < data.length; i++) {
      if (data[i].name !== 'Signature' && data[i].name !== 'Initial') {
        this.actions.push({label: data[i].name, value: data[i].name});
      }
    }
  }

  defaultTabAction(data:any){
    //this.defaultTab.push({label:"", value:""});
    this.defaultTab.push({label: data.fulName ,value: data.EmpNo});
    for (let i = 0; i < data.roles.length; i++) {
      if(data.roles[i].status.toLowerCase() === 'active'){
        this.defaultTab.push({label: data.roles[i].name, value: data.roles[i].id});
      }
      // this.defaultTab.push({label: data.title, value: data.EmpNo});
    }
    // for (let i = 0; i < data.delegated.length; i++) {
    //   this.defaultTab.push({label: data.delegated[i].delName, value: data.delegated[i].id});
    //   // this.defaultTab.push({label: data.title, value: data.EmpNo});
    // }


  }

  changeClass(){
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Info', detail: 'You must refresh your browser to use the updated settings'
    });
  }

  changeShowInactiveRole(){
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Info', detail: 'You must refresh your browser to use the updated settings'
    });
  }

  assignTemplates(data) {
    this.entryTemplates = data;
    this.templates.push({label:"", value:""});
    for (let i = 0; i < data.length; i++) {
      this.templates.push({label: data[i].symName, value: data[i].symName});
    }
    this.busy = true;
    this.userService.getUserSettings().subscribe(val => {
      this.busy = false;
      this.assignGeneralSettings(val)
    }, err => {
      this.busy = false;
    });
  }

  updateGeneralSetting() {
    for (const setting of this.generalSettings) {
      // console.log("Update Setting Key ==> " + setting.key + " === " + setting.val);
      if (setting.key === 'Default Action') {
        setting.val = this.selectedActions;
      }
      else if (setting.key === 'Page Size') {
        setting.val = this.defaultNo;
      }
      else if (setting.key === 'Default Template') {
        setting.val = this.selectedTemplate;
      }
      else if (setting.key === 'Show Inactive Role') {
        this.isShowRole = true;
        setting.val = this.selShowInactiveRole;
      }
      else if (setting.key === 'Default Tab') {
        setting.val = this.selectedTab;
      }
      else if (setting.key === 'Default Folder') {
        setting.val = this.folderId;
      }
      /* else if (setting.key === 'Default Theme') {
        this.isTheme = true;
        setting.val = this.userService.selectedTheme;
      }
      else if (setting.key === 'Default View') {
        this.isDefaultView = true;
        setting.val = this.userService.defaultView;
      } */
    }

    if (this.isShowRole === false) {
      // console.log("ShowInactiveRole" + " === " + this.selShowInactiveRole);
      this.generalSettings.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Show Inactive Role',
        'val': this.selShowInactiveRole
      });
    }
    // this.generalSettings.map((d,i)=>{
    //   if(d.key)
    // });
  /*   if (this.isTheme === false) {
      this.generalSettings.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Default Theme',
        'val': this.userService.selectedTheme
      });
    }
    if (this.isDefaultView === false) {
      this.generalSettings.push({
        'id': null,
        'appId': 'ECM',
        'empNo': this.user.EmpNo,
        'key': 'Default View',
        'val': this.userService.defaultView
      });
    } */
    // this.generalSettings.push({
    //   'id': null,
    //   'appId': 'ECM',
    //   'empNo': this.user.EmpNo,
    //   'key': 'Default Tab',
    //   'val': `${this.selectedTab}`
    // });
    this.busy = true;
    // console.log(this.generalSettings);
    this.userService.updateUserSettings(this.generalSettings).subscribe(val => {
      this.busy = false;
      this.updateSettings(val)
    }, err => {
      this.busy = false;
      this.updateFailed(err)
    });
  }

  updateFailed(err) {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Update'
    });
  }

  updateSettings(val) {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Updated Successfully'
    });
    localStorage.removeItem('defaultView');
    localStorage.setItem('defaultView',this.userService.defaultView);
    this.userService.pageSize = this.defaultNo;
    this.userService.loadUserSettings();
  }

  assignGeneralSettings(val) {
    // console.log("Assign general settings :: " + val);
    this.userService.updateSettings(val);
    this.generalSettings = val;
    for (const setting of val) {
      // console.log("Assign Setting Key ==> " + setting.key + " === " + setting.val);
      if (setting.key === 'Default Action') {
        this.selectedActions = setting.val;
      }
      if (setting.key === 'Page Size') {
        this.defaultNo = setting.val;
      }
      if (setting.key === 'Default Template') {
        this.selectedTemplate = setting.val;
      }
      if (setting.key === 'Show Inactive Role') {
        this.selShowInactiveRole = setting.val;
      }
      if (setting.key === 'Default Theme') {
        this.userService.selectedTheme = setting.val;
      }
      if (setting.key === 'Default View') {
        this.userService.defaultView = setting.val;
      }
      if(setting.key === 'Default Tab') {
        this.selectedTab  = setting.val;
      }
      if(setting.key === 'Default Folder') {
        this.folderId = setting.val;
        if(this.folderId && this.folderId != "")
          this.contentService.getFolderDetails(this.folderId).subscribe(data => this.assignFolderPath(data));
      }
    }
  }

  assignFolderPath(data) {
    this.folderpath = data.path;
    this.folderId = data.id;
  }

  openTreeDialog() {
    this.busy = true;
    this.contentService.getTopFolders().subscribe(data => {
      //console.log(data)
      this.busy = false;
      this.getMainFolders(data);
      this.openTree = true;
    }, err => {
      this.busy = false;
    });
  }
  removeFolderPath() {
    this.folderId = "";
    this.folderpath = "";
    this.removeEnabled = false;
    this.isFolderChanged = true;
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
      this.folderList = topFolder;

      this.contentService.getSubFolders(this.folderList[0].data.id).subscribe(data =>
        this.assignSubFoldersFor(this.folderList[0], data));
    }
    else {
      if (data && data.path && data.id) {
        this.folderpath = data.path;
        this.folderId = data.id;
        this.removeEnabled = true;
      }
      //console.log(this.folderId)
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
  }

  nodeExpand(event) {
    this.contentService.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFolders(event.node, data));
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
  }
  nodeSelect(event) {
    // if (event.node.data.id === this.selectedFolder.data.id) {
    //   return;
    // }
    this.contentService.validateFolderPermissions(event.node.data.id, 'ADD').subscribe(data => {
      this.folderPermission.folderSelected = true;
      if (data !== true) {
        this.folderPermission.permission = true;
      } else {
        this.folderPermission.permission = false;
        this.folderpath = event.node.data.path;
        this.folderId = event.node.data.id;
        this.isFolderChanged = true;
        //console.log(this.folderId)


        /*localStorage.setItem('folderId', event.node.data.id);
        localStorage.setItem('path', event.node.data.path);
        this.ds.savedFolderBrowse.folderPathSavedBrowse = event.node.data.path;*/
      }
    });
  }
  selectFolder() {
    this.openTree = false;
    this.removeEnabled = true;
  }

  changeFolderPath(event)
  {
    if(event.target.value && event.target.value !== "")
      this.isFolderChanged = true;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  destroyKeys(){
    Object.keys(this).map(k => {
     //this[k] = null;
      delete this[k];
     })
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.generalSettings = [];
    this.entryTemplates = [];
    this.pageSize = [];
    this.actions = [];
    this.templates = [];
    this.showInactiveRole = [];
    this.destroyKeys();
  }
}