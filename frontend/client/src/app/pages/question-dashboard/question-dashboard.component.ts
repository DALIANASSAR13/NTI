import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-question-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-dashboard.component.html',
  styleUrl: './question-dashboard.component.scss',
})
export class QuestionDashboardComponent implements OnInit {
  questions: any[] = [];
  filteredQuestions: any[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';

  // Delete confirmation modal
  showDeleteModal = false;
  questionToDelete: any = null;
  isDeleting = false;
  deleteError = '';

  // Toast notification
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any;

  totalQuestions = 0;
  shownQuestions = 0;

  updateCalculations(): void {
    this.totalQuestions = this.questions.length;
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredQuestions = this.questions;
    } else {
      this.filteredQuestions = this.questions.filter(
        (q) =>
          q.text.toLowerCase().includes(term) ||
          q.options.some((opt: string) => opt.toLowerCase().includes(term)) ||
          q.correctAnswer.toLowerCase().includes(term)
      );
    }
    this.shownQuestions = this.filteredQuestions.length;
  }

  greeting = '';

  constructor(
    private questionService: QuestionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadQuestions();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    let timeOfDay = 'Good evening';
    if (hour < 12) timeOfDay = 'Good morning';
    else if (hour < 18) timeOfDay = 'Good afternoon';
    
    const name = this.questionService.getTeacherName();
    this.greeting = `${timeOfDay}, ${name}`;
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.questionService.getAll().subscribe({
      next: (data: any) => {
        this.questions = data;
        this.updateCalculations();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to load questions. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.updateCalculations();
  }

  navigateToCreate(): void {
    this.router.navigate(['/questions/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/questions/edit', id]);
  }

  // Delete modal
  openDeleteModal(question: any): void {
    this.questionToDelete = question;
    this.showDeleteModal = true;
    this.deleteError = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.questionToDelete = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    const question = this.questionToDelete;
    if (!question) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.questionService.delete(question._id).subscribe({
      next: () => {
        this.questions = this.questions.filter((q) => q._id !== question._id);
        this.updateCalculations();
        this.isDeleting = false;
        this.closeDeleteModal();
        this.showToast('Question deleted successfully', 'success');
      },
      error: (err: any) => {
        this.deleteError = err.error?.message || 'Failed to delete question.';
        this.isDeleting = false;
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

}
