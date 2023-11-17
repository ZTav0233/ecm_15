import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UpdateDocumentComponent} from "../../components/generic-components/update-document/update-document.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedTreeModule} from "../tree-module/tree.module";
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
// import {BusyModule} from "angular2-busy";

@NgModule({
  declarations: [
    UpdateDocumentComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule, DialogModule,
    ButtonModule, SharedTreeModule,
    InputTextModule,
    CheckboxModule,
    CalendarModule,
    // BusyModule,
    TooltipModule,
    TableModule
  ],
  exports: [UpdateDocumentComponent]
})
export class SharedUpdateDocumentModule { }
