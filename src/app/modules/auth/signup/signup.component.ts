import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { MailChimpService } from '../../../core/services/mailchimp.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  user;
  title = 'Sign Up | Allgive.org';
  invalid = false;
  errorMessage = '';

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private mailchimpService: MailChimpService
   ) { }

  signupForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.email]
  });

  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.authService.authState) {
      this.router.navigate(['/charities']);
    }

    this.setTitle(this.title);
  }

  onSubmit() {
    this.invalid = false;
    this.errorMessage = '';

    this.authService.emailSignUp(
      this.capitalize(this.signupForm.value.firstName),
      this.capitalize(this.signupForm.value.lastName),
      this.signupForm.value.email,
      '1234567'
    )
      .then((res) => {
        this.router.navigate(['/charities']);
      })
      .catch(error => {
        this.invalid = true;
        this.errorMessage = error.message;
    });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  capitalize(str) {
    if (str === str.toUpperCase()) {
      str = str.toLowerCase();
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
