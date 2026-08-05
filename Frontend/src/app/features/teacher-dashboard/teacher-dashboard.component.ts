import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartData } from 'chart.js';

import { TeacherAnalyticsService } from '../../core/services/teacher-analytics.service';
import { ExportService } from '../../core/services/export.service';
import { StatSealComponent } from '../../shared/components/stat-seal/stat-seal.component';
import {
  ExamOverviewStats,
  ExamSummary,
  PassFailStats,
  ScoreBand,
  StudentAttempt,
} from '../../core/models/analytics.models';

type SortableColumn = 'studentName' | 'scorePercentage' | 'grade' | 'submittedAt';

/**
 * Standalone teacher/doctor analytics dashboard.
 * Self-contained — does not import or route to the student dashboard.
 * Drop it behind whichever route/guard serves teacher accounts.
 */
@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe, BaseChartDirective, StatSealComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherDashboardComponent implements OnInit {
  private readonly analytics = inject(TeacherAnalyticsService);
  private readonly exportService = inject(ExportService);

  // ----- raw state -----
  overview = signal<ExamOverviewStats | null>(null);
  exams = signal<ExamSummary[]>([]);
  selectedExamId = signal<string | null>(null);
  passFail = signal<PassFailStats | null>(null);
  scoreDistribution = signal<ScoreBand[]>([]);
  attempts = signal<StudentAttempt[]>([]);
  isLoadingAttempts = signal(false);

  searchTerm = signal('');
  sortColumn = signal<SortableColumn>('studentName');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // ----- derived state -----
  selectedExamTitle = computed(
    () => this.exams().find((e) => e.id === this.selectedExamId())?.title ?? '',
  );

  visibleAttempts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const column = this.sortColumn();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    let rows = this.attempts();
    if (term) {
      rows = rows.filter((a) => a.studentName.toLowerCase().includes(term));
    }

    return [...rows].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * direction;
      }
      return String(valueA).localeCompare(String(valueB)) * direction;
    });
  });

  passFailChartData = computed<ChartData<'doughnut'>>(() => {
    const stats = this.passFail();
    return {
      labels: ['Passed', 'Failed'],
      datasets: [
        {
          data: [stats?.passedCount ?? 0, stats?.failedCount ?? 0],
          backgroundColor: ['#2f9e6e', '#e15b4d'],
          borderWidth: 0,
        },
      ],
    };
  });

  scoreDistributionChartData = computed<ChartData<'bar'>>(() => ({
    labels: this.scoreDistribution().map((b) => b.label),
    datasets: [
      {
        label: 'Students',
        data: this.scoreDistribution().map((b) => b.studentCount),
        backgroundColor: '#14213d',
        borderRadius: 6,
      },
    ],
  }));

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  ngOnInit(): void {
    this.analytics.getOverview().subscribe((stats) => this.overview.set(stats));

    this.analytics.getExams().subscribe((exams) => {
      this.exams.set(exams);
      if (exams.length) {
        this.selectExam(exams[0].id);
      }
    });
  }

  selectExam(examId: string): void {
    this.selectedExamId.set(examId);
    this.isLoadingAttempts.set(true);

    this.analytics.getPassFailStats(examId).subscribe((stats) => this.passFail.set(stats));
    this.analytics.getScoreDistribution(examId).subscribe((bands) => this.scoreDistribution.set(bands));
    this.analytics.getAttempts(examId).subscribe((attempts) => {
      this.attempts.set(attempts);
      this.isLoadingAttempts.set(false);
    });
  }

  onExamChange(examId: string): void {
    this.selectExam(examId);
  }

  onSort(column: SortableColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  sortArrow(column: SortableColumn): string {
    if (this.sortColumn() !== column) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  exportExcel(): void {
    this.exportService.exportAttemptsToExcel(this.visibleAttempts(), this.selectedExamTitle());
  }

  exportPdf(): void {
    this.exportService.exportAttemptsToPdf(this.visibleAttempts(), this.selectedExamTitle());
  }
}
