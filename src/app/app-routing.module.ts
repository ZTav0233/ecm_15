import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardHomeService } from './services/auth-guard-home.service';
import { HomeComponent } from './components/generic-components/home/home.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuardHomeService], children: [
      {path: '', loadChildren:()=>import( './modules/main/main.module').then(m=>m.MainModule)},
      {path: 'workflow', loadChildren:()=>import('./modules/workflow/workflow.module').then(m=>m.WorkflowModule)},//canActivate: [WorkflowAuthGuardService]
      {path: 'browse', loadChildren:()=>import('./modules/browse/browse.module').then(m=>m.BrowseModule)},
    ]
  },
  {path: 'auth', loadChildren:()=>import( './modules/auth/auth.module').then(m=>m.AuthModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
