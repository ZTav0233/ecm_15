import { Component, DoCheck, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { LazyLoadEvent } from "primeng/api";
import { Table } from 'primeng/table';

import { AdminService } from "../../../services/admin.service";
import * as global from "../../../global.variables";
import { ConfigurationService } from '../../../services/configuration.service';
@Component({
  selector: 'app-update-document',
  templateUrl: './update-document.component.html'
})
export class UpdateDocumentComponent implements OnInit, DoCheck {
  @Input() public docEditPropForm: any;
  @Input() public docTemplateDetails: any;
  @Input() public fileUploaded: any;
  @Input() public fileselected: any;
  @Input() public entryTemp: any;
  @Output() public fileChanged = new EventEmitter();
  public allowedExtensions = ['.msg', '.csv', '.pdf', '.doc', '.zip', '.docx', '.xls', '.xlsx', '.msg', '.ppt', '.pptx', '.dib', '.webp',
    '.jpeg', '.svgz', '.gif', '.jpg', '.ico', '.png', '.svg', '.tif', '.xbm', '.bmp', '.jfif', '.pjpeg', '.pjp', '.tiff', '.txt'];
  public allowedExtensionsString;
  public busy: boolean;
  docToOrFrom: any;
  designation: any;
  selectedDesignation: any;
  et_dependent_lookup: any;
  totalRecords: number;
  datasource: any;
  showDesignation = false;
  @ViewChild('gb') searchInput: ElementRef;
  @ViewChild('dt') namelist:any;
  fileSizeConfiguration:any;
  public excepClassNames = global.excep_class_names;
  public isFileSizeCorrect:boolean = true
  constructor(private as: AdminService, private configService: ConfigurationService) {
    this.allowedExtensionsString = this.allowedExtensions.join(',') + this.allowedExtensions.join(',').toUpperCase();
    this.et_dependent_lookup = global.et_dependent_lookup;
  }

  ngOnInit() {
     let desigData;
     if(this.as.designationValues && this.as.designationValues.length<=0){
       //AKV-getDesignationValues
        this.as.getDesignationData().subscribe(data => {
        this.as.designationValues=data;
        this.as.designationValues.unshift({ id: "", value: null, action: "" });
        this.assignDesignationData(this.as.designationValues);
    },err=>{
         console.log(err);
       });
    }
    else{
       desigData = this.as.designationValues;
       this.assignDesignationData(desigData);
     }
     this.getConfigurationValue();
    //let desigData = JSON.parse(localStorage.getItem('designationJSON'));
  }

  getConfigurationValue(){
    this.configService.getAppConfigurationValue('MAXFILESIZE').subscribe(config => {
      this.fileSizeConfiguration = JSON.parse(config)
      // console.log(this.fileSizeConfiguration)
     
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

  ngDoCheck() {
    // this.docTemplateDetails.props.forEach(control => {
    //   if ((this.docTemplateDetails.name.toLowerCase() !== 'ap contracts payments') && control.symName === 'DocumentFrom' && control.hidden === 'false') {
    //     // this.docEditPropForm.get('DocumentFrom').disable();
    //   }
    //   if ((this.docTemplateDetails.name.toLowerCase() !== 'ap contracts payments') && control.symName === 'DocumentTo' && control.hidden === 'false') {
    //     // this.docEditPropForm.get('DocumentTo').disable();
    //   }
    // });
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
    this.namelist.onFilterKeyup('', 'data', 'contains');
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
    if (input === 'Document To') {
      this.docEditPropForm.get('DocumentTo').setValue(val.data.value);
    }
    else {
      this.docEditPropForm.get('DocumentFrom').setValue(val.data.value);
    }
  }

//   bytesToSize(bytes:any) {
//     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//     if (bytes == 0) return '0 Byte';
//     let i:any = Math.floor(Math.log(bytes) / Math.log(1024));
//     return Math.round(bytes / Math.pow(1024, i))  + ' ' + sizes[i];;
//  }

  onUpload(event) {

    if (event.files && event.files.length) {
      let fileSize = event.files[0].size;
      if (fileSize <= Number(this.fileSizeConfiguration.value)){
        this.isFileSizeCorrect = true
        let name = event.files[0].name.toLowerCase(),
        extension = name.substr(name.lastIndexOf('.'));
      if (this.allowedExtensions.indexOf(extension) > -1) {
        this.fileUploaded = event.files[0];
        if (this.fileUploaded !== undefined && this.entryTemp) {
          this.fileselected = true;
          this.fileChanged.emit({ fileselected: true, fileUploaded: this.fileUploaded })
        } else {
          this.fileselected = false;
          this.fileChanged.emit({ fileselected: false, fileUploaded: null })
        }
      }
    }
      else {
        this.isFileSizeCorrect = false
        console.log("Maximum File size allowed 800 MB!");
      }
    }
    else {
      console.log("File is not selected");
    }
  }

  removeSelectedFile() {
    this.fileselected = false;
    this.fileUploaded = undefined;
    this.fileChanged.emit({ fileselected: false, fileUploaded: null })
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

  assignDependentLookup(detail) {
    //debugger;
    
    if (this.et_dependent_lookup && this.et_dependent_lookup.indexOf(',') != -1) {
      let etdls = this.et_dependent_lookup.split(',');
      for (let i = 0; i < etdls.length; i++) {
        let et_dep_lkup = etdls[i];
        
        if (et_dep_lkup && et_dep_lkup.indexOf(':') != -1) {
          let etdeplkupVals= et_dep_lkup.split(':');

          if ((etdeplkupVals[0] != "" && detail.name.trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
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
        
        if ((etdeplkupVals[0] != "" && detail.name.trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
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
    if (this.et_dependent_lookup.trim().toUpperCase().indexOf(d.name.trim().toUpperCase()) != -1)
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
