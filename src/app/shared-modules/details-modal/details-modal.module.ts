import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DocDetailsModalComponent} from '../../components/generic-components/doc-details-modal/doc-details-modal.component';
import {SharedHTMLPipeModule} from "../safe-html-pipe/safe-html-pipe";
import { CgBusyModule } from 'angular-busy2';
import { DocLinkedDetailsModalComponent } from '../../components/generic-components/doc-linked-details-modal/doc-linked-details-modal.component';
import { DocTrackDetailsModalComponent } from '../../components/generic-components/doc-track-details-modal/doc-track-details-modal.component';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [
    DocDetailsModalComponent,
    DocLinkedDetailsModalComponent,
    DocTrackDetailsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    DialogModule,
    FileUploadModule, InputTextModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    CgBusyModule, 
    TabViewModule, TableModule, TooltipModule,SharedHTMLPipeModule
  ],
  providers: [],
  exports: [DocDetailsModalComponent,DocLinkedDetailsModalComponent,DocTrackDetailsModalComponent]
})
export class SharedDetailsModalModule {
}
