import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {BrowseScreenComponent} from "../../components/generic-components/browse-screen/browse-screen.component";
import {SharedTreeModule} from "../tree-module/tree.module";
import {SharedRightPanelModule} from "../right-panel/right-panel.module";
import {SharedFolTreeModule} from "../fav-fol-tree/fav-fol-tree";
import { CgBusyModule } from 'angular-busy2';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { SharedDataTableModule } from '../data-table/data-table.module';

@NgModule({
  declarations: [
    BrowseScreenComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule, TooltipModule,
    TreeModule,
    CgBusyModule,
    ContextMenuModule,
    TableModule,
    SharedRightPanelModule,
    TabViewModule,
    SharedFolTreeModule,
    SharedTreeModule,
    SharedDataTableModule
  ],
  providers: [],
  exports: [BrowseScreenComponent]
})
export class SharedBrowseModule {
}
