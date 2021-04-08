import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { DeviceDetectorService } from 'ngx-device-detector';

import { ContentfulService } from '../../core/services/contentful.service';

@Component({
  selector: 'app-testimonial-carousel',
  templateUrl: './testimonial-carousel.component.html',
  styleUrls: ['./testimonial-carousel.component.scss']
})
export class TestimonialCarouselComponent implements OnInit {

  testimonials = [];

  constructor(config: NgbCarouselConfig, private deviceService: DeviceDetectorService, private contentfulService: ContentfulService) {
    // config.interval = 10000;
  }

  ngOnInit() {
    this.contentfulService.getTestimonials().subscribe(testimonials => {
      this.testimonials = Object.values(testimonials);
    });
  }

}
