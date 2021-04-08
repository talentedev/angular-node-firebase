import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharitiesListComponent } from './charities-list.component';

describe('CharitiesListComponent', () => {
  let component: CharitiesListComponent;
  let fixture: ComponentFixture<CharitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharitiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
