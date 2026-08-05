
// exam-state.service.ts
import { Injectable } from '@angular/core';
import { Exam } from './attempt.service';

@Injectable({ providedIn: 'root' })
export class ExamStateService {
  currentExam: Exam | null = null;
}