import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';

import { PaymentComponent } from '../payment/payment.component';
import { CustomDonationComponent } from '../custom-donation/custom-donation.component';
import { UserService } from '../../../core/services/user.service';
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-subscription-payment',
  templateUrl: './subscription-payment.component.html',
  styleUrls: ['./subscription-payment.component.scss']
})
export class SubscriptionPaymentComponent implements OnInit {

  charity: any;
  isLoading = false;
  faMagic = faMagic;
  faSpinner = faSpinner;
  modals = [];
  selectedCard = null;
  isNewCard = false;
  donationElements = [
    {
      donationAmount: 3,
      donationFrequency: 'every day',
      stripeFrequency: 'day',
      active: false
    },
    {
      donationAmount: 10,
      donationFrequency: 'every week',
      stripeFrequency: 'week',
      active: false
    },
    {
      donationAmount: 50,
      donationFrequency: 'every month',
      stripeFrequency: 'month',
      active: false
    }
  ];

  donationAmount: string;
  donationFrequency: string;
  selectedDonation = this.donationElements[1];

  constructor(
    public modalRef: MDBModalRef,
    private modalService: MDBModalService,
    private userService: UserService
    ) { }

  selectDonationAmount(donation, index) {

    if (this.isLoading) { return; }

    this.donationElements.forEach(element => {
      element.active = false;
    });

    if (index !== 2) {
      this.donationAmount = donation.donationAmount;
      this.donationFrequency = donation.stripeFrequency;

      this.donationElements.forEach(element => {
        if (element !== donation) {
          element.active = false;
        }

        if (this.selectedDonation && element === this.selectedDonation) {
          element.active = false;
          this.selectedDonation = null;
        }
      });

      this.selectedDonation = donation;
      this.selectedDonation.active = true;
      this.isLoading = true;
      this.open();
    } else {
      donation.active = true;
      this.customizeDonation();
    }
  }

  ngOnInit() {
    this.modals.push(this.modalRef);
  }

  open() {
    this.userService.getPayments().subscribe(cards => {

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
          cards: cards,
          donation: this.selectedDonation,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements
          // modals: [this.modalRef]
        }
      };

      this.modalService.show(PaymentComponent, modalOptions);
      this.modalRef.hide();
      this.isLoading = false;
    });
  }

  customizeDonation() {
    this.userService.getPayments().subscribe(cards => {
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
          donation: this.selectedDonation,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements,
          cards: cards
        }
      };
      this.modalService.show(CustomDonationComponent, modalOptions);
      this.modalRef.hide();
    });
  }

}
