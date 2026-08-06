import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Question {
  _id: string;
  teacherId: string;
  text: string;
  options: string[];
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionPayload {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly apiUrl = environment.apiUrl + '/questions';
  private readonly token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmE4MmJkM2ZhMzJkOGY3NmQxYjE3YiIsInJvbGUiOiJ0ZWFjaGVyIiwic3BlY2lhbGl6YXRpb24iOiJTY2llbmNlIiwibGV2ZWwiOjEsImlhdCI6MTc4NTk0ODA2MywiZXhwIjoxNzg2MDM0NDYzfQ.BAgyNI08MAcWXBYf5t-iCaf8uFo80pdjUBW2G9vOBCk';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
  }

  getAll(): Observable<Question[]> {
    return this.http
      .get<ApiResponse<Question[]>>(this.apiUrl, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Question> {
    return this.http
      .get<ApiResponse<Question>>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  create(payload: QuestionPayload): Observable<Question> {
    return this.http
      .post<ApiResponse<Question>>(this.apiUrl, payload, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<QuestionPayload>): Observable<Question> {
    return this.http
      .put<ApiResponse<Question>>(`${this.apiUrl}/${id}`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map(() => undefined));
  }

  getTeacherName(): string {
    try {
      const payload = this.token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.name || 'Teacher';
    } catch {
      return 'Teacher';
    }
  }
}
