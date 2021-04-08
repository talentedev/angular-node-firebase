import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';

import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { UserService } from '../../../core/services/user.service';
import { SubscriptionPaymentComponent } from '../subscription-payment/subscription-payment.component';
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {

  charity;
  donation;
  cards;
  modals = [];

  error: string;
  name: string;
  email: string;
  authState;
  invalidCard = false;
  errorMessage = '';
  isNewCard = false;
  selectedCard = null;

  elements: Elements;
  cardNumber: StripeElement;
  isBack = false;
  donationElements;
  isSubmitting = false;
  faSpinner = faSpinner;
  customerName = '';
  constructor(
    public modalRef: MDBModalRef,
    private modalService: MDBModalService,
    private auth: AuthService,
    private payments: PaymentsService,
    private stripeService: StripeService,
    private userService: UserService,
  ) {
    this.customerName = this.auth.authState.firstName + ' ' + this.auth.authState.lastName;
  }

  ngOnInit() {
    if (this.cards.length > 0) {
      // Except the expirted cards.
      var now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      this.cards = this.cards.filter(card => !(card.exp_year <= year && card.exp_month <= month));
      this.selectedCard = this.cards[0];
    }
    this.stripeService.elements()
      .subscribe(elements => {
        this.elements = elements;
        if (!this.cardNumber) {
          const style = {
            base: {
              iconColor: '#666EE8',
              color: '#31325F',
              lineHeight: '40px',
              fontWeight: 300,
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSize: '18px',
              '::placeholder': {
                color: '#CFD7E0'
              }
            }
          };
          this.cardNumber = this.elements.create('card', {style: style});
          this.cardNumber.mount('#card-number');

          if (this.selectedCard === null || this.selectedCard === undefined) {
            this.isNewCard = true;
            setTimeout(() => { this.cardNumber.focus(); }, 2000);
          }
        }
      });
    this.modals.push(this.modalRef);
  }

  ngOnDestroy() {
    if (this.cardNumber !== undefined && this.cardNumber !== null) {
      this.cardNumber.unmount();
    }
  }

  onChangeCard(card) {
    if (card) {
      this.isNewCard = false;
      this.selectedCard = card;
    } else {
      this.isNewCard = true;
      this.selectedCard = null;
      setTimeout(() => { this.cardNumber.focus(); });
    }
  }

  back() {
    this.modalRef.hide();

    const modalOptions = {
      backdrop: true,
      keyboard: true,
      focus: true,
      show: false,
      ignoreBackdropClick: false,
      class: '',
      containerClass: '',
      animated: true,
      modals: this.modals,
      data: {
        charity: this.charity,
        selectedCard: this.selectedCard,
        isNewCard: this.isNewCard,
        donationElements: this.donationElements
      }
    };
    this.modalService.show(SubscriptionPaymentComponent, modalOptions);
  }
  open() {
    this.invalidCard = false;
    this.isSubmitting = true;
    this.errorMessage = '';
    if (this.isNewCard) {
      if ( this.customerName === '' ) {
        this.invalidCard = true;
        this.isSubmitting = false;
        this.errorMessage = 'Please input your name.';
        return;
      }
      this.stripeService.createToken(this.cardNumber, {name: this.customerName}).subscribe(async(result) => {
        if (result.token) {
          const modalOptions = {
            backdrop: true,
            keyboard: true,
            focus: true,
            show: false,
            ignoreBackdropClick: false,
            class: '',
            containerClass: '',
            animated: true,
            data: {
              token: result.token,
              charity: this.charity,
              donation: this.donation,
              name: this.name,
              email: this.email,
              cards: this.cards,
              modals: this.modals,
              isNewCard: this.isNewCard,
              donationElements: this.donationElements,
            }
          };
          await this.userService.getUserCards();
          this.modalService.show(PaymentConfirmationComponent, modalOptions);
          this.modalRef.hide();
        } else {
          this.invalidCard = true;
          this.isSubmitting = false;
          this.errorMessage = result.error.message;
        }
      });
    } else {
      const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: false,
        class: '',
        containerClass: '',
        animated: true,
        data: {
          token: null,
          charity: this.charity,
          donation: this.donation,
          customer: this.selectedCard ? this.selectedCard.customer : null,
          name: this.name,
          email: this.email,
          modals: this.modals,
          cards: this.cards,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements
        }
      };
      this.modalService.show(PaymentConfirmationComponent, modalOptions);
      this.modalRef.hide();
    }
  }
}
