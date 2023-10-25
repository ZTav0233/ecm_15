import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AdminService} from "../../../services/admin.service";
import {BrowserEvents} from "../../../services/browser-events.service";
import {Router} from "@angular/router";
import * as _ from "lodash";

@Component({
  selector: 'app-edit-ap-permission',
  templateUrl: './edit-ap-permission.component.html',
  styleUrls: ['./edit-ap-permission.component.css']
})
export class EditApPermissionComponent implements OnInit {
  @Input() public selectedPolicy;
  @Input() public newPermissions;
  @Input() public screen;
  @Output() pc = new EventEmitter();
  @Output() removeP = new EventEmitter();
  @Output() addP = new EventEmitter();
  @Output() getGS = new EventEmitter();
  @Output() removeNP = new EventEmitter();
  @Output() addNP = new EventEmitter();
  @Output() accessTC = new EventEmitter();
  @Output() isSaveDisabled = new EventEmitter();
  @Input() public isFullAccess;
  isAdmin = true;
  busy: boolean;
  public suggestionsResults: any[] = [];
  granteeTypes = [{label: 'USER', value: 'USER'}, {label: 'GROUP', value: 'GROUP'}];
  public accessLevels = [{label: 'Full Control', value: 'Full Control'},
    {label: 'Owner', value: 'Owner'},
    {label: 'Author', value: 'Author'},
    {label: 'Viewer', value: 'Viewer'},
  ];
  public accessLevelsArray;
  public accessType = [{label: 'Allow', value: 'ALLOW'}, {label: 'Deny', value: 'DENY'}];
  public accessPolicyType = [{label: 'Default', value: 'DEFAULT'}, {
    label: 'OrgCode',
    value: 'ORGCODE'
  }, {label: 'Permission', value: 'PERMISSION'}];
  public tempNew:any;
  public selectedorgcode:any;
  public searchquery:any;
  constructor(private bs: BrowserEvents, private router: Router,private as: AdminService) {
    this.accessLevelsArray = [];
  }

  onClickPerm(i, perm) {
    if (!(this.router.url.includes('administration'))) {
      this.isAdmin=false;
      if (perm.accessLevel === "Viewer" || perm.accessLevel === "Author" || perm.accessLevel === "Owner") {
        this.accessLevelsArray[i] = [
          {label: 'Owner', value: 'Owner'},
          {label: 'Author', value: 'Author'},
          {label: 'Viewer', value: 'Viewer'},
        ];
      }
      else {
        this.accessLevelsArray[i] = [
          {label: 'Full Control', value: 'Full Control'},
          {label: 'Owner', value: 'Owner'},
          {label: 'Author', value: 'Author'},
          {label: 'Viewer', value: 'Viewer'}
        ];
      }
    }
  }

  ngOnInit() {
    this.as.searchOrgUnits(this.selectedPolicy.orgCode).subscribe(data => {
      this.selectedorgcode=data[0];
    }, err => {
      this.busy = false;
    });
    this.bs.openEditSecurityModel.subscribe(data => {
      if (!(this.router.url.includes('administration'))) {
        this.isAdmin=false;
        if (data.action === 'open') {
          this.accessLevels = [{label: 'Full Control', value: 'Full Control'},
            {label: 'Owner', value: 'Owner'},
            {label: 'Author', value: 'Author'},
            {label: 'Viewer', value: 'Viewer'}
          ];
        }
        else if (data.action === 'add') {
          if (this.isFullAccess === undefined) {
            this.isFullAccess = data.isFullAccess;
          }
          this.validateForFullPermission();
        }
      }
    });
    this.bs.isFullAccessForDoc.subscribe(data => {
      if (!(this.router.url.includes('administration'))) {
        this.isAdmin=false;
        data.map((d, i) => {
          if (d.accessLevel === "Viewer" || d.accessLevel === "Author" || d.accessLevel === "Owner") {
            this.accessLevelsArray[i] = [
              {label: 'Owner', value: 'Owner'},
              {label: 'Author', value: 'Author'},
              {label: 'Viewer', value: 'Viewer'},
            ];
          }
          else {
            this.accessLevelsArray[i] = [
              {label: 'Full Control', value: 'Full Control'},
              {label: 'Owner', value: 'Owner'},
              {label: 'Author', value: 'Author'},
              {label: 'Viewer', value: 'Viewer'},
            ];
          }
        });
      }
    })

  }

  ngOnChanges() {

  }

  enableSaveButtonValidation(){
    let tem=false;
    if( this.newPermissions){
       this.newPermissions.map(d=> {
         if(d.Isexist){
           tem=true;
         }
         this.isSaveDisabled.emit(tem);
       });

    }
  }

  validateForFullPermission() {
    if (!this.isFullAccess) {
      let obj = {label: 'Full Control', value: 'Full Control'};
      let exist = false;
      let index = 0;
      this.accessLevels.map((d, i) => {
        if (d.value === 'Full Control') {
          exist = true;
          index = i;
        }
      });
      if (exist) {
        this.accessLevels.splice(index, 1)
      }
      else if (!exist && this.isFullAccess) {
        this.accessLevels.push(obj)
      }
    }
  }

  rowStyleMapFn(row, index):any {
    if (row.action === 'REMOVE') {
      return 'removed-row';
    }
  }

  accessTypeChanged(permission) {
    this.accessTC.emit(permission);
    this.isSaveDisabled.emit(false);
  }

  permissionChanged(permission) {
    this.pc.emit(permission);
    this.isSaveDisabled.emit(false);
  }

  removePermission(permission) {
    this.removeP.emit(permission);
    this.isSaveDisabled.emit(false);
  }

  addPermission(permission) {
    this.addP.emit(permission);
    this.tempNew=this.newPermissions;
    this.isSaveDisabled.emit(false);
  }

  getGranteesSuggestion(event, newPermission) {
    this.getGS.emit({event: event, np: newPermission});
  }

  onGranteeTypeChange(permission) {
    permission.granteeName = undefined;
    this.isSaveDisabled.emit(false);
  }

  removeNewPermission(permission) {
    this.removeNP.emit(permission);
      if(this.newPermissions && this.newPermissions.length>0){
       let exist=false;
       this.newPermissions.map((d,i)=>{
       if(!(d.Isexist)){
        exist=true;
       }
     });
       this.isSaveDisabled.emit(!exist);
    }
    else{
       this.isSaveDisabled.emit(true);
    }

  }

  addNewPermission() {
    this.addNP.emit();
  }
  selectParticipant(e,newperm){
    if((this.getDuplicateItemCount(newperm) && this.getDuplicateItemCount(newperm).length > 1) ||
      ( this.getDuplicateItemCountExisting(newperm) && this.getDuplicateItemCountExisting(newperm).length > 1 )){
      newperm.Isexist=true;
    }
    else {
      newperm.Isexist=false;
    }
     if(this.newPermissions && this.newPermissions.length>0){
       let exist=false;
       this.newPermissions.map((d,i)=>{
       if(!(d.Isexist)){
        exist=true;
       }
     });
       this.isSaveDisabled.emit(!exist);
    }
    else{
       this.isSaveDisabled.emit(true);
    }
    //this.isSaveDisabled.emit(newperm.Isexist);

  }

  getDuplicateItemCount(newperm){
    return _.filter(this.newPermissions, function(d) {
      return d.granteeName.login===newperm.granteeName.login });
  }
  getDuplicateItemCountExisting(newperm){
    let perm = _.cloneDeep(this.selectedPolicy.permissions);
    let allPerm = _.concat(perm, [newperm]);
    var filtered = _.filter(allPerm,function(d) {
      return (typeof(d.granteeName) === "string" && d.granteeName.indexOf("@") !== -1 && d.granteeName.split("@")[0] === newperm.granteeName.login || d.granteeName.login===newperm.granteeName.login) });
    return filtered
  }
  // changeOrg(event){
  //   console.log(event);
  //  // this.searchquery="";
  //   //this.searchquery='clear';
  // }
  search(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.suggestionsResults = data;
    }, err => {
      this.busy = false;
    });

  }
   orgUnitSelected(selected,selectedPolicy) {
    selectedPolicy.orgCode =selected.orgCode;
    selectedPolicy.orgUnitId=selected.id;
  }

}
