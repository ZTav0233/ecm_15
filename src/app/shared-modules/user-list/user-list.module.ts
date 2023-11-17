import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTreeModule} from '../tree-module/tree.module';
import {UserListComponent} from '../../components/generic-components/user-list/user-list.component';

@NgModule({
  declarations: [
    UserListComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule, SharedTreeModule,
    InputTextModule,
    TreeModule,
    TooltipModule
  ],
  providers: [],
  exports: [UserListComponent]
})
export class SharedUserListModule {

}
