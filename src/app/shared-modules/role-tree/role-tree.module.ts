import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RoleTreeComponent } from '../../components/generic-components/role-tree/role-tree.component';
import { SharedHTMLPipeModule } from "../safe-html-pipe/safe-html-pipe";
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    RoleTreeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ButtonModule,
    TreeModule,
    TooltipModule,
    SharedHTMLPipeModule
  ],
  providers: [],
  exports: [RoleTreeComponent]
})
export class SharedRoleTreeModule {

}
