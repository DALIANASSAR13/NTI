import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.scss',
})
export class QuestionFormComponent implements OnInit {
  isEditMode = false;
  editId: string | null = null;
  isLoadingEdit = false;
  
  get pageTitle() {
    return this.isEditMode ? 'Edit Question' : 'Add Questions';
  }

  // Batch questions list (for create mode)
  questions: any[] = [];
  private nextId = 1;

  // Global submit
  isBatchSubmitting = false;
  batchProgress = 0;
  batchTotal = 0;
  batchDone = 0;
  batchErrors: string[] = [];

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any;

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = id;
      this.loadQuestion(id);
    } else {
      // Start with one empty question
      this.addQuestion();
    }
  }

  private loadQuestion(id: string): void {
    this.isLoadingEdit = true;
    this.questionService.getById(id).subscribe({
      next: (q: any) => {
        this.questions = [
          {
            id: this.nextId++,
            text: q.text,
            options: [...q.options],
            correctAnswer: q.correctAnswer,
            isSubmitting: false,
            isSubmitted: false,
            error: '',
          },
        ];
        this.isLoadingEdit = false;
      },
      error: (err: any) => {
        this.showToast(
          err.error?.message || 'Failed to load question.',
          'error'
        );
        this.isLoadingEdit = false;
      },
    });
  }

  addQuestion(): void {
    this.questions.push({
      id: this.nextId++,
      text: '',
      options: ['', ''],
      correctAnswer: '',
      isSubmitting: false,
      isSubmitted: false,
      error: '',
    });
  }

  removeQuestion(id: number): void {
    this.questions = this.questions.filter((q) => q.id !== id);
  }

  duplicateQuestion(source: any): void {
    this.questions.push({
      id: this.nextId++,
      text: source.text,
      options: [...source.options],
      correctAnswer: source.correctAnswer,
      isSubmitting: false,
      isSubmitted: false,
      error: '',
    });
  }

  addOption(questionId: number): void {
    this.questions = this.questions.map((q) => {
      if (q.id === questionId && q.options.length < 6) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    });
  }

  removeOption(questionId: number, optionIndex: number): void {
    this.questions = this.questions.map((q) => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_: any, i: number) => i !== optionIndex);
        // Reset correct answer if removed
        const correctAnswer = newOptions.includes(q.correctAnswer)
          ? q.correctAnswer
          : '';
        return { ...q, options: newOptions, correctAnswer };
      }
      return q;
    });
  }

  updateOptionValue(
    questionId: number,
    optionIndex: number,
    value: string
  ): void {
    this.questions = this.questions.map((q) => {
      if (q.id === questionId) {
        const oldValue = q.options[optionIndex];
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        // If this option was the correct answer, update it
        const correctAnswer =
          q.correctAnswer === oldValue ? value : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer };
      }
      return q;
    });
  }

  setCorrectAnswer(questionId: number, option: string): void {
    this.questions = this.questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, correctAnswer: option };
      }
      return q;
    });
  }

  validateQuestion(q: any): string | null {
    if (!q.text.trim() || q.text.trim().length < 3) {
      return 'Question text must be at least 3 characters.';
    }
    const filledOptions = q.options.filter((o: string) => o.trim());
    if (filledOptions.length < 2) {
      return 'At least 2 options are required.';
    }
    if (q.options.some((o: string) => !o.trim())) {
      return 'All option fields must be filled in.';
    }
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
      return 'Please select a correct answer.';
    }
    return null;
  }

  isQuestionValid(q: any): boolean {
    return this.validateQuestion(q) === null;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // ── Submit ──

  submitAll(): void {
    if (this.isEditMode) {
      this.submitEdit();
      return;
    }

    const allQuestions = this.questions;
    const pending = allQuestions.filter((q) => !q.isSubmitted);

    // Validate all
    let hasErrors = false;
    this.questions = this.questions.map((q) => {
      if (q.isSubmitted) return q;
      const err = this.validateQuestion(q);
      if (err) {
        hasErrors = true;
        return { ...q, error: err };
      }
      return { ...q, error: '' };
    });

    if (hasErrors) {
      this.showToast('Please fix validation errors before submitting.', 'error');
      return;
    }

    this.isBatchSubmitting = true;
    this.batchTotal = pending.length;
    this.batchDone = 0;
    this.batchErrors = [];

    const payloads = pending.map((q) => ({
      text: q.text.trim(),
      options: q.options.map((o: string) => o.trim()),
      correctAnswer: q.correctAnswer.trim(),
    }));

    const observables = payloads.map((p) => this.questionService.create(p));

    // Submit sequentially to track progress
    let completedCount = 0;
    const errors: string[] = [];
    const completedIds: number[] = [];

    const submitNext = (index: number) => {
      if (index >= pending.length) {
        // All done
        this.isBatchSubmitting = false;
        if (errors.length === 0) {
          this.showToast(
            `${completedCount} question${completedCount > 1 ? 's' : ''} created successfully!`,
            'success'
          );
          setTimeout(() => this.router.navigate(['/questions']), 1200);
        } else {
          this.batchErrors = errors;
          this.showToast(
            `${completedCount} created, ${errors.length} failed.`,
            'error'
          );
        }
        return;
      }

      const q = pending[index];
      this.questions = this.questions.map((item) =>
        item.id === q.id ? { ...item, isSubmitting: true, error: '' } : item
      );

      observables[index].subscribe({
        next: () => {
          completedCount++;
          completedIds.push(q.id);
          this.batchDone = completedCount;
          this.questions = this.questions.map((item) =>
            item.id === q.id
              ? { ...item, isSubmitting: false, isSubmitted: true }
              : item
          );
          submitNext(index + 1);
        },
        error: (err: any) => {
          errors.push(
            `Q${index + 1}: ${err.error?.message || 'Failed to create'}`
          );
          this.questions = this.questions.map((item) =>
            item.id === q.id
              ? {
                  ...item,
                  isSubmitting: false,
                  error: err.error?.message || 'Failed to create',
                }
              : item
          );
          submitNext(index + 1);
        },
      });
    };

    submitNext(0);
  }

  private submitEdit(): void {
    const q = this.questions[0];
    if (!q) return;

    const err = this.validateQuestion(q);
    if (err) {
      this.questions = this.questions.map((item) => (item.id === q.id ? { ...item, error: err } : item));
      return;
    }

    this.questions = this.questions.map((item) =>
      item.id === q.id ? { ...item, isSubmitting: true, error: '' } : item
    );

    const payload = {
      text: q.text.trim(),
      options: q.options.map((o: string) => o.trim()),
      correctAnswer: q.correctAnswer.trim(),
    };

    this.questionService.update(this.editId!, payload).subscribe({
      next: () => {
        this.showToast('Question updated successfully!', 'success');
        this.questions = this.questions.map((item) =>
          item.id === q.id
            ? { ...item, isSubmitting: false, isSubmitted: true }
            : item
        );
        setTimeout(() => this.router.navigate(['/questions']), 1200);
      },
      error: (err: any) => {
        this.questions = this.questions.map((item) =>
          item.id === q.id
            ? {
                ...item,
                isSubmitting: false,
                error: err.error?.message || 'Failed to update',
              }
            : item
        );
        this.showToast(
          err.error?.message || 'Failed to update question.',
          'error'
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/questions']);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }
}
