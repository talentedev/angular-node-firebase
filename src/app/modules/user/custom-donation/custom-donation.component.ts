import { Component, OnInit } from '@angular/core';
import { MDBModalRef } from 'angular-bootstrap-md';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-donation',
  templateUrl: './custom-donation.component.html',
  styleUrls: ['./custom-donation.component.scss']
})
export class CustomDonationComponent implements OnInit {

  action: Subject<any> = new Subject();
  donationAmount;
  donationSchedule;
  invalidAmount = false;
  errorMsg = '';

  constructor(
    public modalRef: MDBModalRef
  ) { }

  ngOnInit() {
    this.donationAmount = this.donationAmount.toFixed(2);
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
      const data = {
        amount: parseFloat(this.donationAmount),
        schedule: this.donationSchedule
      };
      this.modalRef.hide();
      this.action.next(data);
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
