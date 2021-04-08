import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-delete-card',
  templateUrl: './delete-card.component.html',
  styleUrls: ['./delete-card.component.css']
})
export class DeleteCardComponent implements OnInit {

  @Input() cards;
  @Input() selectedCard;
  selectedOption = 'deleteAll';
  availableCards = [];
  assignedCard;
  faSpinner = faSpinner;
  customerName;

  elements: Elements;
  cardNumber: StripeElement;

  isProcessing = false;
  invalidCard = false;
  errorMessage = '';
  authState;
  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private auth: AuthService,
    private stripeService: StripeService
  ) {
    this.customerName = this.auth.authState.firstName + ' ' + this.auth.authState.lastName;
  }

  ngOnInit() {
    // Except the expirted cards.
    var now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.cards = this.cards.filter(card => card.exp_year >= year && card.exp_month > month);

    this.availableCards = this.cards.filter(card => card.id !== this.selectedCard.id);
    this.assignedCard = this.availableCards[0] || null;
    this.isProcessing = false;
    this.authState = this.auth.authState;
  }

  onDelete() {
    this.selectedOption = 'deleteAll';
  }

  onAssign() {
    this.selectedOption = 'assignCard';
  }

  onSelectCard(card) {
    this.assignedCard = card;
    if (!card) {
      this.renderStripeCard();
    }
  }

  submit() {

    if (this.isProcessing) { return; }
    this.isProcessing = true;
    this.invalidCard = false;
    this.errorMessage = '';
    if (this.selectedOption === 'assignCard' && this.assignedCard === null) {
      if ( this.customerName === '' ) {
        this.invalidCard = true;
        this.isProcessing = false;
        this.errorMessage = 'Please input your name.';
        return;
      }
      this.stripeService.createToken(this.cardNumber, {name: this.customerName}).subscribe((result) => {
        if (result.token) {
          const data = {
            isDelete: false,
            card: this.selectedCard,
            assignedCard: result.token,
            uid: this.authState.uid,
            isNewCard: true,
            email: this.authState.email
          };
          this.userService.deleteCard(data).subscribe(res => {
            this.activeModal.dismiss('success');
            this.isProcessing = false;
            // this.userService.sendEmailForDeletePaymentMethod(data).subscribe();
          });
        } else {
          this.invalidCard = true;
          this.isProcessing = false;
          this.errorMessage = result.error.message;
        }
      });
    } else {
      const isDelete = this.selectedOption === 'deleteAll' ? true : false;
      const assignedCard = this.selectedOption === 'deleteAll' ? null : this.assignedCard;
      const data = {
        isDelete: isDelete,
        card: this.selectedCard,
        assignedCard: assignedCard,
        uid: this.authState.uid
      };
      this.userService.deleteCard(data).subscribe(res => {
        this.activeModal.dismiss('success');
        this.isProcessing = false;
        // this.userService.sendEmailForDeletePaymentMethod(data).subscribe();
      });
    }
  }

  renderStripeCard() {
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

  ngOnDestroy() {
    if (this.cardNumber !== undefined && this.cardNumber !== null) {
      this.cardNumber.unmount();
    }
  }
}
