// app.routes.ts
import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { PreExamComponent } from './components/pre-exam/pre-exam.component';
import { ExamTakingComponent } from './components/exam-taking/exam-taking.component';
import { AttemptHistoryComponent } from './components/attempt-history/attempt-history.component';
import { AttemptResultComponent } from './components/attempt-result/attempt-result.component';
import { QuestionDashboardComponent } from './pages/question-dashboard/question-dashboard.component';
import { QuestionFormComponent } from './pages/question-form/question-form.component';
import { ExamDashboardComponent } from './pages/exam-dashboard/exam-dashboard';
import { ExamDetailsComponent } from './pages/exam-details/exam-details';
import { ExamFormComponent } from './pages/exam-form/exam-form';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './services/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'exams', pathMatch: 'full' },
      { path: 'exams', component: ExamDashboardComponent },
      { path: 'exams/new', component: ExamFormComponent },
      { path: 'exams/:id', component: ExamDetailsComponent },
      { path: 'questions', component: QuestionDashboardComponent },
      { path: 'questions/new', component: QuestionFormComponent },
      { path: 'questions/edit/:id', component: QuestionFormComponent },
      { path: 'student/dashboard', component: StudentDashboardComponent },
      { path: 'student/pre-exam/:id', component: PreExamComponent },
      { path: 'student/exam/:attemptId', component: ExamTakingComponent },
      { path: 'student/history', component: AttemptHistoryComponent },
      { path: 'student/result/:attemptId', component: AttemptResultComponent },
      { path: 'user-info', loadComponent: () => import('./pages/user-info/user-info').then(m => m.UserInfoComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  }
];
