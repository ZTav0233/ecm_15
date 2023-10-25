import { NgModule } from '@angular/core';
import { DocumentCartComponent } from '../../components/generic-components/document-cart/document-cart.component';
import { CommonModule } from '@angular/common';
import { SharedHTMLPipeModule } from "../safe-html-pipe/safe-html-pipe";
import { FormsModule } from "@angular/forms";
import { CgBusyModule } from 'angular-busy2';
import { EnclosureDocumentCartComponent } from '../../components/generic-components/enclosure-document-cart/enclosure-document-cart.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    DocumentCartComponent,
    EnclosureDocumentCartComponent
  ],
  imports: [
    CommonModule,
    TooltipModule,
    SharedHTMLPipeModule,
    CheckboxModule, 
    FormsModule,
    CgBusyModule
  ],
  providers: [],
  exports: [DocumentCartComponent,EnclosureDocumentCartComponent]
})
export class SharedDocumentCartModule { }