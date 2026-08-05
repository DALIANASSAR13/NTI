// app.routes.ts
import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { PreExamComponent } from './components/pre-exam/pre-exam.component';
import { ExamTakingComponent } from './components/exam-taking/exam-taking.component';
import { AttemptHistoryComponent } from './components/attempt-history/attempt-history.component';
import { AttemptResultComponent } from './components/attempt-result/attempt-result.component';

export const routes: Routes = [
  { path: 'student/dashboard', component: StudentDashboardComponent },
  { path: 'student/pre-exam/:id', component: PreExamComponent },
  { path: 'student/exam/:attemptId', component: ExamTakingComponent },
  { path: 'student/history', component: AttemptHistoryComponent },
  { path: 'student/result/:attemptId', component: AttemptResultComponent },
  { path: '', redirectTo: '/student/dashboard', pathMatch: 'full' }
];