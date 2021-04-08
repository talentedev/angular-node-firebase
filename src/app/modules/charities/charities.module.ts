import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CharityDetailsComponent } from './charity-details/charity-details.component';
import { CharitiesRoutingModule } from './charities-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PaymentsModule } from '../payments/payments.module';
import { CharitiesListComponent } from './charities-list/charities-list.component';
import { CharitiesComponent } from './charities.component';
import { CharityDetailResolverService } from './charity-detail-resolver.service';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    PaymentsModule,
    CharitiesRoutingModule,
  ],
  declarations: [CharityDetailsComponent, CharitiesListComponent, CharitiesComponent],
  providers: [CharityDetailResolverService]
})
export class CharitiesModule { }
