import {Component} from '@angular/core';
import {Router} from '@angular/router';


@Component({
  templateUrl: './session-timeout.component.html',
})
export class SessionTimeoutComponent {
  private sessionTimeoutButtonText;

  constructor(private router: Router) {
    this.sessionTimeoutButtonText = localStorage.getItem('defaultView');
  }

  goToDefaultPage() {
    this.router.navigate(['/']);
  }
}
