import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-details.html',
  styles: [`
    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      font-size: 1rem;
      font-weight: 600;
      color: #868e96;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #495057; }
    .tab-btn.active {
      color: #339af0;
      border-bottom-color: #339af0;
    }
  `]
})
export class ExamDetailsComponent implements OnInit {
  exam: any = null;
  stats: any = null;
  isLoading = true;
  error = '';
  
  isSaving = false;
  activeTab = 'questions';

  editForm: any = {};
  get hasAttempts() {
    return (this.stats?.taken?.length || 0) > 0;
  }
  
  savingQuestions: { [id: string]: boolean } = {};
  savedMessage: { [id: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private questionService: QuestionService
  ) {}

  ngOnInit() {
    this.loadExam();
  }

  loadExam() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.goBack();

    this.isLoading = true;
    this.error = '';

    this.examService.getExamById(id).subscribe({
      next: (res: any) => {
        this.exam = res.data;
        this.editForm = {
          availableFrom: this.formatDate(res.data.availableFrom),
          availableTo: this.formatDate(res.data.availableTo),
          durationInMinutes: res.data.durationInMinutes,
          questionsToAsk: res.data.questionsToAsk
        };
        
        // Load stats
        this.examService.getExamStats(id).subscribe({
          next: (statsRes: any) => {
            this.stats = statsRes.data;
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Stats error:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load exam details';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateStr: string | Date): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  updateForm(field: string, value: any) {
    this.editForm = { ...this.editForm, [field]: value };
  }

  saveSchedule() {
    const id = this.exam?._id;
    if (!id) return;

    this.isSaving = true;
    
    // Convert datetimes back to proper ISO
    const payload: any = {
      availableTo: new Date(this.editForm.availableTo)
    };

    if (!this.hasAttempts) {
      payload.availableFrom = new Date(this.editForm.availableFrom);
      payload.durationInMinutes = this.editForm.durationInMinutes;
      payload.questionsToAsk = this.editForm.questionsToAsk;
    }

    this.examService.updateExam(id, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.loadExam(); // reload to get fresh data
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to update exam');
        this.isSaving = false;
      }
    });
  }

  onOptionChange(q: any, idx: number, newValue: string, oldValue: string) {
    if (q.correctAnswer === oldValue) {
      q.correctAnswer = newValue;
    }
    q.options[idx] = newValue;
  }

  addOption(q: any) {
    q.options.push(`New Option ${q.options.length + 1}`);
  }

  removeOption(q: any, idx: number) {
    const removed = q.options.splice(idx, 1)[0];
    if (q.correctAnswer === removed && q.options.length > 0) {
      q.correctAnswer = q.options[0];
    } else if (q.options.length === 0) {
      q.correctAnswer = '';
    }
  }

  saveQuestion(q: any) {
    if (!q.text?.trim()) {
      alert('Question text cannot be empty');
      return;
    }
    if (!q.options || q.options.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    if (!q.correctAnswer) {
      alert('Please select a correct answer');
      return;
    }

    this.savingQuestions[q._id] = true;
    
    const payload = {
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer
    };

    this.questionService.update(q._id, payload).subscribe({
      next: () => {
        this.savingQuestions[q._id] = false;
        this.savedMessage[q._id] = true;
        setTimeout(() => {
          this.savedMessage[q._id] = false;
        }, 3000);
      },
      error: (err: any) => {
        this.savingQuestions[q._id] = false;
        alert(err.error?.message || 'Failed to save question');
      }
    });
  }

  goBack() {
    this.router.navigate(['/exams']);
  }
}
