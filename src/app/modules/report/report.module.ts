import { NgModule } from '@angular/core';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {ReportComponent} from "./report.component";
// import {
//   AccordionModule, AutoCompleteModule, ButtonModule, CalendarModule, CheckboxModule, DataTableModule, DropdownModule,
//   InputTextModule,
//   MenubarModule,
//   SplitButtonModule,
//   TooltipModule,
//   TreeModule
// } from "primeng/primeng";
import {SharedHTMLPipeModule} from "../../shared-modules/safe-html-pipe/safe-html-pipe";
import {FormsModule} from "@angular/forms";
import 'chartjs-plugin-datalabels';
//import {ContentService} from "../../services/content.service";
import {AdminService} from "../../services/admin.service";
import {ConfigurationService} from "../../services/configuration.service";
import { CgBusyModule } from 'angular-busy2';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenubarModule } from 'primeng/menubar';
import { NgChartsModule } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { ReportsRoleTreeComponent } from 'src/app/components/generic-components/reports-role-tree/reports-role-tree.component';
import { TableModule } from 'primeng/table';
import { ReportRoutingModule } from './report-routing.module';

@NgModule({
  imports: [
    ReportRoutingModule,
    CommonModule,
    AccordionModule,
    ButtonModule,
    InputTextModule, 
    CheckboxModule,
    TreeModule,
    TooltipModule,
    SharedHTMLPipeModule,
    AutoCompleteModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    NgChartsModule,
    SplitButtonModule,
    MatSelectModule,
    MenubarModule,
    CgBusyModule,
    TableModule
  ],
  declarations: [ReportComponent,ReportsRoleTreeComponent],

  providers: [
    //ContentService,
    AdminService,
    ConfigurationService, {provide: APP_BASE_HREF, useValue: '/'}
  ]
})
export class ReportModule { 
 
  
}
