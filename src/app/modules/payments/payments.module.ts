import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputsModule, ButtonsModule, IconsModule } from 'angular-bootstrap-md';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PaymentsRouterModule } from './payments-router.module';
import { PaymentComponent } from './payment/payment.component';
import { SubscriptionPaymentComponent } from './subscription-payment/subscription-payment.component';
import { PaymentConfirmationComponent } from './payment-confirmation/payment-confirmation.component';
import { CustomDonationComponent } from './custom-donation/custom-donation.component';
import { ChangeSubscriptionComponent } from './change-subscription/change-subscription.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PaymentsRouterModule,
    InputsModule,
    ButtonsModule,
    IconsModule,
    NgbModule,
    FontAwesomeModule
  ],
  declarations: [
    PaymentComponent,
    SubscriptionPaymentComponent,
    PaymentConfirmationComponent,
    CustomDonationComponent,
    ChangeSubscriptionComponent
  ],
  entryComponents: [
    PaymentComponent,
    SubscriptionPaymentComponent,
    PaymentConfirmationComponent,
    CustomDonationComponent,
    ChangeSubscriptionComponent
  ]
})
export class PaymentsModule { }
