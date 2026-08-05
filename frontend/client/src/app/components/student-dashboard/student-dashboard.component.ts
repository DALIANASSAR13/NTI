import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AttemptService, Exam } from '../../services/attempt.service';
import { ExamStateService } from '../../services/exam-state.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html'
})
export class StudentDashboardComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  error = '';

  constructor(
    private attemptService: AttemptService,
    private examState: ExamStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.error = '';
    // this.attemptService.getAvailableExams().subscribe({
    //   next: (data: Exam[]) => { this.exams = data; this.loading = false; },
    //   error: (err: any) => { this.error = 'Failed to load exams.'; this.loading = false; }
    // });
    this.attemptService.getAvailableExams().subscribe({
      next: (data: Exam[]) => { this.exams = data; this.loading = false; },
      error: (err: any) => { this.error = 'Failed to load exams.'; this.loading = false; }
    });
  }

  viewExam(exam: Exam): void {
    this.examState.currentExam = exam;
    this.router.navigate(['/student/pre-exam', exam._id]);
  }
}