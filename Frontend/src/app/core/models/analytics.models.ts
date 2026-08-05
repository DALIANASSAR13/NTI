/**
 * Shared data contracts between the Angular frontend and the backend API.
 *
 * Backend devs: implement endpoints that return exactly these shapes and
 * nothing in the services/components below needs to change.
 */

export interface ExamOverviewStats {
  totalExamsCreated: number;
  totalStudentsAttempted: number;
  averageScorePercentage: number;
}

export interface PassFailStats {
  passedCount: number;
  failedCount: number;
}

export interface ScoreBand {
  /** e.g. "0-50", "50-60", "90-100" */
  label: string;
  studentCount: number;
}

export interface ExamSummary {
  id: string;
  title: string;
}

export type AttemptStatus = 'passed' | 'failed';

export interface StudentAttempt {
  id: string;
  studentName: string;
  scorePercentage: number;
  grade: string;
  /** ISO 8601 date string */
  submittedAt: string;
  status: AttemptStatus;
}

export interface StudentOverviewStats {
  averageScorePercentage: number;
  completedExamsCount: number;
}

export type StudentExamStatus = 'upcoming' | 'completed';

export interface StudentExamItem {
  id: string;
  title: string;
  status: StudentExamStatus;
  /** ISO 8601 date string — present when status === 'upcoming' */
  scheduledAt?: string;
  /** present when status === 'completed' */
  scorePercentage?: number;
  durationMinutes?: number;
}

export interface ProgressPoint {
  examTitle: string;
  scorePercentage: number;
  /** ISO 8601 date string */
  date: string;
}
