import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AttemptService } from './services/attempt.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = 'client';

  constructor(private attemptService: AttemptService) {}

  ngOnInit(): void {
    this.attemptService.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNzM5OTNmMzVlMjg1MmFlMGYwZWY5YSIsInJvbGUiOiJzdHVkZW50Iiwic3BlY2lhbGl6YXRpb24iOiJDb21wdXRlciBTY2llbmNlIiwibGV2ZWwiOjMsImlhdCI6MTc4NTk2NTM4OCwiZXhwIjoxNzg2NTcwMTg4fQ.ncoJlalyiIUC693asNlKz2RRk01Hj5XTnVEmJpF6vec');
  }
}
