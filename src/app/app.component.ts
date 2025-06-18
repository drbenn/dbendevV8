import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreejsBgSceneComponent } from './threejs-bg-scene/threejs-bg-scene.component';
import { ThreejsDesertSceneComponent } from './threejs-desert-scene/threejs-desert-scene.component';
import { HeroSectionComponent } from "./hero-section/hero-section.component";
import { ProjectsSectionComponent } from './projects/components/projects-section/projects-section.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AboutSectionComponent } from './about-section/about-section.component';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ThreejsBgSceneComponent, ThreejsDesertSceneComponent, NavbarComponent ,HeroSectionComponent, ProjectsSectionComponent, AboutSectionComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isLoading: boolean = true;

  ngOnInit(): void {
    // Simulate loading time, as in your React app
    setTimeout(() => {
      this.isLoading = false;
    }, 700); // Original: 700ms
  }
}
