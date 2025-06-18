import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [NgOptimizedImage],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  standalone: true
})
export class HeroSectionComponent {

}
