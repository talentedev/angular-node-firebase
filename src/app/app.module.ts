import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { NgxStripeModule } from 'ngx-stripe';
import { NgxLoadingModule } from 'ngx-loading';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';

import { environment } from '../environments/environment';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { PagesModule } from './modules/pages/pages.module';
import { CharitiesModule } from './modules/charities/charities.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

// Services
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';
import { ChartService } from './core/services/chart.service';
import { TitleService } from './core/services/title.service';
import { PaymentsService } from './core/services/payments.service';
import { MailChimpService } from './core/services/mailchimp.service';
import { ContentfulService } from './core/services/contentful.service';
import { ContentfulPreviewService } from './core/services/contentful-preview.service';

// Components
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { MainComponent } from './core/components/main/main.component';
import { FaqsComponent } from './core/components/faqs/faqs.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { SubscriptionPaymentComponent } from './modules/payments/subscription-payment/subscription-payment.component';
import { PaymentComponent } from './modules/payments/payment/payment.component';
import { PaymentConfirmationComponent } from './modules/payments/payment-confirmation/payment-confirmation.component';
import { PasswordlessAuthComponent } from './modules/auth/passwordless-auth/passwordless-auth.component';
import { StartComponent } from './core/components/start/start.component';
import { BackComponent } from './core/components/back/back.component';
import { AboutComponent } from './core/components/about/about.component';

const cookieConfig:NgcCookieConsentConfig = {
  cookie: {
    domain: 'allgive.herokuapp.com' // or 'your.domain.com' // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
  },
  palette: {
    popup: {
      background: '#2d2b2f'
    },
    button: {
      background: '#575757'
    }
  },
  theme: 'classic',
  type: 'opt-out',
  layout: 'my-custom-layout',
  layouts: {
    "my-custom-layout": '{{messagelink}}{{compliance}}'
  },
  elements:{
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message" style="font-family: Nunito; font-size: 17px;">{{message}} 
      <a aria-label="learn more about our privacy policy" tabindex="1" class="cc-link" href="{{privacyPolicyHref}}" target="_blank" style="color: #0a8cc9;">{{privacyPolicyLink}}</a> 
    </span>
    `,
  },
  compliance: {
    'opt-out': '<div class="cc-compliance cc-highlight">{{dismiss}}{{allow}}</div>',
  },
  content:{
    message: 'This website stores cookies on your computer. These cookies are used to collect information about how you interact with our website and allow us to remember you. We use this information in order to improve and customize your browsing experience and for analytics and metrics about our visitors both on this website and other media. To find out more about the cookies we use, see our ',
    
    privacyPolicyLink: 'Privacy Policy',
    privacyPolicyHref: 'https://allgive.herokuapp.com/pages/legal',

    allow: 'I AGREE!',
    dismiss: 'NO THANKS',
  }
};

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    MainComponent,
    FaqsComponent,
    ContactComponent,
    PasswordlessAuthComponent,
    StartComponent,
    BackComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    NgxStripeModule.forRoot(environment.stripeKey),
    NgbModule,
    SharedModule,
    CharitiesModule,
    UserModule,
    AuthModule,
    PaymentsModule,
    PagesModule,
    AppRoutingModule,
    NgxLoadingModule.forRoot({}),
    FontAwesomeModule,
    MDBBootstrapModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    NgcCookieConsentModule.forRoot(cookieConfig)
  ],
  providers: [
    HttpClient, Title, ContentfulService, ContentfulPreviewService, TitleService,
    AuthService, AuthGuard, PaymentsService, MailChimpService, UserService, ChartService ],
  bootstrap: [ AppComponent ],
  entryComponents: []
})
export class AppModule { }
