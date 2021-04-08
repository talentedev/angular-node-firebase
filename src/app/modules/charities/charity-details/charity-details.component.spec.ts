import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharityDetailsComponent } from './charity-details.component';

describe('CharityDetailsComponent', () => {
  let component: CharityDetailsComponent;
  let fixture: ComponentFixture<CharityDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharityDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
