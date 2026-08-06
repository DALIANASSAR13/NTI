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
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  fatalError = '';

  constructor(
    private examState: ExamStateService,
    private attemptService: AttemptService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.exam = this.examState.currentExam;
    if (!this.exam) this.router.navigate(['/student/dashboard']);
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  returnToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }

  startExam(): void {
    if (!this.exam) return;
    this.loading = true;
    this.attemptService.startAttempt(this.exam._id).subscribe({
      next: (res: any) => { 
        this.loading = false; 
        this.router.navigate(['/student/exam', res.data.attemptId]); 
      },
      error: (err: any) => { 
        this.loading = false;
        const msg = err.error?.message || 'Failed to start exam. Please check your connection.';
        
        if (err.status >= 400 && err.status < 500) {
           this.fatalError = msg;
        } else {
           this.showToast(msg, 'error');
        }
      }
    });
  }
}