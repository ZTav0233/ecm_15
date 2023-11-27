import { Component, OnInit, ViewChild } from '@angular/core';
import {AdminService} from "../../../services/admin.service";
import {CoreService} from "../../../services/core.service";
import {BreadcrumbService} from "../../../services/breadcrumb.service";
import {GrowlService} from "../../../services/growl.service";
import * as moment from 'moment';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-ecmdoc-ocrtracker',
  templateUrl: './ecmdoc-ocrtracker.component.html',
  styleUrls: ['./ecmdoc-ocrtracker.component.css']
})
export class EcmdocOcrtrackerComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
 busy: boolean;
 ecmDocOcrList:any;
 selectedRow:any;
 public justificationDialog = false;
 justificationMsg:any;
  constructor(private as: AdminService,private breadcrumbService: BreadcrumbService,private growlService: GrowlService,private coreService: CoreService) { }

  ngOnInit() {
    this.callOCRDetails();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'ECM-OCR Tracker' }
    ]);
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  callOCRDetails(){
    this.busy = true;
     this.as.getDocOCRDetails().subscribe(data => {
      this.busy = false;
      this.assignOCRDetails(data);
    }, err => {
      this.busy = false;
    });
  }
  assignOCRDetails(d){
    d.map(r=>{
     r.createDate2= moment(r.createDate).format('DD/MM/YYYY HH:mm:ss');
      r.modifyDate2= moment(r.modifyDate).format('DD/MM/YYYY HH:mm:ss');
    });
    this.ecmDocOcrList=d;

  }
  cancelJustificationDialog() {
    this.justificationDialog = false;
  }
  assignOcrRow(d){
    this.selectedRow=d;
  }
  addJustification(){
    this.as.updateDocOCRStatus(this.selectedRow.docId,this.justificationMsg).subscribe(data => {
      this.growlService.showGrowl({
      severity: 'info',
      summary: 'Success', detail: 'Updated Successfully'
    });
    this.callOCRDetails();
    },err=>{
      this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: 'Update Failed'
    });
    })
  }
  //  exportToExcel() {
  //   const array = [];
  //   this.colHeaders.map(d => {
  //     array.push(d.field);
  //   });
  //   this.coreService.exportToExcel( this.ecmDocOcrList, 'ECM_Admin_Users '+this.coreService.getDateTimeForExport()+'.xlsx', array)
  // }

}
