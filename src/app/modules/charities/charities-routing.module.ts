import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CharitiesComponent } from './charities.component';
import { CharitiesListComponent } from './charities-list/charities-list.component';
import { CharityDetailsComponent } from './charity-details/charity-details.component';
import { CharityDetailResolverService } from './charity-detail-resolver.service';
import { SubscriptionPaymentComponent } from '../payments/subscription-payment/subscription-payment.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'preview',
    component: CharitiesComponent,
    children: [
      {
        path: ':slug',
        component: CharityDetailsComponent
      }
    ]
  },
  {
    path: 'charities',
    component: CharitiesComponent,
    children: [
      // {
      //   path: ':slug',
      //   component: CharityDetailsComponent,
      // },
      {
        path: '',
        component: CharitiesListComponent
      }
    ]
  },
  {
    path: 'charities/:slug',
    component: CharityDetailsComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class CharitiesRoutingModule { }
