import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-global-footer',
  templateUrl: './global-footer.component.html',
  styleUrls: ['./global-footer.component.css']
})
export class GlobalFooterComponent implements OnInit {

  authState;

  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();

  constructor(public authService: AuthService, private router: Router) {
    this.authState = this.authService.authState;
  }

  ngOnInit() {
  }
}
