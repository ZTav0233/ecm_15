import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
    {
      path: '', component: SettingsComponent,
      children: [{
        path: '', 
        component: SettingsComponent, 
        data: { shouldReuse: true }
      }
      ]
    },
  ];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingRoutingModule { }