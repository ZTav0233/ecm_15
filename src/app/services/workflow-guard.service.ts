import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {UserService} from './user.service';
import * as globalv from '../global.variables';
import {CoreService} from "./core.service";

@Injectable()
export class WorkflowAuthGuardService implements CanActivate {
  constructor(private router: Router, private us: UserService, private coreService: CoreService) {

  }

  canActivate(): Observable<boolean> {
    const subscription = this.us.logIn(globalv.username, 'def');
    this.coreService.progress = {busy: subscription, message: '', backdrop: true};
    return subscription
      .map(data => {
        localStorage.setItem('user', JSON.stringify(data));
        /*this.us.getUserSettings().subscribe((val: any) => {
          let self = this;
          _.map(val, function (record) {
            if (record.key === 'Default Theme') {
              self.us.selectedTheme = record.val;
              self.us.applyTheme();
            }
            if (record.key === 'Default View') {
              self.us.defaultView = record.val;
              localStorage.setItem('defaultView', self.us.defaultView);
            }
            if (record.key === 'Page Size') {
              self.us.pageSize = record.val;
            }
          });
        });*/
        return true;
      }, Error => {
        localStorage.removeItem('user');
        this.router.navigate(['/auth/auth-failure']);
        return false;
      });
  }

}
