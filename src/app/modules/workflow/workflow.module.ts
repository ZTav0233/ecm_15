import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
// import { WorkflowRoute } from './workflow-routing.module';
// import {
//   AccordionModule, AutoCompleteModule,
//   ButtonModule, CalendarModule,
//   ConfirmDialogModule, DataTableModule, DialogModule,
//   DropdownModule, FileUploadModule,
//   InputTextareaModule, InputTextModule, MenubarModule, MultiSelectModule, OrderListModule,
//   OverlayPanelModule, PanelModule, SelectButtonModule, SplitButtonModule, StepsModule, TabViewModule,
//   TooltipModule, CheckboxModule, InputSwitchModule, ConfirmationService, SpinnerModule, RadioButtonModule, TreeModule,
// } from 'primeng/primeng';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowComponent } from './workflow.component';
import { DraftComponent } from './drafts/draft.component';
import { LaunchComponent } from './launch/launch.component';
import { SentComponent } from './sent/sent.component';
import { InboxComponent } from './inbox/inbox.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { ActionButtonComponent } from '../../components/generic-components/action-button/action-button.component';
import { FilterComponent } from '../../components/generic-components/filter/filter.component';
import { AdminService } from '../../services/admin.service';
import { ConfigurationService } from '../../services/configuration.service';
import { ArchiveComponent } from './archive/archive.component';
import { SharedAddDocumentModule } from '../../shared-modules/add-document/add-document.module';
import { SharedSearchDocumentModule } from '../../shared-modules/search-document/search-document.module';
import { SharedDocumentCartModule } from '../../shared-modules/document-cart/document-cart.module';
import { SharedRecipientsModule } from '../../shared-modules/recipients/recipients.module';
import { SharedUserListModule } from '../../shared-modules/user-list/user-list.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { APP_BASE_HREF } from '@angular/common';
import { SharedDocumentStatusModule } from '../../shared-modules/document-status/document-status.module';
import { FilterResultComponent } from './filter-result/filter-result.component';
import { SharedHTMLPipeModule } from "../../shared-modules/safe-html-pipe/safe-html-pipe";
import { SharedUpdateDocumentModule } from "../../shared-modules/update-document/update-document.module";
import { InboxNewComponent } from "./inbox-new/inbox-new.component";
import { SharedDetailsModalModule } from "../../shared-modules/details-modal/details-modal.module";
import { SharedRoleTreeModule } from "../../shared-modules/role-tree/role-tree.module";
import { SharedBrowseModule } from "../../shared-modules/shared-browse/shared-browse.module";
import { SharedRoleListModule } from "../../shared-modules/role-list/role-list.module";
import { CgBusyModule } from 'angular-busy2';
import { MemoComponent } from './memo/memo.component';
import { SharedUserModule } from '../../shared-modules/user/user.module';
import { SharedRecipientsMemoModule } from '../../shared-modules/recipients-memo/recipients-memo.module';
import { SharedExpandableListModule } from '../../shared-modules/expandable/expandable.module';
import { DataService } from '../../services/data.Service';
import { CKEditorModule } from 'ckeditor4-angular';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { OrderListModule } from 'primeng/orderlist';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TreeModule } from 'primeng/tree';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { WorkflowRoutingModule } from './workflow-routing.module';
// import { DataTableComponent } from 'src/app/components/generic-components/datatable/datatable.component';
// import { SharedRecipientsMemoModule } from '../../shared-modules/recipients-memo/recipients-memo.module';
import { TableModule } from 'primeng/table';
import { SharedDataTableModule } from 'src/app/shared-modules/data-table/data-table.module';

@NgModule({
  declarations: [
    WorkflowComponent,
    DraftComponent,
    LaunchComponent,
    SentComponent,
    InboxComponent,
    InboxNewComponent,
    ActionButtonComponent,
    FilterComponent,
    TaskDetailComponent,
    ArchiveComponent,
    FilterResultComponent,
    MemoComponent,
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CgBusyModule,
    WorkflowRoutingModule,
    HttpClientModule,
    AccordionModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    OrderListModule,
    OverlayPanelModule,
    PanelModule,
    StepsModule,
    TabViewModule,
    TooltipModule,
    MatTabsModule,
    ConfirmDialogModule,
    SharedAddDocumentModule,
    SharedSearchDocumentModule,
    SharedDocumentCartModule,
    SharedRecipientsModule,
    SharedRecipientsMemoModule,
    SharedExpandableListModule,
    SharedUserListModule,
    SharedUserModule,
    SharedDocumentStatusModule,
    SelectButtonModule,
    MatSelectModule,
    MenubarModule,
    DialogModule,
    FileUploadModule,
    SplitButtonModule,
    MultiSelectModule,
    SharedDetailsModalModule,
    SharedHTMLPipeModule,
    CheckboxModule,
    InputSwitchModule,
    TreeModule,
    SharedUpdateDocumentModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    SharedRoleTreeModule,
    SharedRecipientsModule,
    SharedBrowseModule,
    SharedRoleListModule,
    CKEditorModule,
    TableModule,
    SharedDataTableModule
  ],
  providers: [
    DataService,
    AdminService,
    ConfigurationService, { provide: APP_BASE_HREF, useValue: '/' }
  ]
})
export class WorkflowModule { }
