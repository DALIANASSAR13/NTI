import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamForm } from './exam-form';

describe('ExamForm', () => {
    let component: ExamForm;
    let fixture: ComponentFixture<ExamForm>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ExamForm],
        }).compileComponents();

        fixture = TestBed.createComponent(ExamForm);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
