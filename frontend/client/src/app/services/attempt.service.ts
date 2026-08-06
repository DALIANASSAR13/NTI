// attempt.service.ts - full code with token handling
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Exam {
  _id: string;
  title: string;
  description: string;
  durationInMinutes: number;
  level: number;
  specialization: string;
  availableTo?: string;
}

export interface Question {
  _id: string;
  text: string;
  options: string[];
}

export interface AssignedQuestion {
  question: Question;
  selectedOption?: number;
}

export interface Attempt {
  _id: string;
  examId: Exam;
  status: 'started' | 'submitted' | 'completed';
  assignedQuestions: any[];
  studentAnswers?: { questionId: string; selectedOption: string }[];
  score?: number;
  startTime: string;
}

@Injectable({ providedIn: 'root' })
export class AttemptService {
  private apiUrl = 'http://localhost:5000/api';
  private token = '';

  constructor(private http: HttpClient) {}

  setToken(t: string): void { this.token = t; }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  getAvailableExams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams`, { headers: this.headers() });
  }

  startAttempt(examId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attempts/start`, { examId }, { headers: this.headers() });
  }

  submitAttempt(attemptId: string, answers: { questionId: string; selectedOption: number }[]): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.apiUrl}/attempts/submit`, { attemptId, answers }, { headers: this.headers() });
  }

  getMyAttempts(): Observable<Attempt[]> {
    return this.http.get<any>(`${this.apiUrl}/attempts/my-attempts`, { headers: this.headers() })
      .pipe(map(res => res.data));
  }

  getAttemptResult(attemptId: string): Observable<Attempt> {
    return this.http.get<any>(`${this.apiUrl}/attempts/${attemptId}/result`, { headers: this.headers() })
      .pipe(map(res => res.data));
  }
}