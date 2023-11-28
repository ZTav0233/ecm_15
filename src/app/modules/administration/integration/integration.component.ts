import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ConfirmationService } from 'primeng/api';
import { GrowlService } from '../../../services/growl.service';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../services/content.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { CoreService } from '../../../services/core.service';
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import * as global from '../../../global.variables';
import * as _ from "lodash";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.css']
})
export class IntegrationComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dataTable!: Table;
  private subscriptions: Subscription[] = [];
  public integrations: any[] = [];
  public colHeaders: any[] = [];
  public showIntegration = false;
  public editMode = false;
  suggestionsResults: any[];
  public integration = {
    id: 0,
    appId: '',
    orgUnit: { label: '', value: '' },
    entryTemp: { id: '', symName: '', vsid: '', name: '' },
    param1: '',
    param2: '',
    param3: '',
    param4: '',
    param5: '',
    type: '',
    description: '',
    createdBy: '',
    createdDate: '',
    coordinator: ''
  };
  public integrationParams = {
    appId: '',
    param1: '',
    param2: '',
    param3: '',
    param4: '',
    param5: '',
    type: '',
    createdDate: '',
    createdBy: ''
  };
  public entryTemplates: any[] = [];
  public params: any[] = [];
  public types: any[] = [];
  public orgSelected = false;
  public busy: boolean;
  public itemsPerPage: any = 14;
  public user = new User();
  public viewIntigrationParams = false;
  public temp: any;

  constructor(private as: AdminService, private confirmationService: ConfirmationService, private coreService: CoreService, private growlService: GrowlService,
    private cs: ContentService, private breadcrumbService: BreadcrumbService, private us: UserService) {
    this.user = us.getCurrentUser();
  }

  refresh() {
    this.getIntegrations();
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.colHeaders = [
      { field: 'id', header: 'Id', hidden: true }, { field: 'appId', header: 'Integration Name', hidden: false },
      { field: 'description', header: 'Description', hidden: false }, {
        field: 'coordinator',
        header: 'Integration Coordinator',
        hidden: false
      },
      //{field: 'empName', header: 'Created By', hidden: false}, {field: 'createdDate', sortField:'createdDate2', header: 'Created Date', hidden: false},
      { field: 'etName', header: 'Entry Template Name', hidden: false },
      { field: 'modifiedBy', header: 'Modified By', hidden: false },
      { field: 'modifiedDate', sortField: 'modifiedDate2', header: 'Modified Date', hidden: false },
      { field: 'className', header: 'Class Name', hidden: true }, { field: 'template', header: 'Template', hidden: true },
      /*{field: 'param1', header: 'Param 1', hidden: false}, {field: 'param2', header: 'Param 2', hidden: false},
      {field: 'param3', header: 'Param 3', hidden: false}, {field: 'param4', header: 'Param 4', hidden: false},
      {field: 'param5', header: 'Param 5', hidden: false}, {field: 'type', header: 'Type', hidden: false}*/
    ];
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Integration' }
    ]);
    this.getIntegrations();
    this.types = [{ label: 'Single', value: 'SINGLE' }, { label: 'Multiple', value: 'MULTIPLE' }];
  }
  applyFilterGlobal($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);

    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.itemsPerPage = parseInt(d.val, 10);
          } else {
            this.itemsPerPage = 14;
          }
        }
      });
    }
  }

  getIntegrations() {
    this.busy = true;
    this.as.getIntegrations().subscribe(res => {
      this.busy = false;
      res.map((d) => {
        d.modifiedDate2 = this.coreService.getTimestampFromDate(d.modifiedDate, null, '/');
        d.createdDate2 = this.coreService.getTimestampFromDate(d.createdDate, null, '/');
      });
      this.integrations = res;
    }, err => {
      this.busy = false;
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  search(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResults = [];
      for (const orgunit of data) {
        this.suggestionsResults.push({
          label: orgunit.desc,
          value: orgunit.id
        });
      }
    }, err => {
      this.busy = false;
    });
  }

  orgUnitSelected(selected) {
    this.orgSelected = true;
    this.busy = true;
    this.cs.getEntryTemplatesByOrgId(selected.value).subscribe(template => {
      this.busy = false;
      this.entryTemplates = [];
      template.map((temp, i) => {
        this.entryTemplates.push({ label: temp.symName, value: { 'id': temp.id, 'symName': temp.symName } });
      });
    }, err => {
      this.busy = false;
    });
  }

  changeTemplateSelection(event) {
    this.assignTempProp(this.integration.entryTemp.id, null);
  }

  assignTempProp(temId, rowData) {
    this.params = [];
    this.params.push({ label: '', value: '' });
    let integprop = global.integ_prop;
    integprop.map(d => {
      this.params.push({ label: d, value: d, isSysProp: true })
    });
    this.busy = true;
    this.cs.getEntryTemplate(temId).subscribe(template => {
      this.busy = false;
      this.temp = template;
      if (!this.editMode) {
        this.integration.entryTemp.symName = template.symName;
        this.integration.entryTemp.name = template.name;
        this.integration.entryTemp.vsid = template.vsid;
      }
      template.props.map((prop, index) => {
        this.params.push({ label: prop.name, value: prop.symName });
      });
      if (this.editMode && rowData) {
        this.integration = {
          id: rowData.id,
          appId: rowData.appId,
          orgUnit: { label: '', value: '' },
          entryTemp: { id: rowData.template, symName: rowData.className, vsid: this.temp.vsid, name: this.temp.name },
          param1: rowData.param1,
          param2: rowData.param2,
          param3: rowData.param3,
          param4: rowData.param4,
          param5: rowData.param5,
          type: rowData.type,
          description: rowData.description,
          createdBy: rowData.empName,
          createdDate: rowData.createdDate,
          coordinator: rowData.coordinator
        };
      }
    }, err => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'You do not have permission for selected entry template.'
      });
      this.showIntegration = false;
    });
  }
  trackByFn(index, item) {
    return item.field; // or item.id
  }

  newIntegration() {
    let exist = false;
    this.integrations.map(d => {
      if (d.appId.toUpperCase() === this.integration.appId.toUpperCase()) {
        exist = true;
      }
    });
    if (!exist || this.editMode) {
      const newIntegration = {
        'id': this.integration.id,
        'appId': this.integration.appId,
        'className': this.integration.entryTemp.symName,
        'template': this.integration.entryTemp.id,
        'etVsid': this.integration.entryTemp.vsid,
        'etName': this.integration.entryTemp.name,
        'param1': this.integration.param1,
        'param2': this.integration.param2,
        'param3': this.integration.param3,
        'param4': this.integration.param4,
        'param5': this.integration.param5,
        'type': this.integration.type,
        'description': this.integration.description,
        'empName': this.user.fulName,
        'coordinator': this.integration.coordinator
      };
      this.busy = true;
      this.as.saveIntegrations(newIntegration).subscribe(data => {
        this.busy = false;
        if (this.editMode) {
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success',
            detail: 'Saved Successfully'
          });
        } else {
          this.growlService.showGrowl({
            severity: 'info',
            summary: 'Success',
            detail: 'Added Successfully'
          });
        }
        this.closeModel();
        this.getIntegrations();
      }, Error => {
        this.busy = false;
        this.fail()
      });
    }
    else {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist',
        detail: 'Integration name already exist'
      });
    }
  }

  fail() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure',
      detail: 'Failed'
    });
  }

  modifyIntegration(row) {
    let record = _.find(this.integrations, function (r) {
      return r.id === row.id;
    });
    this.editMode = true;
    this.assignTempProp(record.template, record);
    this.showIntegration = true;
  }

  confirmDeleteIntegration(row) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete ' + row.appId + '?',
      header: 'Delete Confirmation',
      key: 'confirmDI',
      icon: 'fa fa-fw ui-icon-help',
      accept: () => {
        this.deleteIntegration(row);
      },
      reject: () => {
      }
    });
  }

  deleteIntegration(row) {
    this.busy = true;
    this.as.deleteIntegrations(row.id).subscribe(res => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success',
        detail: 'Deleted Successfully'
      });
      this.getIntegrations();
    }, error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'Failed'
      });
    });
  }

  closeModel() {
    this.showIntegration = false;
    this.editMode = false;
    this.entryTemplates = [];
    this.orgSelected = false;
    this.integration = {
      id: 0,
      appId: '',
      orgUnit: { label: '', value: '' },
      entryTemp: { id: '', symName: '', vsid: '', name: '' },
      param1: '',
      param2: '',
      param3: '',
      param4: '',
      param5: '',
      type: '',
      description: '',
      createdBy: '',
      createdDate: '',
      coordinator: ''
    };
  }

  viewIntegration(row) {
    let rowData = _.find(this.integrations, function (r) {
      return r.id === row.id;
    });
    this.busy = true;
    this.cs.getEntryTemplate(rowData.template).subscribe(template => {
      this.busy = false;
      this.temp = template;
      this.integrationParams = {
        appId: rowData.appId,
        param1: rowData.param1,
        param2: rowData.param2,
        param3: rowData.param3,
        param4: rowData.param4,
        param5: rowData.param5,
        type: rowData.type,
        createdDate: rowData.createdDate,
        createdBy: rowData.empName
      };
      this.viewIntigrationParams = true;
    }, err => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure',
        detail: 'User does not have permission to view'
      });
      this.viewIntigrationParams = false;
    });
  }

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      array.push(d.field);
    });
    this.coreService.exportToExcel(this.integrations, 'Integration '+this.coreService.getDateTimeForExport()+'.xlsx', array)
  }

  ngOnDestroy() {
    for (const subs of this.subscriptions) {
      subs.unsubscribe();
    }
    this.subscriptions = [];
    this.integrations = [];
    this.colHeaders = [];
    this.showIntegration = false;
    this.editMode = false;
    this.entryTemplates = [];
    this.orgSelected = false;
  }
}
