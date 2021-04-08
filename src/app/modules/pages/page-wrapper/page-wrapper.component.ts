import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-pages',
  templateUrl: './page-wrapper.component.html',
  styleUrls: ['./page-wrapper.component.css']
})
export class PageWrapperComponent implements OnInit {

  title: string;
  pageTitle: string;
  pageContent;

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      window.scrollTo(0, 0);
      if (event instanceof NavigationEnd) {
        this.ngOnInit();
        window.scroll(0, 0);
      }
    });
  }

  ngOnInit() {
    let pageSlug = this.route.snapshot.paramMap.get('slug');

    if (pageSlug === 'legal') {
      this.title = 'Legal | Allgive.org';
      this.pageTitle = 'Privacy Policy';
    }

    this.setTitle(this.title);

    this.contentfulService.getTextOnlyPage(pageSlug).subscribe((res: any) => {
      this.pageContent = res.content;
    });
  }

  public setTitle( newTitle: string ) {
    this.titleService.setTitle( newTitle );
  }

}
