import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AttemptService, Attempt } from '../../services/attempt.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-taking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exam-taking.component.html'
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  attempt: Attempt | null = null;
  remainingTime = 0;
  answers: any[] = [];
  private timerSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private attemptService: AttemptService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId')!;
    this.attemptService.getAttemptResult(id).subscribe({
      next: (data) => {
        this.attempt = data;
        const duration = (data.exam as any).durationInMinutes * 60;
        const elapsed = (Date.now() - new Date(data.startTime).getTime()) / 1000;
        this.remainingTime = Math.max(0, Math.floor(duration - elapsed));
        this.startTimer();
        this.answers = data.assignedQuestions.map((q: any) => ({
          questionId: q.question?._id || q.question,
          selectedOption: -1
        }));
      },
      error: (err) => console.error(err)
    });
  }

  startTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) this.remainingTime--;
      else this.submit();
    });
  }

  selectOption(i: number, opt: number): void {
    this.answers[i].selectedOption = opt;
  }

  submit(): void {
    this.timerSub?.unsubscribe();
    const valid = this.answers.filter(a => a.selectedOption !== -1);
    this.attemptService.submitAttempt(this.attempt!._id, valid).subscribe({
      next: () => this.router.navigate(['/student/result', this.attempt!._id]),
      error: (err) => console.error(err)
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