import { Component, OnInit, setTestabilityGetter } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ContentfulService } from '../../services/contentful.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  title = 'Small Sacrifice, Big Difference | Allgive.org';
  carouselType = 'Available Charities';
  sacrifice = {
    image: '../../assets/images/new_coffee_cup.jpg',
    text: 'The average cost of a daily cup of coffee ($3.94) can turn into a monthly donation of $118.20.'
  }

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
    this.getRandomSacrifice();
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  getRandomSacrifice() {
    this.contentfulService.getSacrifices().subscribe(res => {
      if (res) {
        const sacrifices = Object.values(res);
        // Get random sacrifice
        if (sacrifices.length > 0) {
          this.sacrifice = sacrifices[Math.floor(Math.random() * sacrifices.length)];
        }
      }
    });
  }

}
