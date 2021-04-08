import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements OnInit {

  title = 'FAQ | Allgive.org';
  content = '';

  constructor( private titleService: Title, private contentfullService: ContentfulService ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);

    this.contentfullService.getTextOnlyPage('faq').subscribe((res: any) => {
      this.content = res.content;
    });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
