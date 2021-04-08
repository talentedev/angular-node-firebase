import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-charities',
  templateUrl: './charities.component.html',
  styleUrls: ['./charities.component.css']
})
export class CharitiesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onActivate(event) {
    window.scrollTo(0, 0);
  }

}
