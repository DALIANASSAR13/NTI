import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam';

@Component({
  selector: 'app-exam-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-dashboard.html',
  styleUrls: ['../question-dashboard/question-dashboard.component.scss'] // Reusing paper theme styles for simplicity
})
export class ExamDashboardComponent implements OnInit {
  exams: any[] = [];
  isLoading = true;
  error = '';
  greeting = '';

  constructor(
    private examService: ExamService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setGreeting();
    this.loadExams();
  }

  setGreeting() {
    const hour = new Date().getHours();
    let timeOfDay = 'Good evening';
    if (hour < 12) timeOfDay = 'Good morning';
    else if (hour < 18) timeOfDay = 'Good afternoon';
    this.greeting = `${timeOfDay}, ${this.examService.getTeacherName()}`;
  }

  loadExams() {
    this.isLoading = true;
    this.error = '';
    
    this.examService.getTeacherExams().subscribe({
      next: (res: any) => {
        this.exams = res.data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load exams';
        this.isLoading = false;
      }
    });
  }

  viewExam(id: string) {
    this.router.navigate(['/exams', id]);
  }

  useAsTemplate(id: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/exams/new'], { queryParams: { templateId: id } });
  }

  deleteExam(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this exam? This cannot be undone.')) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.loadExams(); // reload the list
        },
        error: (err: any) => {
          alert(err.error?.message || 'Failed to delete exam');
        }
      });
    }
  }

  navigateToCreate() {
    this.router.navigate(['/exams/new']);
  }
}
