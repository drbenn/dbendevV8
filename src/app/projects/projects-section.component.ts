import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FeaturedProjectsComponent } from './components/featured-projects/featured-projects.component';
import { ProjectsArchiveModalComponent } from './components/projects-archive-modal/projects-archive-modal.component';


@Component({
  selector: 'app-projects-section',
  imports: [CommonModule, FeaturedProjectsComponent, ProjectsArchiveModalComponent],
  templateUrl: './projects-section.component.html',
  styleUrl: './projects-section.component.scss'
})
export class ProjectsSectionComponent {
  @ViewChild('projectsModal') projectsModalRef!: ElementRef<HTMLDialogElement>;

  openModal(): void {
    // DaisyUI uses the native <dialog> element
    if (this.projectsModalRef && this.projectsModalRef.nativeElement) {
      this.projectsModalRef.nativeElement.showModal();
    }
  }

  closeModal(): void {
    if (this.projectsModalRef && this.projectsModalRef.nativeElement) {
      this.projectsModalRef.nativeElement.close();
    }
  }
}
