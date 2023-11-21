import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowseComponent } from './browse.component';
import { SharedDataTableModule } from '../../shared-modules/data-table/data-table.module';
import { SharedRightPanelModule } from '../../shared-modules/right-panel/right-panel.module';
import { BrowserEvents } from '../../services/browser-events.service';
import { AddDocumentComponent } from './add-document/add-document.component';
import { BrowseDocumentComponent } from './browse-documents/browse-document.component';
import { ConfigurationService } from '../../services/configuration.service';
//import {ContentService} from '../../services/content.service';
import { SharedTreeModule } from '../../shared-modules/tree-module/tree.module';
import { SharedAddDocumentModule } from '../../shared-modules/add-document/add-document.module';
import { CgBusyModule } from 'angular-busy2';
import { FavouriteFoldersComponent } from './favourite-folders/favourite-folders.component';
import { UpdateDocumentComponent } from './update-document/update-document.component';
import { SharedUpdateDocumentModule } from "../../shared-modules/update-document/update-document.module";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { TreeModule } from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';
import { BrowseRoutingModule } from './browse-routing.module';
// import { NgxAsideModule } from 'ngx-aside';
// import {
//   ButtonModule, InputTextModule, DialogModule, PanelModule, TreeModule, ContextMenuModule
// } from 'primeng/primeng';
@NgModule({
  declarations: [
    BrowseComponent,
    AddDocumentComponent,
    BrowseDocumentComponent,
    FavouriteFoldersComponent,
    UpdateDocumentComponent
  ],
  imports: [
    BrowseRoutingModule,
    CommonModule,
    FormsModule, ReactiveFormsModule, DialogModule,
    ButtonModule,
    InputTextModule,
    SharedDataTableModule,
    CgBusyModule,
    SharedRightPanelModule, SharedTreeModule, PanelModule, TreeModule, ContextMenuModule,
    SharedAddDocumentModule,
    SharedUpdateDocumentModule,
  ],
  providers: [ConfigurationService
    //, WorkflowService
    //, ContentService
  ],
})
export class BrowseModule {
}
