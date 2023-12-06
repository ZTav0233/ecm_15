import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SimpleSearchComponent } from './simple-search/simple-search.component';
import { AdvanceSearchComponent } from './advance-search/advance-search.component';
import { SharedSearchDocumentModule } from '../../shared-modules/search-document/search-document.module';
import { SharedDataTableModule } from '../../shared-modules/data-table/data-table.module';
import { SharedRightPanelModule } from '../../shared-modules/right-panel/right-panel.module';
//import {ContentService} from '../../services/content.service';
import { CgBusyModule } from 'angular-busy2';
import { ConfigurationService } from '../../services/configuration.service';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SearchRoutingModule } from './search-routing.module';
// import { AppRoutingModule } from 'src/app/app-routing.module';

@NgModule({
  imports: [
    SearchRoutingModule,
    TabViewModule,
    ButtonModule,
    CommonModule,
    SharedSearchDocumentModule,
    CgBusyModule,
    SharedDataTableModule, SharedRightPanelModule,
    AccordionModule, InputTextareaModule
  ],
  declarations: [
    SearchComponent,
    SimpleSearchComponent,
    AdvanceSearchComponent
  ],
  providers: [
    //WorkflowService
    //,ContentService
    ConfigurationService
  ]
})
export class SearchModule {
}