import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-document-status',
  templateUrl: './document-status.component.html'
})
export class DocumentStatusComponent {
  @Input() public workitemProgress:any[];
  @Input() public showAddBtn=true;
  @Output() public onRemoveProgress=new EventEmitter();
  @Output() public onAddProgress=new EventEmitter();
  addFormVisible=false;
  @Input() public progressObj:any={};

  addProgress(){
    this.addFormVisible=false;
    this.onAddProgress.emit(this.progressObj);
  }

  removeProgress(id){
    this.onRemoveProgress.emit(id);
  }

  closeAddForm(){
    this.progressObj={};
    this.addFormVisible=false;
  }
}


