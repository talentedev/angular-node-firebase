import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDonationComponent } from './custom-donation.component';

describe('CustomDonationComponent', () => {
  let component: CustomDonationComponent;
  let fixture: ComponentFixture<CustomDonationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDonationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
