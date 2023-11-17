import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTreeModule} from '../tree-module/tree.module';
import { UserComponent } from '../../components/generic-components/user/user.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    UserComponent
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
  exports: [UserComponent]
})
export class SharedUserModule {

}
