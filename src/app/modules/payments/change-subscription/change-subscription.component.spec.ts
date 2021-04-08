import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSubscriptionComponent } from './change-subscription.component';

describe('ChangeSubscriptionComponent', () => {
  let component: ChangeSubscriptionComponent;
  let fixture: ComponentFixture<ChangeSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
