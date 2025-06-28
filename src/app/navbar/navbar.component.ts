import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap'; // Import GSAP core
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'; // Import ScrollToPlugin

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  scrollY: number = 0;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
  }

  constructor() {
    // Ensure ScrollToPlugin is registered if not done globally
    gsap.registerPlugin(ScrollToPlugin);
  }

  ngOnInit(): void {
    // Set initial scroll position
    this.onWindowScroll();
  }

  ngAfterViewInit(): void {
    // Optional: If you need to do something after the view is initialized.
    // For this component, onWindowScroll() in ngOnInit is usually enough.
  }

  ngOnDestroy(): void {
    // No explicit event listener cleanup needed for HostListener
    // or if the component is removed, GSAP instances might need to be killed if complex.
  }

  scrollToSection(event: Event, targetId: string): void {
    event.preventDefault(); // Prevent default jump behavior
    gsap.to(window, {
      duration: 1.5, // Duration of the scroll animation
      scrollTo: {
        y: targetId,
        offsetY: 64 // Adjust this offset for fixed header height if needed
      },
      ease: "power2.inOut" // Smooth easing function
    });
  }

  // For mobile navigation links in the drawer
  scrollToSectionAndCloseDrawer(event: Event, targetId: string): void {
    this.scrollToSection(event, targetId);
    // Uncheck the drawer checkbox to close it
    const drawerToggle = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  }

  @Output('selectedTheme') updateTheme = new EventEmitter<'light' | 'dark'>();

  protected isDarkMode: boolean = false;
  activeTheme: string = 'light';         // default light theme
  protected selectTheme(): void {
    if (this.activeTheme === 'light') {
      this.activeTheme = 'dark';           // dark theme
      this.isDarkMode = true;
    } else {
      this.activeTheme = 'light';        // light theme
      this.isDarkMode = false;
    };
    this.updateTheme.emit(this.isDarkMode ? 'dark' : 'light');
  };
}
