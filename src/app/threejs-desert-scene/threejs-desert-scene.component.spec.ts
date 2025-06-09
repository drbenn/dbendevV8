import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreejsDesertSceneComponent } from './threejs-desert-scene.component';

describe('ThreejsDesertSceneComponent', () => {
  let component: ThreejsDesertSceneComponent;
  let fixture: ComponentFixture<ThreejsDesertSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreejsDesertSceneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreejsDesertSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
