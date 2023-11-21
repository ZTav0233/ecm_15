import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { GrowlService } from "../../../services/growl.service";
import { DocumentService } from "../../../services/document.service";
import { Subscription } from "rxjs";
import { ContentService } from "../../../services/content.service";
import { DocumentInfoModel } from "../../../models/document/document-info.model";
import { EntryTemplateDetails } from "../../../models/document/entry-template-details.model";
import { ActivatedRoute } from "@angular/router";
import { ConfigurationService } from '../../../services/configuration.service';

@Component({
  selector: 'app-update-document-page',
  templateUrl: './update-document.component.html',
  styleUrls: ['./update-document.component.css']
})
export class UpdateDocumentComponent implements OnInit {
  public busy: boolean;
  private subscription: Subscription[] = [];
  public fileUploaded: any = undefined;
  private updateddDocuments = new FormData();
  public fileselected = false;
  public entryTemp = false;
  public saveDocInfo = new DocumentInfoModel();
  public docTemplateDetails = new EntryTemplateDetails();
  public docEditPropForm: FormGroup;
  private errorJson: any;
  public editAttachment = false;
  public isFileSizeCorrect:boolean = true
  constructor(private ds: DocumentService, private growlService: GrowlService, private cs: ContentService, private route: ActivatedRoute,
    private configService: ConfigurationService) {
    this.docEditPropForm = new FormGroup({
      DocumentTitle: new FormControl(null, [Validators.required, this.noWhitespaceValidator])
    });
    this.route.paramMap.subscribe((params: any) => {
      this.openEditDoc(params.params.docId);
    });
  }

  ngOnInit() { 
    this.getConfigurationValue();
  }
  getConfigurationValue(){
    this.configService.getAppConfigurationValue('MAXFILESIZE').subscribe(config => {
      console.log(config)
     
    }, err => {
      this.busy = false;
    });
  }

  openEditDoc(doc) {
    this.busy = true;
    this.ds.getDocument(doc).subscribe(data => {
      this.busy = false;
      this.fileUploaded = undefined;
      if (data.entryTemplate) {
        this.assignFieldsForEditDoc(data);
      } else {
        this.entryTemp = false;
        window.parent.postMessage({ v1: "closeUpdateDocDialog", v2: 'Failure', v3: "This document dosen't have entry template information" }, '*');
      }
    }, err => {
      this.busy = false;
      if (err.statusText === 'OK') {
        /*this.growlService.showGrowl({
          severity: 'error',
          summary: 'Invalid Document', detail: 'This document is either deleted or you dont have permission'
        });*/
        window.parent.postMessage({ v1: 'closeUpdateDocDialog', v2: 'Failure', v3: "This document is either deleted or you don't have permission" }, '*');
      }
    });
  }

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
          if (control.symName === 'ECMNo')
            this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.required, Validators.maxLength(15), this.noWhitespaceValidator]));
          if (control.dtype === 'DATE') {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, Validators.required));
          } else {
            this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.required, this.noWhitespaceValidator]));
          }
        } else if (control.symName === 'ECMNo') {
          this.docEditPropForm.addControl(control.symName, new FormControl(null, [Validators.maxLength(15), this.noWhitespaceValidator]));
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
        } else if(prop.ltype === 2 && prop.mvalues[0] !== null) {
               if(prop.lookups) {
                 prop.lookups.map((d, i) => {
                   if (prop.mvalues[0]===d.label){
                     this.docEditPropForm.get(prop.symName).setValue(d.value);
                   }
                 });
               }
        } else {
          this.docEditPropForm.get(prop.symName).setValue(prop.mvalues[0]);
        }
        // }
      }
    }, Error => {
      this.busy = false;
      window.parent.postMessage({ v1: "closeUpdateDocDialog", v2: 'Failure', v3: "Failed to load entry template" }, '*');
    });
    this.editAttachment = true;
  }

  updatedDocument() {
    this.updateddDocuments = new FormData();
    this.updateddDocuments.append('document', this.fileUploaded);
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
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          prop.mvalues = [this.getFormatedDate(this.docEditPropForm.get(prop.symName).value)];
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
    this.ds.checkIn(this.updateddDocuments).subscribe(data1 => {
      this.busy = false;
      this.updateSuccess(data1)
    }, Error => {
      this.busy = false;
      this.updateDocCheckInFailed(Error)
    });
  }

  updateSuccess(data) {
    if (data) {
      /*this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Updated Successfully'
      });*/
      this.closeEditAttModal('Success', 'Document Updated Successfully');
    } else {
      this.updateFailed('error');
    }
    this.fileselected = false;
    this.ngOnInit();
  }

  updateFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    /*this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: this.errorJson
    });*/
    window.parent.postMessage({ v1: 'closeUpdateDocDialog', v2: 'Failure', v3: this.errorJson }, '*');
  }

  updateDocCheckInFailed(error) {
    this.errorJson = JSON.parse(error.error).responseMessage;
    /*this.growlService.showGrowl({
      severity: 'error',
      summary: 'Failure', detail: this.errorJson
    });*/
    window.parent.postMessage({ v1: 'closeUpdateDocDialog', v2: 'Failure', v3: this.errorJson }, '*');
    this.ds.cancelCheckOut(this.saveDocInfo.id).subscribe();
  }

  updateProperty() {
    for (const prop of this.saveDocInfo.props) {
      if (prop.dtype === 'DATE') {
        if (this.docEditPropForm.get(prop.symName).value !== null) {
          prop.mvalues = [this.getFormatedDate(this.docEditPropForm.get(prop.symName).value)];
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

  fileChanged(event) {
    this.fileselected = event.fileselected;
    this.fileUploaded = event.fileUploaded;
  }

  noWhitespaceValidator(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  closeEditAttModal(status?, msg?) {
    window.parent.postMessage({ v1: 'closeUpdateDocDialog', v2: status, v3: msg }, '*');
    this.editAttachment = false;
    this.docEditPropForm.reset();
    this.saveDocInfo = null;
    this.fileselected = false;
    this.entryTemp = false;
    this.fileUploaded = undefined;
    this.updateddDocuments = new FormData();
  }

  cancel() {
    this.closeEditAttModal('close');
  }

  ngOnDestroy() {
    for (let subs of this.subscription) {
      subs.unsubscribe();
    }
    this.editAttachment = false;
    this.subscription = null;
    this.docEditPropForm.reset();
    this.saveDocInfo = null;
    this.fileselected = false;
    this.entryTemp = false;
    this.fileUploaded = undefined;
    this.updateddDocuments = new FormData();
  }

}
