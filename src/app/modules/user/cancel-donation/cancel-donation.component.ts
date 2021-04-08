import { Component, OnInit } from '@angular/core';
import { MDBModalRef } from 'angular-bootstrap-md';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cancel-donation',
  templateUrl: './cancel-donation.component.html',
  styleUrls: ['./cancel-donation.component.scss']
})
export class CancelDonationComponent implements OnInit {

  action: Subject<any> = new Subject();

  constructor(
    public modalRef: MDBModalRef,
  ) { }

  ngOnInit() {
  }

  submit() {
    this.action.next(true);
    this.modalRef.hide();
  }

}
