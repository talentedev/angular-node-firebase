import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.css']
})
export class EditCardComponent implements OnInit {

  @Input() card;

  months = [];
  years = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    public activeModal: NgbActiveModal
  ) { }

  editCardForm = this.fb.group({
    expMonth: [''],
    expYear: [''],
    name: [''],
    address: [''],
    address2: [''],
    city: [''],
    state: [''],
    zip: ['']
  });

  ngOnInit() {

    this.editCardForm.setValue({
      expMonth: this.card.exp_month,
      expYear: this.card.exp_year,
      name: this.card.name,
      address: this.card.address_line1 || '',
      address2: this.card.address_line2 || '',
      city: this.card.address_city || '',
      state: this.card.address_state || '',
      zip: this.card.address_zip
    });

    this.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const today = new Date();
    let yyyy = today.getFullYear();
    for (let i = 0; i < 20; ++i) {
      this.years.push(yyyy);
      yyyy++;
    }
  }

  submit() {
    const data = {
      uid: this.authService.authState.uid,
      id: this.card.id,
      customer: this.card.customer,
      expMonth: this.editCardForm.value.expMonth,
      expYear: this.editCardForm.value.expYear,
      name: this.editCardForm.value.name,
      address: this.editCardForm.value.address,
      address2: this.editCardForm.value.address2,
      city: this.editCardForm.value.city,
      state: this.editCardForm.value.state,
      zip: this.editCardForm.value.zip
    };

    this.userService.updateCard(data).subscribe(res => {
      this.activeModal.dismiss('success');
    });
  }
}
