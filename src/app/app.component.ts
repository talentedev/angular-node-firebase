import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgcCookieConsentService, NgcInitializeEvent, NgcStatusChangeEvent, NgcNoCookieLawEvent } from 'ngx-cookieconsent';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;

  menuState = true;
  deviceInfo = null;
  public constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private deviceService: DeviceDetectorService,
    private ccService: NgcCookieConsentService
    ) {
      this.epicFunction();

      // Update user activity
      if (this.authService.authState) {
        const uid = this.authService.authState.uid;
        this.authService.updateRecentActivity(uid).subscribe();
      }
    }

  ngOnInit() {
    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('popupOpen');
      });
 
    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
      () => {
        console.log('popupClose');
      });
 
    this.initializeSubscription = this.ccService.initialize$.subscribe(
      (event: NgcInitializeEvent) => {
        console.log('initialize');
      });
 
    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        console.log('statusChange');
        console.log(this.ccService.hasConsented());
        console.log(this.ccService.getConfig());
      });
 
    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        console.log('revokeChoice');
      });
 
    this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event: NgcNoCookieLawEvent) => {
        console.log('noCookieLaw');
      });
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onClickWrapper() {
    this.menuState = false;
    return true;
  }

  onHide($event) {
    this.menuState = $event;
    console.log('menu', this.menuState);
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();

    if (isMobile) {
      this.menuState = false;
    }
  }

  ngOnDestroy() {
    // unsubscribe to cookieconsent observables to prevent memory leaks
    this.popupOpenSubscription.unsubscribe();
    this.popupCloseSubscription.unsubscribe();
    this.initializeSubscription.unsubscribe();
    this.statusChangeSubscription.unsubscribe();
    this.revokeChoiceSubscription.unsubscribe();
    this.noCookieLawSubscription.unsubscribe();
  }
}
