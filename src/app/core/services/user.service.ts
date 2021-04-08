import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {

  private apiUrl = environment.apiUrl;

  public cards: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {

    this.authService.authStateChange.subscribe(auth => {
      if (auth) {
        this.getUserCards();
      }
    });
  }

  getUserCards(): Promise<any> {
    const endpoint = this.apiUrl + '/payments';
    const requestData = {
      email: this.authService.authState.email
    };
    return new Promise(resolve => {
      this.http.post(endpoint, requestData).subscribe( (cards: any[]) => {
        this.cards = cards;
        resolve(this.cards);
      });
    });
  }

  getTransactions(): Observable<any> {
    const uid = this.authService.authState.uid;
    return this.http.post<any>(this.apiUrl + '/transactions', { uid: uid });
  }

  getDonations(): Observable<any> {
    const uid = this.authService.authState.uid;
    return this.http.post<any>(this.apiUrl + '/donations', { uid: uid });
  }

  getPayments(): Observable<any> {
    const uid = this.authService.authState.uid;
    return this.http.post<any>(this.apiUrl + '/payments', { uid: uid });
  }

  updateCard(data): Observable<any> {
    const endpoint = this.apiUrl + '/update-card';
    return this.http.post(endpoint, data);
  }

  deleteCard(data): Observable<any> {
    const endpoint = this.apiUrl + '/delete-card';
    return this.http.post(endpoint, data);
  }

  updateProfile(data): Observable<any> {
    const endpoint = this.apiUrl + '/update-profile';
    return this.http.post(endpoint, data);
  }

  sendEmailForDeletePaymentMethod(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/card-remove-email', data);
  }

  sendEmailForAddedPaymentMethod(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/card-added-email', data);
  }

  sendEmailForContact(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/contact-us-email', data);
  }

  changePayment(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/change-payment', data);
  }

  getUserByEmail(email): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/get-user-by-email', {email: email});
  }
}
