import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userData = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    specialization: '',
    level: 1
  };
  error = '';
  loading = false;
  availableSpecializations: string[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getSpecializations().subscribe({
      next: (res) => {
        if (res.success) {
          this.availableSpecializations = res.data;
        }
      },
      error: (err) => console.error('Failed to load specializations')
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.register(this.userData).subscribe({
      next: (res) => {
        const role = this.authService.getUserRole();
        if (role === 'teacher') {
          this.router.navigate(['/exams']);
        } else {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
