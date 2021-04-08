import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

const APP_TITLE = 'allgive.org';
const SEPARATOR = ' | ';

@Injectable()
export class TitleService {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) { }

  static ucFirst(string) {
    if (!string) { return string; }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  init() {
    // this.router.events
    //   .filter((event) => event instanceof NavigationEnd)
    //   .map(() => {
    //     let route = this.activatedRoute;
    //     while (route.firstChild) { route = route.firstChild; }
    //     return route;
    //   })
    //   .filter((route) => route.outlet === 'primary')
    //   .mergeMap((route) => route.data)
    //   .map((data) => {
    //     if (data.title) {
    //       return data.title;
    //     } else {
    //       return this.router.url.split('/').reduce((acc, frag) => {
    //         if (acc && frag) { acc += SEPARATOR; }
    //         return acc + TitleService.ucFirst(frag);
    //       });
    //     }
    //   })
    //   .subscribe((pathString) => this.titleService.setTitle(`${pathString} ${SEPARATOR} ${APP_TITLE}`));
  }

}
