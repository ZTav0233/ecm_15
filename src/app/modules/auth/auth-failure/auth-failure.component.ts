import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CoreService} from '../../../services/core.service';
import {Location} from '@angular/common';

@Component({
  templateUrl: './auth-failure.component.html',
})

export class AuthFailureComponent implements OnInit{

  ngOnInit() {
  }

  constructor(private router: Router) {
  }
  login() {
   this.router.navigate(['/']);
  }
}
