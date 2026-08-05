import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExamOverviewStats,
  ExamSummary,
  PassFailStats,
  ScoreBand,
  StudentAttempt,
} from '../models/analytics.models';

/**
 * All the data calls the teacher (doctor) dashboard needs.
 *
 * The base URL comes from `environment.apiUrl` — point that at the real
 * backend when it's ready and nothing in this file has to change.
 *
 * Expected REST contract:
 *   GET  /teacher/overview                                        -> ExamOverviewStats
 *   GET  /teacher/exams                                            -> ExamSummary[]
 *   GET  /teacher/exams/:examId/pass-fail                          -> PassFailStats
 *   GET  /teacher/exams/:examId/score-distribution                 -> ScoreBand[]
 *   GET  /teacher/exams/:examId/attempts?search=&sortBy=&sortDir=   -> StudentAttempt[]
 *
 * The backend identifies "which teacher" from the authenticated
 * request (JWT / session) — no teacher id is ever sent from the client.
 */
@Injectable({ providedIn: 'root' })
export class TeacherAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/teacher`;

  getOverview(): Observable<ExamOverviewStats> {
    return this.http.get<ExamOverviewStats>(`${this.baseUrl}/overview`);
  }

  getExams(): Observable<ExamSummary[]> {
    return this.http.get<ExamSummary[]>(`${this.baseUrl}/exams`);
  }

  getPassFailStats(examId: string): Observable<PassFailStats> {
    return this.http.get<PassFailStats>(`${this.baseUrl}/exams/${examId}/pass-fail`);
  }

  getScoreDistribution(examId: string): Observable<ScoreBand[]> {
    return this.http.get<ScoreBand[]>(`${this.baseUrl}/exams/${examId}/score-distribution`);
  }

  getAttempts(
    examId: string,
    options?: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' },
  ): Observable<StudentAttempt[]> {
    let params = new HttpParams();
    if (options?.search) params = params.set('search', options.search);
    if (options?.sortBy) params = params.set('sortBy', options.sortBy);
    if (options?.sortDir) params = params.set('sortDir', options.sortDir);

    return this.http.get<StudentAttempt[]>(`${this.baseUrl}/exams/${examId}/attempts`, { params });
  }
}
