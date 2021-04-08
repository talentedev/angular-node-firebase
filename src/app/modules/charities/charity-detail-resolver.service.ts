import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ContentfulService } from '../../core/services/contentful.service';

@Injectable()
export class CharityDetailResolverService implements Resolve<Promise<any>> {

  constructor(private cs: ContentfulService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    const id = route.paramMap.get('id');

    return this.cs.getCharityDetail(id)
      .then(charity => {
      })
      .catch(error => {
        console.log(error);
        this.router.navigate(['/charities']);
      });
  }

}
