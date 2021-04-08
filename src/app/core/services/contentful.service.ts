import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable()
export class ContentfulService {

  constructor(private http: HttpClient) { }

  getAllCharities() {
    const url = `${environment.adminApiUrl}/get-charities`;
    return this.http.post(url, {});
  }

  getCharities() {
    const url = `${environment.adminApiUrl}/get-available-charities`;
    return this.http.post(url, {});
  }

  getCharityDetail(slug): Promise<any> {
    const url = `${environment.adminApiUrl}/get-charity-by`;
    return new Promise((resolve, reject) => {
      this.http.post(url, {option: 'slug', value: slug}).subscribe((res: any[]) => {
        if (res && res.length > 0) {
          resolve(res[0]);
        } else {
          reject({error: 'no charity'});
        }
      }, err => {
        reject(err);
      });
    });
  }

  getCharityByName(charityName): Promise<any> {
    const url = `${environment.adminApiUrl}/get-charity-by`;
    return new Promise((resolve, reject) => {
      this.http.post(url, {option: 'title', value: charityName, all: true}).subscribe((res: any[]) => {
        if (res) {
          resolve(res[0]);
        } else {
          resolve(null);
        }
      }, err => {
        reject(err);
      });
    });
  }

  getFeaturedCharities() {
    const url = `${environment.adminApiUrl}/get-charity-by`;
    return this.http.post(url, {option: 'featured', value: true});
  }

  getCharitiesByCategory(category) {
    const url = `${environment.adminApiUrl}/get-charity-by`;
    return this.http.post(url, {option: 'category', value: category});
  }

  getTextOnlyPage(slug) {
    const url = `${environment.adminApiUrl}/get-page`;
    return this.http.post(url, {type: slug});
  }

  getTestimonials() {
    const url = `${environment.adminApiUrl}/get-testimonials`;
    return this.http.post(url, {});
  }

  getSacrifices() {
    const url = `${environment.adminApiUrl}/get-sacrifices`;
    return this.http.post(url, {});
  }

}
