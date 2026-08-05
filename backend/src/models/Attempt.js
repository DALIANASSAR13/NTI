const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
    },
    assignedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    studentAnswers: [studentAnswerSchema],
    score: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['in-progress', 'completed'],
        message: 'Status must be either in-progress or completed',
      },
      default: 'in-progress',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one active attempt per student per exam
attemptSchema.index({ studentId: 1, examId: 1 });

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
