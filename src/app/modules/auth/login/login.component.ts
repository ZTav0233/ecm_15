import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import * as global from '../../../global.variables';
import { CoreService } from "../../../services/core.service";

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  username: any;
  private subscriptions: any[] = [];
  busy: boolean;

  constructor(
    private us: UserService,
    private router: Router,
    private cs: CoreService) { }

  ngOnInit() {
    this.login();
  }

  login() {
    this.username = global.username;
    this.busy = true;
    this.us.logIn(this.username, 'def').subscribe(data => {
      this.busy = false;
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('ecmloaded', "true");
      this.us.assignGeneralSettings(() => {
        /*if (this.us.defaultView === 'dashboard') {
          this.router.navigate(['/']);
        } else if (this.us.defaultView === 'workflow') {
          this.router.navigate(['/workflow']);
          this.us.defaultViewSubMenuExpanded = 1;
        } else if (this.us.defaultView === 'folders') {
          this.router.navigate(['/browse/browse-folders']);
          this.us.defaultViewSubMenuExpanded = 2;
        }*/
        this.router.navigate(['/']);
      });
    }, err => {
      this.busy = false;
      localStorage.removeItem('user');
      localStorage.removeItem('ecmloaded');
      this.router.navigate(['/auth/auth-failure']);
    });
  }

  ngOnDestroy() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }
}
