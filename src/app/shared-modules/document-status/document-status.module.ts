import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {FormsModule} from "@angular/forms";
import { DocumentStatusComponent } from '../../components/generic-components/document-status/document-status.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';


@NgModule({
  declarations: [
    DocumentStatusComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    InputTextareaModule
  ],
  providers: [],
  exports: [DocumentStatusComponent]
})
export class SharedDocumentStatusModule {

}
