import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TreeComponent } from '../../components/generic-components/tree/tree.component';
import { CgBusyModule } from 'angular-busy2';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    TreeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule, TooltipModule,
    TreeModule,
    CgBusyModule,
    ContextMenuModule
  ],
  providers: [],
  exports: [TreeComponent]
})
export class SharedTreeModule {
}