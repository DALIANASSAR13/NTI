import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next(payload);
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success && res.data.token) {
          localStorage.setItem('token', res.data.token);
          this.loadUserFromToken();
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((res: any) => {
        if (res.success && res.data.token) {
          localStorage.setItem('token', res.data.token);
          this.loadUserFromToken();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getSpecializations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/specializations`);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
}
