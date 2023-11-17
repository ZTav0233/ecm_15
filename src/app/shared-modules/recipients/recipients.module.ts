import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedTreeModule } from '../tree-module/tree.module';
import { RecipientsComponent } from '../../components/generic-components/recipients/recipients.component';
import { SharedUserListModule } from '../user-list/user-list.module';
import { MatTabsModule } from '@angular/material/tabs'
import { SharedRoleListModule } from '../role-list/role-list.module';
import { SharedRoleTreeModule } from '../role-tree/role-tree.module';
import { CgBusyModule } from 'angular-busy2';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { DragDropModule } from 'primeng/dragdrop';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    RecipientsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule, SharedTreeModule, 
    InputTextModule,
    MatTabsModule,
    SharedUserListModule,
    AutoCompleteModule,
    TooltipModule,
    SharedRoleListModule,
    SharedRoleTreeModule, ProgressSpinnerModule, TabViewModule,
    CgBusyModule,
    DragDropModule, AccordionModule, DialogModule
  ],
  providers: [],
  exports: [RecipientsComponent]
})
export class SharedRecipientsModule {

}
