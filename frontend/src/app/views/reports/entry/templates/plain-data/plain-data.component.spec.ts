import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlainDataComponent } from './plain-data.component';

describe('PlainDataComponent', () => {
  let component: PlainDataComponent;
  let fixture: ComponentFixture<PlainDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlainDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlainDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
