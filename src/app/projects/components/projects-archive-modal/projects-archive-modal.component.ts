import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectData } from '../../../types/app.types';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-projects-archive-modal',
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './projects-archive-modal.component.html',
  styleUrl: './projects-archive-modal.component.scss'
})
export class ProjectsArchiveModalComponent {
  allProjects$: Observable<ProjectData[] | null>;

  constructor(private projectService: ProjectService) {
    this.allProjects$ = this.projectService.getAllProjects();
  }

  ngOnInit(): void {
    // Data fetching is handled by the service constructor
  }
}
