import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import {
//   ConfirmDialogModule, ContextMenuModule, DialogModule,
//   TreeModule, TooltipModule
// } from 'primeng/primeng';
import { HttpClientModule } from '@angular/common/http';
import { CgBusyModule } from 'angular-busy2';
import { FavFolTreeComponent } from "../../components/generic-components/fav-fol-tree/fav-fol-tree.component";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';

@NgModule({
  declarations: [
    FavFolTreeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule, 
    TooltipModule,
    TreeModule,
    CgBusyModule,
    ContextMenuModule
  ],
  providers: [],
  exports: [FavFolTreeComponent]
})
export class SharedFolTreeModule {
}
