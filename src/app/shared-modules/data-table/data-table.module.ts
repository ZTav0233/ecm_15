import {NgModule} from '@angular/core';

// import {
//   ButtonModule, CheckboxModule,
//   ConfirmDialogModule,
//   DataTableModule, DialogModule, TooltipModule,
//   DropdownModule,
//   InputTextModule,
//   TabViewModule
// } from 'primeng/primeng';
import {DataTableComponent} from '../../components/generic-components/datatable/datatable.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SharedDetailsModalModule } from '../details-modal/details-modal.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { CgBusyModule } from 'angular-busy2';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DocDataTableComponent } from 'src/app/components/generic-components/doc-datatable/doc-datatable.component';
import { SharedHTMLPipeModule } from "../safe-html-pipe/safe-html-pipe";


@NgModule({
    declarations: [
        DataTableComponent,
        DocDataTableComponent
    ],
    providers: [],
    exports: [DataTableComponent, DocDataTableComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        DialogModule,
        SharedDetailsModalModule,
        ConfirmDialogModule,
        CgBusyModule,
        MultiSelectModule,
        SharedHTMLPipeModule
    ]
})
export class SharedDataTableModule {
}
