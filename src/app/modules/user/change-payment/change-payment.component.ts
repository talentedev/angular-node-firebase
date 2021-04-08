import { Component, OnInit, OnDestroy } from '@angular/core';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-change-payment',
  templateUrl: './change-payment.component.html',
  styleUrls: ['./change-payment.component.scss']
})
export class ChangePaymentComponent implements OnInit, OnDestroy {

  action: Subject<any> = new Subject();
  cardId;
  subscriptionId;
  customerId;

  cards;
  error: string;
  invalidCard = false;
  errorMessage = '';
  isNewCard = false;
  selectedCard = null;

  elements: Elements;
  cardNumber: StripeElement;
  donationElements;
  isSubmitting = false;
  faSpinner = faSpinner;
  customerName = '';
  isShowInputName = false;
  constructor(
    public modalRef: MDBModalRef,
    private modalService: MDBModalService,
    private auth: AuthService,
    private stripeService: StripeService,
    private userService: UserService,
  ) {
    this.customerName = this.auth.authState.firstName + ' ' + this.auth.authState.lastName;
  }

  ngOnInit() {
    // Except the expirted cards.
    var now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.cards = this.cards.filter(card => !(card.exp_year <= year && card.exp_month <= month));

    this.cards.forEach(card => {
      if (card.id === this.cardId) {
        this.selectedCard = card;
      }
    });
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

        }
      });
  }

  onChangeCard(card) {
    if (card) {
      this.isNewCard = false;
      this.selectedCard = card;
      this.isShowInputName = false;
    } else {
      this.isNewCard = true;
      this.selectedCard = null;
      this.isShowInputName = true;
      setTimeout(() => { this.cardNumber.focus() });
    }
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
      this.stripeService.createToken(this.cardNumber, {name: this.customerName}).subscribe((result) => {
        if (result.token) {
          const data = {
            uid: this.auth.authState.uid,
            token: result.token,
            customerId: this.customerId,
            subscriptionId: this.subscriptionId,
            isNewCard: true
          };
          this.userService.changePayment(data).subscribe(res => {
            this.action.next(true);
            this.modalRef.hide();
          });
        } else {
          this.invalidCard = true;
          this.isSubmitting = false;
          this.errorMessage = result.error.message;
        }
      });
    } else {
      const data = {
        uid: this.auth.authState.uid,
        cardId: this.selectedCard.id,
        subscriptionId: this.subscriptionId,
        isNewCard: false
      };
      this.userService.changePayment(data).subscribe(res => {
        this.action.next(true);
        this.modalRef.hide();
      });
    }
  }

  ngOnDestroy() {
    if (this.cardNumber !== undefined && this.cardNumber !== null) {
      this.cardNumber.unmount();
    }
  }
}

