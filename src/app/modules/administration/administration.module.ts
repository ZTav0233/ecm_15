import { AdminService } from '../../services/admin.service';
import { NewsService } from '../../services/news.service';
import { NgModule } from '@angular/core';
import { AdministrationComponent } from './administration.component';
// import {
//   ButtonModule, CalendarModule, CheckboxModule, DataTableModule, DropdownModule, InputTextModule,
//   DialogModule,
//   ConfirmDialogModule, InputTextareaModule,
//   TabViewModule, SpinnerModule,
//   AutoCompleteModule, PanelModule, EditorModule, AccordionModule, SelectButtonModule, TooltipModule, RadioButtonModule,
//   InputSwitchModule, ListboxModule, DataScrollerModule, OrderListModule, MessagesModule, TreeModule, ProgressBarModule,
//   InputMaskModule, OverlayPanelModule
// } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { AdministrationRoute } from './administration.routes';
//import {ContentService} from '../../services/content.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AccessPolicyService } from '../../services/access-policy.service';
import { SharedRoleTreeModule } from '../../shared-modules/role-tree/role-tree.module';
import { SharedUserListModule } from '../../shared-modules/user-list/user-list.module';
import { AccesspolicyComponent } from './accesspolicy/accesspolicy.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { LookupmappingComponent } from './lookupmapping/lookupmapping.component';
import { LookupsComponent } from './lookups/lookups.component';
import { NewsComponent } from './news/news.component';
import { RolemanagementComponent } from './rolemanagement/rolemanagement.component';
import { EntrytemplateMappingComponent } from './entrytemplate-mapping/entrytemplate-mapping.component';
import { AccessPolicyMappingComponent } from './accesspolicy-mapping/accesspolicy-mapping.component';
import { IntegrationComponent } from './integration/integration.component';
import { CgBusyModule } from 'angular-busy2';
import { ErrorlogManagementComponent } from './errorlog-management/errorlog-management.component';
import { EcmUsersComponent } from './ecm-users/ecm-users.component';
import { SharedHTMLPipeModule } from '../../shared-modules/safe-html-pipe/safe-html-pipe';
import { EcmReportUserComponent } from './ecm-report-user/ecm-report-user.component';
import { EcmAdminUsersComponent } from './ecm-admin-users/ecm-admin-users.component';
import { SharedRoleListModule } from "../../shared-modules/role-list/role-list.module";
import { SharedEditApPermissionModule } from "../../shared-modules/edit-ap-permission/edit-ap-permission.module";
import { EcmGlobalListComponent } from './ecm-global-list/ecm-global-list.component';
// import { SplitPaneModule } from "ng2-split-pane/lib/ng2-split-pane";
import { EcmAdminLogsComponent } from './ecm-admin-logs/ecm-admin-logs.component';
import { EcmExcludeUsersComponent } from './ecm-exclude-users/ecm-exclude-users.component';
import { EcmOrgUnitManagementComponent } from './ecm-org-unit-management/ecm-org-unit-management.component';
import { ManageAccesspolicyComponent } from './manage-accesspolicy/manage-accesspolicy.component';
import { SecurityToolComponent } from './security-tool/security-tool.component';
import { SharedDetailsModalModule } from "../../shared-modules/details-modal/details-modal.module";
import { EcmdocOcrtrackerComponent } from './ecmdoc-ocrtracker/ecmdoc-ocrtracker.component';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessagesModule } from 'primeng/messages';
import { TreeModule } from 'primeng/tree';
import { ProgressBarModule } from 'primeng/progressbar';
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from 'primeng/table';
import { InputMaskModule } from 'primeng/inputmask';
import { RouterModule } from '@angular/router';
import { AdministrationRoutingModule } from './administration-routing.modules';
import { EditorModule } from 'primeng/editor';
@NgModule({
  declarations: [
    AdministrationComponent, ConfigurationsComponent, AccesspolicyComponent,
    LookupsComponent, LookupmappingComponent, NewsComponent, RolemanagementComponent, EntrytemplateMappingComponent,
    AccessPolicyMappingComponent, IntegrationComponent, ErrorlogManagementComponent,
    EcmUsersComponent,
    EcmReportUserComponent,
    EcmAdminUsersComponent,
    EcmGlobalListComponent,
    EcmAdminLogsComponent,
    EcmExcludeUsersComponent,
    EcmOrgUnitManagementComponent,
    ManageAccesspolicyComponent,
    SecurityToolComponent,
    EcmdocOcrtrackerComponent
  ],
  imports: [
    AdministrationRoutingModule,
    RouterModule, 
    PanelModule,
    CommonModule,
    FormsModule,
    TabViewModule, AccordionModule, SelectButtonModule, TooltipModule, ButtonModule,
    InputTextModule, InputTextareaModule, ConfirmDialogModule, CheckboxModule, SharedHTMLPipeModule,
    CalendarModule,
    CgBusyModule,
    SharedRoleListModule, RadioButtonModule, InputSwitchModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    AutoCompleteModule,
    SharedRoleTreeModule,
    SharedUserListModule, MessagesModule,
    SharedEditApPermissionModule, ReactiveFormsModule, TreeModule, ProgressBarModule,
    SharedDetailsModalModule,ListboxModule,TableModule,InputMaskModule,EditorModule
    // , SpinnerModule,  DataScrollerModule,
  ],
  providers: [
    AdminService,
    //ContentService,
    ConfigurationService,
    NewsService,
    AccessPolicyService],
})
export class AdministrationModule {
}
