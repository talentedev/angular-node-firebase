import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordlessAuthComponent } from './passwordless-auth.component';

describe('PasswordlessAuthComponent', () => {
  let component: PasswordlessAuthComponent;
  let fixture: ComponentFixture<PasswordlessAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordlessAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordlessAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
