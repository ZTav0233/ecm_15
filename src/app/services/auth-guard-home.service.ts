import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, Router} from '@angular/router';
import {UserService} from './user.service';

@Injectable()
export class AuthGuardHomeService implements CanActivate {
  constructor(private router: Router) {

  }

  canActivate() {
    if (localStorage.getItem('user') == null) {
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }
}
