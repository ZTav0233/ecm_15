import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministrationComponent } from './administration.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { AccesspolicyComponent } from './accesspolicy/accesspolicy.component';
import { LookupsComponent } from './lookups/lookups.component';
import { LookupmappingComponent } from './lookupmapping/lookupmapping.component';
import { NewsComponent } from './news/news.component';
import { RolemanagementComponent } from './rolemanagement/rolemanagement.component';
import { AccessPolicyMappingComponent } from './accesspolicy-mapping/accesspolicy-mapping.component';
import { ManageAccesspolicyComponent } from './manage-accesspolicy/manage-accesspolicy.component';
import { EntrytemplateMappingComponent } from './entrytemplate-mapping/entrytemplate-mapping.component';
import { IntegrationComponent } from './integration/integration.component';
import { ErrorlogManagementComponent } from './errorlog-management/errorlog-management.component';
import { EcmUsersComponent } from './ecm-users/ecm-users.component';
import { EcmReportUserComponent } from './ecm-report-user/ecm-report-user.component';
import { EcmAdminUsersComponent } from './ecm-admin-users/ecm-admin-users.component';
import { EcmGlobalListComponent } from './ecm-global-list/ecm-global-list.component';
import { EcmAdminLogsComponent } from './ecm-admin-logs/ecm-admin-logs.component';
import { EcmExcludeUsersComponent } from './ecm-exclude-users/ecm-exclude-users.component';
import { EcmOrgUnitManagementComponent } from './ecm-org-unit-management/ecm-org-unit-management.component';
import { SecurityToolComponent } from './security-tool/security-tool.component';
import { EcmdocOcrtrackerComponent } from './ecmdoc-ocrtracker/ecmdoc-ocrtracker.component';


const routes: Routes = [
    {
      path: '', component: AdministrationComponent,
      children: [
        {path: 'configurations', component: ConfigurationsComponent},
        {path: 'integration', component: IntegrationComponent}, 
        {path: 'entry-template-mapping', component: EntrytemplateMappingComponent},
        {path: 'access-policies', component: AccesspolicyComponent},
        {path: 'access-policy-mapping', component: AccessPolicyMappingComponent},
        {path: 'manage-accesspolicy', component: ManageAccesspolicyComponent},
        {path: 'lookups', component: LookupsComponent},
        {path: 'lookup-mapping', component: LookupmappingComponent},
        {path: 'role-management', component: RolemanagementComponent},
        {path: 'ecm-users', component: EcmUsersComponent},
        {path: 'ecm-users', component: EcmUsersComponent},
        {path: 'ecm-report-user', component: EcmReportUserComponent},
        {path: 'ecm-global-list', component: EcmGlobalListComponent},
        {path: 'ecm-admin-user', component: EcmAdminUsersComponent},
        {path: 'news', component: NewsComponent},
        {path: 'errorlog-management', component: ErrorlogManagementComponent},
        {path: 'ecm-admin-logs', component: EcmAdminLogsComponent},
        {path: 'ecm-exclude-users', component: EcmExcludeUsersComponent},
        {path: 'orgunit-management', component: EcmOrgUnitManagementComponent},
        {path: 'security-tool', component: SecurityToolComponent},
        {path: 'ecmdoc-track', component: EcmdocOcrtrackerComponent}
      ]
    },
  
  
  ];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdministrationRoutingModule { }