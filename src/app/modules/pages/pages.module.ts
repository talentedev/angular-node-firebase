import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PagesComponent } from './pages.component';
import { PageWrapperComponent } from './page-wrapper/page-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PagesRoutingModule,
  ],
  declarations: [PagesComponent, PageWrapperComponent]
})
export class PagesModule { }
