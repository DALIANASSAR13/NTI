import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentAttempt } from '../models/analytics.models';

/**
 * Generates Excel/PDF files client-side from whatever attempts are
 * currently loaded in the dashboard — no extra backend endpoint needed.
 *
 * If exports ever need to include data beyond what the page has loaded
 * (e.g. thousands of rows), swap these methods to call a backend export
 * endpoint instead; the public method signatures below can stay the same.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  exportAttemptsToExcel(attempts: StudentAttempt[], examTitle: string): void {
    const rows = attempts.map((a) => ({
      Student: a.studentName,
      Score: a.scorePercentage,
      Grade: a.grade,
      Date: new Date(a.submittedAt).toLocaleDateString(),
      Status: a.status === 'passed' ? 'Passed' : 'Failed',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attempts');
    XLSX.writeFile(workbook, `${this.slug(examTitle)}-results.xlsx`);
  }

  exportAttemptsToPdf(attempts: StudentAttempt[], examTitle: string): void {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(examTitle, 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [['Student', 'Score', 'Grade', 'Date', 'Status']],
      body: attempts.map((a) => [
        a.studentName,
        `${a.scorePercentage}%`,
        a.grade,
        new Date(a.submittedAt).toLocaleDateString(),
        a.status === 'passed' ? 'Passed' : 'Failed',
      ]),
    });

    doc.save(`${this.slug(examTitle)}-results.pdf`);
  }

  private slug(text: string): string {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
