import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Observable, Subject } from 'rxjs';
import { PaymentsService } from './payments.service';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  stripeCustomer;
  apiUrl = environment.apiUrl;
  authState: any = null;
  authStateChange: Subject<any> = new Subject();

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router,
    private db: AngularFireDatabase,
    private pmt: PaymentsService,
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.authState = currentUser;
  }

  // Returns true if user is authenticated
  isAuthenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  currentUser(): any {
    return this.isAuthenticated ? this.authState : null;
  }

  // Returns observable with current user data
  currentUserObservable(): any {
    return this.afAuth.authState;
  }

  // Returns current user UID
  currentUserId(): string {
    return this.isAuthenticated ? this.authState.uid : '';
  }

  currentUserDisplayName(): string {
    if (!this.authState) { return ''; } else { return this.authState['displayName'] || 'Current User'; }
  }

  currentDbUser(): any {
    const id = this.currentUserId();
    return this.db.list('/users', ref => ref.orderByChild('authId')).query.equalTo(id);
  }

  // Create Stripe customer
  createUser(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/users', data);
  }

  // Check if user exist already.
  checkUser(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/check-user', {email: data});
  }

  // Update user activity
  updateUserActivity(uid): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/update-activity', {uid: uid});
  }

  // Update user activity
  updateRecentActivity(uid): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/recent-activity', {uid: uid});
  }

  // Sign up
  emailSignUp(firstName: string, lastName: string, email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        const authUser = this.afAuth.auth.currentUser;
        const data = {
          uid: authUser.uid,
          email: authUser.email,
          firstName: firstName,
          lastName: lastName
        };
        // Insert new user to database.
        this.createUser(data).subscribe(result => {
          // Remove comment on production.
          this.emailLinkLogin(authUser.email).subscribe(res => {
            Promise.resolve(res);
          });
        }, err => {
          Promise.reject(err);
        });
      })
      .catch(error => Promise.reject(error));
  }

  // Passwordless Login
  emailLinkLogin(email: string) {
    return this.http.post<any>(this.apiUrl + '/send-magic-link', {email: email});
  }

  confirmSignIn(uid, token) {
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiUrl + '/confirm-signin', {uid: uid, token: token})
        .subscribe(user => {
          if (user.message) {
            reject();
          } else {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authState = user;
            this.router.navigate(['/charities']);
            this.updateUserActivity(user.uid).subscribe();
            resolve(user);
          }
        }, err => {
          reject(err);
        });
    });
  }

  syncAuthState() {
    const uid = this.authState.uid;
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiUrl + '/me', {uid: uid})
        .subscribe(user => {
          if (!user.message) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authState = user;
            resolve(user);
          } else {
            reject();
          }
        }, err => reject());
    });
  }

  // Sign out
  signOut(): void {
    this.afAuth.auth.signOut();
    localStorage.removeItem('currentUser');
    this.authState = null;
    this.router.navigate(['/']);
  }
  signOut2(): void {
    localStorage.removeItem('currentUser');
    this.authState = null;
    this.afAuth.auth.signOut();
  }
}
