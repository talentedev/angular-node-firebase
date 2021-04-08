import { Component, OnInit, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';

import { PaymentsService } from '../../../core/services/payments.service';
import { AuthService } from '../../../core/services/auth.service';
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PaymentComponent } from '../payment/payment.component';
import { tokenKey } from '@angular/core/src/view';

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss']
})
export class PaymentConfirmationComponent implements OnInit {

  charity;
  donation;
  customer;
  token;
  modals = [];
  authState;
  invalidCard = false;
  errorMessage = '';
  card_id;
  isSubmitting = false;
  faMagic = faMagic;
  faSpinner = faSpinner;
  cards = [];
  selectedDonation;
  selectedCard;
  isNewCard;
  donationElements;
  constructor(
    public modalRef: MDBModalRef,
    private payments: PaymentsService,
    private router: Router,
    private auth: AuthService,
    private modalService: MDBModalService,
    private stripeService: StripeService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.authState = this.auth.authState;
    this.modals.push(this.modalRef);
  }

  onSubmit() {

    if (this.isSubmitting) { return; }
    if (this.invalidCard) {
      this.closeAllModals();
      return;
    }
    this.invalidCard = false;
    this.errorMessage = '';
    // Convert charge amount to pennies for Stripe
    const stripeAmount = this.donation.donationAmount * 100;
    const data = {
      uid: this.authState.uid,
      donation: stripeAmount,
      frequency: this.donation.stripeFrequency,
      user: this.authState,
      charity: this.charity,
      token: this.token,
      customer: this.customer,
      card: this.selectedCard ? this.selectedCard : null,
    };
    this.isSubmitting = true;

    if (this.token != null) {
      this.payments.processNewSubscription(data)
        .subscribe(res => {
          this.isSubmitting = false;
          if (res.message) {
            this.invalidCard = true;
            const errorData = {
              user: this.authState,
              msg: res.message,
              card: this.token.card,
            };
            this.payments.processCardError(errorData).subscribe();
            this.errorMessage = res.message;
          } else {
            this.closeAllModals();
            this.router.navigate(['/portfolio'], { queryParams: { donation: 'success' } });
          }
        });
    } else {
      this.payments.processSubscription(data)
        .subscribe(res => {
          this.isSubmitting = false;
          if (res.message) {
            this.invalidCard = true;
            const errorData = {
              user: this.authState,
              msg: res.message,
              card: this.selectedCard,
            };
            this.payments.processCardError(errorData).subscribe();
            this.errorMessage = res.message;
          } else {
            this.ngZone.run(_ => {
              this.closeAllModals();
              this.router.navigate(['/portfolio'], { queryParams: { donation: 'success' } });
            });
          }
        });
    }
  }

  back() {

    const modalOptions = {
      backdrop: false,
      keyboard: true,
      focus: true,
      show: false,
      ignoreBackdropClick: false,
      class: '',
      containerClass: '',
      animated: true,
      data: {
        charity: this.charity,
        cards: this.cards,
        donation: this.donation,
        selectedCard: this.selectedCard,
        isNewCard: this.isNewCard,
        donationElements: this.donationElements
      }
    };
    this.modalService.show(PaymentComponent, modalOptions);
    this.modalRef.hide();
  }

  closeAllModals() {
    for (let i = 0; i < this.modals.length; ++i) {
      this.modals[i].hide();
    }
    setTimeout(() => {
      const elements: any = document.getElementsByTagName('mdb-modal-container');
      for (let i = 0; i < elements.length; i++) {
        elements[0].style.display = 'none';
      }
    }, 500);
  }
}
