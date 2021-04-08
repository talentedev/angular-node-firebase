import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordlessAuthComponent } from './passwordless-auth/passwordless-auth.component';

const routes: Routes = [
  // {
  //   path: 'login',
  //   component: LoginComponent,
  //   data: { title: 'Login'}
  // },
  // {
  //   path: 'signup',
  //   component: SignupComponent,
  //   data: { title: 'Sign Up'}
  // },
  {
    path: 'link-login',
    component: PasswordlessAuthComponent,
    data: { title: 'Email Link Login'}
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class AuthRoutingModule { }
