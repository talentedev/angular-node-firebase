import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';

interface MailChimpResponse {
  result: string;
  msg: string;
}

@Injectable()
export class MailChimpService {

  private endpoint: string = environment.mailchimpKey.endpoint;
  private hiddenName: string = environment.mailchimpKey.hiddenName;

  constructor(
    private http: HttpClient
  ) { }

  /** Subscribe user */
  subscribeUser(fname, lanme, email) {
    const params = new HttpParams()
      .set('FNAME', fname)
      .set('LNAME', lanme)
      .set('EMAIL', email)
      .set(this.endpoint, '');

    const mailChimpUrl = this.endpoint + params.toString();

    this.http.jsonp<MailChimpResponse>(mailChimpUrl, 'c').subscribe(response => {
      if (response.result && response.result !== 'error') {
        console.log(response.result);
      } else {
        console.log(response);
      }
    }, error => {
      console.error(error);
    });
  }
}
