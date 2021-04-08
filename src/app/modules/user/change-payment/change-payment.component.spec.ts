import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePaymentComponent } from './change-payment.component';

describe('ChangePaymentComponent', () => {
  let component: ChangePaymentComponent;
  let fixture: ComponentFixture<ChangePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
