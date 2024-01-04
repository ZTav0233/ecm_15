import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';
// import {
//   ButtonModule, CalendarModule, CheckboxModule, DataTableModule, DropdownModule, InputTextModule,
//   AccordionModule, ConfirmDialogModule, TabViewModule,
//   AutoCompleteModule, SelectButtonModule, DialogModule, TooltipModule, SpinnerModule, DataScrollerModule, TreeModule,
// } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DelegationComponent } from './delegation/delegation.component';
import { ListComponent } from './list/list.component';
import { GeneralComponent } from './general/general.component';
import { WorkflowService } from '../../services/workflow.service';
import { CommonModule } from '@angular/common';
import { SharedUserListModule } from '../../shared-modules/user-list/user-list.module';
import { SharedRoleTreeModule } from "../../shared-modules/role-tree/role-tree.module";
import { CgBusyModule } from 'angular-busy2';
import { SettingRoutingModule } from './settings-routing.module';
import { SharedDataTableModule } from 'src/app/shared-modules/data-table/data-table.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TableModule } from 'primeng/table';
import { SignComponent } from './esign/esign.component';
import { FileUploadModule } from 'primeng/fileupload';
//import {ContentService} from "../../services/content.service";

@NgModule({
  declarations: [
    SettingsComponent,
    DelegationComponent,
    ListComponent,
    GeneralComponent,
    SignComponent
  ],
  imports: [
    CommonModule,
    SharedDataTableModule, ConfirmDialogModule, TabViewModule, TooltipModule,
    DropdownModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    CalendarModule,
    AccordionModule, AutoCompleteModule, SelectButtonModule, DialogModule,
    SharedUserListModule,
    SharedRoleTreeModule,
    TreeModule,
    CgBusyModule,
    SettingRoutingModule,
    TableModule,
    ReactiveFormsModule,
    FileUploadModule
  ],
  providers: [
    //WorkflowService
    //,ContentService
  ],
})
export class SettingsModule {
}
