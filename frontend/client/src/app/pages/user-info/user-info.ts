import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfoComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.user = res.data;
        }
      },
      error: (err) => {
        // Fallback to token payload if API fails
        this.authService.currentUser$.subscribe((u) => {
          this.user = u;
        });
      }
    });
  }
}
