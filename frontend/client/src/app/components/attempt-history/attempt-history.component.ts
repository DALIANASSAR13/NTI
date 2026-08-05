import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AttemptService, Attempt } from '../../services/attempt.service';

@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './attempt-history.component.html'
})
export class AttemptHistoryComponent implements OnInit {
  attempts: Attempt[] = [];

  constructor(private attemptService: AttemptService, private router: Router) {}

  ngOnInit(): void {
    this.attemptService.getMyAttempts().subscribe({
      next: (data) => this.attempts = data,
      error: (err) => console.error(err)
    });
  }

  viewResult(id: string): void {
    this.router.navigate(['/student/result', id]);
  }

  getExamTitle(att: Attempt): string {
    return (att.exam as any)?.title || 'Unknown';
  }
}