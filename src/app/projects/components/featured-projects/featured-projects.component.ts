import { Component } from '@angular/core';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProjectData } from '../../../types/app.types';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-featured-projects',
  imports: [ProjectCardComponent, CommonModule],
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.scss'
})
export class FeaturedProjectsComponent {
  featuredProjects$: Observable<ProjectData[] | null>;

  constructor(private projectService: ProjectService) {
    this.featuredProjects$ = this.projectService.getFeaturedProjects();
  }

  ngOnInit(): void {
    // Data fetching is handled by the service constructor
  }
}
