import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';

import { PaymentsService } from '../../../core/services/payments.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomDonationComponent } from '../../user/custom-donation/custom-donation.component';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-change-subscription',
  templateUrl: './change-subscription.component.html',
  styleUrls: ['./change-subscription.component.scss']
})
export class ChangeSubscriptionComponent implements OnInit {

  choosedOrg: any;
  callback: any;

  loading = false;
  last4 = '';
  isSaving = false;

  constructor(public modalRef: MDBModalRef,
    private payments: PaymentsService,
    private router: Router,
    private auth: AuthService,
    private modalService: MDBModalService,
    private stripeService: StripeService,
    private paymentsService: PaymentsService,
    private userService: UserService
    ) { }

  ngOnInit() {
    this.userService.cards.forEach(card => {
      if (this.choosedOrg.cardid === card.id) {
        this.last4 = card.last4;
      }
    });
    this.choosedOrg.amount /= 100;
  }

  cancelDonation() {
    if (confirm('Are you sure to cancel this donation?')) {
      const data = {
        uid: this.auth.authState.uid,
        subscription_id: this.choosedOrg.subscriptionId
      };
      this.loading = true;
      this.paymentsService.processCancelSubscription(data).subscribe(res => {
        // this.init();
        this.modalRef.hide();
      });
    }
  }

  hideModal() {
    this.modalRef.hide();
  }

  updateSchedule() {

    if (this.isSaving) {
      return;
    }

    const data = {
      uid: this.auth.authState.uid,
      donation: this.choosedOrg.amount * 100,
      frequency: this.choosedOrg.schedule,
      charity_name: this.choosedOrg.charityname,
      token: null,
      subscription_id: this.choosedOrg.subscriptionId,
      productId: this.choosedOrg.productId,
      cardId: this.choosedOrg.cardId,
    };
    this.loading = true;
    this.isSaving = true;
    this.paymentsService.processUpdateSubscription(data).subscribe((result) => {
      this.isSaving = true;
      this.modalRef.hide();
      this.callback();
    });
  }

  selectDonate(amount, schedule) {
    this.choosedOrg.amount = amount;
    this.choosedOrg.daily = amount;
    this.choosedOrg.schedule = schedule;
  }

  openCustomDonationModal() {
    const modalOptions = {
      data: {
        donationAmount: this.choosedOrg.amount,
        donationSchedule: this.choosedOrg.schedule
      }
    };
    const modalRef = this.modalService.show(CustomDonationComponent, modalOptions);

    modalRef.content.action.subscribe( (result: any) => {
      this.choosedOrg.daily = result.amount;
      this.choosedOrg.amount = result.amount;
      this.choosedOrg.schedule = result.schedule;
    });
  }

  endDate(month, year) {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const todayStr = mm + '/' + dd + '/' + yyyy;
    const endDate = month + '/30/' + year;

    const date1 = new Date(todayStr);
    const date2 = new Date(endDate);
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

}
