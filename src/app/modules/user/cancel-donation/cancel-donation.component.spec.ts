import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelDonationComponent } from './cancel-donation.component';

describe('CancelDonationComponent', () => {
  let component: CancelDonationComponent;
  let fixture: ComponentFixture<CancelDonationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelDonationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelDonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
