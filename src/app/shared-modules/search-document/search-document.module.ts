import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchDocumentComponent } from '../../components/generic-components/search-document/search.component';
import { CgBusyModule } from 'angular-busy2';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    SearchDocumentComponent
  ],
  imports: [
    PanelModule,
    DialogModule,
    TreeModule,
    CommonModule,
    HttpClientModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    CalendarModule,
    CgBusyModule,
    InputSwitchModule, ProgressSpinnerModule, AutoCompleteModule, TableModule, ConfirmDialogModule
  ],
  providers: [],
  exports: [SearchDocumentComponent]
})
export class SharedSearchDocumentModule {

}