import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ProjectData } from '../../types/app.types';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<ProjectData[] | null>(null);
  projects$: Observable<ProjectData[] | null> = this.projectsSubject.asObservable();
  featuredProjects$: Observable<ProjectData[] | null>;

  constructor(private http: HttpClient) {
    // Initialize featuredProjects$ based on projects$
    this.featuredProjects$ = this.projects$.pipe(
      map(projects => projects ? projects.filter(project => project.isFeatured) : null)
    );
    this.loadProjects(); // Load projects when the service is instantiated
  }

  private loadProjects(): void {
    // Assuming projects.json is in the public/assets folder
    this.http.get<ProjectData[]>('assets/projects.json').pipe(
      tap(jsonData => {
        // Sort data by ID descending
        const sortedData = jsonData.sort((a, b) => b.id - a.id);
        this.projectsSubject.next(sortedData);
      })
    ).subscribe({
      error: (err) => console.error('Error fetching projects data:', err)
    });
  }

  getAllProjects(): Observable<ProjectData[] | null> {
    return this.projects$;
  }

  getFeaturedProjects(): Observable<ProjectData[] | null> {
    return this.featuredProjects$;
  }
}
