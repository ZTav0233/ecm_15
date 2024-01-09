import { Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import {Subscription} from 'rxjs';
import {ContentService} from "../../../services/content.service";
import {WorkflowService} from '../../../services/workflow.service';
import {UserService} from '../../../services/user.service';
import {GrowlService} from '../../../services/growl.service';
import {CoreService} from '../../../services/core.service';
import {BreadcrumbService} from '../../../services/breadcrumb.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-esign',
  templateUrl: './esign.component.html',
  styleUrls: ['./esign.component.css']
})
export class SignComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private user: any;
  public fullName: any;
  public userName: any;
  public kocId: any;
  public signForm: FormGroup;
  public newDocFormData = new FormData();
  removeEnabled = false;
  uploadedFiles: any;
  public allowedExtensions = ['.png', '.PNG'];
  allowedExtensionsString: any;
  public imageSrc: any;
  public isContractUser: any;
  public isInitialExists: any = "no";

  busy: boolean;

  index: any;
  public folderPermission = { usage: 'addDocument', folderSelected: false, permission: true };
  selectedFolder: any;

  constructor(
    private toastr:ToastrService,
    private wfs: WorkflowService, 
    public userService: UserService, 
    private growlService: GrowlService,
    private fb: FormBuilder,
    private coreService: CoreService, 
    private breadcrumbService: BreadcrumbService, 
    private confirmationService: ConfirmationService,
    private contentService: ContentService) {
    this.user = this.userService.getCurrentUser();
    this.allowedExtensionsString = this.allowedExtensions.join(',');
    this.signForm = fb.group({
      'UserName': [null, Validators.required],
    });
  }

  ngOnInit() {
    this.busy = true;

    this.userService.logIn(this.user.userName,this.user.password).subscribe(data => {
      console.log(data);
      this.fullName = data.fulName;
      this.userName = data.userName;
      this.kocId = data.KocId;
      this.verifyContractUser();      
    }, err => {
      this.busy = false;
    });
  }

  verifyContractUser(){
    this.userService.validateContractUser().subscribe((res) => {
      console.log("validateContractUser :: " + res);
      if(res === "1"){
        this.isContractUser = true;
        this.verifyInitialExists();
      }
      else{
        this.isContractUser = false;
      }
        
      this.busy = false;
    });
  }

  verifyInitialExists(){
    this.busy = true;
    this.userService.verifyInitialExists().subscribe((data) => {
      this.busy = false;
      this.isInitialExists = data;
      if(this.isInitialExists == 'yes'){
        this.previewSign(false);
      }
    }, (err) => {
      this.busy = false;
    });
    this.busy = false;
  }

  docUpload(event) {
      this.onUpload(event);
  }

  onUpload(event) {
    console.log("Doc Event :: " + event.files);
    console.log("Doc Event Length :: " + event.files.length);
    if (event.files && event.files.length) {
        let name = event.files[0].name.toLowerCase(),
          extension = name.substr(name.lastIndexOf('.'));
        if (this.allowedExtensions.indexOf(extension) > -1) {
          this.uploadedFiles = event.files[0];
          console.log("Uploaded Event :: " + this.uploadedFiles);
          console.log(this.uploadedFiles.type);
          const docTitle = this.uploadedFiles.name.split('.').slice(0, -1).join(".");
          console.log("Uploaded File Name :: " + docTitle);
          //this.signForm.get('DocumentTitle').setValue(docTitle);
        }
    }
    else {
      console.log("File is not selected");
    }
  
  }

  addDocument(event) {
    let format='image/png';
    
    this.newDocFormData = new FormData();
    this.newDocFormData.append('document', this.uploadedFiles);
    format= this.uploadedFiles.type;

    if ((Object.keys(this.signForm.controls)) &&
      (Object.keys(this.signForm.controls).length < 1)) {
    } else {
      const docInfo = {
        fullName: this.fullName,
        userName: this.userName,
        kocId: this.kocId
      };

      this.newDocFormData.append('SignInfo', JSON.stringify(docInfo));
      this.busy = true;
      this.userService.addSignImage(this.newDocFormData).subscribe((data) => {
        this.busy = false;
        this.addDocSuccess(data);
      }, (err) => {
        this.busy = false;
        this.addDocFailed();
      });
    }
  }

  addDocSuccess(data) {
    // if (!this.router.url.includes('launch')) {
    //   window.parent.postMessage('AddDocLaunchSuccess', '*');
    // }
    console.log("Sign Upload Status :: " + data);
    if(data=="success"){
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'Signature Image Uploaded'
      // });
      this.toastr.info('Signature Image Uploaded', 'Success');
    }
    else
      this.addDocFailed();
  }

  addDocFailed() {
    
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Upload Failed'
    // });
    this.toastr.error('Upload Failed', 'Failure');

  }


  previewSign(isFromPage: any = false){
    this.busy = true;
    this.userService.getInitialImage().subscribe((data) => {
      this.busy = false;
      this.imageSrc = data;
      if(isFromPage)
        this.reloadApp();
    }, (err) => {
      this.busy = false;
      this.imageSrc = "signImage/sample_sign1.png";
    });
  }

  reloadApp() {
    alert('The page will refresh now, then select setting tab to preview upload image.');
    window.location.reload();
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
    this.destroyKeys();
  }
}