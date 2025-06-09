import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreejsBgSceneComponent } from './threejs-bg-scene/threejs-bg-scene.component';
import { ThreejsDesertSceneComponent } from './threejs-desert-scene/threejs-desert-scene.component';

@Component({
  selector: 'app-root',
  imports: [ThreejsBgSceneComponent, ThreejsDesertSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dbendevV8';
}
