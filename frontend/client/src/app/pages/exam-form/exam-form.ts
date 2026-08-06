import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam';
import { QuestionService } from '../../services/question.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-form.html',
  styleUrls: ['../question-form/question-form.component.scss']
})
export class ExamFormComponent implements OnInit {
  examData: any = {
    title: '', specialization: '', level: 1, durationInMinutes: 60,
    availableFrom: '', availableTo: '', questionsToAsk: 1
  };
  
  questions: any[] = [{ id: Date.now().toString(), text: '', options: ['', ''], correctAnswer: '' }];
  
  isSubmitting = false;
  toastMessage = '';
  examDetailsError = '';

  showImportModal = false;
  bankQuestions: any[] = [];
  selectedBankQuestions: Set<string> = new Set();

  constructor(
    private examService: ExamService,
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['templateId']) {
        this.loadTemplate(params['templateId']);
      }
    });
  }

  loadTemplate(id: string) {
    this.examService.getExamById(id).subscribe((res: any) => {
      if (res.data) {
        const d = res.data;
        this.examData = {
          title: d.title + ' (Copy)',
          specialization: d.specialization,
          level: d.level,
          durationInMinutes: d.durationInMinutes,
          availableFrom: '',
          availableTo: '',
          questionsToAsk: d.questionsToAsk
        };
        
        // Convert existing questions to FormQuestions
        if (d.questionPool && d.questionPool.length > 0) {
          const qs: any[] = d.questionPool.map((q: any, i: number) => ({
            id: Date.now().toString() + i,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer
          }));
          this.questions = qs;
        }
      }
    });
  }

  importFromBank() {
    this.questionService.getAll().subscribe((res: any) => {
      if (res && res.length > 0) {
        this.bankQuestions = res;
        this.selectedBankQuestions = new Set();
        this.showImportModal = true;
      } else {
        this.showError('No questions found in your bank.', '');
      }
    });
  }

  toggleBankSelection(id: string) {
    const current = new Set(this.selectedBankQuestions);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.selectedBankQuestions = current;
  }

  confirmImport() {
    const selectedIds = this.selectedBankQuestions;
    const selectedQs = this.bankQuestions.filter(q => selectedIds.has(q._id));
    
    if (selectedQs.length > 0) {
      const qs: any[] = selectedQs.map((q: any, i: number) => ({
        id: Date.now().toString() + 'import' + i,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      this.questions = [...this.questions, ...qs];
    }
    
    this.showImportModal = false;
  }

  showError(msg: string, elementSelector: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 5000);
    
    if (elementSelector) {
      setTimeout(() => {
        const el = document.querySelector(elementSelector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  addQuestion() {
    this.questions.push({ id: Date.now().toString(), text: '', options: ['', ''], correctAnswer: '' });
  }

  removeQuestion(id: string) {
    this.questions = this.questions.filter(q => q.id !== id);
  }

  addOption(qId: string) {
    this.questions = this.questions.map(q => q.id === qId && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q);
  }

  removeOption(qId: string, index: number) {
    this.questions = this.questions.map(q => {
      if (q.id === qId && q.options.length > 2) {
        const newOpts = [...q.options];
        const removedOpt = newOpts.splice(index, 1)[0];
        return { 
          ...q, 
          options: newOpts,
          correctAnswer: q.correctAnswer === removedOpt ? '' : q.correctAnswer
        };
      }
      return q;
    });
  }

  updateOptionValue(qId: string, index: number, val: string) {
    this.questions = this.questions.map(q => {
      if (q.id === qId) {
        const newOpts = [...q.options];
        const oldVal = newOpts[index];
        newOpts[index] = val;
        return { ...q, options: newOpts, correctAnswer: q.correctAnswer === oldVal ? val : q.correctAnswer };
      }
      return q;
    });
  }

  setCorrectAnswer(qId: string, opt: string) {
    this.questions = this.questions.map(q => q.id === qId ? { ...q, correctAnswer: opt } : q);
  }

  goBack() {
    this.router.navigate(['/exams']);
  }

  submitExam() {
    this.examDetailsError = '';
    
    // 1. Basic validation
    let hasError = false;
    const data = this.examData;
    if (!data.title || !data.specialization || !data.availableFrom || !data.availableTo) {
      this.examDetailsError = 'Please fill out all required exam details.';
      this.showError('Exam details are incomplete.', '#exam-details-card');
      return;
    }

    if (new Date(data.availableTo) <= new Date(data.availableFrom)) {
      this.examDetailsError = 'Available To date must be after Available From date.';
      this.showError('Invalid exam schedule.', '#exam-details-card');
      return;
    }

    let firstErrorSelector = '';

    this.questions = this.questions.map((q, i) => {
      let error = '';
      if (!q.text.trim()) { error = 'Question text is required'; }
      else if (q.options.some((o: string) => !o.trim())) { error = 'All options must have text'; }
      else if (!q.correctAnswer) { error = 'Please select a correct answer'; }

      if (error) {
        q.error = error;
        hasError = true;
        if (!firstErrorSelector) firstErrorSelector = `#question-${i}`;
      }
      return q;
    });

    if (hasError) {
      this.showError('Please fix the errors in your questions.', firstErrorSelector);
      return;
    }

    if (data.questionsToAsk > this.questions.length) {
      this.examDetailsError = 'Questions to ask cannot exceed the number of questions in the pool.';
      this.showError('Pool size mismatch.', '#exam-details-card');
      return;
    }

    this.isSubmitting = true;

    // 2. Create questions first
    const questionObservables = this.questions.map(q => {
      const qPayload = {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      };
      return this.questionService.create(qPayload).pipe(
        catchError(err => of({ error: true, message: err.error?.message || 'Failed to create question' }))
      );
    });

    forkJoin(questionObservables).subscribe(results => {
      const failedIndex = results.findIndex(r => r && (r as any).error);
      if (failedIndex !== -1) {
        const failedMsg = (results[failedIndex] as any).message;
        this.questions[failedIndex].error = failedMsg;
        this.questions = [...this.questions];
        
        this.showError('Failed to save some questions. ' + failedMsg, `#question-${failedIndex}`);
        this.isSubmitting = false;
        return;
      }

      // Collect IDs
      const poolIds = results.map(r => (r as any)._id);
      
      // 3. Create Exam
      const examPayload = {
        title: data.title,
        specialization: data.specialization,
        level: data.level,
        durationInMinutes: data.durationInMinutes,
        availableFrom: new Date(data.availableFrom),
        availableTo: new Date(data.availableTo),
        questionsToAsk: data.questionsToAsk,
        questionPool: poolIds
      };

      this.examService.createExam(examPayload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/exams']);
        },
        error: (err: any) => {
          this.examDetailsError = err.error?.message || 'Failed to create exam';
          this.showError(err.error?.message || 'Failed to create exam', '#exam-details-card');
          this.isSubmitting = false;
        }
      });
    });
  }
}

