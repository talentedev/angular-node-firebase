import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  title = 'Get started | Allgive.org';
  invalid = false;
  inactive = false;
  errorMessage = '';
  success = false;
  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) { }

  signupForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.email]
  });

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onSubmit() {
    this.invalid = false;
    this.inactive = false;
    this.errorMessage = '';

    this.authService.emailSignUp(
      this.capitalize(this.signupForm.value.firstName),
      this.capitalize(this.signupForm.value.lastName),
      this.signupForm.value.email,
      '1234567'
    )
      .then((res) => {
        this.success = true;
        this.authService.signOut2();
      })
      .catch(error => {
        this.userService.getUserByEmail(this.signupForm.value.email).subscribe(res => {
          if (res) {
            const user: any = Object.values(res)[0];
            if (user.enabled) {
              this.invalid = true;
            } else {
              this.inactive = true;
            }
          } else {
            this.invalid = true;
          }
        })
    });
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  capitalize(str) {
    if (str === str.toUpperCase()) {
      str = str.toLowerCase();
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
