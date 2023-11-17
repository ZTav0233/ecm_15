import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import {SharedTreeModule} from "../tree-module/tree.module";
import {SharedRightPanelModule} from "../right-panel/right-panel.module";
import {SharedFolTreeModule} from "../fav-fol-tree/fav-fol-tree";
import { CgBusyModule } from 'angular-busy2';
import { FormsModule } from '@angular/forms';
import { ExpandableListComponent } from '../../components/generic-components/expandable-list/expandable-list.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { AccordionModule } from 'primeng/accordion';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from 'primeng/api';
@NgModule({
  declarations: [
    ExpandableListComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule, 
    TooltipModule,
    TreeModule,
    CgBusyModule,
    ContextMenuModule,
    TableModule,
    AccordionModule,
    SharedRightPanelModule,
    TabViewModule,
    SharedFolTreeModule,
    SharedModule,
    SharedTreeModule,
    FormsModule
  ],
  providers: [],
  exports: [ExpandableListComponent]
})
export class SharedExpandableListModule {
}
