import { Component, OnInit, Input } from '@angular/core';
import { Entry } from 'contentful';
import { CarouselModule, WavesModule } from 'angular-bootstrap-md';

import { ContentfulService } from '../../core/services/contentful.service';
import { DeviceDetectorService } from 'ngx-device-detector';
@Component({
  selector: 'app-featured-carousel',
  templateUrl: './featured-carousel.component.html',
  styleUrls: ['./featured-carousel.component.scss']
})
export class FeaturedCarouselComponent implements OnInit {

  heroStyle: {};
  charities: Entry<any>[] = [];
  bgImages: Entry<any>[] = [];
  slugs: Entry<any>[] = [];
  charityNames: Entry<any>[] = [];
  showNavigationArrows = false;
  showNavigationIndicators = false;
  isMobile;
  deviceInfo;
  constructor(
    private contentfulService: ContentfulService,
    private deviceService: DeviceDetectorService) {
  }

  ngOnInit() {
    this.epicFunction();
    return this.contentfulService.getFeaturedCharities()
      .subscribe((res: any[]) => {
        this.charities = res;
        for (let i = 0; i < res.length; ++i) {
          this.bgImages.push(res[i].coverImage);
          this.slugs.push(res[i].slug);
          this.charityNames.push(res[i].title);
        }
      });
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();

    if (isMobile) {
      this.isMobile = isMobile;
    }
  }
}
