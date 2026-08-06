import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AttemptService, Exam, Attempt } from '../../services/attempt.service';
import { forkJoin } from 'rxjs';
import { ExamStateService } from '../../services/exam-state.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  exams: Exam[] = [];
  takenExamIds = new Set<string>();
  inProgressExamIds = new Set<string>();
  loading = false;
  error = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private attemptService: AttemptService,
    private examState: ExamStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  loadExams(): void {
    this.loading = true;
    this.error = '';
    
    forkJoin({
      exams: this.attemptService.getAvailableExams(),
      attempts: this.attemptService.getMyAttempts()
    }).subscribe({
      next: (res) => {
        this.exams = res.exams.data || [];
        const attempts = res.attempts || [];
        attempts.forEach((attempt: Attempt) => {
          if (attempt.examId && attempt.examId._id) {
            if (attempt.status === 'completed') {
              this.takenExamIds.add(attempt.examId._id);
            } else {
              this.inProgressExamIds.add(attempt.examId._id);
            }
          }
        });

        this.exams.sort((a, b) => {
          const aTaken = this.takenExamIds.has(a._id);
          const bTaken = this.takenExamIds.has(b._id);
          if (aTaken === bTaken) {
             const aInProgress = this.inProgressExamIds.has(a._id);
             const bInProgress = this.inProgressExamIds.has(b._id);
             if (aInProgress && !bInProgress) return -1;
             if (!aInProgress && bInProgress) return 1;
             return 0;
          }
          return aTaken ? 1 : -1;
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load exams.';
        this.loading = false;
        this.showToast(this.error, 'error');
      }
    });
  }

  isExamTaken(examId: string): boolean {
    return this.takenExamIds.has(examId);
  }

  isExamInProgress(examId: string): boolean {
    return this.inProgressExamIds.has(examId);
  }

  viewExam(exam: Exam): void {
    this.examState.currentExam = exam;
    this.router.navigate(['/student/pre-exam', exam._id]);
  }
}