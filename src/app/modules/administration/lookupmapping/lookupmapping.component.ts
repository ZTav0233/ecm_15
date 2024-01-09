import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../services/content.service';
import { GrowlService } from '../../../services/growl.service';
import { ConfirmationService, } from 'primeng/api';
import { CoreService } from "../../../services/core.service";
import { UserService } from "../../../services/user.service";
import * as _ from "lodash";
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lookupmapping',
  templateUrl: './lookupmapping.component.html',
  styleUrls: ['./lookupmapping.component.css']
})
export class LookupmappingComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dataTable!: Table;
  private subscription: Subscription[] = [];
  public lookupMappingList: any[];
  public colHeaders: any[] = [];
  public showNewLookupMapping = false;
  suggestionsResults: any[];
  public lookupMapping = {
    orgUnit: { label: '', value: '' },
    entryTemp: { id: '', vsId: '' },
    prop: '',
    lookup: ''
  };
  public entryTemplates: any[] = [];
  public properties: any;
  public lookups: any[] = [];
  public editMode = false;
  public orgSelected = false;
  public itemsPerPage: any = 10;
  public busy: boolean;
  public suggestionsResultsOrg: any[] = [];
  public selectedOrgCode: any;
  public selectedTemplate: any;
  etList: any[] = [];
  orgName: any;
  public isMapped = false;
  alreadyMappedMsg: any;

  constructor(private adminService: AdminService,private toastr:ToastrService,
    private cs: ContentService, private us: UserService,
    private growlService: GrowlService, private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService, private coreService: CoreService) {
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  refresh() {
    if (this.selectedTemplate) {
      this.searchLookupMapping();
    }
    else {
      this.getAllLookupMapping();
      //   this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Select Required',
      //   detail: 'Select Org Unit and Entry template'
      // });
    }

  }
  clearSelection() {
    this.selectedTemplate = undefined;
    this.getAllLookupMapping();
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.getEntryTempDropdown();
    //this.getEntryTempAll();
    this.colHeaders = [
      { field: 'id', header: 'Id', hidden: true },
      //{field: 'orgUId', header: 'OrgUId', hidden: true},
      { field: 'lkUp', header: 'LkUp', hidden: true },
      { field: 'tmpId', header: 'TmpId', hidden: true },
      { field: 'lkupName', header: 'Lookup Name', hidden: false },
      { field: 'prop', header: 'Filenet Property', hidden: false },
      //{field: 'orgUName', header: 'Organization Unit', hidden: false},
      { field: 'tmpName', header: 'Entry Template', hidden: false }
    ];
    this.getAllLookupMapping();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Lookup Mapping' }
    ]);
    this.busy = true;
    this.adminService.getLookups().subscribe(lookups => {
      this.busy = false;
      lookups.map((lookup, index) => {
        this.lookups.push({ label: lookup.name, value: lookup.id });
      });
    }, err => {
      this.busy = false;
    });
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.itemsPerPage = parseInt(d.val, 10);
          } else {
            this.itemsPerPage = 10;
          }
        }
      });
    }
  }

  getAllLookupMapping() {
    this.busy = true;
    this.adminService.getLookupMappings().subscribe(lookupMap => {
      this.busy = false;
      this.lookupMappingList = lookupMap;
    }, err => {
      this.busy = false;
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  newLookupMapping() {
    this.showNewLookupMapping = true;
  }

  search(event) {
    this.busy = true;
    this.adminService.searchOrgUnits(event.query).subscribe(data => {
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

  confirmClear() {
    this.orgName = undefined;
    this.etList = [];
    this.lookupMappingList = [];
  }


  getEntryTempDropdown() {
    this.orgSelected = true;
    this.busy = true;
    this.cs.getEntryTemplates().subscribe(template => {
      this.busy = false;
      this.entryTemplates = [];
      this.etList = []; //added on 10042019 to avoid two entry template call
      template.map((temp, i) => {
        this.entryTemplates.push({ label: temp.symName, value: { id: temp.id, vsId: temp.vsid } });
        this.etList.push({ label: temp.symName, value: temp.vsid }); //added on 10042019 to avoid two entry template call
      });
    }, err => {
      this.busy = false;
    });
  }

  changeProp() {
    this.adminService.getLookupMappingByTemplate(this.lookupMapping.prop, this.lookupMapping.entryTemp.vsId).subscribe(data => this.isAlreadyMapped(data));
  }
  reset() {
    this.dataTable.reset()
  }
  isAlreadyMapped(data) {
    let tempName;
    this.lookups.map(d => {
      if (d.value === data.lkUp) {
        tempName = d.label;
      }
    });
    this.alreadyMappedMsg = '*Already mapped with lookup - ' + "'" + tempName + "'";
    if (data.lkUp > 0) {
      this.isMapped = true;
    }
    else {
      this.alreadyMappedMsg = '';
      this.isMapped = false;
    }
  }

  orgUnitSelectedForSearch(e) {
    this.selectedOrgCode = e.id;
  }

  getEntryTempAll() {
    this.busy = true;
    this.cs.getEntryTemplates().subscribe(template => {
      this.busy = false;
      this.assignTemplates(template)
    }, err => {
      this.busy = false;
    });
  }

  assignTemplates(data) {
    this.etList = [];
    data.map((temp, i) => {
      this.etList.push({ label: temp.symName, value: temp.vsid });
    });
  }

  searchLookupMapping() {
    if (this.selectedTemplate) {
      this.busy = true;
      this.adminService.getLookupMappingsByOrg('', this.selectedTemplate).subscribe(data => {
        this.busy = false;
        this.assignMappings(data)
      }, err => {
        this.busy = false;
      });
    }
    else {
      this.getAllLookupMapping();
    }
  }

  assignMappings(data) {
    this.lookupMappingList = data;
  }

  changeTemplateSelection(event) {
    this.assignTempProp(event.value.id);
    this.alreadyMappedMsg = '';
  }

  assignTempProp(temId) {
    this.properties = [];
    this.busy = true;
    this.cs.getEntryTemplate(temId).subscribe(template => {
      this.busy = false;
      template.props.map((prop, index) => {
        if (prop.dtype !== 'DATE' && prop.hidden === 'false' && prop.name !== 'ECM No') {
          this.properties.push({ label: prop.symName + "(" + prop.desc + ")", value: prop.symName });
        }
      });
    }, err => {
      this.busy = false;
    });
  }

  addNewLookupMapping() {
    let tempprop = this.lookupMapping.prop;
    if (this.editMode && this.lookupMapping.prop) {
      tempprop = this.lookupMapping.prop.substring(0, this.lookupMapping.prop.indexOf('('));
    }
    this.busy = true;
    this.adminService.addLookupMapping(
      this.lookupMapping.orgUnit.value,
      this.lookupMapping.entryTemp.vsId,
      tempprop,
      this.lookupMapping.lookup
    ).subscribe(data => {
      this.busy = false;
      this.success(data)
    }, Error => {
      this.busy = false;
      this.fail(Error)
    });
  }

  success(data) {
    if (data === "OK") {
      this.showNewLookupMapping = false;
      if (this.editMode) {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success',
        //   detail: 'Saved Successfully'
        // });
        this.toastr.info('Saved Successfully', 'Success');
      } else {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success',
        //   detail: 'Added Successfully'
        // });
        this.toastr.info('Added Successfully', 'Success');
      }
      this.searchLookupMapping();
    }
    else if (data === "Exists") {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Already Exist', detail: 'Mapping Already Exist'
      // });
      this.toastr.error('Mapping Already Exist', 'Already Exist');
    }
    this.editMode = false;

  }

  fail(data) {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure',
    //   detail: 'Failed'
    // });
    this.toastr.error('Failed', 'Failure');
    this.editMode = false;
  }

  modifyLookupMapping(lkpmap) {
    let row = _.find(this.lookupMappingList, function (r) {
      return r.id === lkpmap.id;
    });
    this.busy = true;
    this.cs.getEntryTemplate(row.etId).subscribe(data => {
      this.busy = false;
      this.assignSelectedPropWithDesc(data, row)
    }, err => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure',
      //   detail: 'User doesnot have permission to edit'
      // });
      this.toastr.error('User doesnot have permission to edit', 'Failure');
    });
  }

  assignSelectedPropWithDesc(data, row) {
    data.props.map(d => {
      if (d.symName === row.prop) {
        row.prop = row.prop + "(" + d.desc + ")";
      }
    });
    this.editMode = true;
    this.properties = [];
    this.properties.push({ label: row.prop, value: row.prop });
    this.lookupMapping = {
      orgUnit: { label: row.orgUName, value: row.orgUId },
      entryTemp: { id: row.tmpName, vsId: row.tmpId },
      prop: row.prop,
      lookup: row.lkUp
    };
    this.showNewLookupMapping = true;
  }

  deleteLookupMapping(row) {
    let prop = row.prop;
    if (row.prop.indexOf('(') > -1) {
      prop = row.prop.substr(0, row.prop.indexOf('('))
    }
    this.busy = true;
    this.adminService.removeLookupMapping(row.orgUId, row.tmpId, prop).subscribe(res => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success',
      //   detail: 'Deleted Successfully'
      // });
      this.toastr.info('Deleted Successfully', 'Success');
      if (this.selectedTemplate) {
        this.busy = true;
        this.adminService.getLookupMappingsByOrg('', this.selectedTemplate).subscribe(data => {
          this.busy = false;
          this.assignMappings(data)
        }, err => {
          this.busy = false;
        });
      }
      else {
        this.getAllLookupMapping();
      }
    }, Error => {
      this.busy = false;
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure',
      //   detail: 'Failed'
      // });
      this.toastr.error('Failed', 'Failure');
    });
  }

  confirmdeleteLookupMapping(row) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete?',
      header: 'Delete Confirmation',
      key: 'confirmLM',
      icon: 'fa fa-fw ui-icon-help',
      accept: () => {
        this.deleteLookupMapping(row);
      },
      reject: () => {
      }
    });
  }

  closeModel() {
    this.showNewLookupMapping = false;
    this.editMode = false;
    this.isMapped = false;
    this.alreadyMappedMsg = '';
    //this.entryTemplates = [];
    this.orgSelected = false;
    this.lookupMapping = {
      orgUnit: { label: '', value: '' },
      entryTemp: { id: '', vsId: '' },
      prop: '',
      lookup: ''
    };
  }

  exportToExcel() {
    let array = [];
    this.colHeaders.map(d => {
      if (d.hidden === false) {
        array.push(d.field);
      }
    });
    this.coreService.exportToExcel(this.lookupMappingList, 'Lookup_Mapping ' + this.coreService.getDateTimeForExport() + '.xlsx', array)
  }

  searchOrg(event) {
    this.busy = true;
    this.adminService.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResultsOrg = data;
    }, err => {
      this.busy = false;
    });
  }

  ngOnDestroy() {
    for (const subs of this.subscription) {
      subs.unsubscribe();
    }
    this.subscription = [];
    this.lookupMappingList = [];
    this.colHeaders = [];
    this.suggestionsResults = [];
    this.lookupMapping = {
      orgUnit: { label: '', value: '' },
      entryTemp: { id: '', vsId: '' },
      prop: '',
      lookup: ''
    };
    this.entryTemplates = [];
    this.properties = [];
    this.lookups = [];
    this.isMapped = false;
  }
}
