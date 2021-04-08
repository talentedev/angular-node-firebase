import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { Entry } from 'contentful';

import { AuthService } from '../../../core/services/auth.service';
import { ContentfulService } from '../../../core/services/contentful.service';
import { ContentfulPreviewService } from '../../../core/services/contentful-preview.service';
import { SubscriptionPaymentComponent } from '../../payments/subscription-payment/subscription-payment.component';
import { UserService } from '../../../core/services/user.service';
import { ChangeSubscriptionComponent } from '../../payments/change-subscription/change-subscription.component';

@Component({
  selector: 'app-charity-details',
  templateUrl: './charity-details.component.html',
  styleUrls: ['./charity-details.component.scss']
})
export class CharityDetailsComponent implements OnInit {

  charity: any;
  carouselType: String = 'Explore Other Charities';
  coverStyle: {};
  logoStyle: {};
  title: string;
  charityName = '';
  charityCategory = '';
  modalRef: MDBModalRef;
  isDonate = false;
  contributions: any[] = [];
  choosedOrg: any;
  initialized = false;
  modals = [];
  testimonial;
  testimonials = [
    {
      'name': 'Jeff B.',
      'location': 'Columbus, GA',
      'quote': 'AllGive is so easy to use. The website is really intuitive and it takes all the work out of giving to my charity.'
    },
    {
      'name': 'Lexie C.',
      'location': 'Chickamauga, GA',
      'quote': 'I think this is a really great idea. Being able to give a little everyday takes the pain out of writing that one big check every month!'
    },
    {
      'name': 'Jeremy B.',
      'location': 'San Diego, CA',
      'quote': 'The reporting interface is my favorite part. I love being able to see where all of my giving is going at a glance.'
    },
    {
      'name': 'Billy B.',
      'location': 'Fort Collins, CO',
      'quote': 'I never gave until AllGive made it so easy. Now I\'m giving to 3 charities!'
    },
    {
      'name': 'Elizabeth H.',
      'location': 'Signal Mountain, TN',
      'quote': 'This is the easiest way to give to my favorite charities I\'ve ever seen!'
    },
    {
      'name': 'Barry F.',
      'location': 'New York, NY',
      'quote': 'You really can\'t understand just how quick, easy, and painless giving can be until you\'ve used AllGive.'
    },
    {
      'name': 'James M.',
      'location': 'Atlanta, GA',
      'quote': 'I turned one less Friday Happy Hour drink into $2,800 for the Make a Wish Foundation in just one year.'
    }
  ];

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService,
    private contenfulPreviewService: ContentfulPreviewService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: MDBModalService,
    private auth: AuthService,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.auth.authState) {
      const subscriber = this.userService.getDonations().subscribe(donations => {
        this.contributions = donations;
        this.checkIsDonate();
        subscriber.unsubscribe();
        this.initialized = true;
      });
    }
    const pathSegment = this.route.snapshot.pathFromRoot[1].url[0].path;
    const charityId = this.route.snapshot.paramMap.get('slug');
    if (pathSegment === 'preview') {
      this.contenfulPreviewService.previewCharityDetail(charityId)
        .then(res => {

          alert('preview');
          this.charity = res;
          this.charityName = this.charity.fields.charityName;
          this.charityCategory = this.charity.fields.category.fields.categoryName;
          this.title = 'Preview | ' + this.charity.fields.charityName + ' | Allgive.org';
          this.setTitle(this.title);
          this.coverStyle = {
            'background-image': 'url(' + this.charity.fields.coverImage.fields.file.url + ')',
            'background-position': 'center 20%',
            'background-size': 'cover',
            'margin-bottom': '7vw'
          };
          this.logoStyle = {
            'background-image': 'url(' + this.charity.fields.logo.fields.file.url + ')',
            'background-size': 'cover',
            'position': 'absolute',
            'overflow': 'hidden',
            'width': '10vw',
            'height': '10vw',
            'bottom': '-5vw',
            'left': '0',
            'right': '0',
            'margin': 'auto',
            'text-indent': '-10rem'
          };

          this.checkIsDonate();
        });
    } else {
      this.contentfulService.getCharityDetail(charityId)
        .then((res: any) => {

          if (res === undefined) { return this.router.navigate(['not-find-page']); }

          this.charity = res;
          this.charityName = this.charity.title;
          this.charityCategory = this.charity.category;
          this.title = this.charity.title + ' | Allgive.org';
          this.setTitle(this.title);
          this.coverStyle = {
            'background-image': 'url(' + this.charity.coverImage + ')',
            'background-position': 'center 20%',
            'background-size': 'cover',
            'margin-bottom': '7vw'
          };
          this.logoStyle = {
            'background-image': 'url(' + this.charity.logo + ')',
            'background-size': 'cover',
            'position': 'absolute',
            'overflow': 'hidden',
            'width': '10vw',
            'height': '10vw',
            'bottom': '-5vw',
            'left': '0',
            'right': '0',
            'margin': 'auto',
            'text-indent': '-10rem'
          };
          this.checkIsDonate();
        }).catch(err => {
          this.router.navigate(['not-find-page']);
        });
    }

    // Get random testimonial
    this.testimonial = this.testimonials[Math.floor(Math.random() * this.testimonials.length)];
  }

  checkIsDonate() {
    this.isDonate = true;
    if (this.auth.isAuthenticated()) {
        this.contributions.forEach(contribution => {
        if (contribution.product === this.charityName) {
          this.isDonate = false;
          this.choosedOrg = contribution;
        }
      });
    } else {
      this.isDonate = true;
      this.initialized = true;
    }
  }

  public setTitle( newTitle: string ) {
    this.titleService.setTitle( newTitle );
  }

  open() {
    if (this.auth.authState) {
      const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: false,
        class: '',
        containerClass: '',
        animated: true,
        modals: this.modals,
        data: {
            charity: this.charity
        }
      };
      this.modalService.show(SubscriptionPaymentComponent, modalOptions);
    } else {
      this.router.navigate(['/start']);
    }
  }

  closeAllModals() {
    for (let i = 0; i < this.modals.length; ++i) {
      this.modals[i].hide();
    }
    setTimeout(() => {
      const elements: any = document.getElementsByTagName('mdb-modal-container');
      for (let i = 0; i < elements.length; i++) {
        elements[0].style.display = 'none';
      }
    }, 500);
  }

  openManager() {
    if (this.auth.authState) {
      const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: false,
        class: '',
        containerClass: '',
        animated: true,
        data: {
            charity: this.charity,
            choosedOrg: this.choosedOrg,
            callback: () => {
              this.ngOnInit();
            }
        }
      };
      this.modalService.show(ChangeSubscriptionComponent, modalOptions);
    } else {
      this.router.navigate(['/start']);
    }
  }
}
