import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AttemptService, Attempt } from '../../services/attempt.service';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './attempt-result.component.html',
  styleUrls: ['./attempt-result.component.scss']
})
export class AttemptResultComponent implements OnInit {
  attempt: Attempt | null = null;

  constructor(
    private route: ActivatedRoute,
    private attemptService: AttemptService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId')!;
    this.attemptService.getAttemptResult(id).subscribe({
      next: (data) => this.attempt = data,
      error: (err) => console.error(err)
    });
  }

  getExamTitle(): string {
    return (this.attempt?.examId as any)?.title || 'Unknown';
  }

  getQuestionsCount(): number {
    return this.attempt?.assignedQuestions?.length || 0;
  }

  getCorrectAnswersCount(): number {
    if (this.attempt?.score === undefined || this.attempt?.score === null) return 0;
    return Math.round((this.attempt.score / 100) * this.getQuestionsCount());
  }

  getSelectedOption(questionId: string): string {
    const answer = this.attempt?.studentAnswers?.find(a => a.questionId === questionId);
    return answer ? answer.selectedOption : 'No answer provided';
  }
}