import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable()
export class PaymentsService {

  userId: string;
  membership: any;
  customer;
  stripe: Observable<any>;
  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    // private headers: HttpHeaders,
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {

    this.afAuth.authState.subscribe((auth) => {
      if (auth) { this.userId = auth.uid; }
    });

    // this.membership = this.afAuth.authState
    //   .do(user => this.userId = user.uid)
    //   .map(user => {
    //     return this.db.object(`users/${user.uid}/pro-membership`);
    //   });
  }

  processPayment(token: string, data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/charge', data);
  }

  processSubscription(data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/subscription', data);
  }

  processNewSubscription(data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/new-subscription', data);
  }

  processCancelSubscription(data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/cancel-subscription', data);
  }

  processUpdateSubscription(data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/update-subscription', data);
  }

  checkForCustomerSource(user): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/customer', user);
  }

  processCardError(data: Object): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/card-error', data);
  }

}
