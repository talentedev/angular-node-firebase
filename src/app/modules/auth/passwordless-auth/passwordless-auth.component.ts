import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-passwordless-auth',
  templateUrl: './passwordless-auth.component.html',
  styleUrls: ['./passwordless-auth.component.css']
})
export class PasswordlessAuthComponent implements OnInit {

  public loading = false;
  public isInvalidLink = false;
  public sendingLink = false;
  invalidUser = false;
  faEnvelope = faEnvelope;
  faSpinner = faSpinner;
  title = 'Log In | Allgive.org';
  formTitle = 'Request Secure Login Link';
  emailSent = false;
  loginForm = this.fb.group({
    email: ['', Validators.email]
  });

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
   ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
    this.activatedRoute.queryParams.subscribe(params => {
        const token = params['token'];
        const uid = params['uid'];
        if (token && uid) {
          this.confirmSignIn(uid, token);
        }
    });
    this.router.events.subscribe(val => {
      if (this.authService.authState && val.constructor.name === 'NavigationEnd') {
        const uid = this.authService.authState.uid;
        this.authService.updateRecentActivity(uid).subscribe();
      }
    });
  }

  sendEmailLink() {
    this.sendingLink = true;
    this.emailSent = false;
    this.invalidUser = false;
    this.authService.checkUser(this.loginForm.value.email).subscribe(user => {
      if (user) {
        const userData: any = Object.values(user)[0];
        this.authService.emailLinkLogin(this.loginForm.value.email)
          .subscribe((res) => {
            this.emailSent = true;
            this.sendingLink = false;
            this.invalidUser = false;
            this.formTitle = 'Secure Login Link Sent';
          });
      } else {
        this.sendingLink = false;
        this.invalidUser = true;
      }
    });
  }

  confirmSignIn(uid, token) {
    this.loading = true;
    this.authService.confirmSignIn(uid, token)
      .then(res => {
        this.loading = false;
      }).catch(err => {
        this.loading = false;
        this.isInvalidLink = true;
      });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
