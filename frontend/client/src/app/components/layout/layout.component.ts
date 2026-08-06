import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isTeacher = false;
  isSidebarOpen = true;
  userName = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isTeacher = role === 'teacher';
    
    // Get current user name from observable
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || (this.isTeacher ? 'Teacher' : 'Student');
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
