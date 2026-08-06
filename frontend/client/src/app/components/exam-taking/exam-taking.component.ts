import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AttemptService, Attempt } from '../../services/attempt.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-taking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exam-taking.component.html',
  styleUrls: ['./exam-taking.component.scss']
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  attempt: Attempt | null = null;
  remainingTime = 0;
  answers: any[] = [];
  private timerSub!: Subscription;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  fatalError = '';

  constructor(
    private route: ActivatedRoute,
    private attemptService: AttemptService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId')!;
    this.attemptService.getAttemptResult(id).subscribe({
      next: (data: any) => {
        this.attempt = data;
        const duration = (data.examId as any).durationInMinutes * 60;
        const elapsed = (Date.now() - new Date(data.startTime).getTime()) / 1000;
        this.remainingTime = Math.max(0, Math.floor(duration - elapsed));
        
        // Populate existing answers if any
        this.answers = data.assignedQuestions.map((q: any) => {
          const existing = data.studentAnswers?.find((a: any) => a.questionId === (q._id || q.question));
          return {
            questionId: q._id || q.question,
            selectedOption: existing ? existing.selectedOption : ''
          };
        });

        if (this.remainingTime <= 0) {
          this.submit(true);
        } else {
          this.startTimer();
        }
      },
      error: (err) => {
        console.error(err);
        this.fatalError = err.error?.message || 'Failed to load exam. The exam may not exist or has expired.';
      }
    });
  }

  returnToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }

  startTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) this.remainingTime--;
      else this.submit(true);
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  selectOption(i: number, opt: any): void {
    this.answers[i].selectedOption = String(opt);
  }

  submit(isAutoSubmit: boolean = false): void {
    if (isAutoSubmit !== true) {
      const hasUnanswered = this.answers.some(a => !a.selectedOption || a.selectedOption === '');
      if (hasUnanswered) {
        this.showToast('Please answer all questions before submitting the exam.', 'error');
        return;
      }
    }

    this.timerSub?.unsubscribe();
    const valid = this.answers.filter(a => a.selectedOption && a.selectedOption !== '');
    this.attemptService.submitAttempt(this.attempt!._id, valid).subscribe({
      next: () => this.router.navigate(['/student/result', this.attempt!._id]),
      error: (err) => {
        const msg = err.error?.message || 'Failed to submit exam';
        if (err.status === 400 && (msg.includes('Time is up') || msg.includes('already been submitted'))) {
          this.router.navigate(['/student/result', this.attempt!._id]);
        } else if (err.status >= 400 && err.status < 500) {
          this.fatalError = msg;
        } else {
          console.error(err);
          this.showToast(msg, 'error');
        }
      }
    });
  }

  get time(): string {
    const m = Math.floor(this.remainingTime / 60);
    const s = this.remainingTime % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }
}