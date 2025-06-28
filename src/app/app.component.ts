import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreejsBgSceneComponent } from './threejs-bg-scene/threejs-bg-scene.component';
import { ThreejsDesertSceneComponent } from './threejs-desert-scene/threejs-desert-scene.component';
import { HeroSectionComponent } from "./hero-section/hero-section.component";
import { ProjectsSectionComponent } from './projects/projects-section.component';
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
export class AppComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;

  // custom cursor - where mouse FOLLOWER actually is
  topPosition: number = 0;
  leftPosition: number = 0;

  // custom cursor - where mouse actually is
  targetX: number = 0;
  targetY: number = 0;

  dotWidth: number = 0;
  dotHeight: number = 0;

  bigDotHeight: number = 384
  bigDotWidth: number = 384

    // Animation frame ID for cancellation
  private animationFrameId: number | null = null;

  // Smoothing factor (0 to 1). Closer to 0 means more lag, closer to 1 means faster follow.
  // Common values are between 0.05 and 0.2.
  private readonly easingFactor: number = 0.125;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (event.clientX === 0 || event.clientY === 0 || event.clientY >= (window.innerHeight - 4) || event.clientX >= (window.innerWidth - 14)) {
      this.dotHeight = 0;
      this.dotWidth = 0;
    } else {
      this.dotHeight = 32;
      this.dotWidth = 32;
    }

    // Get the bounding rectangle of the host element
    const hostRect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // Calculate mouse position relative to the *host element*
    // This is crucial if your component is not at the very top-left of the viewport.
    this.targetX = event.clientX - hostRect.left;
    this.targetY = event.clientY - hostRect.top;
  }

  ngOnInit(): void {
    // Simulate loading time, as in your React app
    setTimeout(() => {
      this.isLoading = false;
    }, 700); // Original: 700ms
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    // Cancel the animation frame loop when the component is destroyed
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private startAnimationLoop(): void {
    const animate = () => {
      // Interpolate the current position towards the target position
      // (target - current) * easingFactor gives a fraction of the remaining distance
      this.leftPosition += (this.targetX - this.leftPosition) * this.easingFactor;
      this.topPosition += (this.targetY - this.topPosition) * this.easingFactor;

      // Request the next animation frame
      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Start the first frame
    this.animationFrameId = requestAnimationFrame(animate);
  }

  protected changeTheme(selectedTheme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', selectedTheme);
  }
}
