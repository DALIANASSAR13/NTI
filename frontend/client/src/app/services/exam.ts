import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  _id?: string;
  title: string;
  specialization: string;
  level: number;
  availableFrom: Date;
  availableTo: Date;
  durationInMinutes: number;
  questionPool: any[]; // IDs or Question objects
  questionsToAsk: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExamStats {
  taken: any[];
  notTaken: any[];
  totalEligible: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:5000/api/exams';
  // Using the hardcoded token
  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmE4MmJkM2ZhMzJkOGY3NmQxYjE3YiIsInJvbGUiOiJ0ZWFjaGVyIiwic3BlY2lhbGl6YXRpb24iOiJTY2llbmNlIiwibGV2ZWwiOjEsImlhdCI6MTc4NTk0ODA2MywiZXhwIjoxNzg2MDM0NDYzfQ.BAgyNI08MAcWXBYf5t-iCaf8uFo80pdjUBW2G9vOBCk';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  }

  getTeacherExams(): Observable<ApiResponse<Exam[]>> {
    return this.http.get<ApiResponse<Exam[]>>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getExamById(id: string): Observable<ApiResponse<Exam>> {
    return this.http.get<ApiResponse<Exam>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getExamStats(id: string): Observable<ApiResponse<ExamStats>> {
    return this.http.get<ApiResponse<ExamStats>>(`${this.apiUrl}/${id}/stats`, {
      headers: this.getHeaders(),
    });
  }

  createExam(data: any): Observable<ApiResponse<Exam>> {
    return this.http.post<ApiResponse<Exam>>(this.apiUrl, data, {
      headers: this.getHeaders(),
    });
  }

  deleteExam(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updateExam(id: string, data: Partial<Exam>): Observable<ApiResponse<Exam>> {
    return this.http.patch<ApiResponse<Exam>>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders(),
    });
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
