// attempt.service.ts - full code with token handling
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  _id: string;
  title: string;
  description: string;
  durationInMinutes: number;
  level: number;
  specialization: string;
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
  exam: Exam;
  status: 'started' | 'submitted';
  assignedQuestions: AssignedQuestion[];
  score?: number;
  startTime: string;
}

@Injectable({ providedIn: 'root' })
export class AttemptService {
  private apiUrl = 'http://localhost:5555/api';
  private token = '';

  constructor(private http: HttpClient) {}

  setToken(t: string): void { this.token = t; }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  getAvailableExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`, { headers: this.headers() });
  }

  startAttempt(examId: string): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.apiUrl}/attempts/start`, { examId }, { headers: this.headers() });
  }

  submitAttempt(attemptId: string, answers: { questionId: string; selectedOption: number }[]): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.apiUrl}/attempts/submit`, { attemptId, answers }, { headers: this.headers() });
  }

  getMyAttempts(): Observable<Attempt[]> {
    return this.http.get<Attempt[]>(`${this.apiUrl}/attempts/my-attempts`, { headers: this.headers() });
  }

  getAttemptResult(attemptId: string): Observable<Attempt> {
    return this.http.get<Attempt>(`${this.apiUrl}/attempts/${attemptId}/result`, { headers: this.headers() });
  }
}