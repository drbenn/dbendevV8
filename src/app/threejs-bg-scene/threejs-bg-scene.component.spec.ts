import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreejsBgSceneComponent } from './threejs-bg-scene.component';

describe('ThreejsBgSceneComponent', () => {
  let component: ThreejsBgSceneComponent;
  let fixture: ComponentFixture<ThreejsBgSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreejsBgSceneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreejsBgSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
