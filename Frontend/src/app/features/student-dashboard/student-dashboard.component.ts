import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartData } from 'chart.js';

import { StudentAnalyticsService } from '../../core/services/student-analytics.service';
import { StatSealComponent } from '../../shared/components/stat-seal/stat-seal.component';
import { ProgressPoint, StudentExamItem, StudentOverviewStats } from '../../core/models/analytics.models';

/**
 * Standalone student dashboard.
 * Self-contained — does not import or route to the teacher dashboard.
 * Drop it behind whichever route/guard serves student accounts.
 */
@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DatePipe, BaseChartDirective, StatSealComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  private readonly analytics = inject(StudentAnalyticsService);

  overview = signal<StudentOverviewStats | null>(null);
  exams = signal<StudentExamItem[]>([]);
  progress = signal<ProgressPoint[]>([]);

  progressChartData = computed<ChartData<'line'>>(() => ({
    labels: this.progress().map((p) => p.examTitle),
    datasets: [
      {
        label: 'Score %',
        data: this.progress().map((p) => p.scorePercentage),
        borderColor: '#2f9e6e',
        backgroundColor: 'rgba(47, 158, 110, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2f9e6e',
      },
    ],
  }));

  readonly lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  ngOnInit(): void {
    this.analytics.getOverview().subscribe((stats) => this.overview.set(stats));
    this.analytics.getExams().subscribe((exams) => this.exams.set(exams));
    this.analytics.getProgress().subscribe((points) => this.progress.set(points));
  }
}
