import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProgressPoint, StudentExamItem, StudentOverviewStats } from '../models/analytics.models';

/**
 * All the data calls the student dashboard needs.
 *
 * Expected REST contract:
 *   GET /student/overview  -> StudentOverviewStats
 *   GET /student/exams     -> StudentExamItem[]
 *   GET /student/progress  -> ProgressPoint[]
 *
 * The backend identifies "which student" from the authenticated
 * request (JWT / session) — no student id is ever sent from the client.
 */
@Injectable({ providedIn: 'root' })
export class StudentAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/student`;

  getOverview(): Observable<StudentOverviewStats> {
    return this.http.get<StudentOverviewStats>(`${this.baseUrl}/overview`);
  }

  getExams(): Observable<StudentExamItem[]> {
    return this.http.get<StudentExamItem[]>(`${this.baseUrl}/exams`);
  }

  getProgress(): Observable<ProgressPoint[]> {
    return this.http.get<ProgressPoint[]>(`${this.baseUrl}/progress`);
  }
}
