import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HighchartsChartModule  } from 'highcharts-angular';
import { NgxLoadingModule } from 'ngx-loading';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChartsModule, WavesModule, InputsModule, ButtonsModule, IconsModule, ModalModule, TableModule } from 'angular-bootstrap-md';

import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { EditCardComponent } from './edit-card/edit-card.component';
import { DeleteCardComponent } from './delete-card/delete-card.component';
import { StackedChartComponent } from './stacked-chart/stacked-chart.component';
import { CustomDonationComponent } from './custom-donation/custom-donation.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ChangePaymentComponent } from './change-payment/change-payment.component';
import { SchedulePipe } from '../../core/pipes/schedule.pipe';
import { CancelDonationComponent } from './cancel-donation/cancel-donation.component';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UserRoutingModule,
    HighchartsChartModule,
    NgxLoadingModule.forRoot({}),
    ChartsModule,
    WavesModule,
    FontAwesomeModule,
    InputsModule,
    ButtonsModule,
    IconsModule,
    ModalModule,
    TableModule
  ],
  declarations: [
    UserComponent,
    DashboardComponent,
    ProfileComponent,
    EditProfileComponent,
    EditCardComponent,
    DeleteCardComponent,
    StackedChartComponent,
    CustomDonationComponent,
    TransactionsComponent,
    ChangePaymentComponent,
    SchedulePipe,
    CancelDonationComponent
  ],
  entryComponents: [
    EditCardComponent,
    DeleteCardComponent,
    CustomDonationComponent,
    ChangePaymentComponent,
    CancelDonationComponent
  ]
})
export class UserModule { }
