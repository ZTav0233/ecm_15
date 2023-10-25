import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// import {BusyModule} from 'angular2-busy';
import {EditApPermissionComponent} from "../../components/generic-components/edit-ap-permission/edit-ap-permission.component";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    EditApPermissionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    DialogModule,
    FileUploadModule, InputTextModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    // BusyModule, 
    TabViewModule, TableModule, TooltipModule, AutoCompleteModule,
  ],
  providers: [],
  exports: [EditApPermissionComponent]
})
export class SharedEditApPermissionModule {
}
