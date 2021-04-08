import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './core/components/main/main.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { FaqsComponent } from './core/components/faqs/faqs.component';
import { StartComponent } from './core/components/start/start.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CharityDetailsComponent } from './modules/charities/charity-details/charity-details.component';
import { BackComponent } from './core/components/back/back.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { DashboardComponent } from './modules/user/dashboard/dashboard.component';
import { AboutComponent } from './core/components/about/about.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    data: { title: 'Small Sacrifice, Big Difference'}
  },
  {
    path: 'faqs',
    component: FaqsComponent,
    data: {title: 'FAQs'}
  },
  {
    path: 'start',
    component: StartComponent,
    data: {title: 'Get started'}
  },
  {
    path: 'back',
    component: BackComponent,
    data: {title: 'Get started'}
  },
  {
    path: 'not-find-page',
    component: PageNotFoundComponent,
    data: {title: 'Page not found'}
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {title: 'Contact Us'}
  },
  {
    path: 'portfolio',
    canActivate: [ AuthGuard ],
    component: DashboardComponent,
    data: {title: 'Dashboard'}
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {title: 'About Us'}
  },
  // {
  //   path: '**',
  //   component: PageNotFoundComponent,
  //   data: {title: 'Page not found'}
  // },
  {
    path: ':slug',
    component: CharityDetailsComponent,
    data: {title: 'Page not found'}
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
