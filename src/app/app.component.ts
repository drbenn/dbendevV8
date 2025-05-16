import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreejsBgSceneComponent } from './threejs-bg-scene/threejs-bg-scene.component';

@Component({
  selector: 'app-root',
  imports: [ThreejsBgSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dbendevV8';
}
