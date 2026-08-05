import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './features/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './features/student-dashboard/student-dashboard.component';

/**
 * FOR LOCAL PREVIEW ONLY.
 *
 * This file exists so you can `ng serve` and open each dashboard by typing
 * its URL directly — there is no link, nav bar, or button connecting the
 * two pages anywhere in the app itself.
 *
 * In the real app, don't import this file. Instead register each component
 * on its own route inside whichever routing already separates teacher
 * accounts from student accounts (guards, separate route files, separate
 * apps, etc.) — see the README for that part.
 */
export const previewRoutes: Routes = [
  { path: 'preview/teacher', component: TeacherDashboardComponent },
  { path: 'preview/student', component: StudentDashboardComponent },
  { path: '', redirectTo: 'preview/teacher', pathMatch: 'full' },
];
