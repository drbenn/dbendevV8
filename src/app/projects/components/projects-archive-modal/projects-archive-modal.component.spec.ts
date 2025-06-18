import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsArchiveModalComponent } from './projects-archive-modal.component';

describe('ProjectsArchiveModalComponent', () => {
  let component: ProjectsArchiveModalComponent;
  let fixture: ComponentFixture<ProjectsArchiveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsArchiveModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsArchiveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
