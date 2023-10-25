import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, Router} from '@angular/router';
import {UserService} from "./user.service";

@Injectable()
export class DefaultUrlGuardService implements CanActivate {
  constructor(private router: Router, private us: UserService) {

  }

  canActivate() {
    if (this.router.url === '/') {
      const defaultView = localStorage.getItem('defaultView');
      if (defaultView === 'workflow') {
        this.router.navigate(['/workflow']);
        this.us.defaultViewSubMenuExpanded = 1;
        return false
      } else if (defaultView === 'folders') {
        this.router.navigate(['/browse/browse-folders']);
        this.us.defaultViewSubMenuExpanded = 2;
        return false
      } else{
        return true
      }
    } else {
      return true
    }
  }
}
