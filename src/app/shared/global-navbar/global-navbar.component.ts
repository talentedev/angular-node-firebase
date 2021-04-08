import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-global-navbar',
  templateUrl: './global-navbar.component.html',
  styleUrls: ['./global-navbar.component.css']
})
export class GlobalNavbarComponent implements OnInit {

  user: Observable<firebase.User>;
  authState;
  deviceInfo = null;
  isMobile;
  @Input() menuState;
  @Output() hide: any = new EventEmitter();

  constructor(public authService: AuthService,
    private deviceService: DeviceDetectorService,
    private router: Router) {
    this.authState = this.authService.authState;
  }

  ngOnInit() {
    //
    this.epicFunction();
  }

  goToDashboard() {
    this.menuState = false;
    this.hide.emit(this.menuState);
  }

  collapseMenu() {
    this.menuState = false;
    this.hide.emit(this.menuState);
  }

  logout() {
    this.authService.signOut();
  }

  toggleMenu() {
    this.menuState = !this.menuState;
    this.hide.emit(this.menuState);
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();

    if (isMobile) {
      this.isMobile = isMobile;
    }
  }
}
