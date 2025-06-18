import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  contactInfo = [
    {
      title: 'Email',
      link: 'mailto:bennett.daniel@gmail.com'
    },
    {
      title: 'GitHub',
      link: 'https://github.com/drbenn'
    },
    {
      title: 'LinkedIn',
      link: 'https://www.linkedin.com/in/bennettdanielr/'
    },
    // {
    //   title: 'LeetCode',
    //   link: 'https://leetcode.com/dbenn10/'
    // },
  ];

  currentYear: number = new Date().getFullYear();
}
