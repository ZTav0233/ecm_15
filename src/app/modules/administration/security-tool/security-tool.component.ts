import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ContentService } from "../../../services/content.service";
import { CoreService } from "../../../services/core.service";
import { Subscription } from "rxjs";
import { AdminService } from "../../../services/admin.service";
import { NewsService } from "../../../services/news.service";
import { ConfirmationService, SelectItem } from "primeng/api";
import * as _ from "lodash";
import { GrowlService } from "../../../services/growl.service";
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import * as moment from 'moment';
import { interval } from 'rxjs';
import { DocumentService } from "../../../services/document.service";
import { DocDetailsModalComponent } from "../../../components/generic-components/doc-details-modal/doc-details-modal.component";
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-security-tool',
  templateUrl: './security-tool.component.html',
  styleUrls: ['./security-tool.component.css']
})
export class SecurityToolComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
  public openTree = false;
  public roles = [{ label: 'Full Control', value: 'Full Control' },
  { label: 'Owner', value: 'Owner' },
  { label: 'Author', value: 'Author' },
  { label: 'Viewer', value: 'Viewer' },
  ];
  private subscriptions: Subscription[] = [];
  index: any;
  folderList: any[];
  removeEnabled = false;
  public suggestionsResults: any[] = [];
  types = [{ label: 'USER', value: 'USER' }, { label: 'GROUP', value: 'GROUP' }];
  operationsTable: any;
  entryTemplate: any;
  orgCodeList: any;
  docClass: any;
  openLoggingCount = false;
  openLoggingUpdate = false;
  openDetails = false;
  public actions = [
    { label: 'Add', value: 'ADD' },
    { label: 'Deny', value: 'DENY' },
    { label: 'Remove', value: 'REMOVE' }
  ];
  public secPostObj: any = {
    selectedClass: {
      docClassSymName: '',
      docClassId: ''
    }, selectedEntryTemplate: {
      entryTemplateId: null,
      entryTemplateVsId: '',
      entryTemplateName: ''
    }, selectedFolder: {
      id: '',
      path: '',
      isSubFolders: false
    },
    selectedOrgCode: '',
    createdFrom: '',
    createdTo: '',
    participants: [],
    desc: '',
    query: ''
  };
  selectedOperation: any;
  loggingTable: any;
  public currentUser: User;
  selectedType: any;
  isNotQuery = true;
  formTypes: SelectItem[];
  currentOperation: any;
  busy: boolean;
  showUpdateLogDetails = false;
  selectedLogDetails: any;
  noParticipants = true;
  displayinfo = false;
  viewDocTitle: any;
  public docSysProp: any;
  public docInfo: any;
  public docSecurity: any;
  public foldersFiledIn: any;
  public showFailedDoc = false;
  public selectedOpForLog: any;
  public permissionDetails: any;
  @ViewChildren(DocDetailsModalComponent) docDetailsModalComponent: QueryList<DocDetailsModalComponent>;
  public displayPermissionDetails = false;
  public selectedPermission: any;
  public itemsPerPage: any;
  accessLevelsMap = {
    'Full Control': 998903,
    'Author': 131575,
    'Viewer': 131249,
    'Owner': 933367
  };
  subscriptionTimer: Subscription;
  rowsLogTable: any;
  isLogFiltered = false;
  filterLogText: any;
  @ViewChild('gbLogging') searchInput: ElementRef;
  @ViewChild('dt') tableOperation: ElementRef;
  loggingTableCopy: any;
  today: Date;
  busyLogFilter = false;
  indexTab: any = 0;
  // selectedFolder: any;
  constructor(
    private toastr: ToastrService,
    private us: UserService,
    private growlService: GrowlService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cs: ContentService,
    private coreService: CoreService,
    private as: AdminService,
    private ds: DocumentService) {
    this.entryTemplate = [];
    this.docClass = [];
    this.currentUser = this.us.getCurrentUser();
    this.formTypes = [];
    this.formTypes.push({ label: 'Query', value: 'query' });
    this.formTypes.push({ label: 'Criteria', value: 'criteria' });
    this.selectedType = 'criteria';
    this.today = new Date();
    this.subscriptionTimer = interval(600000).subscribe((x => {
      this.getOperationTable(true);
      console.log(new Date());
    }));
  }

  ngOnInit() {
    this.loggingTable = [{ currentCount: 0, logData: [], totalPage: 0, totalCount: 0 }];
    this.getDocumentClasses();
    this.getOperationTable();
    this.getOrgCodeList();
    //   this.operationsTable = [{"operationId":"41987277-4a14-47d5-b645-cfc3df1301a1","startTime":1606042924013,"status":"FINISHED","actionBy":"AVannadil","modifiedBy":"AVannadil","currentCount":0,"totalCount":0,"type":"SAVE","description":"ASDASD","enableUpdate":false,"enableResume":false},{"operationId":"0d2e9106-584d-482c-8eb7-b18a5989f788","startTime":1601969214291,"status":"RUNNING","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"5th try count using doc class entry tem folder path","enableUpdate":false,"enableResume":false},{"operationId":"f1799f29-2234-4858-87ab-711c1c6c8630","startTime":1601966582875,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"4th try count & update","enableUpdate":false,"enableResume":false},{"operationId":"b95938ae-d3d7-4cbf-81d1-84c45da0e118","startTime":1601969417445,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"6th count try","enableUpdate":false,"enableResume":false},{"operationId":"74961fe9-2268-4c1c-9f09-b07b45242da5","startTime":1601978087639,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"7th try ","enableUpdate":false,"enableResume":false},{"operationId":"f27096eb-55e7-4046-afb1-52076a4ff248","startTime":1601978141917,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"AVannadil","currentCount":0,"totalCount":0,"type":"UPDATE","description":"7th try ","enableUpdate":false,"enableResume":false},{"operationId":"0b3f47c0-f90c-4d4b-9be0-8dbf56b1705a","startTime":1601980384502,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"8th try","enableUpdate":false,"enableResume":false},{"operationId":"bf1339d4-01e8-4b8e-a2ac-8590c1ac780f","startTime":1601980616898,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"9th try","enableUpdate":false,"enableResume":false},{"operationId":"6516f937-beef-4787-836e-7f8c185315b3","startTime":1601980977186,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"UPDATE","description":"9th try","enableUpdate":false,"enableResume":false},{"operationId":"88516ba1-6a9c-4229-a325-49f2571672b0","startTime":1601983332791,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"UPDATE","description":"8th try","enableUpdate":false,"enableResume":false},{"operationId":"6d82acf3-caf5-4d19-af02-c23c8d350a54","startTime":1601969612583,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"6th try for count","enableUpdate":false,"enableResume":false},{"operationId":"8942b416-3b99-4764-8898-35fbb799f611","startTime":1601982174776,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"UPDATE","description":"10th try","enableUpdate":false,"enableResume":false},{"operationId":"63176d54-c68f-47d2-ba28-978f285215cf","startTime":1601965377341,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"Second Try Count","enableUpdate":false,"enableResume":false},{"operationId":"edcfdce5-dd25-48cf-b25f-b27b9b2f0e41","startTime":1601965799431,"status":"FINISHED","actionBy":"FTanbouz","modifiedBy":"FTanbouz","currentCount":0,"totalCount":0,"type":"COUNT","description":"3rd Try- with update","enableUpdate":false,"enableResume":false},{"operationId":"61f8e92f-5147-4780-a18b-058500bedc24","startTime":1601965863675,"status":"FINISHED","actionBy":"ECMTCEAdmin","modifiedBy":"ECMTCEAdmin","currentCount":0,"totalCount":0,"type":"UPDATE","description":"3rd Try- with update","enableUpdate":false,"enableResume":false}] ;
    // this.operationsTable.map(d=>{
    //   d.startTime2=moment(d.startTime).format('DD/MM/YYYY HH:mm:ss');
    // });
    // console.log(this.tableOperation);
    // this.tableOperation['sortField']='startTime';
    // this.tableOperation['sortOrder']=-1;
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Security Update Tool' }
    ]);
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  getOrgCodeList() {
    this.orgCodeList = [];
    this.orgCodeList.push({ label: '', value: '' });
    this.as.getLookupValues(1).subscribe(res => {
      res.map((d, i) => {
        if (!(d.label.trim().length > 4)) {
          this.orgCodeList.push({ label: d.label, value: d.value });
        }
      });
      //this.orgCodeList=temp;
    })
  }

  handleChange(e) {
    this.secPostObj.desc = '';
    if (e === 'criteria') {
      this.isNotQuery = true;
      this.secPostObj.query = '';
    }
    else {
      this.isNotQuery = false;
    }
  }

  changeNewClass(e) {
    this.as.entryTemplates(e.value.docClassSymName).subscribe(data => this.assignEntryTemplates(data));
  }

  assignEntryTemplates(data) {
    this.entryTemplate = [];
    this.entryTemplate.push({ label: 'ALL', value: '' });
    data.map(d => {
      this.entryTemplate.push({ label: d.name, value: { entryTemplateId: d.id, entryTemplateVsId: d.vsid, entryTemplateName: d.name } });
    });
  }

  getDocumentClasses() {
    this.busy = true;
    this.as.getclassDefinitions().subscribe(data => {
      this.busy = false;
      this.assignClassDef(data)
    }, err => {
      this.busy = false;
    });
  }

  assignClassDef(data) {
    let selectedObj;
    data.map(d => {
      this.docClass.push({ label: d.name, value: { docClassId: d.id, docClassSymName: d.symName } });
    });
    this.docClass.map(d => {
      if (d.value.docClassSymName && d.value.docClassSymName.toLowerCase() === 'kocdocument') {
        selectedObj = d;
      }
    });
    this.secPostObj.selectedClass = selectedObj.value;
    this.as.entryTemplates(selectedObj.value.docClassSymName).subscribe(data => this.assignEntryTemplates(data));
  }

  getOperationTable(isTimer?, isSortDes?) {
    if (!isTimer) {
      this.busy = true;
    }
    this.as.getAllOperations().subscribe(data => {
      this.busy = false;
      this.assignOperation(data, isSortDes)
    }, err => {
      this.busy = false;
    });
  }
  removeOperCount(e) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove?',
      key: 'removeOp',
      accept: () => {
        this.removeOperation(e.operationId);
      }
    });
  }

  onPauseOrResume(e) {
    if (e.status === 'RUNNING') {
      this.as.operationPause(e.operationId).subscribe(data => {
        e.status = 'PAUSED';
        e.action = 'RESUME';
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Operation Paused'
        // });
        this.toastr.info('Operation Paused', 'Success');
      }, err => {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Failed to pause operation'
        // });
        this.toastr.error('Failed to pause operation', 'Failure');
      });
    }
    else if (e.status === 'FINISHED' && e.type === 'UPDATE') {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to remove?',
        key: 'removeOp',
        accept: () => {
          this.removeOperation(e.operationId);
        }
      });
    }
    else if (e.status === 'FINISHED' && e.type !== 'UPDATE') {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to update?',
        key: 'updateOp',
        accept: () => {
          this.updateOperation(e.operationId);
          e.enableUpdate = false;
        }
      });
    }
    else if (e.status === 'PAUSED' || e.status === 'FAILED') {
      this.as.operationResume(e.operationId).subscribe(data => {
        e.status = 'RUNNING';
        e.action = 'PAUSE';
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Operation Resumed'
        // });
        this.toastr.info('Operation Resumed', 'Success');
      }, err => {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Failed to resume Operation'
        // });
        this.toastr.error('Failed to resume Operation', 'Failure');
      });
    }
    else if (e.status === 'SAVED') {
      this.as.operationResume(e.operationId).subscribe(data => {
        e.status = 'RUNNING';
        e.action = 'PAUSE';
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Operation Started'
        // });
        this.toastr.info('Operation Started', 'Success');
      }, err => {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Failure', detail: 'Failed to start Operation'
        // });
        this.toastr.error('Failed to start Operation', 'Failure');
      });
    }
  }

  onPaging(op, e) {
    this.busy = true;
    let temp = '';
    if (this.showFailedDoc) {
      temp = 'failed';
    }
    if (this.filterLogText && this.filterLogText.length >= 3) {
      this.as.getOperationLogsFilter(this.filterLogText, op.operationId, (e.first / e.rows) + 1, temp).subscribe(res => {
        this.busy = false;
        this.loggingTable = res;
      }, err => {
        this.busy = false;
      });
    }
    else {
      this.as.getOperationLogs(op.operationId, (e.first / e.rows) + 1, temp).subscribe(res => {
        this.busy = false;
        this.loggingTable = res;
      }, err => {
        this.busy = false;
      });
    }
  }
  closeLog(input) {
    this.showFailedDoc = false;
    this.isLogFiltered = false;
    this.filterLogText = undefined;
    input.value = '';
    this.loggingTable = [];
    this.loggingTableCopy = [];
  }

  removeOperation(dat) {
    // let temp=[...this.operationsTable];
    // if (this.operationsTable.map(opt => opt.id).indexOf(id) !== -1) {
    //   temp.splice(this.operationsTable.map(opt => opt.id).indexOf(id), 1);
    // }
    // this.operationsTable=temp;
    this.busy = true;
    this.as.operationRemove(dat).subscribe(d => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Operation Removed Successfully'
      // });
      this.toastr.info('Operation Removed Successfully', 'Success');
      this.getOperationTable();
    }, err => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Failed To Remove Operation'
      // });
      this.toastr.error('Failed To Remove Operation', 'Failure');
    });
  }

  updateOperation(dat) {
    this.busy = true;
    this.as.operationUpdate(dat).subscribe(d => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Update Started'
      // });
      this.toastr.info('Update Started', 'Success');
      this.getOperationTable();
    }, err => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Failed To Start Update'
      // });
      this.toastr.error('Failed To Start Update', 'Failure');
    });
  }

  assignOperation(data, isSortDes) {
    this.operationsTable = data;
    if (isSortDes) {
      this.tableOperation['sortField'] = 'startTime';
      this.tableOperation['sortOrder'] = -1;
    }
    this.operationsTable.map(d => {
      d.startTime2 = moment(d.startTime).format('DD/MM/YYYY HH:mm:ss');
      if (d.status === 'RUNNING') {
        d.action = 'PAUSE';
      }
      else if (d.status === 'FINISHED') {
        if (d.type.toUpperCase() === 'UPDATE') {
          d.action = 'REMOVE'
        }
        else {
          d.action = 'UPDATE';
        }
      }
      else if (d.status === 'PAUSED' || d.status === 'FAILED') {
        d.action = 'RESUME';
      }
      else if (d.status === 'SAVED') {
        d.action = 'START';
      }
    });
  }

  onAccessTypeChange(participant, index) {
    if (participant.action === 'DENY' || participant.action === 'REMOVE') {
      participant.role = undefined;
    }
    else {
      participant.role = 'Full Control';
    }
  }

  startOperation(type) {
    let postobj = {
      docClassId: '', docClassSymName: '', entryTemplateId: null, entryTemplateVsId: '', entryTemplateName: '',
      folderID: '', folderPath: '', subFoldersIncluded: false, orgCode: '', createdFrom: '', createdTo: '', operationType: '', loginName: '', notes: '', query: '',
      participants: []
    };
    postobj.docClassId = this.secPostObj.selectedClass.docClassId;
    postobj.docClassSymName = this.secPostObj.selectedClass.docClassSymName;
    postobj.entryTemplateId = this.secPostObj.selectedEntryTemplate.entryTemplateId;
    postobj.entryTemplateVsId = this.secPostObj.selectedEntryTemplate.entryTemplateVsId;
    postobj.entryTemplateName = this.secPostObj.selectedEntryTemplate.entryTemplateName;
    postobj.folderID = this.secPostObj.selectedFolder.id;
    postobj.folderPath = this.secPostObj.selectedFolder.path;
    postobj.subFoldersIncluded = this.secPostObj.selectedFolder.isSubFolders;
    if (this.secPostObj.selectedOrgCode) {
      postobj.orgCode = this.secPostObj.selectedOrgCode;
    }
    postobj.createdFrom = this.coreService.getFormattedDateString(this.secPostObj.createdFrom, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    postobj.createdTo = this.coreService.getFormattedDateString(this.secPostObj.createdTo, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    postobj.operationType = type;
    postobj.loginName = this.currentUser.userName;
    postobj.notes = this.secPostObj.desc;
    if (!this.isNotQuery) {
      postobj.query = this.secPostObj.query;
    }
    let temp = _.cloneDeep(this.secPostObj.participants);
    let noSelection = false;
    temp.map(d => {
      if (!d.granteeName) {
        noSelection = true;
      }
      else {
        d.name = d.granteeName.name;
        delete d.granteeName;
        delete d.granteesSuggestion;
      }
    });
    if (noSelection) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Participant Required', detail: 'Please Select Participant'
      // });
      this.toastr.error('Please Select Participant', 'Participant Required');
    }
    else {
      postobj.participants = temp;
      this.busy = true;
      if (type === 'SAVE') {
        this.as.saveOperation(postobj).subscribe(data => {
          this.busy = false;
          this.startSuccessfull(data, type)
        }, err => {
          this.busy = false;
          this.startFailed(err, type)
        });
      }
      else {
        this.as.startOperation(postobj).subscribe(data => {
          this.busy = false;
          this.startSuccessfull(data, type)
        }, err => {
          this.busy = false;
          this.startFailed(err, type);
        });
      }

    }
  }

  startSuccessfull(data, type) {
    let msg = "Operation Started";
    if (type === 'SAVE') {
      msg = "Operation Saved";
    }
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: msg
    // });
    this.toastr.info(msg, 'Success');
    let selectedObj;
    this.docClass.map(d => {
      if (d.value.docClassSymName && d.value.docClassSymName.toLowerCase() === 'kocdocument') {
        selectedObj = d;
      }
    });
    this.secPostObj.selectedClass = selectedObj.value;
    // this.secPostObj.selectedClass={docClassSymName: undefined, docClassId: undefined};
    this.secPostObj.selectedEntryTemplate = this.entryTemplate[0];
    this.secPostObj.selectedFolder.id = undefined;
    this.secPostObj.selectedFolder.path = undefined;
    this.secPostObj.selectedFolder.isSubFolders = false;
    this.secPostObj.selectedOrgCode = undefined;
    this.secPostObj.createdFrom = undefined;
    this.secPostObj.createdTo = undefined;
    this.secPostObj.participants = [];
    this.secPostObj.desc = undefined;
    this.secPostObj.query = undefined;
    this.removeEnabled = false;
    this.noParticipants = true;
    this.indexTab = 1;
    this.getOperationTable(undefined, true);
  }

  startFailed(e, type) {
    let msg = 'Failed To Start Operation';
    if (type === 'SAVE') {
      msg = 'Failed To Save Operation';
    }
    let summary = 'Failure';
    if (e.statusText === 'Not Acceptable') {
      msg = 'Query is not valid';
      summary = e.statusText
    }
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: summary, detail: msg
    // });
    this.toastr.error(msg, summary);
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

  getMainFolders(data) {
    const topFolder = [];
    data.map((d, i) => {
      if (d != null) {
        if (d.type === 'PermissionsFolder' || d.type === 'PermissionFolder') {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-shared',
            'children': [],
            'leaf': false
          });
        }
        else {
          topFolder.push({
            label: d.name,
            data: d,
            'level': '1',
            'expandedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw fa fa-fw ui-icon-folder',
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

  removeFolderPath() {
    this.secPostObj.selectedFolder.id = undefined;
    this.secPostObj.selectedFolder.path = undefined;
    this.removeEnabled = false;
    this.secPostObj.selectedFolder.isSubFolders = false;
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
            'expandedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-shared',
            'leaf': false
          });
        }
        else {
          subFolder.push({
            label: d.name,
            data: d,
            'level': '2',
            'expandedIcon': 'fa fa-fw fa fa-fw ui-icon-folder-open',
            'collapsedIcon': 'fa fa-fw fa fa-fw ui-icon-folder',
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

  nodeSelect(event) {
    this.secPostObj.selectedFolder.id = event.node.data.id;
    this.secPostObj.selectedFolder.path = event.node.data.path;
  }

  nodeExpand(event) {
    this.cs.getSubFolders(event.node.data.id).subscribe(data => this.assignSubFoldersFor(event.node, data));

  }
  search(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResults = data;
    }, err => {
      this.busy = false;
    });
  }

  orgUnitSelected(selected) {
    this.secPostObj.selectedOrgCode = selected;
  }

  addParticipants() {
    this.secPostObj.participants = [...this.secPostObj.participants,
    {
      type: 'USER',
      role: 'Full Control',
      action: 'ADD'
    }];
  }

  removeNewPermission(permission) {
    this.secPostObj.participants.map((p, i) => {
      if (p === permission) {
        this.secPostObj.participants.splice(i, 1);
        this.secPostObj.participants = [...this.secPostObj.participants];
      }
    });
  }

  getGranteesSuggestion(event, participant) {
    if (participant.type === 'USER') {
      if (event.query.length >= 3) {
        this.busy = true;
        this.as.searchLDAPUsers(event.query).subscribe(res => {
          this.busy = false;
          participant.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    } else {
      if (event.query.length >= 3) {
        this.busy = true;
        this.as.searchLDAPGroups(event.query).subscribe(res => {
          this.busy = false;
          participant.granteesSuggestion = res;
        }, err => {
          this.busy = false;
        });
      }
    }
  }

  test(dat) {
    let icon;
    if (dat.status === 'RUNNING') {
      // if (dat.type.toUpperCase() === 'UPDATE') {
      icon = 'fa fa-fw fa fa-fw ui-icon-pause';
      // }
    }
    else if (dat.status === 'FINISHED') {
      if (dat.type.toUpperCase() === 'UPDATE') {
        //icon = 'fa fa-fw fa fa-fw ui-icon-remove';
      }
      else {
        icon = 'fa fa-fw fa fa-fw ui-icon-update';
      }
    }
    else if (dat.status === 'PAUSED' || dat.status === 'FAILED' || dat.status === 'SAVED') {
      icon = 'fa fa-fw fa fa-fw ui-icon-play-arrow';
    }
    return icon;
  }

  getSelectedOperation(data) {
    // this.selectedOperation={"operationId":"1c9d2caf-a7d8-4875-bbcb-3481a7a29ab4","startTime":"00:00:00","status":"FINISHED","actionBy":"AVannadil","modifiedBy":"AVannadil","operationInput":{"docClassSymName":"KOCDocument","subFoldersIncluded":false,"query":"SELECT column1, column2 FROM table1, table2 WHERE column2='value' sdjfhjk sdfjsdk dsfhjksdfhjk sdkfjhjksdfhjk SDFSD SDFSDF SDFDSF SDFSD SDFSDF SDFSDF SDFSDF SDFSDF SDFSDF SDFSDF SDFSDFSD SDFSDFSD SDFSFSD SDFSDFSD SDFSDFSD kjshdfkjsdh sdfhjsdhjk;  ","participants":[]},"currentCount":0,"totalCount":9620,"type":"COUNT","description":"test123"}
    this.as.operationDetails(data.operationId).subscribe(data => {
      this.selectedOperation = data;
    });
  }

  runFailedDocs() {
    this.as.runFailed(this.currentOperation.operationId).subscribe(d => {
      if (d === 'started') {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Operation Started'
        // });
        this.toastr.info('Operation Started', 'Success');
        this.openLoggingUpdate = false;
        this.getOperationTable();
      }
      else if (d === 'noFail') {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Info', detail: 'No Failed Documents'
        // });
        this.toastr.info('No Failed Documentsd', 'Info');
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: 'Operation Started'
        // });
        this.toastr.info('Operation Started', 'Success');
        this.openLoggingUpdate = false;
        this.getOperationTable();
      }

    }, err => {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failed', detail: 'Failed To Start Operation'
      // });
      this.toastr.error('Failed To Start Operation', 'Failed');
    })
  }

  refreshOp(dat) {
    this.refreshOperationTable(dat);
  }

  refreshOperationTable(dat) {
    this.busy = true;
    this.as.operationRefresh(dat.operationId).subscribe(val => {
      this.busy = false;
      this.as.operationDetails(dat.operationId).subscribe(data => {
        dat.enableUpdate = data.enableUpdate;
        this.assignRow(dat, val);
      });
    }, err => {
      this.busy = false;
    });
  }

  assignRow(d, val) {
    d.status = val.start;
    if (val.start === 'RUNNING') {
      d.action = 'PAUSE';
    }
    else if (val.start === 'FINISHED') {
      if (d.type.toUpperCase() === 'UPDATE') {
        d.action = 'REMOVE';
      }
      else {
        d.action = 'UPDATE';
      }
    }
    else if (val.start === 'PAUSED' || d.status === 'FAILED') {
      d.action = 'RESUME';
    }
    else if (val.start === 'PAUSED' || d.status === 'SAVED') {
      d.action = 'START';
    }
    //this.getOperationTable();
  }
  //   onLazyLoad(e){
  // console.log(e);
  //   }

  showLoggingInfo(e, type?) {
    this.busy = true;
    this.selectedOpForLog = e;
    //  this.currentOperation = e;//to removeeeeeeeeeeeeeeeeeeeeeeeeeeee
    //  this.loggingTable={logData:[],totalPage:8,currentCount:24}
    //
    //  if(!type){
    //      this.loggingTable=
    //    {"totlapage":93,"totalCount":9204,"logData":[{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{51490600-C3A6-491D-8736-516D131F4314}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{3A400900-3F3F-4E39-9113-0F3D9BC86333}","action":"UPDATE","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{726C0900-C410-4F25-AEC9-31DBED21D1F0}","action":"UPDATE","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{3E211700-08C0-442F-B5A3-E3A6C0CC306A}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{1CFE1800-948B-444B-A9CC-4A90653B0473}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{153D1900-7EDC-46A3-9483-914432A3546B}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{B5C12800-061B-4319-B98E-4285E60D6333}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{97213700-8DC9-4DC1-96AA-BAE49CCBE82D}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D72E3800-567D-485C-A4FF-1A71BDBFC75F}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D8543E00-4B8E-4237-A884-1E89CDAB14F1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{00A34200-2988-43D1-BB5A-33EAEABDF411}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{CDC34600-DB94-4651-9DBA-DDAAEA4951FD}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{1EFF5200-DA67-4148-A021-1EC058DDA2B2}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9B078800-B20C-4FBD-BB0F-0A3B59186686}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{58728800-278C-467B-8D66-CCDF60FACD2C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9F1F8E00-1862-43B4-8484-201AB2D81CBD}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{A2DF9A00-90AD-4532-BECE-CDC0133F34DF}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{A84BA600-CD26-4E46-A688-48874EBF0411}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{BB4CA700-7095-44B3-95F3-EB505AC91169}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{806EA900-61FB-4DD5-9745-A671CB90ABC0}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{5022B000-18D2-42E6-8A7C-4B1FB1E786D1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{2EC6BD00-9AEC-4C32-B9DA-0A1E91F213FD}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{17D7BD00-A06C-4ED8-9CB4-5EFAD758261F}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{895BE300-50C7-4DC1-92E5-238600F22539}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{E15AEB00-F9BD-46AE-AF22-7D8EB85AC281}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{12B1F200-2AED-468F-9745-6732FDCEEFB8}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{E157F400-E968-46EC-AE8E-59BB39012386}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{EB43F900-1389-4AF9-9A89-D40A37200BE0}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9082FF00-2FCB-4654-813A-D422F742861B}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{BF4A0301-4871-40D2-9019-A9A47E9F22E2}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D4970401-DEBA-48C0-9A20-41D3765BDC7D}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{81BC1401-8E56-4046-B20E-B8698F2B19A5}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{B4CF1401-A0A7-42E5-84FD-D48E10AC3A4C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{FF121501-B04A-4C3C-A31B-54AAD2DAD01D}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{22E71501-6C25-4BE8-A853-9B883956A118}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{FB812A01-47F9-4D0D-A510-7A0238E9EACB}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{1C373101-0AF2-4E10-8990-B9B84C086B0B}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{1F563501-D39E-465E-B1EA-713A386D8E31}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{B8A44701-F8C7-4E20-9568-02895E7146F4}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{7A4B5101-9C2D-4694-94BE-EF1DCF513576}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D99F5401-A32A-4E5A-95EA-F6C95EE45FC4}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{52605701-AEDB-42C5-BA60-08BB50395366}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{959A5901-F9D7-4CD0-8E36-A9B56A9221A5}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{69BE5D01-9CAD-453C-A2CB-878043909765}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9E156201-9BFC-4EE0-9DAF-81D3DFCB108E}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{0F456201-DA3C-42B7-8058-322757CEF18C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{F8E36701-6D0C-4F7D-85BE-0C5D9529954D}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{3F617E01-B196-4BB5-9025-3CBC65B20DEA}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{43F78101-FBB5-4D2F-B212-CCFE6F0F30DD}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{DFEF8501-2ACA-4317-AD0F-B3309AA83945}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{F4D78A01-DF2B-4C81-8506-44AB019ADB74}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{14099501-95CC-4E15-9411-FF81994CBBDA}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{ADC89701-54E9-4A12-9A5C-9713DE93230C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{ADF39C01-D635-498B-BF68-8966CB806B0E}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{6CF59D01-0733-4650-87C1-C5018C1933A8}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{FC229E01-1B88-48EB-A7E2-921B9134649C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{8E54A901-6070-418A-9C2D-A0D828368A57}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{7D84AC01-F5F0-4096-A506-FD505E3E4ADE}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{825CAF01-6D34-42B3-B27E-B9CB0FF6AD9C}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{FC8DB701-100D-4982-ABE4-0B9C73335F51}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{C323CC01-ED26-48B3-B609-59549ADE8E12}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9880CE01-7AA6-4E2F-8617-BEA692635D1A}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{C52BCF01-5D74-4759-831C-8D9F032732A8}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{DF47D801-DA1C-4B07-B64F-E74EB0DD75AB}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{E91DD901-7EB4-45C8-ACC5-8AC5C693DC7E}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{778AEB01-096E-4727-B92B-00891E6A4B78}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{0D99F001-A9D1-4BDA-B6EF-AFB89CBD9F96}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{BB07F701-9819-48C8-AAE1-7B161DF892E6}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{4E7CFF01-1C75-45E4-A542-7E2FF619989F}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{F2DE0402-6AD9-452B-A250-1DC2CFF154E1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{88960C02-8991-4D90-AED1-812A5AB51E59}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{827B1002-0CCA-4333-9042-E01BC6F51EBE}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{9AA01F02-E441-4FFE-8325-464F25F2D100}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{FA242102-02B7-4B76-B369-615CDC285440}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{0A934102-388C-48A9-A0FF-854102FCA4EE}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{CB004802-AD0C-47CB-A79E-A82087063BC1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{03BA6C02-6AAA-4CBC-A905-772CE6955D15}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D95F7002-459B-4F39-A2A1-258D402A16D3}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{AD9D7302-BFF7-40AC-BF37-01DF680154DC}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{39BA7A02-A946-486C-A0D3-C4FA7DB8A587}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{E7797D02-99D4-46AD-A99D-26ED50AEDFE5}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{388E8102-C30E-4F38-8065-90B31352246D}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{03F98402-3E37-4ED1-A35B-DD1419AA62FB}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{CB298602-FBB7-4B60-89C8-3F3DE0F2368E}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{C5D88902-FA24-43D2-9E87-FAA7E71F3161}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{618B8F02-3E8F-4BB0-AEA7-1530E2DAB2C6}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{5C289802-CB40-4453-845A-D5BDBD4BDCE7}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{DA28A902-911B-42D1-89ED-7E52FA76B82F}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{B436AB02-2E68-4640-BCB8-7172322063E7}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{B30FD002-0D19-457C-8763-D841659B9B51}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{E0D4D002-AE78-43D6-984E-D0BC10E254A1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{8634D302-4574-4C48-921A-B100A9029DC1}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{8ECCDA02-EFF4-4E44-8B95-1B8FD137E576}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{40C9E702-3BC6-4D57-8272-EA65A4128114}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{D736F502-478B-44C2-B175-45F52E88EFAB}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{0565F802-8D1D-48EB-97DD-7E3E18FA23B2}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{259EFA02-05B5-457D-9212-053D141ED2C3}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{A8840303-F195-4CA9-AF32-3413AAC9822E}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{31F51103-2A9E-4B95-825B-7716B7C54D0F}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{82752903-C3A9-4421-AA7E-DC1F2E07B7DC}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{93222E03-61EA-4DDC-B989-62F7695BAD99}","action":"ADD","status":"SUCCESS"}]};
    //
    //  }
    //  else{
    //    this.loggingTable= {"totlapage":1,"totalCount":5,"logData":[{"operationId":"a712f722-39fa-4087-89e8-bc01fb432d37","docId":"{D151AD1B-C93A-490A-A77C-07C745CA996D}","action":"ADD","status":"SUCCESS"},{"operationId":"a712f722-39fa-4087-89e8-bc01fb432d37","docId":"{9581016B-EF81-48A6-9E2F-0516885017C2}","action":"ADD","status":"FAILED","details":"com.filenet.api.exception.EngineRuntimeException: FNRCE0057E: E_READ_ONLY: The method failed because an object or property is read-only.\r\n\tat com.filenet.apiimpl.core.ListImpl.checkUpdate(ListImpl.java:725)\r\n\tat com.filenet.apiimpl.core.ListImpl.checkUpdate(ListImpl.java:731)\r\n\tat com.filenet.apiimpl.core.ListImpl.add(ListImpl.java:283)\r\n\tat com.ecm.filenet.list.SecToolSearchOperation.AddParticipants(SecToolSearchOperation.java:434)\r\n\tat com.ecm.filenet.list.SecToolSearchOperation.doUpdate(SecToolSearchOperation.java:188)\r\n\tat com.ecm.filenet.list.SecToolSearchOperation.updateOperation(SecToolSearchOperation.java:145)\r\n\tat com.ecm.service.api.securityTool.secToolThread.run(secToolThread.java:65)\r\n\tat java.lang.Thread.run(Thread.java:818)\r\n"},{"operationId":"a712f722-39fa-4087-89e8-bc01fb432d37","docId":"{95F85392-C822-46EB-81F1-9323F61BC304}","action":"ADD","status":"SUCCESS"},{"operationId":"a712f722-39fa-4087-89e8-bc01fb432d37","docId":"{348B5E92-209A-48CE-B3F4-23A78CDD19BB}","action":"ADD","status":"SUCCESS"},{"operationId":"a712f722-39fa-4087-89e8-bc01fb432d37","docId":"{0F2286A7-77F4-4D15-A299-F2D4FE9D6F64}","action":"ADD","status":"SUCCESS"}]} ;
    //  }
    //  this.loggingTableCopy=this.loggingTable;
    // this.rowsLogTable= this.loggingTable.logData.length;
    this.as.getOperationLogs(e.operationId, 1, type).subscribe(res => {
      this.busy = false;
      if (e.type === 'COUNT') {
        this.currentOperation = res;
      }
      else {
        this.currentOperation = e;
        //this.loggingTable = res.loggingData;
        this.loggingTable = res;
        this.loggingTableCopy = res;
        this.rowsLogTable = this.loggingTable.logData.length;
        // this.totalNumber=this.loggingTable.totalCount;
      }
    }, err => {
      this.busy = false;
    });
  }
  showLogDetails(details) {
    this.selectedLogDetails = details;
  }
  isObject(val): boolean { return typeof val === 'object'; }

  validateParticipants() {
    let temp = true;
    this.secPostObj.participants.map(d => {
      if (this.isObject(d.granteeName)) {
        temp = false;
      }
      else {
        temp = true;
        d.granteeName = undefined;
      }

    });
    this.noParticipants = temp;
  }
  openDocDetails(data) {
    this.displayinfo = true;
    this.openDocInfo(data);
  }

  openDocInfo(doc) {
    this.docInfo = [];
    this.busy = true;
    this.ds.getThisDocumentDetails(doc.docId, this.currentUser.EmpNo).subscribe(data => {
      this.busy = false;
      this.assignDocInfo(data)
    }, err => {
      this.busy = false;
    });
  }
  assignDocInfo(data) {
    this.docSysProp = [];
    this.docInfo = [];
    data.document.props.map(p => {
      if (p.hidden === 'false') {
        this.docInfo.push(p);
      }
    });
    this.viewDocTitle = this.coreService.getPropValue(data.document.props, 'DocumentTitle') + " " + "(" + data.document.docclass + ")";
    this.docSysProp.push(data.document);
    this.assignDocSecurity(data.permissions);
    this.assignDocumentFolders(data.fileInFolders);
  }
  assignDocSecurity(data) {
    this.docSecurity = data;
  }
  assignDocumentFolders(data) {
    this.foldersFiledIn = data;
  }
  closeModal() {
    if (this.docDetailsModalComponent) {
      this.docDetailsModalComponent.forEach(docDetailsComponent => {
        docDetailsComponent.ngOnDestroy();
      });
    }
    this.docSysProp = [];
  }
  checkChange() {
    if (this.showFailedDoc) {
      this.showLoggingInfo(this.selectedOpForLog, 'failed')
    } else {
      this.showLoggingInfo(this.selectedOpForLog, '')
    }
    this.searchInput.nativeElement['value'] = '';
    this.filterLogText = undefined;
  }
  showPermissionDetails(type) {
    this.selectedPermission = type;
    this.cs.getAccessPrivileges(this.accessLevelsMap[this.selectedPermission]).subscribe(d => {
      this.permissionDetails = d;
    });
  }
  changeTabType(e) {
    this.indexTab = e.index;
    if (e.index === 1) {
      this.getOperationTable();
    }
  }
  filterLog(e) {
    // console.log(this.filterLogText);
    this.isLogFiltered = false;
    this.filterLogText = e.target.value;
    let temp = '';
    if (this.showFailedDoc) {
      temp = 'failed';
    }
    if (this.filterLogText && this.filterLogText.length >= 3) {
      this.isLogFiltered = true;
      this.busyLogFilter = true;
      //   this.loggingTable=
      // {"totlapage":93,"totalCount":9204,"logData":[{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{51490600-C3A6-491D-8736-516D131F4314}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{3A400900-3F3F-4E39-9113-0F3D9BC86333}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{726C0900-C410-4F25-AEC9-31DBED21D1F0}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{3E211700-08C0-442F-B5A3-E3A6C0CC306A}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{1CFE1800-948B-444B-A9CC-4A90653B0473}","action":"ADD","status":"SUCCESS"},{"operationId":"a92acac4-6df9-497e-9535-3e504625ad83","docId":"{153D1900-7EDC-46A3-9483-914432A3546B}","action":"ADD","status":"SUCCESS"}]};
      this.as.getOperationLogsFilter(this.filterLogText, this.currentOperation.operationId, 1, temp).subscribe(res => {
        this.busyLogFilter = false;
        this.loggingTable = res;
        //this.rowsLogTable= this.loggingTable.logData.length;
      }, err => {
        this.busyLogFilter = false;
      })
    }
    else {
      this.loggingTable = this.loggingTableCopy;
    }

  }
  ngOnDestroy() {
    this.clearSubscriptions();
    this.subscriptions = [];
    this.subscriptionTimer.unsubscribe();
  }


}
