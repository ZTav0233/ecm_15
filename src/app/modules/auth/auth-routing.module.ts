import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth-component';
import { AuthFailureComponent } from './auth-failure/auth-failure.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardLoginService } from 'src/app/services/auth-guard-login.service';

const routes: Routes = [
  {
    path: '', // The root path
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [AuthGuardLoginService] },
      { path: 'auth-failure', component: AuthFailureComponent },
      { path: 'session-timeout', component: SessionTimeoutComponent },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
