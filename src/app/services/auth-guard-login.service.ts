import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {UserService} from './user.service';

@Injectable()
export class AuthGuardLoginService implements CanActivate {
  constructor(private router: Router) {

  }

  canActivate() {
    if (localStorage.getItem('user') !== null) {
      this.router.navigate(['/']);
      return false;
    }

    return true;


  }
}
