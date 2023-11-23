import { Lookup } from '../../../models/admin/lookup.model';
import { LookupValue } from '../../../models/admin/lookupvalue.model';
import { AdminService } from '../../../services/admin.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { ConfirmationService } from 'primeng/api';
import * as global from '../../../global.variables';
import { UserService } from '../../../services/user.service';
import { saveAs } from 'file-saver';
import * as _ from "lodash";

@Component({
  selector: 'app-lookups',
  templateUrl: './lookups.component.html',
  styleUrls: ['./lookups.component.css']
})
export class LookupsComponent implements OnInit, OnDestroy {
  public lookupList = [];
  lookupValues: any[];
  headerTitleLookup: any;
  selectedLookup: any;
  selectedindex: any;
  dat = new LookupValue();
  lookup = new Lookup();
  newLookUp = new LookupValue();
  lookupValueRowId = undefined;
  headerTitle: any;
  showEdit = false;
  busy: boolean;
  query: any;
  queryValue: any;
  emptyMessage: any;
  private subscriptions: any[] = [];
  private roleData: any = { roles: { model: {} } };
  roleTreeExpandedIcon = 'ui-icon-people-outline';
  roleTreeCollapsedIcon = 'ui-icon-people';
  public suggestionsResults: any[] = [];
  public selectedOrgUnit: any;
  orgName: any;
  currentUser: any;
  showEditLookup=false;
  constructor(private as: AdminService, private userService: UserService, private confirmationService: ConfirmationService, private coreService: CoreService, private growlService: GrowlService, private breadcrumbService: BreadcrumbService) {
    this.lookupValues = [];
  }

  refreshtable() {
    this.refreshLookupTable();
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.selectedindex = 1;
    this.emptyMessage = global.no_workitem_found;
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Lookups' }
    ]);
    this.roleData.roles = {
      selectCriterions: [
        { label: 'Email', value: 'EMAIL' },
        { label: 'Name', value: 'NAME' },
        { label: 'Designation', value: 'TITLE' },
        { label: 'Phone', value: 'PHONE' },
        { label: 'Org Code', value: 'ORGCODE' },
        { label: 'Koc No', value: 'KOCNO' }],
      result: undefined, model: { selectedCriterion: 'NAME' }
    };
    this.busy = true;
    this.as.getLookups().subscribe(data => {
      this.busy = false;
      this.assignLookUpNames(data)
    }, err => {
      this.busy = false;
    });
  }

  refreshLookupTable() {
    this.busy = true;
    this.as.getLookups().subscribe(data => {
      this.busy = false;
      this.assignLookUpNamesAfterEdit(data)
    }, err => {
      this.busy = false;
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  filterLookup() {
    if (this.query.length > 0) {
      this.lookupValues = [];
      this.selectedLookup = undefined;
    } else {
      this.busy = true;
      this.as.getLookups().subscribe(data => {
        this.busy = false;
        this.assignLookUpNames(data)
      }, err => {
        this.busy = false;
      });
    }
  }

  confirmClear() {
    this.busy = true;
    this.as.getLookups().subscribe(data => {
      this.busy = false;
      this.assignLookUpNames(data)
    }, err => {
      this.busy = false;
    });
    this.orgName = undefined;
  }

  assignLookUpNamesAfterEdit(data) {
    this.lookupList = data;
  }

  assignLookUpNames(data) {
    this.lookupList = data;
    if (data.length > 0) {
      this.selectedindex = data[0].id;
      this.selectedLookup = this.lookupList[0];
      this.busy = true;
      this.as.getLookupValues(this.lookupList[0].id).subscribe(val => {
        this.busy = false;
        this.assignLookUpValues(val)
      }, err => {
        this.busy = false;
      });
    } else {
      this.lookupValues = [];
    }
  }

  assignLookUpValues(val) {
    val.map(d => {
      d.label = d.label.replace("''", "'");
      d.value = d.value.replace("''", "'");
    });
    this.lookupValues = val;
  }

  showLookUpValues(data) {
    this.selectedindex = data.id;
    this.busy = true;
    this.as.getLookupValues(this.selectedindex).subscribe(val => {
      this.busy = false;
      val.map(d => {
        d.label = d.label.replace("''", "'");
        d.value = d.value.replace("''", "'");
      });
      this.lookupValues = val;
    }, err => {
      this.busy = false;
    });
    this.newLookUp = {
      id: undefined,
      label: undefined,
      value: undefined
    };
  }

  setChildren(parent, response, index) {
    let newParent;
    if (!parent.children) {
      parent.children = [];
      parent.children.push({
        label: response[index].headRoleName, data: response[index], expandedIcon: this.roleTreeExpandedIcon,
        collapsedIcon: this.roleTreeCollapsedIcon, leaf: false, expanded: true
      });
      newParent = parent.children[0];
    } else {
      parent.children.map(c => {
        if (c.data.id === response[index].id) {
          c.expanded = true;
          newParent = c;
        }
      });
    }
  }

  save() {
    if (this.lookupValueRowId !== undefined) {
      //this.lookupValues[this.lookupValueRowId].label = this.dat.label;
      //this.lookupValues[this.lookupValueRowId].value = this.dat.value;
      this.dat.id = this.lookupValueRowId; //this.lookupValues[this.lookupValueRowId].id;
    } else {
      this.dat.id = undefined;
      //this.lookupValues.push(this.dat);
    }
    let post = this.selectedLookup;
    post.values = [this.dat];//this.lookupValues;
    this.busy = true;
    this.as.updateLookupValues(post).subscribe(data => {
      this.busy = false;
      this.addSuccess(data), err => this.addFailed()
    }, err => {
      this.busy = false;
    });
    this.showEdit = true;
  }

  clickInput(row, i) {
    let data = _.find(this.lookupValues, function (r) {
      return r.id === row.id;
    });
    this.headerTitle = 'Edit Lookup Values';
    this.dat.label = data.label;
    this.dat.value = data.value;
    this.lookupValueRowId = row.id;
  }

  addSuccess(dat) {
    if (dat === 'Already Exists') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'Lookup Value Already Exist'
      });
      this.lookupValues.pop();
    } else {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Saved Lookup Value Successfully'
      });

      this.showEdit = false;
      this.refresh();
    }
  }

  addFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Save Lookup Value'
    });
    this.showEdit = true;
    this.refresh();
  }

  add() {
    this.dat = new LookupValue();
    this.headerTitle = 'Add Lookup Values';
    this.lookupValueRowId = undefined;
  }

  refresh() {
    this.busy = true;
    this.as.getLookupValues(this.selectedindex).subscribe(val => {
      this.busy = false;
      val.map(d => {
        d.label = d.label.replace("''", "'");
        d.value = d.value.replace("''", "'");
      });
      this.lookupValues = val;
    }, err => {
      this.busy = false;
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  confirmdeleteLookupValue(rowdat) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete?',
      header: 'Delete Confirmation',
      key: 'confirmLookup',
      icon: 'ui-icon-help',
      accept: () => {
        this.deleteLookupValue(rowdat);
      },
      reject: () => {
      }
    });
  }

  confirmdeleteLookup(rowdat) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete this Lookup?',
      header: 'Delete Confirmation',
      key: 'confirmLookup',
      icon: 'ui-icon-help',
      accept: () => {
        this.deleteLookup(rowdat);
      },
      reject: () => {
      }
    });
  }

  deleteLookup(data) {
    this.busy = true;
    this.as.removeLookup(data.id).subscribe(data => {
      this.busy = false;
      this.removelookupsuccess(data)
    }, err => {
      this.busy = false;
      this.removelookupfailed()
    });
  }

  removelookupsuccess(data) {
    if (data === 'Mapping Exists') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Cannot Remove', detail: 'Mapping Exist'
      });
    } else {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Removed Lookup Successfully'
      });
    }
    this.busy = true;
    this.as.getLookups().subscribe(val => {
      this.busy = false;
      this.assignLookUpNamesAfterDelete(val)
    }, err => {
      this.busy = false;
    });
  }

  assignLookUpNamesAfterDelete(data) {
    this.lookupList = data;
    this.lookupValues = [];

  }

  removelookupfailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Remove Lookup Failed'
    });
  }

  deleteLookupValue(rowdat) {
    let deletelookup = this.selectedLookup;
    this.busy = true;
    this.as.removeLookupValue(rowdat.id, deletelookup.id).subscribe(data => {
      this.busy = false;
      this.removesuccess()
    }, err => {
      this.busy = false;
      this.removefailed()
    });
  }

  removesuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Removed Lookup Value'
    });
    this.refresh();
  }

  removefailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed to Remove Lookup Value'
    });
  }

  addEditLookup(row) {
    this.lookup = new Lookup();
    if (row === undefined) {
      this.headerTitleLookup = 'Add Lookup';
      this.lookup.id = 0;
    } else {
      let dat = _.find(this.lookupList, function (r) {
        return r.id === row.id;
      });
      this.headerTitleLookup = 'Edit Lookup';
      this.lookup.id = dat.id;
      this.lookup.name = dat.name;
    }

  }

  saveLookup() {
    this.busy = true;
    this.as.saveLookup(encodeURIComponent(this.lookup.name), this.lookup.id).subscribe(data => {
      this.busy = false;
      this.savelookupsuccess(data)
    }, err => {
      this.busy = false;
      this.savelookupfailed()
    });
  }

  savelookupsuccess(data) {
    if (data === 'Lookup Exists') {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'Lookup Already Exist'
      });
    } else {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Saved Lookup Successfully'
      });
      this.refreshLookupTable();
      if (this.headerTitleLookup === 'Edit Lookup') {
        this.selectedLookup = this.lookup;
        this.as.getLookupValues(this.lookup.id).subscribe(val => {
          val.map(d => {
            d.label = d.label.replace("''", "'");
            d.value = d.value.replace("''", "'");
          });
          this.lookupValues = val;
        });
      }
    }
  }

  savelookupfailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed to Save Lookup'
    });
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
    this.selectedOrgUnit = selected;
    this.busy = true;
    this.as.getLookupsByOrgId(this.selectedOrgUnit.id).subscribe(data => {
      this.busy = false;
      this.assignLookUpNames(data)
    }, err => {
      this.busy = false;
    });
  }

  exportToExcel() {
    this.busy = true;
    this.as.exportLookups().subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'Lookups '+this.coreService.getDateTimeForExport()+'.xlsx';
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }
}
