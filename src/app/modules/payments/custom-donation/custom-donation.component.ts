import { Component, OnInit } from '@angular/core';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';

import { PaymentComponent } from '../payment/payment.component';
import { UserService } from '../../../core/services/user.service';
import { SubscriptionPaymentComponent } from '../subscription-payment/subscription-payment.component';

@Component({
  selector: 'app-custom-donation',
  templateUrl: './custom-donation.component.html',
  styleUrls: ['./custom-donation.component.scss']
})
export class CustomDonationComponent implements OnInit {

  donationAmount;
  donationSchedule = 'week';
  charity;
  modals = [];
  donation;
  selectedCard;
  isNewCard;
  donationElements;
  cards;
  invalidAmount = false;
  errorMsg = '';

  constructor(
    public modalRef: MDBModalRef,
    private modalService: MDBModalService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.modals.push(this.modalRef);
    const amount = 10;
    this.donationAmount = amount.toFixed(2);
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
          cards: this.cards,
          donation: this.donation,
          modals: this.modals,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements
      }
    };
    this.modalService.show(SubscriptionPaymentComponent, modalOptions);
  }

  next() {
    this.invalidAmount = !this.isValidNumber(this.donationAmount);
    if (this.invalidAmount) {
      this.errorMsg = 'Invalid value!';
    } else if (parseInt(this.donationAmount) < 3) {
      this.invalidAmount = true;
      this.errorMsg = 'We\'re sorry, but $3.00 is the minimum donation amount.';
    }
    if (!this.invalidAmount) {
      const selectedDonation = {
        donationAmount: this.donationAmount,
        stripeFrequency: this.donationSchedule,
        donationFrequency: 'every ' + this.donationSchedule
      };
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
          charity: this.charity,
          cards: this.cards,
          donation: selectedDonation,
          modals: this.modals,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements
        }
      };
      this.modalService.show(PaymentComponent, modalOptions);
      this.modalRef.hide();
    }
  }

  // Check valid number
  isValidNumber(str) {
    if (typeof str === 'number') {
      str = str.toString();
    }
    const regex = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/;
    return regex.test(str);
  }

}
