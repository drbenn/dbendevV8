import { Component, Input } from '@angular/core';
import { ProjectData } from '../../../types/app.types';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
  standalone: true
})
export class ProjectCardComponent {
  // @Input() project!: ProjectData;
  @Input() project!: ProjectData;

  // Helper to check if it's an array and access the first element
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}
