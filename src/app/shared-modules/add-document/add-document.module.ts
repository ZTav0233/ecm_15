import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {AddDocumentComponent} from '../../components/generic-components/add-document/add-document.component';
// import {
//   ButtonModule,
//   CalendarModule,
//   CheckboxModule,
//   ConfirmDialogModule,
//   DataTableModule,
//   DialogModule,
//   DropdownModule,
//   FileUploadModule,
//   InputTextModule,
//   TooltipModule,
//   TreeModule,
// } from 'primeng/primeng';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTreeModule} from '../tree-module/tree.module';
import {AdminService} from "../../services/admin.service";
import { CgBusyModule } from 'angular-busy2';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
// import { SharedDataTableModule } from '../data-table/data-table.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
@NgModule({
  declarations: [
    AddDocumentComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule, 
    DialogModule,
    ButtonModule, 
    SharedTreeModule,
    InputTextModule,
    CheckboxModule,
    CalendarModule,
    TreeModule,
    TooltipModule,
    // SharedDataTableModule, 
    ConfirmDialogModule,
    CgBusyModule,
    TableModule 
  ],
  providers: [AdminService],
  exports: [AddDocumentComponent]
})
export class SharedAddDocumentModule {}