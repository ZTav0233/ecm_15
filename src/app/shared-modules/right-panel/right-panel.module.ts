import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RightpanelComponent } from '../../components/generic-components/rightpanel/rightpanel.component';
import { SharedTreeModule } from '../tree-module/tree.module';
import { AccessPolicyService } from '../../services/access-policy.service';
import { CgBusyModule } from 'angular-busy2';
import { SharedEditApPermissionModule } from "../edit-ap-permission/edit-ap-permission.module";
import { AdminService } from "../../services/admin.service";
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    RightpanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule,
    FileUploadModule, InputTextModule, TreeModule,
    CalendarModule,
    DropdownModule,
    SharedTreeModule,
    InputTextModule,
    CgBusyModule,
    SharedEditApPermissionModule, TooltipModule, TableModule
  ],
  providers: [AccessPolicyService, AdminService],
  exports: [RightpanelComponent]
})
export class SharedRightPanelModule {
}