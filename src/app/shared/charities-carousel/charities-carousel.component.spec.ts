import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharitiesCarouselComponent } from './charities-carousel.component';

describe('CharitiesCarouselComponent', () => {
  let component: CharitiesCarouselComponent;
  let fixture: ComponentFixture<CharitiesCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharitiesCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharitiesCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
