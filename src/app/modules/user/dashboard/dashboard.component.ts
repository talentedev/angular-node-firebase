import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagic, faSpinner, faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { MDBModalService } from 'angular-bootstrap-md';

import { EditCardComponent } from '../edit-card/edit-card.component';
import { DeleteCardComponent } from '../delete-card/delete-card.component';
import { CustomDonationComponent } from '../custom-donation/custom-donation.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { ChangePaymentComponent } from '../change-payment/change-payment.component';
import { CancelDonationComponent } from '../cancel-donation/cancel-donation.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ChartService } from '../../../core/services/chart.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public loading = false;

  firstName = '';
  title = 'Portfolio | Allgive.org';
  showCharityManageView = false;
  showPaymentDetail = [false, false];
  donationOrgs = [];
  selectedOrg = null;
  choosedOrg = null;
  chartOptions: object;
  updateChart = false;
  totalDonation = 0;
  totalProjection = 0;
  charityLogos = [];
  payments = [];
  transactions = [];
  projectionPeriods = [
    'Daily Giving Total',
    'Weekly Giving Total',
    'Monthly Giving Total',
    'Quarterly Giving Total',
    '2019 Year-End-Projection'
  ];
  selectedProjection = '2019 Year-End-Projection';
  averageProjection = '$0.00';
  approximate = false;
  chartData;
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl({value: '', disabled: true})
  });
  faMagic = faMagic;
  faSpinner = faSpinner;
  isSavingProfile = false;
  last4 = '';
  selectedBrand = '';
  showTransaction = false;
  buttonName = 'View Transactions';
  isSubmitting = false;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private contentfullService: ContentfulService,
    private chartService: ChartService,
    private modalService: NgbModal,
    private mdbModalService: MDBModalService,
    private paymentsService: PaymentsService
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
    this.chartOptions = this.chartService.getChartOptions([], this);
    this.init();
  }

  init() {
    this.loading = true;
    this.showCharityManageView = false;
    this.getUserInfo();
  }

  getUserInfo() {
    this.firstName = this.authService.authState.firstName;
    this.profileForm.patchValue({
      firstName: this.authService.authState.firstName,
      lastName: this.authService.authState.lastName,
      email: this.authService.authState.email
    });

    this.userService.getDonations().subscribe(donations => {
      setTimeout(() => {
        this.userService.getTransactions().subscribe(transactions => {
          this.transactions = transactions;
          this.totalDonation = this.chartService.getTotalDonationAmount(transactions);
          this.chartService.processDonations(donations, transactions).then((res: any[]) => {
            this.donationOrgs = res;
            this.chartOptions = this.chartService.getChartOptions(this.donationOrgs, this);
            if (this.donationOrgs.length > 0) {
              this.getCharityLogos(this.donationOrgs);
            }
            this.chartData = transactions;
            this.updateChart = true;
            this.totalProjection = this.chartService.calTotalProjection(this.donationOrgs) || this.totalDonation;
            this.averageProjection = '$' + this.totalProjection.toFixed(2);

            this.loading = false;
            this.isSubmitting = false;
            this.userService.getPayments().subscribe(payments => {
              var now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth() + 1;
              this.payments = [];
              payments.forEach(payment => {
                payment.charities = this.donationOrgs.filter(donationOrg => donationOrg.cardId === payment.id);
                if (payment.exp_year <= year && payment.exp_month <= month) {
                  payment.expired = true;
                } else {
                  payment.expired = false;
                }
                this.payments.push(payment);
              });
            });
          });
        });
      }, 2000);
    }, err => {
      this.loading = false;
      this.isSubmitting = false;
    });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  setProjectionPeriod(index) {
    this.selectedProjection = this.projectionPeriods[index];
    switch (index) {
      case 0:
        this.averageProjection = '$' + (this.totalProjection / 365).toFixed(2) + '/day';
        this.approximate = true;
        break;
      case 1:
        this.averageProjection = '$' + (this.totalProjection / 52).toFixed(2) + '/week';
        this.approximate = true;
        break;
      case 2:
        this.averageProjection = '$' + (this.totalProjection / 12).toFixed(2) + '/month';
        this.approximate = true;
        break;
      case 3:
        this.averageProjection = '$' + (this.totalProjection / 4).toFixed(2) + '/quarter';
        this.approximate = true;
        break;
      case 4:
        this.averageProjection = '$' + this.totalProjection.toFixed(2);
        this.approximate = false;
        break;
      default:
        this.averageProjection = '';
        this.approximate = false;
        break;
    }
  }

  addCharity() {
    this.router.navigate(['/charities']);
  }

  getCharityLogos(data) {
    return new Promise(resolve => {
      this.chartService.getCharityLogo(data).subscribe(res => {
        this.charityLogos = [];
        for (let i = 0; i < res.length; ++i) {
          const image = res[i] && res[i].logo || 'https://via.placeholder.com/800x800?text=Image%20Missing';
          this.charityLogos.push(image);
        }
        resolve();
      });
    });
  }

  isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
  }

  setShowCharityManage(value, chartity= null, scrollTarget=null) {
    if (value) {
      scrollTarget.scrollIntoView();
    }
    this.showCharityManageView = value;
    if (chartity != null) {
      this.choosedOrg = {...chartity};
      this.payments.forEach(card => {
        if (this.choosedOrg.cardId === card.id) {
          this.last4 = card.last4;
          this.selectedBrand = card.brand;
        }
      });
    }
  }

  cancelDonation() {
    const modalRef = this.mdbModalService.show(CancelDonationComponent);
    modalRef.content.action.subscribe( (result: any) => {
      if (result === true) {
        this.updateChart = false;
        const data = {
          uid: this.authService.authState.uid,
          subscription_id: this.choosedOrg.subscriptionId
        };
        this.setShowCharityManage(false);
        this.loading = true;
        this.paymentsService.processCancelSubscription(data).subscribe(res => {
          this.init();
        });
      }
    });
  }

  updateSchedule() {
    const data = {
      uid: this.authService.authState.uid,
      donation: this.choosedOrg.daily * 100,
      frequency: this.choosedOrg.schedule,
      charity_name: this.choosedOrg.charityname,
      token: null,
      subscription_id: this.choosedOrg.subscriptionId,
      cardId: this.choosedOrg.cardId,
      productId: this.choosedOrg.productId
    };
    this.isSubmitting = true;
    this.paymentsService.processUpdateSubscription(data).subscribe(result => {
      this.getUserInfo();
      this.setShowCharityManage(false);
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
        donationAmount: this.choosedOrg.daily,
        donationSchedule: this.choosedOrg.schedule
      }
    };
    const modalRef = this.mdbModalService.show(CustomDonationComponent, modalOptions);
    modalRef.content.action.subscribe( (result: any) => {
      this.choosedOrg.daily = result.amount;
      this.choosedOrg.schedule = result.schedule;
    });
  }

  togglePaymentDetail(index) {
    this.showPaymentDetail[index] = !this.showPaymentDetail[index];
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

  editCard(card) {
    const modalRef = this.modalService.open(EditCardComponent, { centered: true });
    modalRef.componentInstance.card = card;
    modalRef.result.then(result => {
    }, reason => {
      if (reason === 'success') {
        this.init();
      }
    });
  }

  deleteCard(card) {
    const modalRef = this.modalService.open(DeleteCardComponent, { centered: true });
    modalRef.componentInstance.cards = this.payments;
    modalRef.componentInstance.selectedCard = card;
    modalRef.result.then(result => {
    }, reason => {
      if (reason === 'success') {
        this.init();
      }
    });
  }

  updateProfile() {
    this.isSavingProfile = true;
    const data = {
      uid: this.authService.authState.uid,
      firstName: this.capitalize(this.profileForm.value.firstName),
      lastName: this.capitalize(this.profileForm.value.lastName)
    };
    this.userService.updateProfile(data).subscribe(res => {
      this.authService.syncAuthState().then(() => {
        this.isSavingProfile = false;
        this.getUserInfo();
      });
    });
  }

  capitalize(str) {
    if (str === str.toUpperCase()) {
      str = str.toLowerCase();
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  viewTransactions() {
    this.showTransaction = !this.showTransaction;
    if (this.showTransaction) {
      this.buttonName = 'View Graph';
    } else {
      this.buttonName = 'View Transactions';
    }
  }

  changePayment(choosedOrg) {
    const modalOptions = {
      data: {
        cardId: choosedOrg.cardId,
        subscriptionId: choosedOrg.subscriptionId,
        customerId: this.payments[0].customer,
        cards: this.payments
      }
    };
    const modalRef = this.mdbModalService.show(ChangePaymentComponent, modalOptions);
    modalRef.content.action.subscribe( (result: any) => {
      if (result === true) {
        this.init();
      }
    });
  }
}
