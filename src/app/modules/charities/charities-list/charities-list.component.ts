import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-charities-list',
  templateUrl: './charities-list.component.html',
  styleUrls: ['./charities-list.component.css'],
})
export class CharitiesListComponent implements OnInit {

  charities = [];
  filteredCharities = [];
  categories = ['Education', 'Religious', 'Humanitarian', 'Children', 'Veterans', 'Human Rights', 'Conservation', 'Human Services', 'Health', 'Environment', 'Animals', 'Arts & Humanities'];
  activeCategory = 'Category';
  featuredCharity;
  showAll = true;
  coverStyle: {};
  title = 'All Charities | Allgive.org';
  searchText = '';

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getAllCharities();
    this.setTitle(this.title);
  }

  getAllCharities() {
    this.contentfulService.getCharities()
      .subscribe(res => {
        const charities = Object.values(res);
        this.charities = charities;
        this.filteredCharities = charities;
        this.showAll = true;
        this.activeCategory = 'Category';
        this.featuredCharity = charities[Math.floor(Math.random() * charities.length)];

        this.coverStyle = {
          'background-image': 'url(' + this.featuredCharity.coverImage + ')'
        };
      });
  }

  getCharitiesByCategory(category) {
    this.contentfulService.getCharitiesByCategory(category)
      .subscribe((res: any[]) => {
        this.charities = res;
        this.filteredCharities = res;
        this.activeCategory = category;
        this.showAll = false;
      });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onSearchCharity(searchValue: string) {
    this.searchText = searchValue;
    const charities = this.charities.filter(function (charity) {
      return charity.title.toLowerCase().includes(searchValue.toLowerCase());
    });
    this.filteredCharities = charities;
  }
}
