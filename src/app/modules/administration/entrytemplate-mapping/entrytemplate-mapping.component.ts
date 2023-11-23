import { AdminService } from '../../../services/admin.service';
import { ContentService } from '../../../services/content.service';
import { GrowlService } from '../../../services/growl.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { CoreService } from '../../../services/core.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-entrytemplate-mapping',
  templateUrl: './entrytemplate-mapping.component.html',
  styleUrls: ['./entrytemplate-mapping.component.css']
})
export class EntrytemplateMappingComponent implements OnInit {
  entryTemp: any;
  selectedEntryTemplate: any;
  public orgCodes: any[];
  mappedList: any[];
  mappedListTemp: any[];
  selectedorgCode: any;
  isvisible = true;
  searchOrgText: any;
  private subscriptions: any[] = [];
  public deleteETView: boolean = false;
  busy: boolean;

  constructor(
    private cs: ContentService,
    private coreService: CoreService,
    private adminService: AdminService,
    private growlService: GrowlService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.busy = true;
    this.cs.getAllEntryTemplates().subscribe(data => {
      this.busy = false;
      this.assignEntrytemplate(data)
    }, err => {
      this.busy = false;
    });
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Entry Template Mapping' }
    ]);
  }

  getAnyOrg() {
    this.adminService.searchOrgUnits('Any').subscribe(res => {
      this.selectedorgCode = res[0];
    }, err => {
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  searchMappedOrg(event) {
    //if(event.target.value.length>=1) {
    this.mappedList = this.mappedListTemp.filter(e => {
      if (e.desc && e.orgCode) {
         e.desc.toUpperCase().indexOf(event.target.value.toString().toUpperCase()) !== -1 || e.orgCode.toUpperCase().indexOf(event.target.value.toUpperCase()) !== -1;
      }
    });
    // }
  }

  assignEntrytemplate(data) {
    this.entryTemp = data;
    if (this.entryTemp.length > 0) {
      this.selectedEntryTemplate = this.entryTemp[0];
      if (this.selectedEntryTemplate.name !== 'Correspondence') {
        this.getAnyOrg();
      }
      this.busy = true;
      this.adminService.getOrgUnitsByEntryTemplate(data[0].vsid).subscribe(val => {
        this.busy = false;
        this.assignMappedIds(val)
      }, err => {
        this.busy = false;
      });
    }
  }

  showTemplateMapping(data) {
    this.selectedorgCode = undefined;
    this.searchOrgText = undefined;
    this.isvisible= true;
    if(data.isVisible === 'No' || data.isVisible === 'NO') 
      this.isvisible= false;

    if (data.name !== 'Correspondence') {
      this.getAnyOrg();
    }
    this.busy = true;
    this.adminService.getOrgUnitsByEntryTemplate(data.vsid).subscribe(val => {
      this.busy = false;
      this.assignMappedIds(val)
    }, err => {
      this.busy = false;
    });
  }

  getOrgCodes(event) {
    this.adminService.searchOrgUnits(event.query).subscribe(res => {
      res.map((d, i) => {
        if (d.orgCode === 'ANY') {
          res.splice(i, 1)
        }
      });
      this.orgCodes = res;
    }, err => {
    });
  }

  assignMappedIds(data) {
    this.mappedList = data;
    this.mappedListTemp = data;
  }

  mapEntryTemplate() {
    let isExist = false;
    this.mappedList.map((d, i) => {
      if (d.id === this.selectedorgCode.id) {
        isExist = true;
      }
    });
    if (isExist) {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Already Exist', detail: 'Mapping Already Exist'
      });
    }
    else {
      this.adminService.addEntryTemplateMapping(this.selectedorgCode.id, this.selectedEntryTemplate.id, this.isvisible, this.selectedEntryTemplate.vsid).subscribe(data => this.mapSuccess(), err => this.mapFailed());
    }
  }

  mapSuccess() {
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Mapped To Entry Template'
    });
    if (this.selectedEntryTemplate.name !== 'Correspondence') {
      this.getAnyOrg();
    }
    else {
      this.selectedorgCode = undefined;
    }
    this.adminService.getOrgUnitsByEntryTemplate(this.selectedEntryTemplate.vsid).subscribe(val => this.assignMappedIds(val));
  }

  mapFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Failed To Map To Entry Template'
    });
  }

  removeMapping(dat) {
    this.adminService.removeEntryTemplateMapping(dat.id, this.selectedEntryTemplate.vsid).subscribe(data => this.removeSuccess(), err => this.removeFailed());
  }

  removeSuccess() {
    this.searchOrgText = undefined;
    this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Removed From Mapping'
    });
    this.adminService.getOrgUnitsByEntryTemplate(this.selectedEntryTemplate.vsid).subscribe(val => this.assignMappedIds(val));
  }

  removeFailed() {
    this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Fail To Remove From Mapping'
    });
  }

  confirm(event) {
    this.confirmationService.confirm({
      header: 'Remove Mapping?',
      key: 'removeMapping',
      message: 'Are you sure that you want to remove' + ' ' + event.desc + ' ' + 'from Mapping?',
      accept: () => {
        //Actual logic to perform a confirmation
        this.removeMapping(event);
      }, reject: () => {
        //this.searchOrgText=undefined;
        // this.adminService.getOrgUnitsByEntryTemplate(this.selectedEntryTemplate.vsid).subscribe(val => this.assignMappedIds(val));
      }
    });
  }

  checkInvisible(event) {
    //console.log('mapET -' + event);
    this.isvisible = event;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  exportToExcel() {
    this.busy = true;
    this.cs.exportEntryTemplates().subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'EntryTemplate Mappings '+this.coreService.getDateTimeForExport()+'.xlsx';
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  confirmDeleteET(event) {
    this.confirmationService.confirm({
      header: 'Delete Confirmation?',
      key: 'removeMapping',
      message: 'Are you sure that you want to Delete' + ' ' + event.name + '?',
      accept: () => {
        this.deleteET(event);
      }, reject: () => {
      }
    });
  }


  deleteET(template) {
    this.busy = true;
    this.adminService.deleteEntryTemplate(template.id, template.vsid).subscribe(res => {
      this.busy = false;
      if (res && res === 'OK') {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Deleted Successfully'
        });
      } else if (res && res.toLowerCase() === 'docexists') {
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Failure', detail: 'Cant Delete Entry Template, Document Exists.'
        });
      }
      this.ngOnInit();
    }, error => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'User Has No Permission to Delete'
      });
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }
}
