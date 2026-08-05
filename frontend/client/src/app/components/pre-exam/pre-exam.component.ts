// pre-exam.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AttemptService, Exam, Attempt } from '../../services/attempt.service';
import { ExamStateService } from '../../services/exam-state.service';

@Component({
  selector: 'app-pre-exam',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pre-exam.component.html'
})
export class PreExamComponent implements OnInit {
  exam: Exam | null = null;
  loading = false;
  error = '';

  constructor(
    private examState: ExamStateService,
    private attemptService: AttemptService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.exam = this.examState.currentExam;
    if (!this.exam) this.router.navigate(['/student/dashboard']);
  }

  startExam(): void {
    if (!this.exam) return;
    this.loading = true;
    this.attemptService.startAttempt(this.exam._id).subscribe({
      next: (attempt: Attempt) => { this.loading = false; this.router.navigate(['/student/exam', attempt._id]); },
      error: (err: any) => { this.error = 'Failed to start exam.'; this.loading = false; }
    });
  }
}